import { createContext, useContext, useState, ReactNode } from "react";
import { initialEvents, type Event } from "@/data/events";

interface EventContextType {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  registrations: string[];
  registerForEvent: (eventId: string) => void;
}

const EventContext = createContext<EventContextType | null>(null);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [registrations, setRegistrations] = useState<string[]>([]);

  const addEvent = (event: Omit<Event, "id">) => {
    setEvents((prev) => [...prev, { ...event, id: crypto.randomUUID() }]);
  };

  const updateEvent = (id: string, data: Partial<Event>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const registerForEvent = (eventId: string) => {
    setRegistrations((prev) => [...new Set([...prev, eventId])]);
  };

  return (
    <EventContext.Provider value={{ events, addEvent, updateEvent, deleteEvent, registrations, registerForEvent }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used within EventProvider");
  return ctx;
};
