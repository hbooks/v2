import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    if (!token || type !== "signup") {
      setStatus("error");
      return;
    }

    const verifyEmail = async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "signup",
        });
        if (error) throw error;
        setStatus("success");
        toast.success("Email verified successfully!");
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        toast.error("Verification failed. The link may be invalid or expired.");
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

  if (status === "loading") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
        <p className="text-muted-foreground">
          The verification link is invalid or has expired.
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="mt-4 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
        >
          Sign Up Again
        </button>
      </div>
    );
  }

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