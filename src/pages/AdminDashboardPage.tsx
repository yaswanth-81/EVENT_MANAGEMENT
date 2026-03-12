import { useEvents } from "@/context/EventContext";
import { CalendarDays, Users } from "lucide-react";

export default function AdminDashboardPage() {
  const { events, registrations } = useEvents();

  const stats = [
    { label: "Total Events", value: events.length, icon: CalendarDays },
    { label: "Total Registrations", value: registrations.length + 42, icon: Users },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <p className="mt-1 text-sm text-muted-foreground">Overview of your event platform.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-card p-6 card-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
