"use client";

import LoadingScreen from "./LoadingScreen";

export default function LoadingScreenWrapper() {
  if (typeof window === "undefined") {
    return null;
  }

  return <LoadingScreen />;
}
