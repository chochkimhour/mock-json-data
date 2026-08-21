import "./globals.css";
import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://mock-json-data.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mock JSON Data — Fast REST API Mocks",
    template: "%s | Mock JSON Data",
  },
  description:
    "Create, test, and share realistic REST API mock endpoints with custom JSON responses, scenarios, and dynamic templates.",
  keywords: [
    "mock API",
    "JSON API mock",
    "REST API testing",
    "fake API",
    "API prototyping",
    "frontend development",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Mock JSON Data",
    title: "Mock JSON Data — Fast REST API Mocks",
    description: "Create, test, and share realistic REST API mocks in seconds.",
  },
  twitter: {
    card: "summary",
    title: "Mock JSON Data — Fast REST API Mocks",
    description: "Create, test, and share realistic REST API mocks in seconds.",
  },
  robots: { index: true, follow: true },
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("mock-json-theme")==="light"){document.body.classList.add("light")}}catch{}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
