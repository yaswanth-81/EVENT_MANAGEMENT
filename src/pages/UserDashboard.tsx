import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import ConfirmModal from "@/components/ConfirmModal";
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function UserDashboard() {
  const { events, registrations, registerForEvent } = useEvents();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [previewEventId, setPreviewEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [numPersons, setNumPersons] = useState(1);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [attendeeNames, setAttendeeNames] = useState("");
  const [attendeeEmails, setAttendeeEmails] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleRegister = (id: string) => {
    setPreviewEventId(id);
  };

  const startDetailsForm = () => {
    if (!previewEventId) return;
    setSelectedEvent(previewEventId);
    setPreviewEventId(null);
    setNumPersons(1);
    setContactName(user.name);
    setContactPhone("");
    setContactDetails("");
    setAttendeeNames("");
    setAttendeeEmails("");
  };

  const confirmRegister = async () => {
    if (selectedEvent) {
      try {
        if (!numPersons || numPersons < 1) {
          toast.error("Please enter number of persons (at least 1)");
          return;
        }
        if (!attendeeNames.trim()) {
          toast.error("Please enter attendee names");
          return;
        }
        if (!attendeeEmails.trim()) {
          toast.error("Please enter attendee emails");
          return;
        }
        if (!contactPhone.trim()) {
          toast.error("Please enter a contact phone number");
          return;
        }

        const result = await registerForEvent(selectedEvent, {
          numPersons,
          contactName,
          contactPhone,
          contactDetails: [
            `Attendee names: ${attendeeNames}`,
            `Attendee emails: ${attendeeEmails}`,
            contactDetails ? `Notes: ${contactDetails}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        });
        if (!result.requiresPayment) {
          toast.success("Registered successfully!");
        } else {
          // Create Razorpay order and open checkout
          const orderData = await apiFetch<{
            keyId: string;
            order: { id: string; amount: number; currency: string };
          }>("/payments/razorpay/order", {
            method: "POST",
            token,
            body: JSON.stringify({ eventId: selectedEvent }),
          });

          const evt = events.find((e) => e.id === selectedEvent);
          const options = {
            key: orderData.keyId,
            amount: orderData.order.amount,
            currency: orderData.order.currency,
            name: "EventHub",
            description: evt?.name || "Event registration",
            order_id: orderData.order.id,
            prefill: { email: user.email, name: user.name, contact: contactPhone || undefined },
            theme: { color: "#7c3aed" },
            handler: async (response: any) => {
              try {
                await apiFetch("/payments/razorpay/verify", {
                  method: "POST",
                  token,
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });
                toast.success("Payment successful! Registration confirmed.");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Payment verification failed");
              }
            },
          };

          const RazorpayCtor = (window as any).Razorpay as (opts: any) => { open: () => void };
          if (!RazorpayCtor) throw new Error("Razorpay script not loaded");
          const rzp = new RazorpayCtor(options);
          rzp.open();
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Registration failed");
      }
    }
    setSelectedEvent(null);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl">Welcome, {user.name}</h1>
          <p className="mt-2 text-muted-foreground">
            You've registered for {registrations.length} event{registrations.length !== 1 ? "s" : ""}.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={registrations.includes(event.id) ? undefined : handleRegister}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Step 1: show full event details then proceed */}
      <ConfirmModal
        open={!!previewEventId}
        onClose={() => setPreviewEventId(null)}
        onConfirm={startDetailsForm}
        title="Review event details"
        description="Please review the event information before continuing to registration."
      >
        {(() => {
          const evt = events.find((e) => e.id === previewEventId);
          if (!evt) return null;
          return (
            <div className="space-y-3 py-2 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Event</p>
                <p className="text-base font-semibold text-foreground">{evt.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Description</p>
                <p className="text-foreground">{evt.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Date</p>
                  <p className="tabular-nums text-foreground">{evt.date}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Price</p>
                  <p className="tabular-nums text-foreground">
                    {evt.price === 0 ? "Free" : `₹${evt.price}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </ConfirmModal>

      {/* Step 2: details / attendees form */}
      <ConfirmModal
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onConfirm={confirmRegister}
        title="Confirm Registration"
        description="Enter attendee details. Paid events will charge based on number of persons."
      >
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="numPersons">Number of persons</Label>
              <Input
                id="numPersons"
                type="number"
                min={1}
                value={numPersons}
                onChange={(e) => setNumPersons(Number(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contactPhone">Contact phone</Label>
              <Input
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91..."
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="contactName">Contact name</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="attendeeNames">Attendee names (one per line)</Label>
            <Textarea
              id="attendeeNames"
              value={attendeeNames}
              onChange={(e) => setAttendeeNames(e.target.value)}
              rows={3}
              placeholder={"Person 1\nPerson 2\nPerson 3"}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="attendeeEmails">Attendee emails (one per line, same order)</Label>
            <Textarea
              id="attendeeEmails"
              value={attendeeEmails}
              onChange={(e) => setAttendeeEmails(e.target.value)}
              rows={3}
              placeholder={"p1@example.com\np2@example.com\np3@example.com"}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="contactDetails">Additional notes / details</Label>
            <Textarea
              id="contactDetails"
              value={contactDetails}
              onChange={(e) => setContactDetails(e.target.value)}
              rows={3}
              placeholder="Any extra information for the organizer."
            />
          </div>
        </div>
      </ConfirmModal>

      <Footer />
    </div>
  );
}
