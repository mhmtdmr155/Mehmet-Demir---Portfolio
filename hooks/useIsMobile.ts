"use client";

import { useState, useEffect } from "react";

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.innerWidth < 768;
    });

    useEffect(() => {
        // Check initial window size
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Run immediately
        checkMobile();

        // Add event listener
        window.addEventListener("resize", checkMobile);

        // Cleanup
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return isMobile;
}
