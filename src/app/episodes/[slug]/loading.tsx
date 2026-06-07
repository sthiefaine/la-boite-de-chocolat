const shimmer: React.CSSProperties = {
  borderRadius: "var(--radius-md, 0.5rem)",
  background:
    "linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06))",
  backgroundSize: "200% 100%",
  animation: "shimmer 2s infinite",
};

export default function Loading() {
  return (
    <div
      style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem", minHeight: "100vh" }}
      aria-busy="true"
      aria-label="Chargement de l'épisode"
    >
      {/* Breadcrumbs placeholder */}
      <div style={{ ...shimmer, height: 16, width: "45%", maxWidth: 360, marginBottom: "2rem" }} />

      {/* Header: poster + text */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          marginBottom: "2.5rem",
        }}
      >
        <div
          style={{ ...shimmer, width: 280, aspectRatio: "2 / 3", flexShrink: 0, maxWidth: "100%" }}
        />
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ ...shimmer, height: 36, width: "85%" }} />
          <div style={{ ...shimmer, height: 20, width: "50%", marginTop: "1rem" }} />
          <div style={{ ...shimmer, height: 48, width: 200, marginTop: "1.5rem", borderRadius: "999px" }} />
          <div style={{ ...shimmer, height: 14, width: "100%", marginTop: "1.75rem" }} />
          <div style={{ ...shimmer, height: 14, width: "95%", marginTop: "0.6rem" }} />
          <div style={{ ...shimmer, height: 14, width: "70%", marginTop: "0.6rem" }} />
        </div>
      </div>

      {/* Navigation placeholder */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem" }}>
        <div style={{ ...shimmer, height: 56, flex: 1 }} />
        <div style={{ ...shimmer, height: 56, flex: 1 }} />
      </div>

      {/* Recommendations grid placeholder */}
      <div style={{ ...shimmer, height: 24, width: "40%", maxWidth: 300, marginBottom: "1rem" }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div style={{ ...shimmer, aspectRatio: "2 / 3", width: "100%" }} />
            <div style={{ ...shimmer, height: 14, width: "80%", marginTop: "0.6rem" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
