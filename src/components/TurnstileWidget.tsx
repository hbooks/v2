import { Turnstile } from "@marsidev/react-turnstile";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
}

export default function TurnstileWidget({ onSuccess, onError }: TurnstileWidgetProps) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  if (!siteKey) return <div className="text-destructive">Missing Turnstile site key</div>;
  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onSuccess}
      onError={onError}
      options={{ theme: "light", size: "normal" }}
    />
  );
}