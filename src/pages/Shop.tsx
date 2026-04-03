import { mockProducts } from "@/lib/mock-data";
import ProductCard from "@/components/ProductCard";
import GuestPopup from "@/components/GuestPopup";
import heroImage from "@/assets/hero-books.jpg";

export default function ShopPage() {
  const books = mockProducts.filter((p) => p.type === "book");
  const exclusives = mockProducts.filter((p) => p.type === "exclusive");

  return (
    <>
      <GuestPopup />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={heroImage} alt="Hbooks library" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="relative flex h-full items-end pb-12">
          <div className="container mx-auto px-4">
            <h1 className="animate-fade-in font-heading text-4xl font-bold text-foreground md:text-5xl">
              Discover Your Next <span className="text-gradient-gold">Great Read</span>
            </h1>
            <p className="mt-3 max-w-lg animate-fade-in text-lg text-muted-foreground" style={{ animationDelay: "0.2s" }}>
              Premium digital books and exclusive behind-the-scenes content from H.P.
            </p>
          </div>
        </div>
      </section>

      {/* Books */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 font-heading text-3xl font-bold text-foreground">My Books</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Exclusive Scenes */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="mb-8 font-heading text-3xl font-bold text-foreground">Exclusive Scenes</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exclusives.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
