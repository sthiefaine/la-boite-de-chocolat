"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  listUsers,
  setUserRole,
  banUser,
  unbanUser,
  ROLES,
  ROLE_LABELS,
  isAdminRole,
  ROLE_HIERARCHY,
  UserRole,
} from "@/lib/auth/auth-helpers";
import { User } from "@/lib/auth/auth-client";
import { authClient } from "@/lib/auth/auth-client";
import styles from "./UsersAdminPage.module.css";

interface UsersResponse {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const pageSize = 10;

  useEffect(() => {
    loadUsers();
    loadCurrentUserRole();
  }, [currentPage, searchTerm]);

  const loadCurrentUserRole = async () => {
    try {
      const { data: session } = await authClient.getSession();
      setCurrentUserRole(session?.user?.role || null);
      setCurrentUser(session?.user || null);
    } catch (error) {
      console.error("Erreur lors du chargement du rôle utilisateur:", error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = (await listUsers({
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        search: searchTerm,
        sortBy: "createdAt",
        sortDirection: "desc",
      })) as UsersResponse;

      setUsers(response.users);
      setTotal(response.total);
    } catch (error) {
      setError("Erreur lors du chargement des utilisateurs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isAdminRole(currentUserRole)) {
      setError("Vous n'avez pas les permissions pour modifier les rôles");
      return;
    }

    try {
      await setUserRole(userId, newRole as UserRole);
      await loadUsers();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erreur lors du changement de rôle");
      }
      console.error(error);
    }
  };

  const getAvailableRoles = (targetUserRole: string | null | undefined) => {
    if (!currentUserRole || !isAdminRole(currentUserRole)) {
      return [];
    }

    const currentUserIndex = ROLE_HIERARCHY.indexOf(
      currentUserRole as UserRole
    );
    const targetUserIndex = targetUserRole
      ? ROLE_HIERARCHY.indexOf(targetUserRole as UserRole)
      : -1;

    if (targetUserIndex !== -1 && currentUserIndex > targetUserIndex) {
      return [];
    }

    return Object.entries(ROLE_LABELS).filter(([role]) => {
      const roleIndex = ROLE_HIERARCHY.indexOf(role as UserRole);
      return roleIndex >= currentUserIndex;
    });
  };

  const handleBanUser = async (userId: string, reason?: string) => {
    // Vérifier que l'utilisateur actuel peut bannir
    if (!isAdminRole(currentUserRole)) {
      setError("Vous n'avez pas les permissions pour bannir des utilisateurs");
      return;
    }

    try {
      await banUser(userId, reason);
      await loadUsers();
    } catch (error) {
      setError("Erreur lors du bannissement");
      console.error(error);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!isAdminRole(currentUserRole)) {
      setError(
        "Vous n'avez pas les permissions pour débannir des utilisateurs"
      );
      return;
    }

    try {
      await unbanUser(userId);
      await loadUsers();
    } catch (error) {
      setError("Erreur lors du débannissement");
      console.error(error);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Gestion des utilisateurs</h1>
            <p className={styles.subtitle}>
              Gérez les utilisateurs, leurs rôles et leurs statuts
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin" className={styles.backLink}>
              ← Retour à l'administration
            </Link>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.mainCard}>
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Rechercher par email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <div className={styles.userCount}>
                {total} utilisateur{total > 1 ? "s" : ""} au total
              </div>
            </div>
          </div>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Chargement...</p>
            </div>
          ) : (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Date d'inscription</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {users.map((user) => (
                      <tr key={user.id} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                          <div className={styles.userInfo}>
                            <div className={styles.avatar}>
                              <span className={styles.avatarText}>
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className={styles.userDetails}>
                              <div className={styles.userName}>{user.name}</div>
                              <div className={styles.userEmail}>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.roleContainer}>
                            <span
                              className={`${styles.roleBadge} ${
                                styles[
                                  `role${
                                    (user.role || "user")
                                      .charAt(0)
                                      .toUpperCase() +
                                    (user.role || "user").slice(1)
                                  }`
                                ]
                              }`}
                            >
                              {ROLE_LABELS[
                                user.role as keyof typeof ROLE_LABELS
                              ] || ROLE_LABELS[ROLES.USER]}
                            </span>
                            {isAdminRole(currentUserRole) ? (
                              (() => {
                                const availableRoles = getAvailableRoles(
                                  user.role
                                );
                                const canModify =
                                  availableRoles.length > 0 &&
                                  user.id !== currentUser?.id;

                                return canModify ? (
                                  <select
                                    value={user.role || ROLES.USER}
                                    onChange={(e) =>
                                      handleRoleChange(user.id, e.target.value)
                                    }
                                    className={styles.roleSelect}
                                  >
                                    {availableRoles.map(([role, label]) => (
                                      <option key={role} value={role}>
                                        {label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className={styles.noPermission}>
                                    {user.id === currentUser?.id
                                      ? "Vous-même"
                                      : "Pas de permission"}
                                  </span>
                                );
                              })()
                            ) : (
                              <span className={styles.noPermission}>
                                Pas de permission
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          {user.banned ? (
                            <span
                              className={`${styles.statusBadge} ${styles.statusBanned}`}
                            >
                              Banni
                            </span>
                          ) : (
                            <span
                              className={`${styles.statusBadge} ${styles.statusActive}`}
                            >
                              Actif
                            </span>
                          )}
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.dateText}>
                            {new Date(user.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          {isAdminRole(currentUserRole) ? (
                            user.banned ? (
                              <button
                                onClick={() => handleUnbanUser(user.id)}
                                className={`${styles.actionButton} ${styles.unbanButton}`}
                              >
                                Débannir
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleBanUser(user.id, "Violation des règles")
                                }
                                className={`${styles.actionButton} ${styles.banButton}`}
                              >
                                Bannir
                              </button>
                            )
                          ) : (
                            <span className={styles.noPermission}>
                              Pas de permission
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className={styles.paginationContainer}>
                  <div className={styles.paginationContent}>
                    <div className={styles.pageInfo}>
                      Page {currentPage} sur {totalPages}
                    </div>
                    <div className={styles.paginationButtons}>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                      >
                        Précédent
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
