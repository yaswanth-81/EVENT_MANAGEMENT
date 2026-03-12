import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };

export default function EventsPage() {
  const { events } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRegister = (_id: string) => {
    if (!user) return navigate("/login");
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl">All Events</h1>
          <p className="mt-2 text-muted-foreground">Browse and register for upcoming events.</p>

          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {events.map((event) => (
              <EventCard key={event.id} event={event} onRegister={handleRegister} />
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
