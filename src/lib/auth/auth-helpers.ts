import { authClient, User } from "./auth-client";

export const ROLES = {
  DEVELOPER: "developer",
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user",
} as const;

export const ROLE_HIERARCHY = [
  ROLES.DEVELOPER,
  ROLES.ADMIN,
  ROLES.MODERATOR,
  ROLES.USER,
];

export const ROLE_LABELS = {
  [ROLES.DEVELOPER]: "Développeur",
  [ROLES.ADMIN]: "Administrateur",
  [ROLES.MODERATOR]: "Modérateur",
  [ROLES.USER]: "Utilisateur",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_ROLES = [
  ROLES.DEVELOPER,
  ROLES.ADMIN,
  ROLES.MODERATOR,
] as const;
export const VALID_ROLES = Object.values(ROLES);

export const isAdminRole = (role: string | null | undefined): boolean =>
  role ? ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]) : false;

export const isValidRole = (role: string): boolean =>
  VALID_ROLES.includes(role as UserRole);

export interface Session {
  user: User;
  expiresAt: Date;
}

/**
 * Vérifie si l'utilisateur actuel a le rôle admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data: session } = await authClient.getSession();
    console.log("Session:", session);
    return session?.user?.role === "admin";
  } catch (error) {
    console.error("Erreur lors de la vérification du rôle admin:", error);
    return false;
  }
}

/**
 * Vérifie si l'utilisateur actuel a un rôle d'administration (developer, admin, moderator)
 */
export async function isAdminOrHigher(): Promise<boolean> {
  try {
    const { data: session } = await authClient.getSession();
    return isAdminRole(session?.user?.role);
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du rôle d'administration:",
      error
    );
    return false;
  }
}

/**
 * Vérifie si l'utilisateur actuel a un rôle spécifique
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  try {
    const { data: session } = await authClient.getSession();
    return session?.user?.role === role;
  } catch (error) {
    console.error("Erreur lors de la vérification du rôle:", error);
    return false;
  }
}

/**
 * Vérifie si l'utilisateur actuel a au moins le niveau de rôle spécifié
 */
export async function hasRoleOrHigher(
  requiredRole: UserRole
): Promise<boolean> {
  try {
    const { data: session } = await authClient.getSession();
    const userRole = session?.user?.role;

    if (!userRole) return false;

    const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole as UserRole);
    const requiredRoleIndex = ROLE_HIERARCHY.indexOf(requiredRole);

    return userRoleIndex <= requiredRoleIndex;
  } catch (error) {
    console.error("Erreur lors de la vérification du niveau de rôle:", error);
    return false;
  }
}

/**
 * Vérifie si un utilisateur peut modifier le rôle d'un autre utilisateur
 */
export async function canModifyUserRole(
  targetUserRole: UserRole
): Promise<boolean> {
  try {
    const { data: session } = await authClient.getSession();
    const currentUserRole = session?.user?.role;

    if (!currentUserRole) return false;

    const currentUserIndex = ROLE_HIERARCHY.indexOf(
      currentUserRole as UserRole
    );
    const targetUserIndex = ROLE_HIERARCHY.indexOf(targetUserRole);

    // Un utilisateur ne peut modifier que les rôles de niveau inférieur ou égal
    return currentUserIndex <= targetUserIndex;
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    return false;
  }
}

/**
 * Récupère le rôle de l'utilisateur actuel
 */
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const { data: session } = await authClient.getSession();
    const role = session?.user?.role;
    return Object.values(ROLES).includes(role as UserRole)
      ? (role as UserRole)
      : null;
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur actuel est banni
 */
export async function isBanned(): Promise<boolean> {
  try {
    const { data: session } = await authClient.getSession();
    return session?.user?.banned || false;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du statut de bannissement:",
      error
    );
    return false;
  }
}

/**
 * Récupère la liste des utilisateurs (admin seulement)
 */
export async function listUsers(options?: {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}) {
  try {
    const params = new URLSearchParams({
      limit: (options?.limit || 10).toString(),
      offset: (options?.offset || 0).toString(),
      search: options?.search || "",
      sortBy: options?.sortBy || "createdAt",
      sortDirection: options?.sortDirection || "desc",
    });

    const response = await fetch(`/api/admin/users/list?${params}`);

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des utilisateurs");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw error;
  }
}

/**
 * Change le rôle d'un utilisateur (admin seulement)
 */
export async function setUserRole(userId: string, role: UserRole) {
  try {
    // Utiliser l'API personnalisée pour tous les rôles
    // car Better Auth a des limitations avec les rôles personnalisés
    const response = await fetch("/api/admin/users/role", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, role }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors du changement de rôle");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors du changement de rôle:", error);
    throw error;
  }
}

/**
 * Bannit un utilisateur (admin seulement)
 */
export async function banUser(
  userId: string,
  reason?: string,
  expiresIn?: number
) {
  try {
    const response = await fetch("/api/admin/users/ban", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, reason, expiresIn }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors du bannissement");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors du bannissement:", error);
    throw error;
  }
}

/**
 * Débannit un utilisateur (admin seulement)
 */
export async function unbanUser(userId: string) {
  try {
    const response = await fetch("/api/admin/users/unban", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors du débannissement");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors du débannissement:", error);
    throw error;
  }
}
