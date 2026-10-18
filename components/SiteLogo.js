"use client";

import { useState } from "react";

export default function SiteLogo({ name, logoUrl, className = "h-7 w-7 rounded-lg" }) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-stone-200 bg-white ${className}`}
    >
      {logoUrl && !failed ? (
        <img src={logoUrl} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span className="text-xs font-bold uppercase text-stone-500">{(name || "?").charAt(0)}</span>
      )}
    </span>
  );
}
