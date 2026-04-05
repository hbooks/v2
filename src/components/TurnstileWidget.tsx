// src/components/TurnstileWidget.tsx
import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpired?: () => void;
  reset?: number; // Change this prop to force reset
}

declare global {
  interface Window {
    turnstile: any;
  }
}

export default function TurnstileWidget({ onSuccess, onError, onExpired, reset }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const widgetIdRef = useRef<string | null>(null);

  // Load Turnstile script once
  useEffect(() => {
    if (!siteKey) return;
    if (document.querySelector("#turnstile-script")) return;

    const script = document.createElement("script");
    script.id = "turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [siteKey]);

  // Render or reset widget
  useEffect(() => {
    if (!siteKey || !window.turnstile) return;

    const renderWidget = () => {
      if (!containerRef.current) return;
      // Clear previous widget if exists
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          console.log("Turnstile token generated");
          onSuccess(token);
        },
        "error-callback": () => {
          console.error("Turnstile error");
          onError?.();
        },
        "expired-callback": () => {
          console.warn("Turnstile expired");
          onExpired?.();
        },
        theme: "light",
      });
    };

    if (document.readyState === "complete") {
      renderWidget();
    } else {
      window.addEventListener("load", renderWidget);
      return () => window.removeEventListener("load", renderWidget);
    }
  }, [siteKey, reset, onSuccess, onError, onExpired]);

  if (!siteKey) return <div className="text-destructive">Missing Turnstile key</div>;
  return <div ref={containerRef} />;
}