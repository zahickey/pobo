// Scaffold page — proves fonts, tokens and the App Router are wired up.
// Replace with real marketing / discovery content. The public event share page
// (roadmap Step 5) lives at src/app/e/[id]/page.tsx.
export default function Home() {
  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-md)",
        minHeight: "100dvh",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--size-headline)",
          color: "var(--primary)",
        }}
      >
        PoBo
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "var(--size-body)" }}>
        Your city&rsquo;s poster board.
      </p>
      <span
        style={{
          marginTop: "var(--space-xl)",
          background: "var(--live)",
          color: "var(--on-live)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--size-label)",
          fontWeight: 600,
          letterSpacing: "0.05em",
          padding: "var(--space-sm) var(--space-lg)",
          borderRadius: "var(--radius-pill)",
        }}
      >
        LIVE NOW
      </span>
    </main>
  );
}
