import { type Event } from "@/data/events";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EventCardProps {
  event: Event;
  onRegister?: (id: string) => void;
}

export default function EventCard({ event, onRegister }: EventCardProps) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
      className="group flex flex-col overflow-hidden rounded-xl bg-card card-shadow transition-shadow duration-200 hover:card-shadow-hover"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={event.image}
          alt={event.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold text-foreground">{event.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground tabular-nums">
          <CalendarDays className="h-4 w-4" />
          {event.date}
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-semibold tabular-nums text-foreground">
            {event.price === 0 ? "Free" : `₹${event.price}`}
          </span>
          {onRegister && (
            <Button size="sm" onClick={() => onRegister(event.id)}>
              Register Now
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
