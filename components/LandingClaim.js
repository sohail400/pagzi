"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { USERNAME_PATTERN } from "@/lib/profile";

const PINK_BUTTON =
  "btn btn-save h-14 min-h-14 rounded-xl border-0 px-7 text-base font-semibold text-white shadow-none sm:h-12 sm:min-h-12 sm:text-sm";

export default function LandingClaim({ stacked = false }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    const username = value.trim().toLowerCase();
    if (!username) {
      router.push("/signup");
      return;
    }
    if (!USERNAME_PATTERN.test(username)) {
      setError("Use 3–30 letters, numbers, _ or -.");
      return;
    }
    router.push(`/signup?username=${encodeURIComponent(username)}`);
  }

  const field = (
    <label
      className={`flex w-full min-w-0 flex-1 items-center rounded-xl border px-4 text-base ${
        stacked
          ? "h-16 min-h-16 border-white/20 bg-[#2A2A2A]"
          : "h-16 min-h-16 border-white/20 bg-[#2A2A2A] sm:h-12 sm:min-h-12 sm:border-white/15 sm:bg-[#161616] sm:text-sm"
      }`}
    >
      <span className="shrink-0 text-stone-400">pagzi.online/</span>
      <input
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setError("");
        }}
        placeholder="yourname"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={30}
        aria-label="Username"
        className={`min-w-0 flex-1 bg-transparent py-0 text-base leading-normal text-stone-100 outline-none placeholder:text-stone-500 ${stacked ? "" : "sm:text-sm"}`}
      />
    </label>
  );

  if (stacked) {
    return (
      <form onSubmit={submit} className="mx-auto mt-8 w-full max-w-sm text-left">
        {field}
        <button type="submit" className={`${PINK_BUTTON} mt-3 w-full`}>
          Create your page →
        </button>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        {field}
        <button type="submit" className={`${PINK_BUTTON} w-full sm:w-auto`}>
          Create your page →
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      <p className="mt-3 text-sm text-stone-500">
        Connect Google Search Console · Customize your profile · Share your progress
      </p>
    </form>
  );
}
