// ─────────────────────────────────────────────────────────────────
//  Design Tokens — shared across all screens
// ─────────────────────────────────────────────────────────────────
export const colors = {
  bg:          "#0a0e1a",
  bgCard:      "#111827",
  bgInput:     "#1a1f2e",
  bgCardHover: "#1e2438",

  brand:       "#6c63ff",
  brandLight:  "#8b83ff",
  brandGlow:   "rgba(108,99,255,0.35)",

  accent2:     "#ff6584",

  textPrimary:   "#f0f0f8",
  textSecondary: "#9da3b4",
  textMuted:     "#5c6278",

  border:      "rgba(255,255,255,0.08)",
  borderFocus: "rgba(108,99,255,0.6)",

  success:     "#22c55e",
  warning:     "#f59e0b",
  danger:      "#ef4444",
  info:        "#38bdf8",
};

export const radius = { sm: 10, md: 16, lg: 20, xl: 28 };

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: "#6c63ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
};
