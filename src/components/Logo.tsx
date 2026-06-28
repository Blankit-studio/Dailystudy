/**
 * Brand logo — an open rounded-square bracket (white) with a blue
 * bottom-right corner, inspired by the Blankit Studio mark.
 */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      role="img"
      aria-label="Daily Study"
    >
      {/* white open bracket — frame minus the bottom-right corner */}
      <path
        d="M23 32 H15 A7 7 0 0 1 8 25 V15 A7 7 0 0 1 15 8 H25 A7 7 0 0 1 32 15 V23"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* blue accent corner (bottom-right) */}
      <path
        d="M32 25 A7 7 0 0 1 25 32"
        stroke="#1d8fff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({
  className = "",
  textClassName = "text-lg",
  markClassName = "h-7 w-7",
  responsiveWordmark = false,
}: {
  className?: string;
  textClassName?: string;
  markClassName?: string;
  /** Hide the wordmark on small screens (icon only). */
  responsiveWordmark?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-bold tracking-tight text-fg ${className}`}
    >
      <LogoMark className={`${markClassName} shrink-0`} />
      <span className={`${responsiveWordmark ? "hidden sm:inline" : ""} ${textClassName}`}>
        Daily <span className="text-brand">Study</span>
      </span>
    </span>
  );
}
