import { useState } from "react";
import { ShoppingCart, Download, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type Product = {
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

interface Props {
  product: Product;
  onVerificationRequired?: () => void;
}

export default function ProductCard({ product, onVerificationRequired }: Props) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [downloadLoading, setDownloadLoading] = useState(false);
  const isMember = user?.tag === "member";
  const isUnverified = user?.tag === "unverified";

  const coverImage = product.images?.[0] || "/placeholder-book.jpg";

  const handleAddToCart = () => {
    if (isUnverified && onVerificationRequired) {
      onVerificationRequired();
      return;
    }
    // Pass the full product – cart context will convert to CartItem
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleDownload = async () => {
    if (!product.file_url) {
      toast.error("Download not available for this product");
      return;
    }
    setDownloadLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("product-files")
        .createSignedUrl(product.file_url, 60);
      if (error) throw error;
      const link = document.createElement("a");
      link.href = data.signedUrl;
      link.download = product.name.replace(/\s+/g, "_") + ".pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Download started for ${product.name}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Download failed. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleAction = () => {
    if (isUnverified && onVerificationRequired) {
      onVerificationRequired();
      return;
    }
    if (isMember) {
      handleDownload();
      return;
    }
    handleAddToCart();
  };

  const isOutOfStock = product.stock_status === "out_of_stock";

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={coverImage}
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
          {!isMember && !isOutOfStock && (
            <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
          )}
          {isOutOfStock && <span className="text-sm text-destructive">Out of Stock</span>}
          <button
            onClick={handleAction}
            disabled={isOutOfStock || (isMember && downloadLoading)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isMember
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isMember ? (
              downloadLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Download
                </>
              )
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