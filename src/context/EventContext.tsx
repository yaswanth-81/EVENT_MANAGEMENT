import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Event } from "@/data/events";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface EventContextType {
  events: Event[];
  refreshEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, "id">) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  registrations: string[]; // eventIds user is registered for
  refreshRegistrations: () => Promise<void>;
  registerForEvent: (
    eventId: string,
    payload: { numPersons: number; contactName: string; contactPhone: string; contactDetails?: string }
  ) => Promise<{ requiresPayment: boolean; status: string }>;
}

const EventContext = createContext<EventContextType | null>(null);

export function EventProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<string[]>([]);

  const refreshEvents = async () => {
    const data = await apiFetch<{ events: Event[] }>("/events", { method: "GET" });
    setEvents(data.events || []);
  };

  const refreshRegistrations = async () => {
    if (!token) {
      setRegistrations([]);
      return;
    }
    const data = await apiFetch<{ registrations: Array<{ id: string }> }>("/registrations/me", {
      method: "GET",
      token,
    });
    setRegistrations((data.registrations || []).map((r) => r.id));
  };

  useEffect(() => {
    refreshEvents().catch(() => {});
  }, []);

  useEffect(() => {
    refreshRegistrations().catch(() => {});
  }, [token]);

  const addEvent = async (event: Omit<Event, "id">) => {
    await apiFetch("/events", { method: "POST", body: JSON.stringify(event), token });
    await refreshEvents();
  };

  const updateEvent = async (id: string, data: Partial<Event>) => {
    await apiFetch(`/events/${id}`, { method: "PATCH", body: JSON.stringify(data), token });
    await refreshEvents();
  };

  const deleteEvent = async (id: string) => {
    await apiFetch(`/events/${id}`, { method: "DELETE", token });
    await refreshEvents();
  };

  const registerForEvent = async (
    eventId: string,
    payload: { numPersons: number; contactName: string; contactPhone: string; contactDetails?: string }
  ) => {
    const data = await apiFetch<{ requiresPayment: boolean; status: string }>(
      `/registrations/events/${eventId}/register`,
      { method: "POST", token, body: JSON.stringify(payload) }
    );
    await refreshRegistrations();
    return data;
  };

  const value = useMemo<EventContextType>(
    () => ({
      events,
      refreshEvents,
      addEvent,
      updateEvent,
      deleteEvent,
      registrations,
      refreshRegistrations,
      registerForEvent,
    }),
    [events, registrations, token]
  );

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used within EventProvider");
  return ctx;
};
