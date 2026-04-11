import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import {
  Crown,
  User,
  Mail,
  Calendar,
  ShieldCheck,
  ShieldOff,
  LogOut,
  BookOpen,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

type MemberProfile = {
  id: string;
  email: string;
  username: string | null;
  tag: string | null;
  expiry_date: string | null;
  created_at: string;
};

function formatDate(iso: string | null, fallback = "—") {
  if (!iso) return fallback;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function MemberBadge({ tag }: { tag: string | null }) {
  const isMember = tag === "member";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        isMember
          ? "bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/30"
          : "bg-muted text-muted-foreground ring-1 ring-border"
      }`}
    >
      {isMember ? (
        <Crown className="h-3 w-3" />
      ) : (
        <User className="h-3 w-3" />
      )}
      {isMember ? "Active Member" : "Free Account"}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // Redirect guests
  useEffect(() => {
    if (isGuest || !user) {
      navigate("/login", { replace: true });
    }
  }, [isGuest, user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("members")
      .select("id, email, username, tag, expiry_date, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Profile fetch error:", fetchError);
      setError("Failed to load profile. Please try again.");
    } else if (!data) {
      // Member row may not exist yet for brand new signups
      setProfile({
        id:          user.id,
        email:       user.email ?? "",
        username:    user.email?.split("@")[0] ?? null,
        tag:         null,
        expiry_date: null,
        created_at:  user.created_at ?? new Date().toISOString(),
      });
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Sign out failed. Please try again.");
      setSigningOut(false);
    } else {
      navigate("/", { replace: true });
    }
  };

  const isMember   = profile?.tag === "member";
  const days       = daysUntil(profile?.expiry_date ?? null);
  const isExpiring = days !== null && days <= 7 && days > 0;
  const isExpired  = profile?.expiry_date
    ? new Date(profile.expiry_date) < new Date()
    : false;

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your profile…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4">
        <div className="w-full rounded-xl border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">
            Could not load profile
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Profile ──────────────────────────────────────────────────────
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">

      {/* ── Header card ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        {/* Decorative gradient strip */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-amber-500 to-primary/60" />

        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-6">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
            <span className="font-heading text-3xl font-bold text-primary">
              {(profile?.username ?? profile?.email ?? "?")[0].toUpperCase()}
            </span>
          </div>

          {/* Name + badge */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-bold text-foreground truncate">
                {profile?.username ?? profile?.email?.split("@")[0] ?? "Member"}
              </h1>
              <MemberBadge tag={profile?.tag ?? null} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground truncate">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {profile?.email}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              Member since {formatDate(profile?.created_at ?? null)}
            </p>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {signingOut
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <LogOut className="h-4 w-4" />
            }
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Expiry warning banner ────────────────────────────────── */}
      {isMember && isExpiring && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3.5 text-sm text-amber-700">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            Your membership expires in <strong>{days} day{days !== 1 ? "s" : ""}</strong>.{" "}
            <Link to="/membership" className="underline hover:no-underline font-semibold">
              Renew now
            </Link>
          </span>
        </div>
      )}

      {isMember && isExpired && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-3.5 text-sm text-destructive">
          <ShieldOff className="h-4 w-4 shrink-0" />
          <span>
            Your membership has expired.{" "}
            <Link to="/membership" className="underline hover:no-underline font-semibold">
              Renew to restore access
            </Link>
          </span>
        </div>
      )}

      {/* ── Stats grid ──────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Status"
          value={isMember ? "Active" : "Free"}
          sub={isMember ? "Full access" : "Limited access"}
        />
        <StatCard
          icon={<Crown className="h-4 w-4" />}
          label="Plan"
          value={isMember ? "Member" : "None"}
          sub={isMember ? "All content unlocked" : "Upgrade to unlock all"}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label={isExpired ? "Expired" : "Renews"}
          value={
            isMember
              ? formatDate(profile?.expiry_date ?? null)
              : "—"
          }
          sub={
            isMember && days !== null && !isExpired
              ? `${days} day${days !== 1 ? "s" : ""} remaining`
              : isMember && isExpired
              ? "Membership lapsed"
              : "No active subscription"
          }
        />
      </div>

      {/* ── Membership section ───────────────────────────────────── */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-bold text-foreground">
          Membership
        </h2>

        {isMember && !isExpired ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Access level</span>
              <span className="font-medium text-foreground">Full — all books &amp; exclusives</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Expiry date</span>
              <span className="font-medium text-foreground">
                {formatDate(profile?.expiry_date ?? null)}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <BookOpen className="h-4 w-4" />
                Browse Member Shop
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              {isExpired
                ? "Your subscription has ended. Renew to regain full access to all books and exclusive content."
                : "You don't have an active membership yet. Subscribe to unlock all books and exclusive content."}
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/membership"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Crown className="h-4 w-4" />
                {isExpired ? "Renew Membership" : "View Plans"}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
              >
                <BookOpen className="h-4 w-4" />
                Browse Free Titles
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Account details ──────────────────────────────────────── */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-bold text-foreground">
          Account Details
        </h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Username</span>
            <span className="font-medium text-foreground">
              {profile?.username ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground">{profile?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
              {profile?.id}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Joined</span>
            <span className="font-medium text-foreground">
              {formatDate(profile?.created_at ?? null)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Support footer ───────────────────────────────────────── */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Need help with your account?{" "}
        <a
          href="mailto:support@hpbooks.uk"
          className="text-primary underline hover:no-underline"
        >
          support@hpbooks.uk
        </a>
      </p>
    </div>
  );
}