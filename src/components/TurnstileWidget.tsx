import { useCallback, useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpired?: () => void;
  reset?: number; // increment this value to re-execute the challenge
}

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement | string, options: object) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      ready: (callback: () => void) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export default function TurnstileWidget({
  onSuccess,
  onError,
  onExpired,
  reset,
}: TurnstileWidgetProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const widgetIdRef   = useRef<string | null>(null);
  const siteKey       = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Stable callback refs — prevents the render effect from firing on every
  // parent re-render just because inline arrow functions changed identity
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef   = useRef(onError);
  const onExpiredRef = useRef(onExpired);
  useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);
  useEffect(() => { onErrorRef.current   = onError;   }, [onError]);
  useEffect(() => { onExpiredRef.current = onExpired; }, [onExpired]);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;

    // Clean up any existing widget first
    if (widgetIdRef.current) {
      try { window.turnstile.remove(widgetIdRef.current); } catch (_) {}
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,

      // "managed" lets Cloudflare decide silently vs interactive.
      // Paired with appearance "interaction-only" so the widget is only
      // shown to the user if Cloudflare decides interaction is needed —
      // fully invisible for clean users.
      // Do NOT set execution: "execute" here — that defers the challenge
      // until you manually call turnstile.execute(), which means it never
      // runs automatically. Omitting it (default "render") starts the
      // challenge immediately after render().
      appearance: "interaction-only",
      theme: "auto",

      callback: (token: string) => {
        onSuccessRef.current(token);
      },
      "error-callback": () => {
        onErrorRef.current?.();
        // Auto-reset on error so the form isn't permanently blocked
        if (widgetIdRef.current) {
          try { window.turnstile.reset(widgetIdRef.current); } catch (_) {}
        }
      },
      "expired-callback": () => {
        onExpiredRef.current?.();
        // Re-run challenge silently when the token expires
        if (widgetIdRef.current) {
          try { window.turnstile.reset(widgetIdRef.current); } catch (_) {}
        }
      },
    });
  }, [siteKey]);

  // Load the Turnstile script once, using the onload callback pattern
  // which is the most reliable way to know when window.turnstile is ready.
  // Key points:
  //   - Use ?render=explicit so Turnstile doesn't auto-scan the DOM
  //   - Use ?onload=onTurnstileLoad to get a reliable ready callback
  //   - Do NOT add async or defer when using the onload param approach
  useEffect(() => {
    if (!siteKey) return;

    // Already loaded
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Script already injected but not yet ready — attach our callback
    if (document.getElementById("turnstile-script")) {
      window.onTurnstileLoad = renderWidget;
      return;
    }

    // Set the global callback that the script will call on load
    window.onTurnstileLoad = renderWidget;

    const script = document.createElement("script");
    script.id    = "turnstile-script";
    // ?render=explicit prevents auto-scan; ?onload= fires our callback when ready
    script.src   = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";
    // Do NOT add async/defer when using ?onload — the callback timing depends
    // on the script finishing naturally
    document.head.appendChild(script);

    return () => {
      // Don't remove the script on unmount — other widgets may reuse it
    };
  }, [siteKey, renderWidget]);

  // Re-render when the parent bumps `reset` (e.g. after a failed submission)
  useEffect(() => {
    if (reset === undefined || reset === 0) return;
    if (window.turnstile) renderWidget();
  }, [reset, renderWidget]);

  // Cleanup widget on component unmount
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch (_) {}
        widgetIdRef.current = null;
      }
    };
  }, []);

  if (!siteKey) {
    return (
      <div className="text-destructive text-sm">
        Missing Turnstile site key (VITE_TURNSTILE_SITE_KEY)
      </div>
    );
  }

  // The container must exist in the DOM for Turnstile to mount into.
  // Using visibility:hidden + zero dimensions keeps it out of the layout
  // while remaining accessible to Turnstile's DOM queries.
  // Do NOT use display:none — Turnstile cannot render into a hidden element.
  return (
    <div
      ref={containerRef}
      style={{ visibility: "hidden", width: 0, height: 0, overflow: "hidden" }}
      aria-hidden="true"
    />
  );
}