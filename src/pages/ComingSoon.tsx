import { useEffect, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { Link } from "react-router-dom";

// Replace this URL with your own background image
const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2070&auto=format&fit=crop";

// Set the launch date (modify as needed)
// You can change this to a specific date, e.g. new Date(2026, 4, 15) for May 15, 2026
const getInitialLaunchDate = () => {
  const stored = localStorage.getItem("launch_date");
  if (stored) return new Date(stored);
  // Set your own date here: year, month (0‑based), day, hour, minute, second
  const date = new Date(2026, 5, 13, 0, 0, 0); // May 13, 2026
  localStorage.setItem("launch_date", date.toISOString());
  return date;
};

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [launchDate] = useState(getInitialLaunchDate);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center px-4 text-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${BACKGROUND_IMAGE})`,
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-3xl animate-fade-in">
        {/* Logo / Brand */}
        <h1 className="font-heading text-5xl font-bold tracking-tight text-white drop-shadow-lg md:text-7xl">
          Hbooks
        </h1>
        <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-primary" />

        {/* Main message */}
        <p className="mt-8 text-xl text-gray-200 md:text-2xl">
          Something extraordinary is on the horizon.
        </p>
        <p className="mt-2 text-lg text-gray-300">
          We're crafting a brand new experience for book lovers. Stay tuned!
        </p>

        {/* Countdown timer */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="min-w-[80px] rounded-lg bg-white/10 p-4 backdrop-blur-md">
            <div className="text-3xl font-bold text-primary md:text-4xl">{timeLeft.days}</div>
            <div className="text-sm uppercase tracking-wider text-gray-200">Days</div>
          </div>
          <div className="min-w-[80px] rounded-lg bg-white/10 p-4 backdrop-blur-md">
            <div className="text-3xl font-bold text-primary md:text-4xl">{timeLeft.hours}</div>
            <div className="text-sm uppercase tracking-wider text-gray-200">Hours</div>
          </div>
          <div className="min-w-[80px] rounded-lg bg-white/10 p-4 backdrop-blur-md">
            <div className="text-3xl font-bold text-primary md:text-4xl">{timeLeft.minutes}</div>
            <div className="text-sm uppercase tracking-wider text-gray-200">Minutes</div>
          </div>
          <div className="min-w-[80px] rounded-lg bg-white/10 p-4 backdrop-blur-md">
            <div className="text-3xl font-bold text-primary md:text-4xl">{timeLeft.seconds}</div>
            <div className="text-sm uppercase tracking-wider text-gray-200">Seconds</div>
          </div>
        </div>

        {/* Back to home link */}
        <div className="mt-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
          >
            <CalendarDays className="h-4 w-4" />
            Return to current shop
          </Link>
        </div>
      </div>
    </div>
  );
}