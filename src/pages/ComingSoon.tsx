import { useEffect, useState, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

const BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop";

const LAUNCH_DATE = new Date(2026, 4, 13, 0, 0, 0); // May 13, 2026

function getTimeLeft(target: Date) {
  const distance = target.getTime() - Date.now();
  if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(distance / 86400000),
    hours:   Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
    seconds: Math.floor((distance % 60000) / 1000),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ── Single flip card unit ──────────────────────────────────────────────────
function FlipCard({ value, label }: { value: number; label: string }) {
  const current  = pad(value);
  const prevRef  = useRef(current);
  const [prev, setPrev]       = useState(current);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (current !== prevRef.current) {
      setPrev(prevRef.current);
      prevRef.current = current;
      setAnimate(false);
      // tiny delay so React re-mounts the animation
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [current]);

  return (
    <>
      <style>{`
        @keyframes foldTop {
          from { transform: rotateX(0deg);   }
          to   { transform: rotateX(-90deg); }
        }
        @keyframes revealBottom {
          from { transform: rotateX(90deg); }
          to   { transform: rotateX(0deg);  }
        }
        .fold-top    { animation: foldTop     0.25s linear   forwards; }
        .reveal-bot  { animation: revealBottom 0.25s 0.25s linear forwards; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {/* card */}
        <div style={{ position: "relative", width: 90, height: 110, perspective: 600 }}>

          {/* ── static back (new value, always visible) ── */}
          {/* top half of new */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "50%",
            background: "#1a1a1a",
            borderRadius: "8px 8px 0 0",
            overflow: "hidden",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            borderBottom: "1px solid #000",
            zIndex: 1,
          }}>
            <span style={{ fontSize: 56, fontWeight: 800, color: "#f59e0b", lineHeight: 1, paddingBottom: 4, fontVariantNumeric: "tabular-nums" }}>
              {current}
            </span>
          </div>
          {/* bottom half of new */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
            background: "#141414",
            borderRadius: "0 0 8px 8px",
            overflow: "hidden",
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            borderTop: "1px solid #000",
            zIndex: 1,
          }}>
            <span style={{ fontSize: 56, fontWeight: 800, color: "#f59e0b", lineHeight: 1, marginTop: -56, paddingTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {current}
            </span>
          </div>

          {/* ── animated flap: top half showing OLD value folds away ── */}
          {animate && (
            <div className="fold-top" style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "50%",
              background: "#1a1a1a",
              borderRadius: "8px 8px 0 0",
              overflow: "hidden",
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              borderBottom: "1px solid #000",
              transformOrigin: "bottom center",
              zIndex: 4,
              backfaceVisibility: "hidden",
            }}>
              <span style={{ fontSize: 56, fontWeight: 800, color: "#f59e0b", lineHeight: 1, paddingBottom: 4, fontVariantNumeric: "tabular-nums" }}>
                {prev}
              </span>
            </div>
          )}

          {/* ── animated flap: bottom half showing NEW value flips in ── */}
          {animate && (
            <div className="reveal-bot" style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
              background: "#141414",
              borderRadius: "0 0 8px 8px",
              overflow: "hidden",
              display: "flex", alignItems: "flex-start", justifyContent: "center",
              borderTop: "1px solid #000",
              transformOrigin: "top center",
              zIndex: 4,
              backfaceVisibility: "hidden",
            }}>
              <span style={{ fontSize: 56, fontWeight: 800, color: "#f59e0b", lineHeight: 1, marginTop: -56, paddingTop: 4, fontVariantNumeric: "tabular-nums" }}>
                {current}
              </span>
            </div>
          )}

          {/* spine */}
          <div style={{
            position: "absolute", top: "50%", left: 0, right: 0,
            height: 2, background: "#000",
            transform: "translateY(-50%)", zIndex: 5,
            pointerEvents: "none",
          }} />
        </div>

        {/* label */}
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.2em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.5)",
        }}>
          {label}
        </span>
      </div>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(LAUNCH_DATE));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(LAUNCH_DATE)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "0 16px",
      backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.75)), url(${BACKGROUND_IMAGE})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.5) 100%)",
      }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 640 }}>

        {/* brand */}
        <h1 style={{ fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-1px" }}>
          Hbooks
        </h1>
        <div style={{ width: 60, height: 3, background: "#f59e0b", borderRadius: 2, margin: "10px auto 0" }} />

        {/* headline */}
        <p style={{ marginTop: 32, fontSize: "clamp(16px, 2.5vw, 22px)", color: "#e5e7eb", lineHeight: 1.5 }}>
          Something extraordinary is on the horizon.
        </p>
        <p style={{ marginTop: 8, fontSize: 15, color: "#9ca3af" }}>
          A brand-new membership experience for book lovers — coming soon.
        </p>

        {/* flip countdown */}
        <div style={{
          marginTop: 56,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "8px 4px",
        }}>
          <FlipCard value={timeLeft.days}    label="Days"    />
          <span style={{ fontSize: 48, fontWeight: 200, color: "rgba(255,255,255,0.2)", lineHeight: 1, alignSelf: "flex-start", marginTop: 20, padding: "0 2px" }}>:</span>
          <FlipCard value={timeLeft.hours}   label="Hours"   />
          <span style={{ fontSize: 48, fontWeight: 200, color: "rgba(255,255,255,0.2)", lineHeight: 1, alignSelf: "flex-start", marginTop: 20, padding: "0 2px" }}>:</span>
          <FlipCard value={timeLeft.minutes} label="Minutes" />
          <span style={{ fontSize: 48, fontWeight: 200, color: "rgba(255,255,255,0.2)", lineHeight: 1, alignSelf: "flex-start", marginTop: 20, padding: "0 2px" }}>:</span>
          <FlipCard value={timeLeft.seconds} label="Seconds" />
        </div>

        {/* launch label */}
        <p style={{ marginTop: 28, fontSize: 13, color: "#6b7280", letterSpacing: "0.1em" }}>
          Launching · May 13, 2026
        </p>

        {/* back link */}
        <div style={{ marginTop: 48 }}>
          <Link
            to="/"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#9ca3af", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
          >
            <CalendarDays style={{ width: 16, height: 16 }} />
            Return to current shop
          </Link>
        </div>
      </div>
    </div>
  );
}