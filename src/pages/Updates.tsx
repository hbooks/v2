import { useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Update = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("updates")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setUpdates(data || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-destructive">
        <p>Failed to load updates: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">Updates</h1>
      <p className="mb-8 text-muted-foreground">Latest news and announcements from H.P.</p>

      {updates.length === 0 ? (
        <p className="text-center text-muted-foreground">No updates yet. Check back soon!</p>
      ) : (
        <div className="space-y-6">
          {updates.map((update) => (
            <article
              key={update.id}
              className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/20"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(update.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <h2 className="mt-2 font-heading text-xl font-bold text-foreground">{update.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{update.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}