import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Loader2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AokPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [countdown, setCountdown] = useState(3);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const movedRef = useRef(false); // prevent multiple calls

  useEffect(() => {
    const checkAndMove = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // No user – try to get email from sessionStorage
          const storedEmail = sessionStorage.getItem("pendingVerificationEmail");
          if (storedEmail) setEmail(storedEmail);
          setStatus("error");
          return;
        }

        if (user.email_confirmed_at) {
          // ✅ User is verified – call edge function to move to members (only once)
          if (!movedRef.current) {
            movedRef.current = true;
            try {
              const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/move-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, email: user.email }),
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error || "Move failed");
              toast.success("Account verified and ready!");
            } catch (moveErr: any) {
              console.error("Edge function error:", moveErr);
              toast.error("Verification succeeded, but account update failed. You can still log in.");
              // Still proceed to success state – the login-time move will handle it
            }
          }
          setStatus("success");
          toast.success("Email verified successfully!");
        } else {
          // Not verified – store email for resend
          setEmail(user.email);
          setStatus("error");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };
    checkAndMove();
  }, []);

  // Auto-redirect after success
  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (status === "success" && countdown === 0) {
      navigate("/login");
    }
  }, [status, countdown, navigate]);

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

  if (status === "loading") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <div className="animate-bounce">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Email Verified! 🎉</h1>
        <p className="text-center text-muted-foreground">
          Your account has been successfully verified.
          <br />
          Redirecting to the login page in <span className="font-bold text-primary">{countdown}</span> seconds...
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-2 text-sm text-primary underline hover:no-underline"
        >
          Or click here to log in now
        </button>
      </div>
    );
  }

  // Error state – user not verified
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
      <XCircle className="h-16 w-16 text-destructive" />
      <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
      <p className="max-w-md text-center text-muted-foreground">
        The verification link is invalid or has expired, or your email is not yet confirmed.
      </p>
      {email && (
        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
          {resending ? "Sending..." : "Resend Verification Email"}
        </button>
      )}
      <button
        onClick={() => navigate("/signup")}
        className="mt-2 text-sm text-muted-foreground underline hover:text-foreground"
      >
        Sign Up Again
      </button>
    </div>
  );
}