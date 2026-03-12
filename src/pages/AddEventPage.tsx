import { useState } from "react";
import { useEvents } from "@/context/EventContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AddEventPage() {
  const { addEvent } = useEvents();
  const [form, setForm] = useState({ name: "", description: "", date: "", price: "", image: "" });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.date) return toast.error("Name and date are required");
    addEvent({
      name: form.name,
      description: form.description,
      date: form.date,
      price: Number(form.price) || 0,
      image: form.image || "/placeholder.svg",
    });
    toast.success("Event created!");
    setForm({ name: "", description: "", date: "", price: "", image: "" });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold">Add Event</h2>
      <p className="mt-1 text-sm text-muted-foreground">Create a new event listing.</p>

      <form className="mt-8 max-w-lg space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Event Name</Label>
          <Input id="name" value={form.name} onChange={set("name")} placeholder="Tech Summit 2024" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" value={form.description} onChange={set("description")} placeholder="Describe the event..." rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" value={form.date} onChange={set("date")} placeholder="Oct 26, 2024" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input id="price" type="number" value={form.price} onChange={set("price")} placeholder="0" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input id="image" value={form.image} onChange={set("image")} placeholder="https://..." />
        </div>
        <Button type="submit">Create Event</Button>
      </form>
    </div>
  );
}
