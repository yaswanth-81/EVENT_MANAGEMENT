import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, CalendarDays } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md card-shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
          <CalendarDays className="h-6 w-6 text-primary" />
          EventHub
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Home</Link>
          <Link to="/events" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Events</Link>
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link to="/admin" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
              ) : (
                <Link to="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
              )}
              <Button size="sm" variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Login</Link>
              <Button size="sm" asChild><Link to="/register">Register</Link></Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-background px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">Home</Link>
            <Link to="/events" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">Events</Link>
            {user ? (
              <>
                <Link to={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="text-sm text-muted-foreground">Dashboard</Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="text-left text-sm text-muted-foreground">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-sm text-primary font-medium">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
