const shimmer: React.CSSProperties = {
  borderRadius: "var(--radius-md, 0.5rem)",
  background:
    "linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06))",
  backgroundSize: "200% 100%",
  animation: "shimmer 2s infinite",
};

export default function Loading() {
  return (
    <main
      style={{ minHeight: "100vh", background: "var(--bg-primary)" }}
      aria-busy="true"
      aria-label="Chargement des personnes"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ ...shimmer, height: 32, width: "40%", maxWidth: 260 }} />
          <div
            style={{ ...shimmer, height: 16, width: "30%", maxWidth: 220, marginTop: "0.75rem" }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem" }}
            >
              <div style={{ ...shimmer, width: 72, height: 72, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...shimmer, height: 16, width: "80%" }} />
                <div style={{ ...shimmer, height: 12, width: "55%", marginTop: "0.5rem" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
