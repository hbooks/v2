import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

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

export default function ExclusivePage() {
  const [exclusives, setExclusives] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExclusives = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("type", "exclusive")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setExclusives(data || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExclusives();
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
        <p>Failed to load exclusive content: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">Exclusive Scenes</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Behind-the-scenes content, deleted chapters, and early releases — available only here.
      </p>
      {exclusives.length === 0 ? (
        <p className="text-center text-muted-foreground">No exclusive content available yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exclusives.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}