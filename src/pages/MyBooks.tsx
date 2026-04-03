import { mockProducts } from "@/lib/mock-data";
import ProductCard from "@/components/ProductCard";

export default function MyBooksPage() {
  const books = mockProducts.filter((p) => p.type === "book");

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">My Books</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Full-length novels by H.P. — immersive stories that transport you to worlds beyond imagination.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
