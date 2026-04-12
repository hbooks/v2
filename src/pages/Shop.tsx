import { useEffect, useState, useRef } from "react";
import { Loader2, Sparkles, BookOpen, ChevronDown, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import GuestPopup from "@/components/GuestPopup";
import heroImage from "@/assets/hero-books.jpg";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: "book" | "exclusive";
  stock_status: "in_stock" | "out_of_stock";
  images: string[];
  file_url?: string;
  created_at: string;
};

// Staggered fade-in for grid cards
function useInView(ref: React.RefObject<HTMLElement>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-1 w-1 rounded-full bg-primary/40" />
        ))}
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  label,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  label: string;
  title: string;
  subtitle: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>);
  return (
    <div
      ref={ref}
      className={`mb-10 transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          {label}
        </span>
      </div>
      <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
      <p className="mt-2 text-muted-foreground max-w-lg">{subtitle}</p>
    </div>
  );
}

function AnimatedGrid({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>);
  return (
    <div
      ref={ref}
      className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-700 ${
        inView ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

export default function ShopPage() {
  const [books, setBooks] = useState<Product[]>([]);
  const [exclusives, setExclusives] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setBooks((data || []).filter((p) => p.type === "book"));
        setExclusives((data || []).filter((p) => p.type === "exclusive"));
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading the collection…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-destructive">Failed to load products: {error}</p>
      </div>
    );
  }

  return (
    <>
      <GuestPopup />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative h-[60vh] min-h-[460px] overflow-hidden">
        {/* Background image */}
        <img
          src={heroImage}
          alt="Hbooks library"
          onLoad={() => setHeroLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${
            heroLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />

        {/* Multi-layer gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />

        {/* Subtle animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/10"
              style={{
                width: `${40 + i * 20}px`,
                height: `${40 + i * 20}px`,
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                animation: `float ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
                opacity: 0.3 + i * 0.05,
              }}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative flex h-full items-end pb-14">
          <div className="container mx-auto px-4">
            {/* Eyebrow label */}
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5"
              style={{ animation: "fadeSlideUp 0.6s ease forwards", opacity: 0 }}
            >
              <Star className="h-3 w-3 text-primary fill-primary" />
              <span className="text-xs font-semibold tracking-wide text-primary">
                Digital Books & Exclusives
              </span>
            </div>

            <h1
              className="font-heading text-4xl font-bold text-foreground md:text-6xl lg:text-7xl leading-tight"
              style={{ animation: "fadeSlideUp 0.7s 0.1s ease forwards", opacity: 0 }}
            >
              Discover Your Next{" "}
              <span className="text-gradient-gold">Great Read</span>
            </h1>

            <p
              className="mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed"
              style={{ animation: "fadeSlideUp 0.7s 0.2s ease forwards", opacity: 0 }}
            >
              Premium digital books and exclusive behind-the-scenes content from H.P. —
              stories that stay with you long after the last page.
            </p>

            {/* Stats row */}
            <div
              className="mt-7 flex flex-wrap items-center gap-6"
              style={{ animation: "fadeSlideUp 0.7s 0.3s ease forwards", opacity: 0 }}
            >
              {[
                { value: `${books.length}`, label: "Books" },
                { value: `${exclusives.length}`, label: "Exclusives" },
                { value: "24h", label: "Instant delivery" },
              ].map(({ value, label }) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <span className="font-heading text-2xl font-bold text-foreground">{value}</span>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
          <span className="text-xs text-muted-foreground tracking-widest uppercase">Explore</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />
        </div>
      </section>

      {/* ── Books section ─────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <SectionHeader
          icon={BookOpen}
          label="The Collection"
          title="My Books"
          subtitle="Every title available as an instant digital download — start reading in seconds."
        />
        <SectionDivider />
        <div className="mt-10">
          {books.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No books available yet — check back soon.</p>
            </div>
          ) : (
            <AnimatedGrid>
              {books.map((product, i) => (
                <div
                  key={product.id}
                  style={{
                    animation: "fadeSlideUp 0.5s ease forwards",
                    animationDelay: `${i * 80}ms`,
                    opacity: 0,
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </AnimatedGrid>
          )}
        </div>
      </section>

      {/* ── Exclusive Scenes section ──────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle section background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 py-20 relative">
          <SectionHeader
            icon={Sparkles}
            label="Members Only"
            title="Exclusive Scenes"
            subtitle="Behind-the-scenes content, deleted chapters, and extras you won't find anywhere else."
          />
          <SectionDivider />
          <div className="mt-10">
            {exclusives.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-16 text-center">
                <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No exclusive content yet — more coming soon.</p>
              </div>
            ) : (
              <AnimatedGrid>
                {exclusives.map((product, i) => (
                  <div
                    key={product.id}
                    style={{
                      animation: "fadeSlideUp 0.5s ease forwards",
                      animationDelay: `${i * 80}ms`,
                      opacity: 0,
                    }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </AnimatedGrid>
            )}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA banner ─────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-10 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="relative">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Star className="h-5 w-5 text-primary fill-primary/50" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground">
              Unlock Everything with Membership
            </h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Get unlimited access to all books and exclusive content for one low monthly price.
            </p>
            <a
              href="/comingsoon" // change later to /membership
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Star className="h-4 w-4" />
              View Membership Plans
            </a>
          </div>
        </div>
      </section>

      {/* ── Keyframe animations ───────────────────────────────────── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
      `}</style>
    </>
  );
}