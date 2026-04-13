"use client";

import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MIN_VISIBLE_MS = 520;
const FINISH_DELAY_MS = 220;

export function RouteTransitionLoader() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const stopTimers = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const startLoader = () => {
    stopTimers();
    startedAtRef.current = Date.now();
    setIsFinishing(false);
    setIsVisible(true);
    setProgress(14);

    progressTimerRef.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 88) {
          return current;
        }

        const increment = Math.max(2, (90 - current) / 6);
        return Math.min(88, current + increment);
      });
    }, 120);
  };

  const finishLoader = () => {
    if (!isVisible) {
      return;
    }

    const elapsed = startedAtRef.current ? Date.now() - startedAtRef.current : MIN_VISIBLE_MS;
    const waitTime = Math.max(0, MIN_VISIBLE_MS - elapsed);

    stopTimers();
    hideTimerRef.current = window.setTimeout(() => {
      setProgress(100);
      setIsFinishing(true);
      hideTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
        setIsFinishing(false);
        setProgress(0);
      }, FINISH_DELAY_MS);
    }, waitTime);
  };

  useEffect(() => {
    finishLoader();
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }

      const nextUrl = `${url.pathname}${url.search}`;
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (nextUrl === currentUrl) {
        return;
      }

      startLoader();
    };

    window.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("click", handleClick, true);
      stopTimers();
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[100] overflow-hidden transition-opacity duration-200 ${
        isFinishing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,240,228,0.9),rgba(247,240,228,0.72))] backdrop-blur-md" />
      <div
        className="absolute left-0 top-0 h-1 bg-gradient-to-r from-[var(--secondary)] via-[var(--primary)] to-[var(--accent)] shadow-[0_6px_20px_rgba(155,92,23,0.35)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="route-loader-glow absolute h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(211,165,80,0.26),transparent_68%)]" />
        <div className="glass-panel relative w-full max-w-sm rounded-[2rem] border-white/50 px-8 py-8 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/80 shadow-[0_18px_44px_rgba(92,57,17,0.18)]">
            <div className="route-loader-spin flex h-20 w-20 items-center justify-center rounded-full border border-[var(--secondary)]/45 bg-[#fff9f1] p-1.5">
              <Sparkles className="h-8 w-8 text-[var(--primary)]" />
            </div>
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.34em] text-[var(--muted)]">Opening route</p>
          <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">Moving through the portal</p>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Loading the next page with a smoother devotional transition.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            <span className="loader-bar rounded-full bg-[var(--secondary)]/40" />
            <span className="loader-bar loader-bar-delayed rounded-full bg-[var(--primary)]/45" />
            <span className="loader-bar loader-bar-more-delayed rounded-full bg-[var(--accent)]/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
