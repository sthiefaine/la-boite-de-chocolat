"use server";

import {
  auth,
  normalizeGmail,
  checkNormalizedEmailExists,
} from "@/lib/auth/auth";

// Codes d'erreur officiels de Better Auth
const BETTER_AUTH_ERROR_CODES = {
  USER_NOT_FOUND: "User not found",
  FAILED_TO_CREATE_USER: "Failed to create user",
  FAILED_TO_CREATE_SESSION: "Failed to create session",
  FAILED_TO_UPDATE_USER: "Failed to update user",
  FAILED_TO_GET_SESSION: "Failed to get session",
  INVALID_PASSWORD: "Invalid password",
  INVALID_EMAIL: "Invalid email",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "Social account already linked",
  PROVIDER_NOT_FOUND: "Provider not found",
  INVALID_TOKEN: "invalid token",
  ID_TOKEN_NOT_SUPPORTED: "id_token not supported",
  FAILED_TO_GET_USER_INFO: "Failed to get user info",
  USER_EMAIL_NOT_FOUND: "User email not found",
  EMAIL_NOT_VERIFIED: "Email not verified",
  PASSWORD_TOO_SHORT: "Password too short",
  PASSWORD_TOO_LONG: "Password too long",
  USER_ALREADY_EXISTS: "User already exists",
  EMAIL_CAN_NOT_BE_UPDATED: "Email can not be updated",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Credential account not found",
  SESSION_EXPIRED: "Session expired. Re-authenticate to perform this action.",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "You can't unlink your last account",
  ACCOUNT_NOT_FOUND: "Account not found",
  USER_ALREADY_HAS_PASSWORD:
    "User already has a password. Provide that to delete the account.",
} as const;

type SignUpState = {
  error: string | null;
  success: boolean;
};

/**
 * Traite les erreurs Better Auth et retourne un message utilisateur approprié
 */
function handleBetterAuthError(error: any): string {
  if (!error || typeof error !== "object") {
    return "Une erreur inattendue s'est produite";
  }

  // Vérifier si c'est une erreur avec un code spécifique
  if ("code" in error && typeof error.code === "string") {
    switch (error.code) {
      case BETTER_AUTH_ERROR_CODES.USER_ALREADY_EXISTS:
        return "Un compte avec cet email existe déjà";

      case BETTER_AUTH_ERROR_CODES.INVALID_EMAIL:
        return "Format d'email invalide";

      case BETTER_AUTH_ERROR_CODES.PASSWORD_TOO_SHORT:
        return "Le mot de passe doit contenir au moins 8 caractères";

      case BETTER_AUTH_ERROR_CODES.PASSWORD_TOO_LONG:
        return "Le mot de passe est trop long";

      case BETTER_AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED:
        return "Veuillez vérifier votre email avant de vous connecter";

      case BETTER_AUTH_ERROR_CODES.FAILED_TO_CREATE_USER:
        return "Impossible de créer le compte. Veuillez réessayer";

      case BETTER_AUTH_ERROR_CODES.FAILED_TO_CREATE_SESSION:
        return "Erreur lors de la création de la session";

      case BETTER_AUTH_ERROR_CODES.INVALID_EMAIL_OR_PASSWORD:
        return "Email ou mot de passe incorrect";

      case BETTER_AUTH_ERROR_CODES.USER_NOT_FOUND:
        return "Aucun compte trouvé avec cet email";

      case BETTER_AUTH_ERROR_CODES.CREDENTIAL_ACCOUNT_NOT_FOUND:
        return "Aucun compte trouvé avec ces identifiants";

      case BETTER_AUTH_ERROR_CODES.SESSION_EXPIRED:
        return "Votre session a expiré. Veuillez vous reconnecter";

      default:
        return "Une erreur s'est produite lors de l'authentification";
    }
  }

  // Vérifier si c'est une erreur avec un message spécifique
  if ("message" in error && typeof error.message === "string") {
    const message = error.message;

    // Gestion des erreurs personnalisées de notre validation
    if (message.includes("Un compte avec cet email existe déjà")) {
      return message;
    }

    // Gestion des erreurs Better Auth par message
    if (message.includes(BETTER_AUTH_ERROR_CODES.USER_ALREADY_EXISTS)) {
      return "Un compte avec cet email existe déjà";
    }

    if (message.includes(BETTER_AUTH_ERROR_CODES.INVALID_EMAIL)) {
      return "Format d'email invalide";
    }

    if (message.includes(BETTER_AUTH_ERROR_CODES.PASSWORD_TOO_SHORT)) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (message.includes(BETTER_AUTH_ERROR_CODES.INVALID_EMAIL_OR_PASSWORD)) {
      return "Email ou mot de passe incorrect";
    }

    if (message.includes(BETTER_AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED)) {
      return "Veuillez vérifier votre email avant de vous connecter";
    }
  }

  // Vérifier les erreurs de statut HTTP
  if ("status" in error && typeof error.status === "string") {
    switch (error.status) {
      case "UNAUTHORIZED":
        return "Email ou mot de passe incorrect";

      case "FORBIDDEN":
        return "Votre compte a été suspendu. Contactez le support.";

      case "TOO_MANY_REQUESTS":
        return "Trop de tentatives. Veuillez réessayer plus tard.";

      case "BAD_REQUEST":
        return "Données invalides. Veuillez vérifier vos informations.";

      case "CONFLICT":
        return "Un compte avec cet email existe déjà";

      default:
        return "Une erreur s'est produite lors de l'authentification";
    }
  }

  return "Une erreur inattendue s'est produite";
}

