import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import TurnstileWidget from "@/components/TurnstileWidget";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);

  // Redirect based on user tag after auth loads
  useEffect(() => {
    if (!authLoading && user) {
      if (user.tag === "member") navigate("/member-shop");
      else if (user.tag === "unverified") navigate("/unverified-shop");
      else navigate("/");
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!turnstileToken) {
      toast.error("Please complete the captcha");
      return;
    }

    setLoading(true);
    try {
      await login(email, password, turnstileToken);
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
      // Reset captcha to get a fresh token
      setTurnstileToken(null);
      setTurnstileReset(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="flex min-h-[80vh] items-center justify-center">Loading...</div>;
  if (user) return null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <h1 className="mb-2 text-3xl font-bold">Welcome Back</h1>
        <p className="mb-6 text-sm text-muted-foreground">Sign in to your Hbooks account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 pr-10 text-sm"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <TurnstileWidget
            key={turnstileReset}
            onSuccess={setTurnstileToken}
            onError={() => setTurnstileToken(null)}
            onExpired={() => setTurnstileToken(null)}
          />

          <button
            type="submit"
            disabled={loading || !turnstileToken}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}