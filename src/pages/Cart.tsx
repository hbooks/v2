import { useCart } from "@/lib/cart-context";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 font-heading text-3xl font-bold text-foreground">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Browse our collection and add some books!</p>
        <Link
          to="/"
          className="mt-6 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    // TODO: Create IntaSend checkout session
    toast.info("IntaSend checkout will be integrated here");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-lg border border-border bg-card p-4">
              <img
                src={item.cover_image_url}
                alt={item.name}
                className="h-24 w-16 rounded object-cover"
                loading="lazy"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="rounded border border-border p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-medium text-foreground">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="rounded border border-border p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Processing fee</span>
              <span>$0.00</span>
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Total</span>
              <span className="text-primary">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="mt-6 w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Checkout with IntaSend
          </button>
          <button
            onClick={() => clearCart()}
            className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Clear cart
          </button>
        </div>
      </div>
    </div>
  );
}