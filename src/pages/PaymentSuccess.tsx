import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const apiRef = searchParams.get("api_ref");
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiRef) return;
    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("download_links")
        .eq("api_ref", apiRef)
        .single();
      if (data) setDownloads(data.download_links || []);
      setLoading(false);
    };
    fetchOrder();
  }, [apiRef]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Payment Successful!</h1>
      <p>Thank you for your purchase. Your downloads are below (links expire in 24 hours).</p>
      <div className="mt-6 space-y-4">
        {downloads.map((dl: any) => (
          <div key={dl.product_id} className="flex justify-between items-center border-b pb-2">
            <span>{dl.product_name}</span>
            <a href={dl.download_url} className="text-primary underline" download>Download</a>
          </div>
        ))}
      </div>
    </div>
  );
}