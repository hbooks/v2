// src/pages/ComingSoon.tsx
import { useEffect, useState } from "react";
import { CalendarDays, Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";

// Replace this URL with your own background image (can be from Unsplash or your assets)
const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2070&auto=format&fit=crop";

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Set the launch date (e.g., 30 days from now or a specific date)
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30); // 30 days from today
  // Or use a fixed date: new Date(2026, 4, 15); // May 15, 2026

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center px-4 text-center"
         style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${BACKGROUND_IMAGE})` }}>
      
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-3xl animate-fade-in">
        {/* Logo / Brand */}
        <h1 className="font-heading text-5xl font-bold tracking-tight text-white drop-shadow-lg md:text-7xl">
          Hbooks
        </h1>
        <div className="mx-auto mt-2 h-1 w-20 bg-primary rounded-full" />

        {/* Main message */}
        <p className="mt-8 text-xl text-gray-200 md:text-2xl">
          Something extraordinary is on the horizon.
        </p>
        <p className="mt-2 text-lg text-gray-300">
          We're crafting a brand new experience for book lovers. Stay tuned!
        </p>

        {/* Countdown timer */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="rounded-lg bg-white/10 backdrop-blur-md p-4 min-w-[80px]">
            <div className="text-3xl font-bold text-primary md:text-4xl">{timeLeft.days}</div>
            <div className="text-sm uppercase tracking-wider text-gray-200">Days</div>
          </div>
          <div className="rounded-lg bg-white/10 backdrop-blur-md p-4 min-w-[80px]">
            <div className="text-3xl font-bold text-primary md:text-4xl">{timeLeft.hours}</div>
            <div className="text-sm uppercase tracking-wider text-gray-200">Hours</div>
          </div>
          <div className="rounded-lg bg-white/10 backdrop-blur-md p-4 min-w-[80px]">
            <div className="text-3xl font-bold text-primary md:text-4xl">{timeLeft.minutes}</div>
            <div className="text-sm uppercase tracking-wider text-gray-200">Minutes</div>
          </div>
          <div className="rounded-lg bg-white/10 backdrop-blur-md p-4 min-w-[80px]">
            <div className="text-3xl font-bold text-primary md:text-4xl">{timeLeft.seconds}</div>
            <div className="text-sm uppercase tracking-wider text-gray-200">Seconds</div>
          </div>
        </div>

        {/* Notification signup (optional) */}
        <div className="mt-12">
          <p className="text-gray-300">Be the first to know when we launch.</p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="flex items-center rounded-md bg-white/10 backdrop-blur-sm">
              <Mail className="ml-3 h-5 w-5 text-gray-300" />
              <input
                type="email"
                placeholder="Your email address"
                className="w-64 bg-transparent px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <button className="rounded-md bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary/90">
              Notify Me
            </button>
          </div>
        </div>

        {/* Back to home link */}
        <div className="mt-12">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
            <CalendarDays className="h-4 w-4" />
            Return to current shop
          </Link>
        </div>
      </div>
    </div>
  );
}