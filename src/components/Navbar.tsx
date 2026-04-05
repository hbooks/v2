import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, ShoppingCart, User, Menu, X, LogOut, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

const guestLinks = [
  { to: "/", label: "Shop" },
  { to: "/my-books", label: "My Books" },
  { to: "/exclusive", label: "Exclusive Scenes" },
  { to: "/cart", label: "Cart" },
  { to: "/membership", label: "Membership" },
  { to: "/updates", label: "Updates" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, isGuest, loading, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Wait for auth to load before rendering any user-dependent UI
  if (loading) {
    return <div className="h-16 border-b border-border bg-background/80" />;
  }

  const isMember = user?.tag === "member";

  const links = guestLinks.filter((link) => {
    if (isMember && (link.to === "/cart" || link.to === "/membership")) return false;
    return true;
  });

 const handleLogout = async () => {
  try {
    await logout();
    // The page will reload and redirect to home inside the logout function.
    // No extra navigation needed.
  } catch (err) {
    toast.error("Logout failed");
  }
};

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-heading text-xl font-bold text-foreground">
            Hbooks <span className="text-primary">Stores</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!isMember && (
            <Link to="/cart" className="relative text-muted-foreground hover:text-foreground">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-muted-foreground hover:text-foreground"
            >
              <User className="h-5 w-5" />
              <span className="hidden text-sm md:inline">
                {isGuest ? "Guest" : user?.username ?? "User"}
              </span>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-card p-3 shadow-lg">
                  {isGuest ? (
                    <>
                      <p className="mb-2 text-xs text-muted-foreground">Browsing as guest</p>
                      <Link
                        to="/login"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
                      >
                        <LogIn className="h-4 w-4" /> Log In
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">{user?.username ?? "User"}</p>
                      <p className="mb-2 text-xs text-muted-foreground">
                        {isMember ? "You currently have a Membership Active" : "No membership is active on your account"}
                      </p>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-secondary"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {isGuest && (
            <Link
              to="/login"
              className="hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:inline-block"
            >
              Log In
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            className="text-muted-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                location.pathname === link.to
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}