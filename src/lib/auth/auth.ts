import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "../prisma";
import { SITE_URL } from "@/helpers/config";

/**
 * Normalise un email Gmail en supprimant les alias avec "+"
 * Exemple: test+alias@gmail.com devient test@gmail.com
 */
function normalizeGmail(email: string): string {
  const [localPart, domain] = email.toLowerCase().split("@");

  // Si c'est un email Gmail, normaliser la partie locale
  if (domain === "gmail.com") {
    // Supprimer tout ce qui suit le "+" dans la partie locale
    const normalizedLocal = localPart.split("+")[0];
    // Supprimer les points (Gmail ignore les points)
    const withoutDots = normalizedLocal.replace(/\./g, "");
    return `${withoutDots}@gmail.com`;
  }

  return email.toLowerCase();
}

/**
 * Vérifie si un email normalisé existe déjà
 */
async function checkNormalizedEmailExists(email: string): Promise<boolean> {
  const normalizedEmail = normalizeGmail(email);

  // Vérifier si l'email normalisé existe déjà
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { email: email.toLowerCase() }],
    },
  });

  return !!existingUser;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async validateEmail(email: string) {
      const normalizedEmail = normalizeGmail(email);
      const exists = await checkNormalizedEmailExists(email);
      if (exists) {
        throw new Error("Un compte avec cet email existe déjà");
      }
      return normalizedEmail;
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    SITE_URL,
  ],
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["developer", "admin", "moderator"],
      impersonationSessionDuration: 60 * 60, // 1 heure
      defaultBanReason: "Violation des règles",
      bannedUserMessage:
        "Votre compte a été suspendu. Contactez le support si vous pensez qu'il s'agit d'une erreur.",
    }),
    nextCookies(),
  ],
});

// Export des fonctions utilitaires pour utilisation ailleurs
export { normalizeGmail, checkNormalizedEmailExists };
