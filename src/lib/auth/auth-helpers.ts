import { authClient, User } from './auth-client';

export type UserRole = 'user' | 'admin';

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
    console.log('Session:', session);
    return session?.user?.role === 'admin';
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle admin:', error);
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
    console.error('Erreur lors de la vérification du rôle:', error);
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
    return (role === 'admin' || role === 'user') ? role : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle:', error);
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
    console.error('Erreur lors de la vérification du statut de bannissement:', error);
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
  sortDirection?: 'asc' | 'desc';
}) {
  try {
    const { data, error } = await authClient.admin.listUsers({
      query: {
        limit: options?.limit || 10,
        offset: options?.offset || 0,
        searchValue: options?.search,
        sortBy: options?.sortBy || 'createdAt',
        sortDirection: options?.sortDirection || 'desc'
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
}

/**
 * Change le rôle d'un utilisateur (admin seulement)
 */
export async function setUserRole(userId: string, role: UserRole) {
  try {
    const { data, error } = await authClient.admin.setRole({
      userId,
      role
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Erreur lors du changement de rôle:', error);
    throw error;
  }
}

/**
 * Bannit un utilisateur (admin seulement)
 */
export async function banUser(userId: string, reason?: string, expiresIn?: number) {
  try {
    const { data, error } = await authClient.admin.banUser({
      userId,
      banReason: reason,
      banExpiresIn: expiresIn
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Erreur lors du bannissement:', error);
    throw error;
  }
}

/**
 * Débannit un utilisateur (admin seulement)
 */
export async function unbanUser(userId: string) {
  try {
    const { data, error } = await authClient.admin.unbanUser({
      userId
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Erreur lors du débannissement:', error);
    throw error;
  }
} 