import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Mock JSON Data",
  description: "Create, test, and share realistic REST API mocks in seconds.",
  icons: {
    icon: "/mock-json-logo.svg",
    shortcut: "/mock-json-logo.svg",
  },
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
