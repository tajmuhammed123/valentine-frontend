import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valentine's Day Poll",
  description: "Pick your valentine from your colleagues",
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
