"use client";

import { useState } from "react";

export default function PasswordField({
  name,
  autoComplete,
  placeholder,
  required,
  minLength,
  defaultValue,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="input h-12 w-full rounded-xl border-white/15 bg-[#1F1F1F] px-4 pr-12 text-stone-100 outline-none placeholder:text-stone-500 focus:border-stone-400 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((shown) => !shown)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="btn btn-ghost btn-sm absolute top-1/2 right-1.5 h-9 w-9 -translate-y-1/2 rounded-lg border-0 p-0 text-stone-400 shadow-none hover:bg-white/10 hover:text-white"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4.5 20 19.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.2 9.4A2.6 2.6 0 0 0 12 14.5c.5 0 1-.1 1.4-.4M6.1 6.7C4.2 8.1 2.5 12 2.5 12S6 17.5 12 17.5c1.5 0 2.8-.4 4-.9M10.2 6.7A10 10 0 0 1 12 6.5c6 0 9.5 5.5 9.5 5.5s-.8 1.3-2.2 2.6" />
    </svg>
  );
}
