import { initials } from "@/lib/profile";

export default function Avatar({ src, name, className = "", textClassName = "text-base" }) {
  return (
    <div className="avatar">
      <div className={`rounded-full ${className}`}>
        {src ? (
          <img src={src} alt={name || "Profile photo"} className="object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-amber-100 font-bold text-stone-700 ${textClassName}`}
          >
            {initials(name)}
          </div>
        )}
      </div>
    </div>
  );
}
