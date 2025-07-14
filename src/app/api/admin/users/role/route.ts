import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth/auth-server";
import {
  ROLES,
  ROLE_HIERARCHY,
  isAdminRole,
  isValidRole,
  UserRole,
} from "@/lib/auth/auth-helpers";

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId et role requis" },
        { status: 400 }
      );
    }

    if (!isValidRole(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const currentUserRole = user.role as UserRole;
    const targetUserCurrentRole = targetUser.role as UserRole;
    const newRole = role as UserRole;

    const currentUserIndex = ROLE_HIERARCHY.indexOf(currentUserRole);
    const targetUserIndex = ROLE_HIERARCHY.indexOf(targetUserCurrentRole);

    if (currentUserIndex > targetUserIndex) {
      return NextResponse.json(
        {
          error:
            "Vous ne pouvez pas modifier le rôle d'un utilisateur de niveau supérieur ou égal",
        },
        { status: 403 }
      );
    }

    const newRoleIndex = ROLE_HIERARCHY.indexOf(newRole);

    if (newRoleIndex < currentUserIndex) {
      return NextResponse.json(
        {
          error:
            "Vous ne pouvez pas promouvoir un utilisateur à un niveau supérieur au vôtre",
        },
        { status: 403 }
      );
    }

    if (userId === user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier votre propre rôle" },
        { status: 403 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Erreur lors du changement de rôle:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
