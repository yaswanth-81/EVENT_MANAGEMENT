import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(email, password)) {
      toast.success("Welcome, Admin!");
      navigate("/admin");
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-xl bg-card p-8 card-shadow">
        <div className="mb-6 flex items-center justify-center gap-2 text-xl font-semibold">
          <CalendarDays className="h-6 w-6 text-primary" />
          Admin Portal
        </div>
        <h2 className="text-center text-xl font-semibold">Admin Sign In</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">Restricted access</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@event.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/login" className="hover:underline">← User Login</Link>
        </p>
      </div>
    </div>
  );
}
