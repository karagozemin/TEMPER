import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TEMPER — Emergent Harm Moderation",
  description:
    "Detect harm between messages, not inside them. TEMPER combines interaction structure with persistent community memory.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
