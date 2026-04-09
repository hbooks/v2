// src/pages/Contact.tsx
import { useState } from "react";
import { Send, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import TurnstileWidget from "@/components/TurnstileWidget";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [turnstileReset, setTurnstileReset] = useState(0);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!name.trim() || !email.trim() || !message.trim()) {
    toast.error("Please fill in all fields");
    return;
  }
  if (!turnstileToken) {
    toast.error("Security check still running, please wait...");
    return;
  }
  setLoading(true);
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        turnstileToken,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    toast.success("Message sent! We'll get back to you soon.");
    setName("");
    setEmail("");
    setMessage("");
    // Reset captcha after successful send
    setTurnstileToken(null);
    setCaptchaLoading(true);
    setTurnstileReset((prev) => prev + 1);
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "Failed to send message. Please try again.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 font-heading text-4xl font-bold text-foreground">Get in Touch</h1>
        <p className="mb-8 text-muted-foreground">Have a question? We'd love to hear from you.</p>

        <div className="mb-8 flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Email us directly</p>
            <a href="mailto:support@hpbooks.uk" className="text-sm text-primary hover:underline">
              support@hpbooks.uk
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-8">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Your name"
              required
            />
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
            <label className="mb-1 block text-sm font-medium text-foreground">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Your message..."
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
            disabled={loading || !turnstileToken}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {loading ? "Sending..." : captchaLoading ? "Security check running..." : "Send Message"}
          </button>
          {captchaLoading && !turnstileToken && (
            <p className="text-xs text-center text-muted-foreground">
              Confirming you're not a robot, please wait...
            </p>
          )}
        </form>
      </div>
    </div>
  );
}