import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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

export default function ShopPage() {
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
      <div className="flex h-screen items-center justify-center">
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
    <>
      <GuestPopup />
      {/* Hero section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt="Hbooks library"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="relative flex h-full items-end pb-12">
          <div className="container mx-auto px-4">
            <h1 className="animate-fade-in font-heading text-4xl font-bold text-foreground md:text-5xl">
              Discover Your Next <span className="text-gradient-gold">Great Read</span>
            </h1>
            <p className="mt-3 max-w-lg animate-fade-in text-lg text-muted-foreground">
              Premium digital books and exclusive behind-the-scenes content from H.P.
            </p>
          </div>
        </div>
      </section>

      {/* Books section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 font-heading text-3xl font-bold text-foreground">My Books</h2>
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

      {/* Exclusive Scenes section */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="mb-8 font-heading text-3xl font-bold text-foreground">Exclusive Scenes</h2>
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
    </>
  );
}