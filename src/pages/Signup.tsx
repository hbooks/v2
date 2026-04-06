import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import TurnstileWidget from "@/components/TurnstileWidget";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [turnstileReset, setTurnstileReset] = useState(0);

  const validateUsername = (val: string) => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(val)) {
      setUsernameError("Only letters, numbers, underscore, 3-20 characters");
      return false;
    }
    setUsernameError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!validateUsername(username)) return;
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!turnstileToken) {
      toast.error("Captcha still loading, please wait...");
      return;
    }

    setLoading(true);
    try {
      await signup(username, email, password, turnstileToken);
      toast.success("Verification email sent! Check your inbox.");
      sessionStorage.setItem("pendingVerificationEmail", email);
      navigate("/verify-email", { state: { email } });
    } catch (err: any) {
      toast.error(err.message || "Sign up failed");
      // Reset Turnstile on error
      setTurnstileToken(null);
      setTurnstileReset(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in rounded-xl border border-border bg-card p-8">
        <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">Create Account</h1>
        <p className="mb-6 text-sm text-muted-foreground">Join Hbooks and start your reading journey</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (e.target.value) validateUsername(e.target.value);
              }}
              onBlur={() => username && validateUsername(username)}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="your_username"
              required
            />
            {usernameError && <p className="mt-1 text-xs text-destructive">{usernameError}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="••••••••"
              required
            />
          </div>

           <TurnstileWidget
            key={turnstileReset}
            onSuccess={(token) => {
              setTurnstileToken(token);
              setCaptchaLoading(false);
            }}
            onError={() => {
              setTurnstileToken(null);
              setCaptchaLoading(true);
            }}
            onExpired={() => {
              setTurnstileToken(null);
              setCaptchaLoading(true);
            }}
          />

          <button
            type="submit"
            disabled={loading || !turnstileToken || !!usernameError}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : captchaLoading ? "Security check running..." : "Create Account"}
          </button>
          {captchaLoading && !turnstileToken && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Confirming you're not a robot, please wait...
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}