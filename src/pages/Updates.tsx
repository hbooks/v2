import { mockUpdates } from "@/lib/mock-data";
import { CalendarDays } from "lucide-react";

export default function UpdatesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">Updates</h1>
      <p className="mb-8 text-muted-foreground">Latest news and announcements from H.P.</p>

      <div className="space-y-6">
        {mockUpdates.map((update) => (
          <article key={update.id} className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(update.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
            <h2 className="mt-2 font-heading text-xl font-bold text-foreground">{update.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{update.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
