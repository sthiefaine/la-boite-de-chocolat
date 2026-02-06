import { SITE_URL } from "@/helpers/config";
import { MetadataRoute } from "next";

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Claude-Web",
  "ClaudeBot",
  "anthropic-ai",
  "Bard",
  "Gemini",
  "Google-Extended",
  "PerplexityBot",
  "Perplexity",
  "CCBot",
  "cohere-ai",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Bytespider",
];

const SOCIAL_BOTS = [
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "TikTokBot",
  "DouyinBot",
];

const SEARCH_ENGINE_BOTS = [
  "Baiduspider",
  "Sogou",
  "360Spider",
  "YisouSpider",
  "NaverBot",
  "YandexBot",
  "ByteDance",
];

const DEFAULT_RULES = {
  allow: ["/", "/episodes/", "/sagas/", "/transcriptions/"],
  disallow: ["/admin/", "/api/", "/private/", "/*?*utm*", "/*?*ref*"],
};

const AI_RULES = {
  allow: ["/", "/episodes/", "/films/", "/sagas/", "/people/", "/about", "/llms.txt"],
  disallow: ["/admin/", "/api/", "/private/"],
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
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
