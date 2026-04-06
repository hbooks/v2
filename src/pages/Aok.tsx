import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, resendVerification } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no_token">("loading");
  const [countdown, setCountdown] = useState(3);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    console.log("🔑 Token from URL:", token);
    console.log("📝 Type from URL:", type);

    if (!token || type !== "signup") {
      setStatus("no_token");
      return;
    }

    const verifyEmail = async () => {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "signup",
        });
        if (error) throw error;
        console.log("✅ Verification successful:", data);
        setStatus("success");
        toast.success("Email verified successfully!");
      } catch (err: any) {
        console.error("❌ Verification error:", err);
        setStatus("error");
        toast.error(err.message || "Verification failed. The link may be invalid or expired.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  // Auto‑redirect after success
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
    setResending(true);
    try {
      await resendVerification();
      toast.success("Verification email resent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  // Case: verifying token
  if (status === "loading") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  // Case: success
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
          Redirecting you to the login page in <span className="font-bold text-primary">{countdown}</span> seconds...
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

  // Case: error during verification (token present but invalid)
  if (status === "error") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
        <p className="max-w-md text-center text-muted-foreground">
          The verification link is invalid or has expired.
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="mt-4 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Sign Up Again
        </button>
      </div>
    );
  }

  // Case: no token in URL – user arrived manually
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
      <Mail className="h-16 w-16 text-primary" />
      <h1 className="text-2xl font-bold text-foreground">Verify Your Email</h1>
      <p className="max-w-md text-center text-muted-foreground">
        Please check your email inbox (and spam folder) for the verification link.
      </p>
      {user?.email && (
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
        onClick={() => navigate("/login")}
        className="mt-2 text-sm text-muted-foreground underline hover:text-foreground"
      >
        Back to Login
      </button>
    </div>
  );
}