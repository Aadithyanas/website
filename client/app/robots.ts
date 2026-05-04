import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/erp/",
          "/aju_admin_133242_registrations/",
          "/api/",
          "/_next/",
          "/static/",
        ],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "Claude-Web"],
        allow: "/",
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "facebookexternalhit",
        allow: "/",
      }
    ],
    sitemap: "https://www.ajuedsolutions.com/sitemap.xml",
  };
}
