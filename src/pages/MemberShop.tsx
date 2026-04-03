import { mockProducts } from "@/lib/mock-data";
import ProductCard from "@/components/ProductCard";

export default function MemberShopPage() {
  const books = mockProducts.filter((p) => p.type === "book");
  const exclusives = mockProducts.filter((p) => p.type === "exclusive");

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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 font-heading text-3xl font-bold text-foreground">Exclusive Scenes</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exclusives.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
