import { useState } from "react";
import { useEvents } from "@/context/EventContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";

export default function AddEventPage() {
  const { addEvent } = useEvents();
  const [form, setForm] = useState({ name: "", description: "", date: "", price: "", image: "" });
  const [dateObj, setDateObj] = useState<Date | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !dateObj) return toast.error("Name and date are required");
    try {
      let imagePath = form.image || "/placeholder.svg";

      if (imageFile) {
        const body = new FormData();
        body.append("file", imageFile);

        const res = await fetch("/api/uploads/image", { method: "POST", body });
        const data = (await res.json().catch(() => ({}))) as any;
        if (!res.ok || !data?.path) throw new Error(data?.message || "Image upload failed");
        imagePath = data.path;
      }

      await addEvent({
        name: form.name,
        description: form.description,
        date: dateObj.toISOString(),
        price: Number(form.price) || 0,
        image: imagePath,
      });
      toast.success("Event created!");
      setForm({ name: "", description: "", date: "", price: "", image: "" });
      setDateObj(undefined);
      setImageFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event");
    }
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  type="button"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateObj && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dateObj ? dateObj.toDateString() : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateObj}
                  onSelect={(d) => setDateObj(d ?? undefined)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input id="price" type="number" value={form.price} onChange={set("price")} placeholder="0" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Event image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
            }}
          />
        </div>
        <Button type="submit">Create Event</Button>
      </form>
    </div>
  );
}
