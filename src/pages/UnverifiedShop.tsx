import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { mockProducts } from "@/lib/mock-data";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

export default function UnverifiedShopPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");

  // Redirect if already verified
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      // No user – redirect to login
      navigate("/login");
      return;
    }
    // Check if user is verified (either by tag or email_confirmed_at)
    const checkVerified = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email_confirmed_at || user.tag !== "unverified") {
        // User is verified – redirect to regular shop
        navigate("/");
        return;
      }
      // Store email for resend
      setEmail(authUser?.email || user.email);
    };
    checkVerified();
  }, [user, isLoading, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Email address not found. Please sign up again.");
      return;
    }
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });
      if (error) throw error;
      toast.success("Verification email resent! Check your inbox.");
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification email.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Custom header (no navigation links)
  const CustomHeader = () => (
    <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <span className="font-heading text-xl font-bold text-foreground">
            Hbooks <span className="text-primary">Unverified</span>
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {email && <span>Verification pending for {email}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <CustomHeader />
      {/* Red banner */}
      <div className="sticky top-16 z-40 flex items-center justify-center gap-2 bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground">
        <AlertTriangle className="h-4 w-4" />
        UNVERIFIED ACCOUNT – PLEASE VERIFY YOUR EMAIL TO ACCESS FULL FEATURES
      </div>
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">Shop (Preview Mode)</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onVerificationRequired={() => setShowModal(true)}
            />
          ))}
        </div>
      </main>
      {/* No footer – to prevent bypass */}
      {/* Verification modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 mx-4 w-full max-w-md animate-scale-in rounded-xl border border-border bg-card p-8 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
            <h2 className="mt-4 font-heading text-2xl font-bold text-foreground">Verification Required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your email is not verified. Please verify your email address to access full features and make purchases.
            </p>
            <button
              onClick={handleResendVerification}
              className="mt-6 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Resend Verification Email
            </button>
            <p className="mt-4 text-xs text-muted-foreground">
              Already verified? <button onClick={() => navigate("/login")} className="text-primary underline">Log in</button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}