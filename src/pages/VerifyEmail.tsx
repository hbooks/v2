import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState<string>("");

  // Get email from navigation state (passed from Signup)
  useEffect(() => {
    const stateEmail = (location.state as any)?.email;
    if (stateEmail) {
      setEmail(stateEmail);
      // Also store in sessionStorage as fallback
      sessionStorage.setItem("pendingVerificationEmail", stateEmail);
    } else {
      // Try to get from sessionStorage
      const storedEmail = sessionStorage.getItem("pendingVerificationEmail");
      if (storedEmail) setEmail(storedEmail);
    }
  }, [location]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address not found. Please sign up again.");
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });
      if (error) throw error;
      toast.success("Verification email resent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="animate-scale-in text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-4 font-heading text-3xl font-bold text-foreground">Account Verified!</h1>
          <p className="mt-2 text-muted-foreground">Redirecting to your shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in rounded-xl border border-border bg-card p-8 text-center">
        <Mail className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 font-heading text-3xl font-bold text-foreground">Verify Your Email</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We've sent a verification link to <strong>{email || "your email"}</strong>. Check your inbox (and spam folder) to verify your account.
        </p>
        <button
          onClick={handleResend}
          disabled={resending || !email}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-secondary px-6 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
          {resending ? "Resending..." : "Resend Verification Email"}
        </button>
      </div>
    </div>
  );
}