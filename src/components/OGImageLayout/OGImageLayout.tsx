/* eslint-disable @next/next/no-img-element */
import { ReactNode } from "react";

interface OGImageLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  showNewBadge?: boolean;
  episodeNumber?: string;
  isNew?: boolean;
}

export function OGImageLayout({
  leftContent,
  rightContent,
  showNewBadge = false,
  episodeNumber,
  isNew = false,
}: OGImageLayoutProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background:
          "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #96CEB4 75%, #FFEAA7 100%)",
        position: "relative",
      }}
    >
      {/* Effet de texture/grain moderne */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 0%, transparent 30%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 40%)",
          display: "flex",
        }}
      />

      {/* Section gauche */}
      <div
        style={{
          width: "50%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "40px",
        }}
      >
        {leftContent}
      </div>

      {/* Section droite */}
      <div
        style={{
          width: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          padding: "40px",
          background:
            "linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.8) 100%)",
          position: "relative",
        }}
      >
        {/* Badge NOUVEAU */}
        {showNewBadge && isNew && (
          <div
            style={{
              position: "absolute",
              top: "25px",
              right: "25px",
              background: "linear-gradient(45deg, #FF6B6B, #FF8E8E)",
              color: "white",
              padding: "12px 30px",
              borderRadius: "25px",
              fontSize: "24px",
              fontWeight: "900",
              letterSpacing: "1px",
              boxShadow: "0 4px 15px rgba(255, 107, 107, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            🔥 NOUVEAU
          </div>
        )}

        {/* Numéro d'épisode avec style moderne */}
        {showNewBadge && episodeNumber && (
          <div
            style={{
              position: "absolute",
              top: "25px",
              left: "25px",
              fontSize: "24px",
              marginBottom: "30px",
              fontWeight: "700",
              color: "#FFD700",
              padding: "12px 24px",
              background:
                "linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)",
              borderRadius: "30px",
              border: "2px solid rgba(255, 215, 0, 0.3)",
              display: "flex",
              boxShadow: "0 4px 15px rgba(255, 215, 0, 0.2)",
            }}
          >
            {episodeNumber}
          </div>
        )}

        {rightContent}

        {/* Accent décoratif coloré */}
        <div
          style={{
            position: "absolute",
            bottom: "25px",
            left: "40px",
            right: "40px",
            height: "4px",
            background:
              "linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #96CEB4 75%, #FFEAA7 100%)",
            borderRadius: "2px",
            display: "flex",
            boxShadow: "0 2px 10px rgba(255, 107, 107, 0.3)",
          }}
        />
      </div>
    </div>
  );
}

// Composants utilitaires pour les éléments communs
export function ImageContainer({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </div>
  );
}

export function ImageShadow() {
  return (
    <div
      style={{
        position: "absolute",
        width: "85%",
        height: "85%",
        background: "rgba(0, 0, 0, 0.4)",
        borderRadius: "15px",
        transform: "translateY(8px) translateX(8px)",
        display: "flex",
      }}
    />
  );
}

export function ModernImage({
  src,
  alt = "",
  isAdult = false,
}: {
  src: string;
  alt?: string;
  isAdult?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={src}
        width={500}
        height={400}
        style={{
          width: "85%",
          height: "85%",
          objectFit: "cover",
          borderRadius: "15px",
          border: "4px solid rgba(255, 255, 255, 0.8)",
          boxShadow:
            "0 15px 40px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1)",
          filter: isAdult ? "blur(10px)" : "none",
          opacity: isAdult ? 0.8 : 1,
        }}
        alt={alt}
      />
    </div>
  );
}

