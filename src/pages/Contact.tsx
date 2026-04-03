import { useState } from "react";
import { Send, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    // TODO: Insert into Supabase contact_messages table
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    setName("");
    setEmail("");
    setMessage("");
    setLoading(false);
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
            />
          </div>

          {/* Turnstile placeholder */}
          <div className="rounded-md border border-dashed border-border bg-secondary/50 px-3 py-4 text-center text-xs text-muted-foreground">
            🔒 Cloudflare Turnstile captcha will appear here
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
