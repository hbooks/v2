import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Crown, CheckCircle2, Loader2, AlertCircle, ArrowRight } from "lucide-react";

type MemberStatus = {
  tag: string;
  expiry_date: string | null;
  email: string;
};

const MAX_ATTEMPTS = 20; // 20 × 3s = 60 seconds

// Simple confetti burst using CSS keyframes rendered as divs
function Confetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#f97316"];

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {pieces.map((_, i) => {
        const color = colors[i % colors.length];
        const left  = `${Math.random() * 100}%`;
        const delay = `${Math.random() * 1.5}s`;
        const size  = `${6 + Math.random() * 8}px`;
        const duration = `${1.5 + Math.random() * 1.5}s`;
        return (
          <div
            key={i}
            style={{
              position:        "absolute",
              top:             "-10px",
              left,
              width:           size,
              height:          size,
              backgroundColor: color,
              borderRadius:    Math.random() > 0.5 ? "50%" : "2px",
              animation:       `confettiFall ${duration} ${delay} ease-in forwards`,
              transform:       `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function MembershipSuccess() {
  const [searchParams]   = useSearchParams();
  const reference        = searchParams.get("reference");
  const planFromUrl      = searchParams.get("plan") ?? "monthly";

  const [member,   setMember]   = useState<MemberStatus | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("No subscription reference found. If you completed payment, your account will be updated within a few minutes.");
      setLoading(false);
      return;
    }

    const poll = async () => {
      setAttempts((a) => {
        const next = a + 1;

        supabase
          .from("members")
          .select("tag, expiry_date, email")
          .eq("pending_subscription_ref", reference)   // still pending
          .maybeSingle()
          .then(async ({ data: pendingRow }) => {
            // If pending_subscription_ref is cleared the webhook ran
            // and the member is now active — fetch by checking tag
            if (!pendingRow) {
              // Reference was cleared — try fetching by current session user
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const { data: activeMember } = await supabase
                  .from("members")
                  .select("tag, expiry_date, email")
                  .eq("id", user.id)
                  .eq("tag", "member")
                  .maybeSingle();

                if (activeMember) {
                  setMember(activeMember);
                  setLoading(false);
                  setShowConfetti(true);
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  return;
                }
              }
            }

            if (next >= MAX_ATTEMPTS) {
              setError(
                "Your payment was received! Your membership is being activated and should be ready within 2 minutes. " +
                "Please refresh the page or check your profile."
              );
              setLoading(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
            }
          });

        return next;
      });
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reference]);

  // Auto-redirect to shop after 8 seconds on success
  useEffect(() => {
    if (!member) return;
    const timer = setTimeout(() => {
      window.location.href = "/shop";
    }, 8000);
    return () => clearTimeout(timer);
  }, [member]);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  const planLabel = planFromUrl === "annual" ? "Annual" : "Monthly";

  // ── Loading state ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
        <div className="relative mb-6">
          <Crown className="h-16 w-16 text-primary opacity-20" />
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Activating your membership…
        </h1>
        <p className="mt-2 text-muted-foreground">
          Confirming your payment with IntaSend. This usually takes under 30 seconds.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Checking ({attempts} / {MAX_ATTEMPTS})
        </p>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
        <AlertCircle className="h-14 w-14 text-amber-500" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
          Payment Received!
        </h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => window.location.reload()}
            className="rounded-md border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Refresh Page
          </button>
          <Link
            to="/profile"
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Check My Profile
          </Link>
        </div>
      </div>
    );
  }

  // ── Success state ───────────────────────────────────────────────
  return (
    <>
      {showConfetti && <Confetti />}

      <div className="container mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">

        {/* Animated checkmark ring */}
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/30">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
        </div>

        <Crown className="h-8 w-8 text-amber-500" />
        <h1 className="mt-3 font-heading text-3xl font-bold text-foreground">
          Welcome to the Club!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your <span className="font-semibold text-foreground">{planLabel} membership</span> is now active.
        </p>

        {/* Membership details card */}
        <div className="mt-8 w-full rounded-xl border border-border bg-card p-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Membership Details
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium text-foreground">{planLabel}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Active
              </span>
            </div>
            {member?.expiry_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Renews / Expires</span>
                <span className="font-medium text-foreground">
                  {formatDate(member.expiry_date)}
                </span>
              </div>
            )}
            {member?.email && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Account</span>
                <span className="font-medium text-foreground">{member.email}</span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Redirecting to the member shop in a moment…
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Browse Member Shop <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted"
          >
            View My Profile
          </Link>
        </div>
      </div>
    </>
  );
}