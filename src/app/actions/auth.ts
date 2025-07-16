"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signOutAction(currentPath: string) {
  await auth.api.signOut({
    headers: await headers(),
  });

  // Si on est sur une page d'administration, rediriger vers signin
  if (currentPath.startsWith("/admin")) {
    redirect("/signin");
  }

  // Pour les pages normales, on retourne un indicateur pour forcer le refresh côté client
  return { shouldRefresh: true };
}
