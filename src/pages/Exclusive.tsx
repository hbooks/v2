import { mockProducts } from "@/lib/mock-data";
import ProductCard from "@/components/ProductCard";

export default function ExclusivePage() {
  const exclusives = mockProducts.filter((p) => p.type === "exclusive");

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">Exclusive Scenes</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Behind-the-scenes content, deleted chapters, and early releases — available only here.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exclusives.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
