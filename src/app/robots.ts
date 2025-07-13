import { MetadataRoute } from "next";

const AI_BOTS = ["GPTBot", "ChatGPT-User", "Claude-Web", "Bard", "Perplexity", "Gemini", "Google-Extended"];

const SOCIAL_BOTS = ["facebookexternalhit", "Twitterbot", "LinkedInBot", "TikTokBot", "DouyinBot"];

const SEARCH_ENGINE_BOTS = ["Baiduspider", "Sogou", "360Spider", "YisouSpider", "NaverBot", "YandexBot", "ByteDance"];

const DEFAULT_RULES = {
  allow: "/",
  disallow: ["/admin/", "/api/", "/private/", "/*?*utm*", "/*?*ref*"],
};
  
const AI_RULES = {
  allow: ["/episodes/", "/films/", "/"],
  disallow: ["/admin/", "/api/"],
};

const SOCIAL_RULES = {
  allow: "/",
};

const SEARCH_ENGINE_RULES = {
  allow: ["/episodes/", "/films/", "/"],
  disallow: ["/admin/", "/api/"],
};

export default function robots(): MetadataRoute.Robots {

  const allRules = [

    {
      userAgent: "*",
      ...DEFAULT_RULES,
    },

    ...AI_BOTS.map((bot) => ({
      userAgent: bot,
      ...AI_RULES,
    })),

    ...SOCIAL_BOTS.map((bot) => ({
      userAgent: bot,
      ...SOCIAL_RULES,
    })),

    ...SEARCH_ENGINE_BOTS.map((bot) => ({
      userAgent: bot,
      ...SEARCH_ENGINE_RULES,
    })),
  ];

  return {
    rules: allRules,
    sitemap: `${
      process.env.VERCEL_URL
        ? process.env.VERCEL_URL + "/sitemap.xml"
        : process.env.NEXT_PUBLIC_URL + "/sitemap.xml"
    }`,
  };
}
