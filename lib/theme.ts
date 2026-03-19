export const theme = {
  colors: {
    // ── Primary brand color (buttons, links, highlights)
    primary:        "#5e1515",   // deep civic blue
    primaryHover:   "#5e1515",
    primaryLight:   "#EBF1FB",

    // ── Accent (badges, tags, active states)
    accent:         "#7B1C1C",   // durham green
    accentLight:    "#E6F6EF",

    // ── Backgrounds
    bgBase:         "#F7F8FA",   // page background
    bgCard:         "#FFFFFF",   // card/panel background
    bgMuted:        "#F0F2F5",   // subtle section bg

    // ── Text
    textPrimary:    "#111827",
    textSecondary:  "#4B5563",
    textMuted:      "#9CA3AF",
    textInverse:    "#FFFFFF",

    // ── Borders
    border:         "#E5E7EB",
    borderFocus:    "#5e1515",

    // ── Status colors
    statusPending:  "#F59E0B",
    statusReview:   "#3B82F6",
    statusResolved: "#10B981",
    statusDanger:   "#EF4444",

    // ── Nav
    navBg:          "#FFFFFF",
    navText:        "#111827",
    navBorder:      "#E5E7EB",

    // ── Admin (darker palette)
    adminBg:        "#0F172A",
    adminCard:      "#1E293B",
    adminBorder:    "#334155",
    adminText:      "#F1F5F9",
    adminMuted:     "#94A3B8",
  },

  fonts: {
    // ── Swap these two lines to change typography globally
    heading: "'Playfair Display', Georgia, serif",
    body:    "'DM Sans', system-ui, sans-serif",
    mono:    "'JetBrains Mono', monospace",
  },

  radii: {
    sm:   "6px",
    md:   "12px",
    lg:   "18px",
    xl:   "24px",
    full: "9999px",
  },

  shadows: {
    card:  "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
    modal: "0 8px 40px rgba(0,0,0,0.16)",
  },
} as const;

// ── CSS variable string — paste into globals.css :root {}
// If you change colors above, regenerate this block.
export const cssVariables = `
  --color-primary:        ${theme.colors.primary};
  --color-primary-hover:  ${theme.colors.primaryHover};
  --color-primary-light:  ${theme.colors.primaryLight};
  --color-accent:         ${theme.colors.accent};
  --color-accent-light:   ${theme.colors.accentLight};
  --color-bg-base:        ${theme.colors.bgBase};
  --color-bg-card:        ${theme.colors.bgCard};
  --color-bg-muted:       ${theme.colors.bgMuted};
  --color-text-primary:   ${theme.colors.textPrimary};
  --color-text-secondary: ${theme.colors.textSecondary};
  --color-text-muted:     ${theme.colors.textMuted};
  --color-text-inverse:   ${theme.colors.textInverse};
  --color-border:         ${theme.colors.border};
  --color-border-focus:   ${theme.colors.borderFocus};
  --color-nav-bg:         ${theme.colors.navBg};
  --color-nav-text:       ${theme.colors.navText};
  --font-heading:         ${theme.fonts.heading};
  --font-body:            ${theme.fonts.body};
`;