export async function signUpAction(
  prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const captcha = formData.get("captcha") as string;

  // Validation du captcha
  if (captcha) {
    return {
      error: "Erreur de validation",
      success: false,
    };
  }

  // Validation des champs requis
  if (!email || !password || !confirmPassword) {
    return {
      error: "Tous les champs sont requis",
      success: false,
    };
  }

  // Validation de la correspondance des mots de passe
  if (password !== confirmPassword) {
    return {
      error: "Les mots de passe ne correspondent pas",
      success: false,
    };
  }

  // Validation de la longueur du mot de passe
  if (password.length < 8) {
    return {
      error: "Le mot de passe doit contenir au moins 8 caractères",
      success: false,
    };
  }

  if (password.length > 128) {
    return {
      error: "Le mot de passe est trop long (maximum 128 caractères)",
      success: false,
    };
  }

  // Vérification de l'email normalisé (empêche les alias Gmail)
  try {
    const exists = await checkNormalizedEmailExists(email);
    if (exists) {
      return {
        error: "Un compte avec cet email existe déjà",
        success: false,
      };
    }
  } catch (error) {
    return {
      error: "Erreur lors de la vérification de l'email",
      success: false,
    };
  }

  // Création de l'utilisateur
  try {
    const result = await auth.api.createUser({
      body: {
        email,
        password,
        name: email.split("@")[0],
      },
    });

    if (result.user) {
      return {
        error: null,
        success: true,
      };
    }

    return {
      error: "Erreur lors de la création du compte",
      success: false,
    };
  } catch (error) {
    const errorMessage = handleBetterAuthError(error);
    return {
      error: errorMessage,
      success: false,
    };
  }
}

export async function signInAction(
  prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const captcha = formData.get("captcha") as string;

  // Validation du captcha
  if (captcha) {
    return {
      error: "Erreur de validation",
      success: false,
    };
  }

  // Validation des champs requis
  if (!email || !password) {
    return {
      error: "Email et mot de passe requis",
      success: false,
    };
  }

  // Connexion
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    if (result.user) {
      return {
        error: null,
        success: true,
      };
    }

    return {
      error: "Erreur lors de la connexion",
      success: false,
    };
  } catch (error) {
    const errorMessage = handleBetterAuthError(error);
    return {
      error: errorMessage,
      success: false,
    };
  }
}
