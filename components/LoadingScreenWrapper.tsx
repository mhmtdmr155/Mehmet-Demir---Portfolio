"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

export default function LoadingScreenWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Immediate mount check
    if (typeof window !== 'undefined') {
      setMounted(true);
      console.log("🎯 LoadingScreenWrapper mounted!");
      console.log("📄 Document.body exists:", !!document.body);
      console.log("📄 Document.body:", document.body);
    }
  }, []);

  // Render immediately if window is available, don't wait for mounted
  if (typeof window === 'undefined') {
    console.log("❌ LoadingScreenWrapper: No window, returning null");
    return null;
  }

  console.log("✅ LoadingScreenWrapper: Rendering LoadingScreen, mounted:", mounted);
  return <LoadingScreen />;
}
