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
      className="min-h-screen bg-gradient-to-br from-[var(--chocolate-cream)] to-white pb-24 pt-[60px]"
      aria-busy="true"
      aria-label="Chargement des épisodes"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ ...shimmer, height: 36, width: "60%", maxWidth: 420 }} />
          <div
            style={{ ...shimmer, height: 18, width: "40%", maxWidth: 280, marginTop: "0.75rem" }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div style={{ ...shimmer, aspectRatio: "16 / 9", width: "100%" }} />
              <div style={{ ...shimmer, height: 18, width: "85%", marginTop: "0.75rem" }} />
              <div style={{ ...shimmer, height: 14, width: "60%", marginTop: "0.5rem" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
