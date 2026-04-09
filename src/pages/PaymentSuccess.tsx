import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type DownloadLink = {
  product_id: string;
  product_name: string;
  download_url: string;
};

const MAX_ATTEMPTS = 12; // 12 × 5s = 60 seconds

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const apiRef = searchParams.get("api_ref");
  const [downloads, setDownloads] = useState<DownloadLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!apiRef) {
      setError(
        "No order reference found in URL. If you completed payment, please contact support@hpbooks.uk with your payment confirmation."
      );
      setLoading(false);
      return;
    }

    let interval: ReturnType<typeof setInterval>;
    let attempts = 0;

    const fetchOrder = async () => {
      attempts++;

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("download_links")
        .eq("api_ref", apiRef)
        .maybeSingle();

      if (fetchError) {
        console.error("Supabase fetch error:", fetchError);

        const isPermissionError =
          fetchError.code === "42501" ||
          fetchError.message?.toLowerCase().includes("permission") ||
          fetchError.message?.toLowerCase().includes("policy");

        if (isPermissionError) {
          setError(
            "Access denied when retrieving your order. Please contact support@hpbooks.uk with reference: " +
              apiRef
          );
          setLoading(false);
          clearInterval(interval);
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          setError(
            "Could not retrieve your order after multiple attempts. Please contact support@hpbooks.uk with reference: " +
              apiRef
          );
          setLoading(false);
          clearInterval(interval);
        } else {
          setRetryCount(attempts);
        }
        return;
      }

      const links = data?.download_links as DownloadLink[] | null;

      if (links && links.length > 0) {
        setDownloads(links);
        setLoading(false);
        clearInterval(interval);
        toast.success("Your downloads are ready!");
      } else if (attempts >= MAX_ATTEMPTS) {
        setError(
          "Your payment was received but your order is not ready yet. Downloads are usually available within 2 minutes. Please refresh this page or contact support@hpbooks.uk with reference: " +
            apiRef
        );
        setLoading(false);
        clearInterval(interval);
      } else {
        setRetryCount(attempts);
      }
    };

    fetchOrder();
    interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [apiRef]);

  const handleManualRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Payment received — preparing your downloads…
        </h1>
        <p className="mt-2 text-muted-foreground">
          This usually takes under 30 seconds.
        </p>
        {retryCount > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Checking… ({retryCount} / {MAX_ATTEMPTS})
          </p>
        )}
        {apiRef && (
          <p className="mt-4 text-xs text-muted-foreground font-mono">
            Order ref: {apiRef}
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground whitespace-pre-line">{error}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleManualRefresh}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          <a
            href="mailto:support@hpbooks.uk"
            className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
        <p className="mt-2 text-muted-foreground">
          Your order is being processed. Please refresh in a moment.
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
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
        <h1 className="text-3xl font-bold text-foreground">Payment Successful!</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Thank you for your purchase. Your downloads are ready below.{" "}
        <span className="font-medium">Links expire in 24 hours.</span>
      </p>

      <div className="mt-6 rounded-lg border border-border divide-y divide-border">
        {downloads.map((dl) => (
          <div
            key={dl.product_id}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="font-medium text-foreground">{dl.product_name}</span>
            <a
              href={dl.download_url}
              className="text-sm text-primary underline hover:no-underline font-medium"
              download
              target="_blank"
              rel="noreferrer"
            >
              Download
            </a>
          </div>
        ))}
      </div>

      {apiRef && (
        <p className="mt-4 text-xs text-muted-foreground font-mono">
          Order reference: {apiRef}
        </p>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        Need help?{" "}
        <a href="mailto:support@hpbooks.uk" className="text-primary underline">
          support@hpbooks.uk
        </a>
      </p>
    </div>
  );
}