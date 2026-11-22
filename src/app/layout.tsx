import type { Metadata } from "next";
// @ts-expect-error Next.js provides declarations for global CSS imports.
import "./globals.css";

export const metadata: Metadata = {
  title: "HRMS",
  description: "HR Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}