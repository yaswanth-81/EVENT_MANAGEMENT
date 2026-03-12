import { useState } from "react";
import { useEvents } from "@/context/EventContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function ManageEventsPage() {
  const { events, updateEvent, deleteEvent } = useEvents();
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", date: "", price: "" });

  const startEdit = (e: typeof events[0]) => {
    setEditId(e.id);
    setEditForm({ name: e.name, date: e.date, price: String(e.price) });
  };

  const saveEdit = () => {
    if (editId) {
      updateEvent(editId, { name: editForm.name, date: editForm.date, price: Number(editForm.price) });
      toast.success("Event updated");
      setEditId(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    toast.success("Event deleted");
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold">Manage Events</h2>
      <p className="mt-1 text-sm text-muted-foreground">Edit or remove existing events.</p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="pb-3 font-medium text-muted-foreground">Event Name</th>
              <th className="pb-3 font-medium text-muted-foreground">Date</th>
              <th className="pb-3 font-medium text-muted-foreground">Price</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b transition-colors hover:bg-muted/50">
                {editId === event.id ? (
                  <>
                    <td className="py-4 pr-4">
                      <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="h-8" />
                    </td>
                    <td className="py-4 pr-4">
                      <Input value={editForm.date} onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))} className="h-8" />
                    </td>
                    <td className="py-4 pr-4">
                      <Input type="number" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} className="h-8 w-24" />
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={saveEdit}><Check className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditId(null)}><X className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-4 pr-4 font-medium">{event.name}</td>
                    <td className="py-4 pr-4 tabular-nums text-muted-foreground">{event.date}</td>
                    <td className="py-4 pr-4 tabular-nums">{event.price === 0 ? "Free" : `$${event.price}`}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(event)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
