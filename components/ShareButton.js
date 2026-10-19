"use client";

import { useEffect, useState } from "react";
import { isDarkHex } from "@/lib/style";

const PAGE_ORIGIN = "https://pagzi.online";

function Icon({ children }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      {children}
    </svg>
  );
}

export default function ShareButton({ username, title, color = "#E7E5E4", href, className = "" }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ink = isDarkHex(color) ? "#ffffff" : "#1c1917";
  const url = href || `${PAGE_ORIGIN}/${username}`;
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title || username);

  const networks = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      className: "bg-[#1877F2]",
      icon: (
        <Icon>
          <path d="M14.5 8H13a1 1 0 0 0-1 1v2h2.5l-.4 2.5H12V20H9.2v-6.5H7V11h2.2V8.8A3.3 3.3 0 0 1 12.6 5.5H14.5V8Z" />
        </Icon>
      ),
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      className: "bg-[#25D366]",
      icon: (
        <Icon>
          <path d="M12 4.2A7.3 7.3 0 0 0 6.1 16l-.8 3.1 3.2-.8A7.3 7.3 0 1 0 12 4.2Zm3.8 10.3c-.2.5-1 .9-1.4 1-.4.1-.8.2-2.4-.5-2-.8-3.3-2.9-3.4-3-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.1 0 .3 0 .5.4.2.5.6 1.6.7 1.7.1.1.1.3 0 .4-.1.2-.2.3-.3.5l-.2.2c-.1.1-.2.2-.1.4.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.4.1.5-.1.1-.2.6-.7.7-.9.2-.2.3-.2.5-.1.2.1 1.4.7 1.6.8.2.1.4.2.4.3.1.2 0 .8-.2 1.3Z" />
        </Icon>
      ),
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      className: "bg-[#1D9BF0]",
      icon: (
        <Icon>
          <path d="M19.5 7.2c-.5.2-1 .4-1.6.4.6-.3 1-.9 1.2-1.5-.5.3-1.1.6-1.8.7A2.7 2.7 0 0 0 12.8 9c0 .2 0 .4.1.6-2.3-.1-4.3-1.2-5.7-2.9-.2.4-.3.8-.3 1.3 0 1 .5 1.8 1.2 2.3-.4 0-.9-.1-1.2-.4v.1c0 1.3.9 2.4 2.2 2.7-.2.1-.5.1-.7.1-.2 0-.3 0-.5-.1.3 1 1.3 1.8 2.4 1.8A5.5 5.5 0 0 1 5 16.4 7.7 7.7 0 0 0 9.2 17.6c5 0 7.8-4.2 7.8-7.8v-.4c.5-.4 1-.9 1.4-1.5-.5.2-1 .4-1.6.5Z" />
        </Icon>
      ),
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      className: "bg-[#0A66C2]",
      icon: (
        <Icon>
          <path d="M7.2 9.2H4.6V19h2.6V9.2ZM5.9 4.8A1.5 1.5 0 1 0 6 7.8a1.5 1.5 0 0 0-.1-3ZM19.4 13.2c0-2.6-1.4-3.8-3.2-3.8a2.8 2.8 0 0 0-2.5 1.4h-.1V9.2H11.1c0 1.1 0 9.8 0 9.8h2.6v-5.5c0-.3 0-.6.1-.8.3-.6.9-1.3 1.9-1.3 1.3 0 1.9 1 1.9 2.5V19h2.6v-5.8Z" />
        </Icon>
      ),
    },
    {
      label: "Reddit",
      href: `https://www.reddit.com/submit?url=${encoded}&title=${encodedTitle}`,
      className: "bg-[#FF4500]",
      icon: (
        <Icon>
          <path d="M16.8 12.2a1.2 1.2 0 0 0-2 .9 3.4 3.4 0 0 1-2.2.8h-.1l.8-3.6 2.5.5a1.2 1.2 0 1 0 .2-.8l-2.9-.6a.4.4 0 0 0-.5.3l-.9 4.1a3.5 3.5 0 0 1-2.3-.8 1.2 1.2 0 1 0-1.3.7 1.2 1.2 0 0 0 .5-.1 4.6 4.6 0 0 0 3.4 1.6h.2a4.6 4.6 0 0 0 3.5-1.5 1.2 1.2 0 0 0 .9-2.1Zm-6.2 1.5a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm3.6.9c-.4.4-1.1.4-1.6 0a.4.4 0 0 1 .5-.5c.2.1.4.1.6 0a.4.4 0 0 1 .5.5Zm-.2-1.6a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Z" />
        </Icon>
      ),
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encoded}`,
      className: "bg-stone-500",
      icon: (
        <Icon>
          <path d="M5 7.5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Zm7 5.2 6-3.7H6l6 3.7Z" />
        </Icon>
      ),
    },
  ];

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title: title || username, url });
    } catch {
      // The share sheet was closed.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share page"
        aria-haspopup="dialog"
        className={className || "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"}
        style={{ backgroundColor: color, color: ink }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V5m0 0 3.5 3.5M12 5 8.5 8.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12.5V18a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5.5" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-page-title"
            className="w-full max-w-sm rounded-3xl bg-white p-5 text-stone-900 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p id="share-page-title" className="text-lg font-bold">
                Share page
              </p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                aria-label="Share using your device"
                onClick={nativeShare}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-200 text-stone-700"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <circle cx="6" cy="12" r="2" />
                  <circle cx="16" cy="7" r="2" />
                  <circle cx="16" cy="17" r="2" />
                  <path d="M8 11.2 14 8.2M8 12.8l6 3" />
                </svg>
              </button>
              {networks.map((network) => (
                <a
                  key={network.label}
                  href={network.href}
                  target={network.label === "Email" ? undefined : "_blank"}
                  rel={network.label === "Email" ? undefined : "noopener noreferrer"}
                  aria-label={`Share on ${network.label}`}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${network.className}`}
                >
                  {network.icon}
                </a>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-stone-200 px-3 py-2.5">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-none stroke-stone-500 stroke-2">
                <path strokeLinecap="round" d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.1" />
                <path strokeLinecap="round" d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" />
              </svg>
              <p className="min-w-0 flex-1 truncate text-sm text-stone-600">{url.replace("https://", "")}</p>
              <button type="button" onClick={copyLink} className="shrink-0 text-sm font-bold text-stone-900">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
