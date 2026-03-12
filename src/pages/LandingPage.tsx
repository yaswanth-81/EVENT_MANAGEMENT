import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, UserPlus, CalendarCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { useEvents } from "@/context/EventContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const steps = [
  { icon: Search, title: "Browse Events", desc: "Explore our curated catalog of conferences, workshops, and meetups." },
  { icon: UserPlus, title: "Register", desc: "Sign up in seconds with a simple, streamlined registration flow." },
  { icon: CalendarCheck, title: "Attend", desc: "Show up, learn, connect, and make the most of your experience." },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };

export default function LandingPage() {
  const { events } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const featured = events.filter((e) => e.featured).slice(0, 4);

  const handleRegister = (id: string) => {
    if (!user) return navigate("/login");
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground">
        <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="max-w-2xl"
          >
            <h1 className="text-primary-foreground">Find and book your next event.</h1>
            <p className="mt-4 text-lg text-primary-foreground/70">
              Browse our curated list of professional conferences, workshops, and community meetups. Register in seconds.
            </p>
            <div className="mt-8 flex gap-3">
              <Button size="lg" asChild>
                <Link to="/events">Browse Events</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}>
            <h2>Featured Events</h2>
            <p className="mt-2 text-muted-foreground">Hand-picked events happening soon.</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {featured.map((event) => (
              <EventCard key={event.id} event={event} onRegister={handleRegister} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}>
            <h2 className="text-center">How It Works</h2>
          </motion.div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.32, 0.72, 0, 1] }}
                className="text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mx-auto mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
