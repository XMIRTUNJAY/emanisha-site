import type { ReactNode } from "react";

export type IconName =
  | "arrow"
  | "play"
  | "pause"
  | "close"
  | "menu"
  | "sun"
  | "moon"
  | "book"
  | "sound";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
    play: <path d="m9 7 8 5-8 5V7Z" />,
    pause: <path d="M9 8v8M15 8v8" />,
    close: <path d="m7 7 10 10M17 7 7 17" />,
    menu: <path d="M5 8h14M5 16h14" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
      </>
    ),
    moon: <path d="M19 15.5A7.5 7.5 0 0 1 8.5 5 7.5 7.5 0 1 0 19 15.5Z" />,
    book: (
      <path d="M5 5.5A3.5 3.5 0 0 1 8.5 9H12v10H8.5A3.5 3.5 0 0 0 5 22V5.5ZM19 5.5A3.5 3.5 0 0 0 15.5 9H12v10h3.5A3.5 3.5 0 0 1 19 22V5.5Z" />
    ),
    sound: (
      <>
        <path d="M5 10v4h3l4 3V7l-4 3H5Z" />
        <path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="section-label">{children}</p>;
}
