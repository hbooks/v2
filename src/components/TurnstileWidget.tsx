import { useEffect, useRef } from "react";

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
  const successRef = useRef(onSuccess);
  const errorRef = useRef(onError);
  const expiredRef = useRef(onExpired);

  useEffect(() => {
    successRef.current = onSuccess;
    errorRef.current = onError;
    expiredRef.current = onExpired;
  }, [onSuccess, onError, onExpired]);

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

  // Render invisible widget
  useEffect(() => {
    if (!siteKey || !window.turnstile) return;

    const renderWidget = () => {
      if (!containerRef.current) return;
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
      }

      // Invisible mode: use execution: 'execute' and hide the widget
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          successRef.current(token);
        },
        "error-callback": () => {
          errorRef.current?.();
        },
        "expired-callback": () => {
          expiredRef.current?.();
        },
        // Invisible mode settings
        execution: "execute",
        appearance: "interaction-only",
        theme: "light",
      });
    };

    if (document.readyState === "complete") {
      renderWidget();
    } else {
      window.addEventListener("load", renderWidget);
      return () => window.removeEventListener("load", renderWidget);
    }
  }, [siteKey, reset]);

  // Automatically execute the challenge when the widget is ready
  useEffect(() => {
    if (!window.turnstile || !widgetIdRef.current) return;
    // Execute the invisible challenge
    window.turnstile.execute(widgetIdRef.current);
  }, [reset]); // re‑execute when reset changes

  if (!siteKey) return <div className="text-destructive text-sm">Missing Turnstile key</div>;
  // Render a hidden container – invisible to the user
  return <div ref={containerRef} style={{ display: "none" }} />;
}