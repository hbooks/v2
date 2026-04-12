import { useEffect, useRef, useCallback } from "react";

// How often to check for a new version (milliseconds).
// 60 seconds is a good balance — not too chatty, not too slow.
const POLL_INTERVAL_MS = 60_000;

// How long to wait after the tab becomes visible again before re-checking.
const VISIBILITY_RECHECK_DELAY_MS = 2_000;

// Path to the version file served by your Cloudflare Pages site.
// You will generate this file at build time via the Vite plugin below.
const VERSION_FILE = "/version.json";

/**
 * Polls /version.json and reloads the page when a new deployment is detected.
 *
 * How it works:
 *   1. At build time, Vite writes /version.json containing the current git
 *      commit hash (or a timestamp fallback).
 *   2. This hook polls that URL on an interval.
 *   3. When the fetched hash differs from the one baked into this bundle,
 *      the page reloads — but only when the tab is visible and idle.
 *
 * The version baked into the bundle at build time:
 *   Vite injects VITE_APP_VERSION via the vite.config.ts plugin below.
 *   At runtime, import.meta.env.VITE_APP_VERSION holds that value.
 */
export function useAppVersion() {
  // The version this running bundle was built with
  const currentVersion = import.meta.env.VITE_APP_VERSION as string | undefined;
  const pollingRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const reloadPending  = useRef(false);

  const checkVersion = useCallback(async () => {
    // If no version is injected (local dev without the plugin), skip silently
    if (!currentVersion) return;

    try {
      // Bust the CDN/browser cache so we always get the latest file
      const res = await fetch(`${VERSION_FILE}?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;

      const { version } = await res.json() as { version: string };

      if (version && version !== currentVersion) {
        // A new deploy is live — reload once, don't double-trigger
        if (reloadPending.current) return;
        reloadPending.current = true;

        console.info(
          `[AutoReload] New version detected: ${version} (was ${currentVersion}). Reloading…`
        );

        // Give the user a moment (UX grace period), then hard reload
        // so the new service worker / assets are fetched cleanly
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch {
      // Network error — silently skip, try again next interval
    }
  }, [currentVersion]);

  useEffect(() => {
    if (!currentVersion) return; // no-op in dev without the plugin

    // ── Start polling ──────────────────────────────────────────────
    pollingRef.current = setInterval(checkVersion, POLL_INTERVAL_MS);

    // ── Visibility re-check ────────────────────────────────────────
    // When user returns to a tab that was in the background, check
    // immediately rather than waiting for the next poll interval
    let visibilityTimer: ReturnType<typeof setTimeout>;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(visibilityTimer);
        visibilityTimer = setTimeout(checkVersion, VISIBILITY_RECHECK_DELAY_MS);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    // ── Cleanup ────────────────────────────────────────────────────
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      clearTimeout(visibilityTimer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [checkVersion, currentVersion]);
}