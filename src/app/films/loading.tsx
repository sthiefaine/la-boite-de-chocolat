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
      aria-label="Chargement des films"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ ...shimmer, height: 32, width: "50%", maxWidth: 320 }} />
          <div
            style={{ ...shimmer, height: 16, width: "35%", maxWidth: 240, marginTop: "0.75rem" }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div style={{ ...shimmer, aspectRatio: "2 / 3", width: "100%" }} />
              <div style={{ ...shimmer, height: 16, width: "80%", marginTop: "0.6rem" }} />
              <div style={{ ...shimmer, height: 12, width: "50%", marginTop: "0.4rem" }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
