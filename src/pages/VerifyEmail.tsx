import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false); // true after resend clicked
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Get email from navigation state or sessionStorage
  useEffect(() => {
    const stateEmail = (location.state as any)?.email;
    if (stateEmail) {
      setEmail(stateEmail);
      sessionStorage.setItem("pendingVerificationEmail", stateEmail);
    } else {
      const storedEmail = sessionStorage.getItem("pendingVerificationEmail");
      if (storedEmail) setEmail(storedEmail);
    }
  }, [location]);

  // Check if user is already verified (e.g., they closed the tab and later reopened)
  useEffect(() => {
    const checkVerified = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setVerified(true);
        // Start countdown to redirect to login after 3 seconds (or 22?)
        setRedirectCountdown(3);
      } else {
        // Not verified – start silent redirect after 22 seconds
        setRedirectCountdown(22);
      }
    };
    checkVerified();
  }, []);

  // Handle automatic redirect countdown
  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      navigate("/login");
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, navigate]);

  const handleResend = async () => {
    if (resendDone) return; // already clicked
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
      // After successful resend, disable the button and start a new redirect countdown
      setResendDone(true);
      setRedirectCountdown(20); // redirect in 20 seconds
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
          <p className="mt-2 text-muted-foreground">
            Redirecting to login in {redirectCountdown} seconds...
          </p>
        </div>
      </div>
    );
  }

  // If resend was done, show message and countdown
  if (resendDone) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in rounded-xl border border-border bg-card p-8 text-center">
          <Mail className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">Verification Email Sent</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            A new verification link has been sent to <strong>{email}</strong>.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            If you don't receive it, please check your spam folder or contact support at{" "}
            <a href="mailto:contact@hpbooks.uk" className="text-primary underline">contact@hpbooks.uk</a>.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Redirecting to login in {redirectCountdown} seconds...
          </p>
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
          We've sent a verification link to <strong>{email || "your email"}</strong>. 
          Check your inbox (and spam folder) to verify your account.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Redirecting to login in {redirectCountdown} seconds...
        </p>
        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-secondary px-6 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
          {resending ? "Sending..." : "Resend Verification Email"}
        </button>
      </div>
    </div>
  );
}