"use client";

import { useState } from "react";

export default function SiteLogo({ name, className = "h-7 w-7 rounded-lg" }) {
  const [failed, setFailed] = useState(false);
  const domain = name.split("/")[0].toLowerCase();

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-stone-200 bg-white ${className}`}
    >
      {failed ? (
        <span className="text-xs font-bold uppercase text-stone-500">{name.charAt(0)}</span>
      ) : (
        <img
          src={`/api/logo?domain=${encodeURIComponent(domain)}`}
          alt=""
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
