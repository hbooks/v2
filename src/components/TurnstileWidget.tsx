import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  key?: number;
}

declare global {
  interface Window {
    turnstileCallback: (token: string) => void;
    turnstile: any;
  }
}

export default function TurnstileWidget({ onSuccess, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const renderedRef = useRef(false);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey) return;

    const scriptId = "turnstile-script";
    const loadTurnstile = () => {
      if (!window.turnstile) return;
      if (containerRef.current && !renderedRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onSuccess(token);
          },
          "error-callback": () => {
            onError?.();
          },
          theme: "light",
        });
        renderedRef.current = true;
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = loadTurnstile;
      document.head.appendChild(script);
    } else {
      loadTurnstile();
    }

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
      }
    };
  }, [siteKey, onSuccess, onError]);

  if (!siteKey) {
    return <div className="text-destructive text-sm">Captcha configuration error</div>;
  }

  return <div ref={containerRef}></div>;
}