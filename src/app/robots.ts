import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://mock-json-data.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/docs"],
      disallow: [
        "/dashboard",
        "/api/",
        "/login",
        "/register",
        "/reset-password",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
