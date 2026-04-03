import { ShoppingCart, Download } from "lucide-react";
import { Product } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface Props {
  product: Product;
  onVerificationRequired?: () => void;
}

export default function ProductCard({ product, onVerificationRequired }: Props) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const isMember = user?.tag === "member";
  const isUnverified = user?.tag === "unverified";

  const handleAction = () => {
    if (isUnverified && onVerificationRequired) {
      onVerificationRequired();
      return;
    }
    if (isMember) {
      toast.success("Download started!");
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={product.cover_image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <span className="mb-1 inline-block rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {product.type === "book" ? "Book" : "Exclusive"}
        </span>
        <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          {!isMember && (
            <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
          )}
          <button
            onClick={handleAction}
            disabled={product.stock_status === "out_of_stock"}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isMember
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isMember ? (
              <>
                <Download className="h-4 w-4" /> Download
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
