"use client";

import { cloneElement, useEffect, useId, useRef, useState } from "react";

export default function VerifiedTooltip({ children, className = "" }) {
  const rootRef = useRef(null);
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setTouch(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    function close(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  function onClick(event) {
    if (!touch) return;
    if (open && event.target.closest("a")) return;
    event.preventDefault();
    setOpen((current) => !current);
  }

  const shown = touch ? open : hover;

  return (
    <span
      ref={rootRef}
      className={`relative min-w-0 ${className}`}
      onClick={onClick}
      onMouseEnter={() => {
        if (!touch) setHover(true);
      }}
      onMouseLeave={() => setHover(false)}
    >
      {cloneElement(children, { "aria-describedby": tooltipId })}
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute bottom-[calc(100%+7px)] left-0 z-20 w-max max-w-[min(13.5rem,calc(100vw-6.5rem))] rounded-lg bg-black px-2.5 py-1.5 text-left font-sans text-[11px] font-medium leading-snug text-white shadow-lg ${shown ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <span className="flex items-start gap-1.5">
          <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0">
            <circle cx="8" cy="8" r="8" className="fill-emerald-400" />
            <path d="M4.4 8.2 6.7 10.5 11.6 5.6" fill="none" stroke="#052e16" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Data verified with Google Search Console</span>
        </span>
        <span aria-hidden="true" className="absolute left-3.5 top-full h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-black" />
      </span>
    </span>
  );
}
