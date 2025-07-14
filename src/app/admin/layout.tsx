import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminRole } from "@/lib/auth/auth-helpers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/unauthorized");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/unauthorized");
  }

  return (
    <div>
      {children}
    </div>
  );
}
