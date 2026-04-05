// src/components/TurnstileWidget.tsx
import { useEffect, useRef, useState } from "react";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpired?: () => void;
  reset?: number;
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
  const [scriptReady, setScriptReady] = useState(false);

  // Load Turnstile script once
  useEffect(() => {
    if (!siteKey) return;
    if (window.turnstile) {
      setScriptReady(true);
      return;
    }
    if (document.querySelector("#turnstile-script")) {
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          setScriptReady(true);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    const script = document.createElement("script");
    script.id = "turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptReady(true);
    document.head.appendChild(script);
  }, [siteKey]);

  // Render and execute invisible widget when script is ready
  useEffect(() => {
    if (!scriptReady || !window.turnstile || !containerRef.current) return;

    const renderAndExecute = () => {
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
      }

      // Render invisible widget
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onSuccess(token);
        },
        "error-callback": () => {
          onError?.();
        },
        "expired-callback": () => {
          onExpired?.();
          // Re‑execute when expired
          if (widgetIdRef.current) {
            window.turnstile.reset(widgetIdRef.current);
            window.turnstile.execute(widgetIdRef.current);
          }
        },
        // Invisible mode settings
        execution: "execute",
        appearance: "interaction-only",
        theme: "light",
      });

      // Execute the challenge automatically
      if (widgetIdRef.current) {
        window.turnstile.execute(widgetIdRef.current);
      }
    };

    renderAndExecute();

    // Cleanup on unmount or reset
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
      }
    };
  }, [scriptReady, siteKey, reset, onSuccess, onError, onExpired]);

  if (!siteKey) {
    return <div className="text-destructive text-sm">Missing Turnstile site key</div>;
  }

  // Invisible widget – no visible container
  return <div ref={containerRef} style={{ display: "none" }} />;
}