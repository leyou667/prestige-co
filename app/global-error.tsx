"use client";

/** Dernier filet de sécurité si le layout lui-même échoue (styles minimaux intégrés). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#0A0A0A", color: "#fff", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <div>
          <p style={{ letterSpacing: "0.35em", fontSize: 11, color: "#C8A96A", textTransform: "uppercase" }}>PRESTIGE CONCIERGERIE</p>
          <h1 style={{ fontWeight: 300, fontSize: 28 }}>Le site rencontre un problème momentané.</h1>
          <button type="button" onClick={reset} style={{ marginTop: 16, padding: "12px 24px", borderRadius: 999, border: 0, background: "#C8A96A", color: "#0A0A0A", cursor: "pointer" }}>
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
