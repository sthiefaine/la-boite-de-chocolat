"use server";

import { auth } from "@/lib/auth/auth";

type SignUpState = {
  error: string | null;
  success: boolean;
};

export async function signUpAction(
  prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const captcha = formData.get("captcha") as string;

  if (captcha) {
    return {
      error: "Erreur de validation",
      success: false,
    };
  }

  if (!email || !password || !confirmPassword) {
    return {
      error: "Tous les champs sont requis",
      success: false,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Les mots de passe ne correspondent pas",
      success: false,
    };
  }

  if (password.length < 8) {
    return {
      error: "Le mot de passe doit contenir au moins 8 caractères",
      success: false,
    };
  }

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
      error: "Erreur d'inscription",
      success: false,
    };
  } catch (err) {
    if (err instanceof Error) {
      if (
        err.message.includes("User already exists") ||
        err.message.includes("Email already exists")
      ) {
        return {
          error: "Un compte avec cet email existe déjà",
          success: false,
        };
      }

      if (err.message.includes("Invalid email")) {
        return {
          error: "Format d'email invalide",
          success: false,
        };
      }

      if (
        err.message.includes("Password too weak") ||
        err.message.includes("password")
      ) {
        return {
          error: "Le mot de passe ne respecte pas les critères de sécurité",
          success: false,
        };
      }

      if (err.message.includes("Too many attempts")) {
        return {
          error:
            "Trop de tentatives d'inscription. Veuillez réessayer plus tard.",
          success: false,
        };
      }

      if (
        err.message.includes("compte") ||
        err.message.includes("email") ||
        err.message.includes("mot de passe")
      ) {
        return {
          error: err.message,
          success: false,
        };
      }
    }

    return {
      error: "Une erreur inattendue s'est produite",
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

  if (captcha) {
    return {
      error: "Erreur de validation",
      success: false,
    };
  }

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
      error: "Erreur de connexion",
      success: false,
    };
  } catch (err) {
    if (err instanceof Error) {
      if ("status" in err && typeof err.status === "string") {
        switch (err.status) {
          case "UNAUTHORIZED":
            return {
              error: "Email ou mot de passe incorrect",
              success: false,
            };

          case "FORBIDDEN":
            return {
              error: "Votre compte a été suspendu. Contactez le support.",
              success: false,
            };

          case "TOO_MANY_REQUESTS":
            return {
              error:
                "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
              success: false,
            };

          default:
            if (
              err.message.includes("Votre compte") ||
              err.message.includes("Contactez le support")
            ) {
              return {
                error: err.message,
                success: false,
              };
            }
        }
      }
    }

    return {
      error: "Une erreur inattendue s'est produite",
      success: false,
    };
  }
}
