import { Check, Crown, Star, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const plans = [
  {
    name: "Monthly",
    planId: "4KZ840P",
    price: "$6.99",
    period: "/month",
    features: [
      "Access to all digital books",
      "Exclusive scenes & deleted chapters",
      "Early access to new releases",
      "Private Discord community",
    ],
  },
  {
    name: "Annual",
    planId: "8047N0N",
    price: "$71.99",
    period: "/year",
    badge: "Save 14%",
    features: [
      "Everything in Monthly",
      "2 months free",
      "Priority support",
      "Signed digital bookplates",
    ],
  },
];

export default function MembershipPage() {
  const { isGuest, user } = useAuth();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: { name: string; planId: string }) => {
    // Redirect guests to login
    if (isGuest || !user) {
      setShowGuestModal(true);
      return;
    }

    setLoadingPlan(plan.name);

    try {
      // Fetch user profile for username / email
      const { data: profile } = await supabase
        .from("members")
        .select("email, username")
        .eq("id", user.id)
        .maybeSingle();

      const email    = profile?.email    || user.email    || "";
      const username = profile?.username || user.email?.split("@")[0] || "";

      // Call the create-membership-checkout edge function
      const { data, error } = await supabase.functions.invoke(
        "create-membership-checkout",
        {
          body: {
            planId:   plan.planId,
            planName: plan.name,
            email,
            userId:   user.id,
            username,
          },
        }
      );

      if (error) throw new Error(error.message);
      if (!data?.checkoutUrl) throw new Error("No checkout URL returned");

      // Redirect to IntaSend subscription setup page
      window.location.href = data.checkoutUrl;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      console.error("Subscription error:", message);
      toast.error(message);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <Crown className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 font-heading text-4xl font-bold text-foreground">
          Become a <span className="text-gradient-gold">Member</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Unlock everything. All books, all exclusive content, all the time.
        </p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const isLoading = loadingPlan === plan.name;
          return (
            <div
              key={plan.name}
              className="relative rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              {plan.badge && (
                <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {plan.badge}
                </span>
              )}
              <h3 className="font-heading text-2xl font-bold text-foreground">
                {plan.name}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading || loadingPlan !== null}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Why membership section */}
      <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-border bg-card p-8 text-center">
        <Star className="mx-auto h-8 w-8 text-primary" />
        <h3 className="mt-3 font-heading text-xl font-bold text-foreground">
          Why Membership?
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          As a member, you get unlimited access to every book and exclusive piece of content
          in the store. No per-item purchases, no limits. Plus, you join our private community
          and get early access to everything new.
        </p>
      </div>

      {/* Guest modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setShowGuestModal(false)}
          />
          <div className="relative z-10 mx-4 w-full max-w-sm animate-scale-in rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="font-heading text-xl font-bold text-foreground">
              Account Required
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please log in or sign up to subscribe to a membership plan.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/login"
                className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="flex-1 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}