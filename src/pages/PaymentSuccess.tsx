import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const apiRef = searchParams.get("api_ref");
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!apiRef) {
      setError("No order reference found. Please contact support.");
      setLoading(false);
      return;
    }

    let interval: ReturnType<typeof setInterval>;
    let attempts = 0;
    const maxAttempts = 12; // 12 * 5s = 60 seconds
    const delay = 5000; // 5 seconds

    const fetchOrder = async () => {
      attempts++;
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("download_links")
          .eq("api_ref", apiRef)
          .maybeSingle();

        if (error) throw error;

        if (data?.download_links && data.download_links.length > 0) {
          // Order found with download links
          setDownloads(data.download_links);
          setLoading(false);
          clearInterval(interval);
          toast.success("Your downloads are ready!");
        } else if (attempts >= maxAttempts) {
          // Timeout – order not processed
          setError("Your payment was successful, but your downloads are not yet ready. Please check back in a few minutes or contact support.");
          setLoading(false);
          clearInterval(interval);
        } else {
          // Still waiting – update retry count for UI feedback
          setRetryCount(attempts);
        }
      } catch (err: any) {
        console.error(err);
        if (attempts >= maxAttempts) {
          setError("Failed to retrieve your order. Please contact support with your order reference: " + apiRef);
          setLoading(false);
          clearInterval(interval);
        }
      }
    };

    // Initial fetch
    fetchOrder();

    // Poll every 5 seconds
    interval = setInterval(fetchOrder, delay);

    return () => clearInterval(interval);
  }, [apiRef]);

  const handleManualRefresh = () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    // Force re-run the effect by resetting state and re-fetching
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying your payment and preparing downloads...</p>
        {retryCount > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Waiting for order confirmation ({retryCount}/12 attempts)...
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <button
          onClick={handleManualRefresh}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
        <p className="mt-2 text-muted-foreground">
          Your order is being processed. Downloads will appear here shortly.
        </p>
        <button
          onClick={handleManualRefresh}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-secondary px-6 py-2.5 text-sm font-medium"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">Payment Successful! 🎉</h1>
      <p className="mt-2 text-muted-foreground">
        Thank you for your purchase. Your downloads are below (links expire in 24 hours).
      </p>
      <div className="mt-6 space-y-4">
        {downloads.map((dl: any) => (
          <div key={dl.product_id} className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-medium">{dl.product_name}</span>
            <a
              href={dl.download_url}
              className="text-primary underline hover:no-underline"
              download
            >
              Download
            </a>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        If you have any issues, please contact support at{' '}
        <a href="mailto:support@hpbooks.uk" className="text-primary underline">
          support@hpbooks.uk
        </a>
      </p>
    </div>
  );
}