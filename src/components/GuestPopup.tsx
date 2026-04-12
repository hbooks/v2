import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { X } from "lucide-react";

export default function GuestPopup() {
  const { isGuest } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isGuest) return;
    const dismissed = sessionStorage.getItem("guest-popup-dismissed");
    if (dismissed) return;

    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [isGuest]);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("guest-popup-dismissed", "true");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative z-10 mx-4 w-full max-w-md animate-scale-in rounded-xl border border-border bg-card p-8 shadow-lg">
        <button onClick={dismiss} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-2 font-heading text-2xl font-bold text-foreground">Welcome to Hbooks bookshop</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          You are viewing the shop as a guest. Create an account for exclusive member benefits, or continue browsing.
        </p>
        <div className="flex gap-3">
          <Link
            to="/login"
            onClick={dismiss}
            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Log In
          </Link>
          <button
            onClick={dismiss}
            className="flex-1 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
