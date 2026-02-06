"use client";

import dynamic from "next/dynamic";

const CommandMenu = dynamic(() =>
  import("./CommandMenu").then((m) => m.CommandMenu), {
    ssr: false,
  }
);

export function CommandMenuWrapper() {
  return <CommandMenu />;
}
