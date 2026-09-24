"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SlideTab {
  label: string;
  href: string;
}

interface Position {
  left: number;
  width: number;
  opacity: number;
}

/** Menu en pilule avec curseur qui glisse au survol et se repose sur l'onglet actif. */
export function SlideTabs({ tabs, activeIndex, className }: { tabs: SlideTab[]; activeIndex: number; className?: string }) {
  const refs = React.useRef<(HTMLLIElement | null)[]>([]);
  const [position, setPosition] = React.useState<Position>({ left: 0, width: 0, opacity: 0 });
  const [cursor, setCursor] = React.useState(activeIndex);

  const moveTo = React.useCallback((index: number) => {
    setCursor(index);
    const el = refs.current[index];
    if (!el) return setPosition((p) => ({ ...p, opacity: 0 }));
    setPosition({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
  }, []);

  React.useEffect(() => {
    moveTo(activeIndex);
  }, [activeIndex, moveTo]);

  return (
    <ul
      onMouseLeave={() => moveTo(activeIndex)}
      className={cn("relative flex w-fit rounded-full border border-white/10 bg-anthracite/80 p-1 backdrop-blur-md", className)}
    >
      {tabs.map((tab, i) => (
        <li
          key={tab.href}
          ref={(el) => {
            refs.current[i] = el;
          }}
          onMouseEnter={() => moveTo(i)}
          className="relative z-10"
        >
          <Link
            href={tab.href}
            aria-current={i === activeIndex ? "page" : undefined}
            className={cn("block px-4 py-2 text-[0.68rem] uppercase tracking-wide2 transition-colors duration-300 lg:px-6", i === cursor ? "text-ink" : "text-white")}
          >
            {tab.label}
          </Link>
        </li>
      ))}
      <motion.li
        aria-hidden="true"
        animate={{ ...position }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="absolute inset-y-1 z-0 rounded-full bg-white"
      />
    </ul>
  );
}