export function PlayButton() {
  return (
    <div
      style={{
        position: "absolute",
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "4px solid rgba(255, 255, 255, 0.9)",
        boxShadow:
          "0 10px 30px rgba(255, 107, 107, 0.4), 0 0 30px rgba(255, 255, 255, 0.3)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="white"
        stroke="none"
      >
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    </div>
  );
}

export function AgeBadge() {
  return (
    <div
      style={{
        position: "absolute",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "4px solid rgba(255, 255, 255, 0.9)",
        boxShadow:
          "0 10px 30px rgba(220, 38, 38, 0.6), 0 0 30px rgba(255, 255, 255, 0.3)",
      }}
    >
      <span
        style={{
          fontSize: "48px",
          fontWeight: "900",
          color: "white",
          textShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
          letterSpacing: "-2px",
        }}
      >
        +18
      </span>
    </div>
  );
}

export function EpisodeContent({
  title,
  episodeNumber,
  isNew = false,
}: {
  title: string;
  episodeNumber?: string;
  isNew?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Titre principal avec style moderne */}
      <div
        style={{
          fontSize: "50px",
          fontWeight: "900",
          marginBottom: "30px",
          textShadow: "0 4px 20px rgba(0, 0, 0, 0.8)",
          letterSpacing: "-3px",
          color: "#FFD700",
          textAlign: "center",
        }}
      >
        ÉCOUTEZ MAINTENANT
      </div>

      {/* Titre de l'épisode plus grand */}
      <div
        style={{
          fontSize: "34px",
          marginBottom: "25px",
          fontWeight: "bold",
          textAlign: "center",
          lineHeight: "1.1",
          textShadow: "0 3px 10px rgba(0, 0, 0, 0.8)",
          color: "#FFFFFF",
          maxWidth: "95%",
        }}
      >
        {title}
      </div>

      {/* Nom du podcast avec style attractif */}
      <div
        style={{
          fontSize: "22px",
          marginBottom: "12px",
          fontWeight: "800",
          color: "#FFD700",
          letterSpacing: "1.5px",
          textShadow: "0 2px 8px rgba(0, 0, 0, 0.6)",
        }}
      >
        LA BOÎTE DE CHOCOLAT
      </div>

      {/* Sous-titre plus visible */}
      <div
        style={{
          fontSize: "20px",
          color: "#4ECDC4",
          fontWeight: "600",
          letterSpacing: "1px",
          textShadow: "0 2px 6px rgba(0, 0, 0, 0.5)",
        }}
      >
        PODCAST CINÉMA
      </div>
    </div>
  );
}

export function DefaultContent({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Titre principal avec style moderne */}
      <div
        style={{
          fontSize: "48px",
          fontWeight: "900",
          marginBottom: "20px",
          textShadow: "0 4px 20px rgba(0, 0, 0, 0.8)",
          letterSpacing: "-2px",
          color: "#FFD700",
          textAlign: "center",
        }}
      >
        {title}
      </div>

      {/* Sous-titre avec style attractif */}
      <div
        style={{
          fontSize: "28px",
          marginBottom: "15px",
          fontWeight: "800",
          color: "#4ECDC4",
          letterSpacing: "2px",
          textShadow: "0 2px 8px rgba(0, 0, 0, 0.6)",
          textAlign: "center",
        }}
      >
        {subtitle}
      </div>

      {/* Description avec style moderne */}
      <div
        style={{
          fontSize: "18px",
          color: "rgba(255, 255, 255, 0.9)",
          fontWeight: "500",
          textAlign: "center",
          lineHeight: "1.4",
          maxWidth: "90%",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        {description}
      </div>

      {/* Badge "DÉCOUVREZ" */}
      <div
        style={{
          marginTop: "30px",
          background:
            "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B6B 100%)",
          color: "white",
          padding: "18px 45px",
          borderRadius: "35px",
          fontSize: "22px",
          fontWeight: "900",
          letterSpacing: "2px",
          boxShadow:
            "0 8px 25px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "3px solid rgba(255, 255, 255, 0.4)",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Effet de brillance sur le badge */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "15%",
            width: "15%",
            height: "15%",
            background: "rgba(255, 255, 255, 0.4)",
            borderRadius: "50%",
          }}
        />
        🎬 DÉCOUVREZ
      </div>
    </div>
  );
}
