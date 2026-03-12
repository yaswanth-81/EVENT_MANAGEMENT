import { CalendarDays, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <CalendarDays className="h-5 w-5 text-primary" />
              EventHub
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Your one-stop platform for discovering, booking, and managing professional events.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="transition-colors hover:text-foreground">Home</Link></li>
              <li><Link to="/events" className="transition-colors hover:text-foreground">Events</Link></li>
              <li><Link to="/login" className="transition-colors hover:text-foreground">Login</Link></li>
              <li><Link to="/register" className="transition-colors hover:text-foreground">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@eventhub.com</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> San Francisco, CA</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Follow Us</h4>
            <div className="mt-3 flex gap-3">
              {["Twitter", "LinkedIn", "GitHub"].map((s) => (
                <a key={s} href="#" className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EventHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
