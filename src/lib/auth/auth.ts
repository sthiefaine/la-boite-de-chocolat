import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "../prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://la-boite-de-chocolat.vercel.app",
        "https://laboitedechocolat.vercel.app"
    ],
    plugins: [
        admin({
            defaultRole: "user",
            adminRoles: ["developer", "admin", "moderator"],
            impersonationSessionDuration: 60 * 60, // 1 heure
            defaultBanReason: "Violation des règles",
            bannedUserMessage: "Votre compte a été suspendu. Contactez le support si vous pensez qu'il s'agit d'une erreur."
        }),
        nextCookies()
    ]
});