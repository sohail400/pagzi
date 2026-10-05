// Outline icons adapted from Tabler Icons (MIT licence).
const ICON_PATHS = {
  x_url: ["M4 4l11.733 16h4.267l-11.733 -16z", "M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"],
  linkedin_url: [
    "M8 11v5",
    "M8 8v.01",
    "M12 16v-5",
    "M16 16v-3a2 2 0 1 0 -4 0",
    "M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z",
  ],
  instagram_url: [
    "M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z",
    "M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0",
    "M16.5 7.5v.01",
  ],
  youtube_url: ["M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z", "M10 9l5 3l-5 3z"],
};

function SocialIcon({ name, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICON_PATHS[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

export default function SocialLinks({ links, size = "md", className = "" }) {
  if (!links.length) return null;

  const small = size === "sm";

  return (
    <div className={`flex flex-wrap items-center ${small ? "-ml-1 gap-1" : "-ml-2 gap-3"} ${className}`}>
      {links.map((link) => (
        <a
          key={link.key}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label={link.label}
          title={link.label}
          className={`rounded-full text-stone-500 transition-colors hover:text-stone-900 ${small ? "p-1" : "p-2"}`}
        >
          <SocialIcon name={link.key} className={small ? "h-4 w-4" : "h-6 w-6"} />
        </a>
      ))}
    </div>
  );
}
