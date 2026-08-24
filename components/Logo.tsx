"use client";

import temperLogo from "@/temper.png";

export function Logo({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* The actual logo file is used directly — no recreation. */}
      <img
        src={temperLogo.src}
        alt="TEMPER"
        width={size}
        height={size}
        draggable={false}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
