import { useEffect, useState, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

// Elegant dark library / reading atmosphere background
const BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop";

const getInitialLaunchDate = () => {
  const stored = localStorage.getItem("launch_date");
  if (stored) return new Date(stored);
  const date = new Date(2026, 4, 13, 0, 0, 0); // May 13, 2026
  localStorage.setItem("launch_date", date.toISOString());
  return date;
};

// ── Flip Card Unit ─────────────────────────────────────────────────────────
// Renders a single time unit (days / hours / minutes / seconds) with a
// realistic card-flip animation whenever the displayed number changes.
function FlipUnit({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const [current, setCurrent]   = useState(value);
  const [previous, setPrevious] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      setPrevious(prevRef.current);
      setFlipping(true);
      prevRef.current = value;

      // After the flip animation completes, update current and reset
      const t = setTimeout(() => {
        setCurrent(value);
        setFlipping(false);
      }, 400); // must match CSS animation duration below
      return () => clearTimeout(t);
    }
  }, [value]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Card */}
      <div className="relative" style={{ width: 80, height: 96 }}>
        <style>{`
          @keyframes flipTop {
            0%   { transform: rotateX(0deg); }
            100% { transform: rotateX(-90deg); }
          }
          @keyframes flipBottom {
            0%   { transform: rotateX(90deg); }
            100% { transform: rotateX(0deg); }
          }
          .flip-top {
            animation: flipTop 0.2s ease-in forwards;
          }
          .flip-bottom {
            animation: flipBottom 0.2s 0.2s ease-out forwards;
          }
        `}</style>

        {/* Static top half — shows current value top */}
        <div
          className="absolute left-0 right-0 top-0 overflow-hidden rounded-t-lg"
          style={{
            height: "50%",
            background: "rgba(15,15,15,0.92)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            zIndex: 1,
          }}
        >
          <div
            className="flex items-end justify-center"
            style={{
              height: "200%",
              fontSize: 52,
              fontWeight: 700,
              color: "hsl(var(--primary))",
              lineHeight: 1,
              paddingBottom: 4,
              fontVariantNumeric: "tabular-nums",
              fontFamily: "var(--font-heading, serif)",
            }}
          >
            {pad(current)}
          </div>
        </div>

        {/* Static bottom half — shows current value bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-lg"
          style={{
            height: "50%",
            background: "rgba(22,22,22,0.92)",
            borderTop: "1px solid rgba(0,0,0,0.4)",
            zIndex: 1,
          }}
        >
          <div
            className="flex items-start justify-center"
            style={{
              marginTop: "-50%",
              height: "200%",
              fontSize: 52,
              fontWeight: 700,
              color: "hsl(var(--primary))",
              lineHeight: 1,
              paddingTop: 4,
              fontVariantNumeric: "tabular-nums",
              fontFamily: "var(--font-heading, serif)",
            }}
          >
            {pad(current)}
          </div>
        </div>

        {/* Flipping top — old value flips away */}
        {flipping && (
          <div
            className="flip-top absolute left-0 right-0 top-0 overflow-hidden rounded-t-lg"
            style={{
              height: "50%",
              background: "rgba(15,15,15,0.95)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              transformOrigin: "bottom center",
              zIndex: 3,
            }}
          >
            <div
              className="flex items-end justify-center"
              style={{
                height: "200%",
                fontSize: 52,
                fontWeight: 700,
                color: "hsl(var(--primary))",
                lineHeight: 1,
                paddingBottom: 4,
                fontVariantNumeric: "tabular-nums",
                fontFamily: "var(--font-heading, serif)",
              }}
            >
              {pad(previous)}
            </div>
          </div>
        )}

        {/* Flipping bottom — new value flips in */}
        {flipping && (
          <div
            className="flip-bottom absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-lg"
            style={{
              height: "50%",
              background: "rgba(22,22,22,0.95)",
              borderTop: "1px solid rgba(0,0,0,0.4)",
              transformOrigin: "top center",
              zIndex: 3,
            }}
          >
            <div
              className="flex items-start justify-center"
              style={{
                marginTop: "-50%",
                height: "200%",
                fontSize: 52,
                fontWeight: 700,
                color: "hsl(var(--primary))",
                lineHeight: 1,
                paddingTop: 4,
                fontVariantNumeric: "tabular-nums",
                fontFamily: "var(--font-heading, serif)",
              }}
            >
              {pad(value)}
            </div>
          </div>
        )}

        {/* Center divider line — the "spine" of the flip */}
        <div
          className="pointer-events-none absolute left-0 right-0"
          style={{
            top: "50%",
            height: 2,
            background: "rgba(0,0,0,0.7)",
            zIndex: 4,
            transform: "translateY(-50%)",
          }}
        />
      </div>

      {/* Label */}
      <span
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "rgba(200,200,200,0.7)", letterSpacing: "0.18em" }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [launchDate] = useState(getInitialLaunchDate);

  useEffect(() => {
    const tick = () => {
      const now      = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days:    Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [launchDate]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center px-4 text-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.72)), url(${BACKGROUND_IMAGE})`,
      }}
    >
      {/* Extra depth vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative z-10 max-w-3xl animate-fade-in">

        {/* Brand */}
        <h1 className="font-heading text-5xl font-bold tracking-tight text-white drop-shadow-lg md:text-7xl">
          Hbooks
        </h1>
        <div className="mx-auto mt-3 h-0.5 w-24 rounded-full bg-primary/80" />

        {/* Headline */}
        <p className="mt-8 text-xl text-gray-200 md:text-2xl">
          Something extraordinary is on the horizon.
        </p>
        <p className="mt-2 text-base text-gray-400">
          We're crafting a brand new membership experience for book lovers.
        </p>

        {/* Flip countdown */}
        <div className="mt-14 flex flex-wrap items-end justify-center gap-3 sm:gap-6">
          <FlipUnit value={timeLeft.days}    label="Days"    />
          <span className="mb-10 text-3xl font-light text-white/30 select-none">:</span>
          <FlipUnit value={timeLeft.hours}   label="Hours"   />
          <span className="mb-10 text-3xl font-light text-white/30 select-none">:</span>
          <FlipUnit value={timeLeft.minutes} label="Minutes" />
          <span className="mb-10 text-3xl font-light text-white/30 select-none">:</span>
          <FlipUnit value={timeLeft.seconds} label="Seconds" />
        </div>

        {/* Launch date label */}
        <p className="mt-8 text-sm text-gray-500 tracking-wide">
          Launching · May 13, 2026
        </p>

        {/* Back link */}
        <div className="mt-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
          >
            <CalendarDays className="h-4 w-4" />
            Return to current shop
          </Link>
        </div>
      </div>
    </div>
  );
}