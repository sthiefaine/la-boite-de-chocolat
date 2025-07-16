import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function POST() {
  await auth.api.signOut({
    headers: await headers(),
  });
  
  redirect("/");
} 