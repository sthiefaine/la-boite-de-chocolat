interface RatingIconProps {
  variant: "empty" | "filled" | "hover" | "golden" | "caramel";
  className?: string;
}

export default function RatingIcon({
  variant,
  className = "",
}: RatingIconProps) {
  const getFillColor = () => {
    switch (variant) {
      case "golden":
        return "var(--accent-gold)";
      case "caramel":
        return "#D2691E";
      case "filled":
        return "var(--chocolate-primary)";
      case "hover":
        return "var(--chocolate-secondary)";
      case "empty":
      default:
        return "rgba(255, 255, 255, 0.6)";
    }
  };

  const getStrokeColor = () => {
    switch (variant) {
      case "golden":
        return "var(--chocolate-dark)";
      case "caramel":
        return "#8B4513";
      case "filled":
        return "var(--chocolate-dark)";
      case "hover":
        return "var(--chocolate-primary)";
      case "empty":
      default:
        return "rgba(255, 255, 255, 0.3)";
    }
  };

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-variant={variant}
    >
      {/* Ombre portée plus réaliste */}
      <ellipse
        cx="16"
        cy="30"
        rx="12"
        ry="3"
        fill="rgba(0, 0, 0, 0.3)"
        opacity="0.4"
      />

      {/* Ombre interne pour la profondeur */}
      <rect
        x="4"
        y="4"
        width="24"
        height="24"
        rx="4"
        fill="rgba(0, 0, 0, 0.1)"
        opacity="0.3"
      />

      {/* Forme principale du chocolat avec coins arrondis */}
      <rect
        x="4"
        y="4"
        width="24"
        height="24"
        rx="4"
        fill={getFillColor()}
        stroke={getStrokeColor()}
        strokeWidth="1.5"
      />

      {/* Gradient interne pour la texture */}
      <rect
        x="5"
        y="5"
        width="22"
        height="22"
        rx="3"
        fill="url(#chocolateGradient)"
        opacity="0.3"
      />

      {/* Définition du gradient */}
      <defs>
        <linearGradient
          id="chocolateGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.1)" />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0.1)" />
        </linearGradient>
      </defs>

      {/* Lignes de division du chocolat (style tablette) */}
      <path
        d="M10 10H22M10 16H22M10 22H22M16 10V22"
        stroke={getStrokeColor()}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Lignes secondaires pour plus de détails */}
      <path
        d="M13 13H19M13 19H19M16 13V19"
        stroke={getStrokeColor()}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Points de texture (noisettes/éclats) - plus variés */}
      <circle cx="8" cy="8" r="1" fill={getStrokeColor()} opacity="0.8" />
      <circle cx="24" cy="8" r="0.8" fill={getStrokeColor()} opacity="0.7" />
      <circle cx="8" cy="24" r="0.9" fill={getStrokeColor()} opacity="0.8" />
      <circle cx="24" cy="24" r="1.1" fill={getStrokeColor()} opacity="0.7" />
      <circle cx="16" cy="16" r="0.7" fill={getStrokeColor()} opacity="0.6" />
      <circle cx="12" cy="12" r="0.5" fill={getStrokeColor()} opacity="0.5" />
      <circle cx="20" cy="12" r="0.6" fill={getStrokeColor()} opacity="0.5" />
      <circle cx="12" cy="20" r="0.4" fill={getStrokeColor()} opacity="0.5" />
      <circle cx="20" cy="20" r="0.5" fill={getStrokeColor()} opacity="0.5" />

      {/* Effet de brillance principal */}
      <path
        d="M5 5L9 9M27 5L23 9"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Brillance secondaire */}
      <path
        d="M6 6L8 8M26 6L24 8"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="0.5"
        strokeLinecap="round"
      />

      {/* Relief pour la profondeur */}
      <path
        d="M5 5L5 27M27 5L27 27"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* Détails supplémentaires pour les chocolats remplis */}
      {variant === "filled" && (
        <>
          <path
            d="M7 7L10 10M25 7L22 10"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          <circle cx="16" cy="12" r="0.6" fill="rgba(255, 255, 255, 0.5)" />
          <circle cx="16" cy="20" r="0.6" fill="rgba(255, 255, 255, 0.5)" />
          <circle cx="12" cy="16" r="0.4" fill="rgba(255, 255, 255, 0.4)" />
          <circle cx="20" cy="16" r="0.4" fill="rgba(255, 255, 255, 0.4)" />
          {/* Texture supplémentaire */}
          <path
            d="M8 8L9 9M24 8L23 9"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="0.3"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Effets spéciaux pour le chocolat doré */}
      {variant === "golden" && (
        <>
          <path
            d="M7 7L10 10M25 7L22 10"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="16" cy="12" r="0.7" fill="rgba(255, 255, 255, 0.7)" />
          <circle cx="16" cy="20" r="0.7" fill="rgba(255, 255, 255, 0.7)" />
          <circle cx="12" cy="16" r="0.5" fill="rgba(255, 255, 255, 0.6)" />
          <circle cx="20" cy="16" r="0.5" fill="rgba(255, 255, 255, 0.6)" />
          <circle cx="14" cy="14" r="0.3" fill="rgba(255, 255, 255, 0.5)" />
          <circle cx="18" cy="14" r="0.3" fill="rgba(255, 255, 255, 0.5)" />
          <circle cx="14" cy="18" r="0.3" fill="rgba(255, 255, 255, 0.5)" />
          <circle cx="18" cy="18" r="0.3" fill="rgba(255, 255, 255, 0.5)" />

          {/* Effet de brillance dorée principale */}
          <path
            d="M5 5L8 8M27 5L24 8"
            stroke="rgba(255, 215, 0, 0.9)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Brillance dorée secondaire */}
          <path
            d="M6 6L9 9M26 6L23 9"
            stroke="rgba(255, 215, 0, 0.6)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />

          {/* Points dorés décoratifs */}
          <circle cx="10" cy="10" r="0.3" fill="rgba(255, 215, 0, 0.8)" />
          <circle cx="22" cy="10" r="0.3" fill="rgba(255, 215, 0, 0.8)" />
          <circle cx="10" cy="22" r="0.3" fill="rgba(255, 215, 0, 0.8)" />
          <circle cx="22" cy="22" r="0.3" fill="rgba(255, 215, 0, 0.8)" />
        </>
      )}

      {/* Caramel pour la note la plus basse */}
      {variant === "caramel" && (
        <>
          {/* Forme de caramel (goutte) */}
          <path
            d="M16 6C16 6 20 8 20 12C20 16 16 26 16 26C16 26 12 16 12 12C12 8 16 6 16 6Z"
            fill="#D2691E"
            stroke="#8B4513"
            strokeWidth="2"
          />

          {/* Détails du caramel */}
          <path
            d="M16 8C16 8 18 9.5 18 12C18 14.5 16 22 16 22C16 22 14 14.5 14 12C14 9.5 16 8 16 8Z"
            fill="#E67E22"
            opacity="1"
          />

          {/* Brillance du caramel */}
          <path
            d="M15 7L17 9M17 7L19 9"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />

          {/* Points de texture caramel */}
          <circle cx="16" cy="10" r="0.4" fill="rgba(255, 255, 255, 0.4)" />
          <circle cx="16" cy="14" r="0.3" fill="rgba(255, 255, 255, 0.3)" />
          <circle cx="16" cy="18" r="0.2" fill="rgba(255, 255, 255, 0.2)" />

          {/* Effet de coulée */}
          <path
            d="M15 20Q16 22 17 20"
            stroke="#8B4513"
            strokeWidth="0.5"
            fill="none"
            opacity="0.6"
          />
        </>
      )}
    </svg>
  );
}
