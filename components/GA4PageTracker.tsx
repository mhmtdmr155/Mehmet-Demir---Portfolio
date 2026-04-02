"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const GA_ID = "G-HT948T4R3X";

type GtagWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

export function GA4PageTracker() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const query = typeof window !== "undefined" ? window.location.search : "";
    const pagePath = `${pathname}${query}`;
    const w = window as GtagWindow;

    if (typeof w.gtag === "function") {
      w.gtag("config", GA_ID, { page_path: pagePath });
    }
  }, [pathname]);

  return null;
}
