import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import ConfirmModal from "@/components/ConfirmModal";
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function UserDashboard() {
  const { events, registrations, registerForEvent } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleRegister = (id: string) => setSelectedEvent(id);

  const confirmRegister = () => {
    if (selectedEvent) {
      registerForEvent(selectedEvent);
      toast.success("Registered successfully! Payment coming soon.");
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

      <ConfirmModal
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onConfirm={confirmRegister}
        title="Confirm Registration"
        description="Proceed to payment (coming soon). For now, your registration will be confirmed immediately."
      />

      <Footer />
    </div>
  );
}
