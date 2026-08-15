import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Mock JSON Data — Create mock APIs instantly",
  description: "Create, test, and share realistic REST API mocks in seconds.",
  icons: {
    icon: "/json-png.png",
    shortcut: "/json-png.png",
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
