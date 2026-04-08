import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/lib/auth-context";

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

export default function MemberShopPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Product[]>([]);
  const [exclusives, setExclusives] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-destructive">
        <p>Failed to load products: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 rounded-xl border border-primary/20 bg-card p-8">
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Welcome, <span className="text-gradient-gold">Member</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          All digital products are included with your membership. Download anything below.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="mb-6 font-heading text-3xl font-bold text-foreground">Books</h2>
        {books.length === 0 ? (
          <p className="text-muted-foreground">No books available yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-6 font-heading text-3xl font-bold text-foreground">Exclusive Scenes</h2>
        {exclusives.length === 0 ? (
          <p className="text-muted-foreground">No exclusive content available.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exclusives.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
