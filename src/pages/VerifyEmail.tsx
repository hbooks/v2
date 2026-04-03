import { useState } from "react";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [verified] = useState(false);

  const handleResend = async () => {
    setResending(true);
    // TODO: call Supabase resend verification email
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Verification email resent! Check your inbox.");
    setResending(false);
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
          We've sent a verification link to your email. Check your inbox (and spam folder) to verify your account.
        </p>
        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-secondary px-6 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
          {resending ? "Resending..." : "Resend Verification Email"}
        </button>
      </div>
    </div>
  );
}
