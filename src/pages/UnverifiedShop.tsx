import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import ProductCard from "@/components/ProductCard";
import { useNavigate } from "react-router-dom";

export default function UnverifiedShopPage() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Red banner */}
      <div className="sticky top-16 z-40 flex items-center justify-center gap-2 bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground">
        <AlertTriangle className="h-4 w-4" />
        UNVERIFIED ACCOUNT – PLEASE VERIFY YOUR EMAIL TO ACCESS FULL FEATURES
      </div>

      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">Shop</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onVerificationRequired={() => setShowModal(true)}
            />
          ))}
        </div>
      </div>

      {/* Verification modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 mx-4 w-full max-w-md animate-scale-in rounded-xl border border-border bg-card p-8 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
            <h2 className="mt-4 font-heading text-2xl font-bold text-foreground">Verification Required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please verify your email address to make purchases. Click below to resend the verification email.
            </p>
            <button
              onClick={() => {
                setShowModal(false);
                navigate("/verify-email");
              }}
              className="mt-6 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Verify My Account
            </button>
          </div>
        </div>
      )}
    </>
  );
}
