/**
 * GLOBAL MEMBERSHIP THEME SYSTEM — single source of truth.
 *
 * The active membership level (persisted in Profile.memberLevel) drives the
 * appearance of the ENTIRE application. Every themed component reads either
 * the CSS variables (--bv-*, written by store.tsx onto <html>) or the theme
 * object from useApp().theme. No page hardcodes membership colours.
 *
 * Titanium Elite uses the app's ORIGINAL design, refined (2026-11) to the
 * muted dusty-plum palette measured from the REAL app's Titanium surfaces
 * (membership levels card + wallet card ramp #482430 → #9A818A): the vivid
 * brick-red ends (#A04449/#A44A50) were replaced with the measured dusty
 * mauve tones. The amber Scan-Code icon stays — the real Titanium wallet
 * keeps it (wallet reference screenshot).
 *   AccountScreen header/arc + reached node #C4789A, HomeScreen greeter,
 *   WalletScreen card ramp, ProfileOverlay header + lifetime pill,
 *   badge tile #5C2740 + #C4879B, QR icon #E8A34F (per wallet reference),
 *   nav indicator retuned to the dusty-rose family (#C4879B),
 *   rosette stroke #5C2740.
 *
 * The other five themes use the colours sampled from the supplied reference
 * screenshots (scripts/sample_theme_colors.py) with the identical layout,
 * gradients direction and dark neutral chrome (#2B2928/#2E2C2B/#343130…).
 */

export const MEMBERSHIP_LEVELS = [
  "Member",
  "Silver Elite",
  "Gold Elite",
  "Platinum Elite",
  "Titanium Elite",
  "Ambassador Elite",
] as const;

export type MembershipLevel = (typeof MEMBERSHIP_LEVELS)[number];

export interface MembershipTheme {
  /** Canonical membership display name (persisted in Profile.memberLevel). */
  level: MembershipLevel;
  /** Short descriptor shown in the Admin selector (describes the theme). */
  tagline: string;
  /** Main accent (icons, focus borders, highlights). */
  accent: string;
  /** Badge/rosette tile background + foreground pair. */
  badgeBg: string;
  badgeFg: string;
  /** Bottom navigation active-tab indicator. */
  indicator: string;
  /** Selected in-page tab underline (Trips). */
  tabIndicator: string;
  /** Loader / skeleton accent. */
  loader: string;
  /** Wallet Scan Code icon colour. */
  scanIcon: string;
  /** Rosette inner stroke (cut-out look). */
  rosetteStroke: string;
  /** Translucent pill behind "Lifetime Progress" in My Profile. */
  lifetimePill: string;
  /* --- Gradients --- */
  /** Account fixed header + My Profile overlay background. */
  headerGradient: string;
  /** Home greeting bar. */
  greeterGradient: string;
  /** Wallet membership card. */
  cardGradient: string;
  /** Standard themed button (Wallet "Done"). */
  buttonGradient: string;
  /** High-emphasis CTA (admin Save / Sign In / Change Password). */
  ctaGradient: string;
  /** Trips screen decorative top surface. */
  tripsGradient: string;
  /* --- Circular night progress gauge --- */
  /** Arc gradient light end → dark end. */
  progressFrom: string;
  progressTo: string;
  /** Reached milestone node fill. */
  progressReached: string;
  /**
   * Tone for the REAL Android status bar (meta theme-color) while the Account
   * / My Profile screens are active — the average colour of the header
   * gradient's top edge, so the system bar blends into the themed header.
   * Never a fake in-app status bar: the OS bar itself is tinted.
   */
  statusColor: string;
}

/* ------------------------------------------------------------------ */
/* Titanium Elite — app's original design, refined to the real app's    */
/* muted dusty-plum palette (levels card + wallet card references)      */
/* ------------------------------------------------------------------ */
const TITANIUM: MembershipTheme = {
  level: "Titanium Elite",
  tagline: "Signature plum · refined",
  accent: "#C4879B",
  badgeBg: "#5C2740",
  badgeFg: "#C4879B",
  indicator: "#C4879B",
  tabIndicator: "#FFFFFF",
  loader: "#8F8C89",
  scanIcon: "#E8A34F",
  rosetteStroke: "#5C2740",
  lifetimePill: "rgba(38, 14, 26, 0.55)",
  headerGradient: "linear-gradient(115deg, #4C2536 0%, #6B3648 52%, #8A5263 100%)",
  greeterGradient: "linear-gradient(95deg, #5E2E42 0%, #7C4154 55%, #94596B 100%)",
  cardGradient:
    "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 42%), linear-gradient(135deg, #482430 0%, #58323E 28%, #6C434E 52%, #866670 78%, #9A818A 100%)",
  buttonGradient: "linear-gradient(95deg, #9C6078 0%, #B48C9B 100%)",
  ctaGradient: "linear-gradient(95deg, #6B3648 0%, #8A5263 100%)",
  tripsGradient: "linear-gradient(180deg, #F5D8E5 0%, #FBEDF2 78%, #F9E8EF 100%)",
  progressFrom: "#D18CA6",
  progressTo: "#A05575",
  progressReached: "#C4789A",
  statusColor: "#5C2C3E",
};

/* ------------------------------------------------------------------ */
/* The five new themes — colours from the supplied screenshots          */
/* ------------------------------------------------------------------ */

/**
 * Member — Orange. Header/banner ramps measured directly from the real
 * Marriott Bonvoy app (Member account header + greeting banner):
 * banner #A5461D → #BF5621, header #C05721 → #AA491E → #EA824C (horizontal).
 */
const MEMBER: MembershipTheme = {
  ...TITANIUM,
  level: "Member",
  tagline: "Orange",
  accent: "#F08A52",
  badgeBg: "#8F3D1A",
  badgeFg: "#F4A476",
  indicator: "#F08A52",
  tabIndicator: "#F08A52",
  loader: "#F08A52",
  scanIcon: "#E8793C",
  rosetteStroke: "#8F3D1A",
  lifetimePill: "rgba(61, 26, 10, 0.55)",
  headerGradient:
    "linear-gradient(90deg, #C05721 0%, #AA491E 30%, #B14E20 48%, #CC6735 76%, #EA824C 100%)",
  greeterGradient: "linear-gradient(90deg, #A5461D 0%, #B24E1F 50%, #BF5621 100%)",
  cardGradient:
    "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 42%), linear-gradient(135deg, #A7471F 0%, #C05720 30%, #E8793C 60%, #F48F5B 82%, #FBC49A 100%)",
  buttonGradient: "linear-gradient(95deg, #C05720 0%, #E8793C 100%)",
  ctaGradient: "linear-gradient(95deg, #A7471F 0%, #D96F33 100%)",
  tripsGradient: "linear-gradient(180deg, #F9C59B 0%, #FBE3CE 78%, #FAE0C9 100%)",
  progressFrom: "#F6B183",
  progressTo: "#C05720",
  progressReached: "#E8793C",
  statusColor: "#C25F2C",
};

/** Silver Elite — Silver / Light Blue (#8F98C1 → #5A5F73, card → #949ABC). */
const SILVER: MembershipTheme = {
  ...TITANIUM,
  level: "Silver Elite",
  tagline: "Silver · Light Blue",
  accent: "#A3ABCE",
  badgeBg: "#3E4356",
  badgeFg: "#AEB6D6",
  indicator: "#A3ABCE",
  tabIndicator: "#A3ABCE",
  loader: "#A3ABCE",
  scanIcon: "#A3ABCE",
  rosetteStroke: "#3E4356",
  lifetimePill: "rgba(23, 26, 38, 0.55)",
  headerGradient: "linear-gradient(90deg, #4A4E60 0%, #6B7190 52%, #8F98C1 100%)",
  greeterGradient: "linear-gradient(90deg, #5E637B 0%, #71758E 55%, #949ABC 100%)",
  cardGradient:
    "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 42%), linear-gradient(135deg, #4E5265 0%, #5E637B 28%, #71758E 52%, #8F98C1 78%, #C6CBDF 100%)",
  buttonGradient: "linear-gradient(95deg, #6B7190 0%, #949ABC 100%)",
  ctaGradient: "linear-gradient(95deg, #5E637B 0%, #8F98C1 100%)",
  tripsGradient: "linear-gradient(180deg, #C6CBDF 0%, #E4E7F0 78%, #E1E4EF 100%)",
  progressFrom: "#C6CBDF",
  progressTo: "#6B7190",
  progressReached: "#8F98C1",
  statusColor: "#565A71",
};

/** Gold Elite — Gold (#D2A973 → #775120, card #714B1E → #86663D → light gold). */
const GOLD: MembershipTheme = {
  ...TITANIUM,
  level: "Gold Elite",
  tagline: "Gold",
  accent: "#D9B57E",
  badgeBg: "#4F3413",
  badgeFg: "#D9B57E",
  indicator: "#D2A973",
  tabIndicator: "#D2A973",
  loader: "#D9B57E",
  scanIcon: "#D9B57E",
  rosetteStroke: "#4F3413",
  lifetimePill: "rgba(43, 28, 8, 0.55)",
  headerGradient: "linear-gradient(90deg, #5E3F18 0%, #86663D 52%, #C49E6D 100%)",
  greeterGradient: "linear-gradient(90deg, #714B1E 0%, #9A7434 55%, #D2A973 100%)",
  cardGradient:
    "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 42%), linear-gradient(135deg, #714B1E 0%, #86663D 28%, #A9834A 52%, #D2A973 78%, #F0DDBC 100%)",
  buttonGradient: "linear-gradient(95deg, #9A7434 0%, #C49E6D 100%)",
  ctaGradient: "linear-gradient(95deg, #714B1E 0%, #C49E6D 100%)",
  tripsGradient: "linear-gradient(180deg, #E8CBA0 0%, #F4E7CF 78%, #F3E4CB 100%)",
  progressFrom: "#EBCF9C",
  progressTo: "#9A7434",
  progressReached: "#C49E6D",
  statusColor: "#6C4D25",
};

/** Platinum Elite — Silver / Grey (#9D9998 → #4C4D52, card → #C9C6C3). */
const PLATINUM: MembershipTheme = {
  ...TITANIUM,
  level: "Platinum Elite",
  tagline: "Platinum · Silver Grey",
  accent: "#B5B2AF",
  badgeBg: "#2C2D31",
  badgeFg: "#B5B2AF",
  indicator: "#B5B2AF",
  tabIndicator: "#B5B2AF",
  loader: "#B5B2AF",
  scanIcon: "#B5B2AF",
  rosetteStroke: "#2C2D31",
  lifetimePill: "rgba(16, 17, 19, 0.55)",
  headerGradient: "linear-gradient(90deg, #3A3B40 0%, #55565C 52%, #8E8A89 100%)",
  greeterGradient: "linear-gradient(90deg, #47484D 0%, #606166 55%, #9D9998 100%)",
  cardGradient:
    "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 42%), linear-gradient(135deg, #3A3B40 0%, #47484D 28%, #606166 52%, #8E8A89 78%, #C9C6C3 100%)",
  buttonGradient: "linear-gradient(95deg, #55565C 0%, #8E8A89 100%)",
  ctaGradient: "linear-gradient(95deg, #3A3B40 0%, #8E8A89 100%)",
  tripsGradient: "linear-gradient(180deg, #BFBDBB 0%, #DCDAD8 78%, #D9D7D5 100%)",
  progressFrom: "#C9C6C3",
  progressTo: "#606166",
  progressReached: "#8E8A89",
  statusColor: "#43444A",
};

/** Ambassador Elite — Dark Charcoal / Silver (#202123 → #6F6E74, card → #77767C). */
const AMBASSADOR: MembershipTheme = {
  ...TITANIUM,
  level: "Ambassador Elite",
  tagline: "Dark Charcoal · Silver",
  accent: "#A2A1A7",
  badgeBg: "#131314",
  badgeFg: "#9E9DA3",
  indicator: "#A2A1A7",
  tabIndicator: "#A2A1A7",
  loader: "#A2A1A7",
  scanIcon: "#A2A1A7",
  rosetteStroke: "#131314",
  lifetimePill: "rgba(6, 6, 7, 0.60)",
  headerGradient: "linear-gradient(90deg, #1B1B1D 0%, #333236 52%, #56555B 100%)",
  greeterGradient: "linear-gradient(90deg, #222224 0%, #3F3E43 55%, #77767C 100%)",
  cardGradient:
    "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 42%), linear-gradient(135deg, #1B1B1D 0%, #222224 28%, #3F3E43 52%, #5A595F 78%, #8A8990 100%)",
  buttonGradient: "linear-gradient(95deg, #3F3E43 0%, #77767C 100%)",
  ctaGradient: "linear-gradient(95deg, #222224 0%, #6F6E74 100%)",
  tripsGradient: "linear-gradient(180deg, #55545A 0%, #77767C 78%, #737278 100%)",
  progressFrom: "#9E9DA3",
  progressTo: "#3F3E43",
  progressReached: "#6F6E74",
  statusColor: "#232326",
};

/** All six themes, in the canonical selector order. */
export const MEMBERSHIP_THEMES: readonly MembershipTheme[] = [
  MEMBER,
  SILVER,
  GOLD,
  PLATINUM,
  TITANIUM,
  AMBASSADOR,
];

const LEVEL_MAP: ReadonlyMap<string, MembershipTheme> = new Map(
  MEMBERSHIP_THEMES.map((t) => [t.level.toLowerCase(), t])
);

/** Resolve any stored/cased level string to its canonical name (null = unknown). */
export function canonicalLevel(raw: string | null | undefined): MembershipLevel | null {
  if (!raw) return null;
  const t = LEVEL_MAP.get(raw.trim().toLowerCase());
  return t ? t.level : null;
}

/**
 * Theme for a membership level string. Unknown values (and the pre-load
 * "null profile" state) fall back to Titanium Elite — the DB default.
 */
export function getTheme(level: string | null | undefined): MembershipTheme {
  const t = level ? LEVEL_MAP.get(level.trim().toLowerCase()) : undefined;
  return t ?? TITANIUM;
}

/**
 * Tone for the REAL Android status bar while the given screen is active.
 * Chrome (standalone PWA) colours the OS status bar from the meta theme-color
 * tag, so instead of drawing any fake in-app status bar we keep that meta tag
 * in sync with the top surface of the active screen + membership theme:
 * Home = hero sky tone (light, dark OS icons — like the real app), Account /
 * My Profile = themed header tone, Trips = themed light sheet tone,
 * Wallet / Book / Wishlists / sub pages / admin = their neutral chrome
 * colours (Wallet's themed membership card sits below the top edge, so its
 * system bar must match the page chrome, not the card).
 */
export function statusBarColorFor(
  tab: string,
  sub: string | null,
  theme: MembershipTheme
): string {
  if (sub) {
    if (sub === "profile") return theme.statusColor;
    if (sub === "admin-login" || sub === "admin-dashboard") return "#232120";
    return "#2E2C2B"; // wallet, personal-info, preferences, payment-methods, security, …
  }
  switch (tab) {
    case "home":
      return "#C9C9C8"; // hero-delhi.jpg sky tone behind the OS clock
    case "book":
      return "#3A3736"; // sticky search header strip
    case "trips":
      return firstGradientStop(theme.tripsGradient);
    case "wishlists":
      return "#2E2C2B";
    default:
      return theme.statusColor; // account
  }
}

/** First hex colour of one of our controlled gradient strings. */
function firstGradientStop(gradient: string): string {
  const m = /#[0-9A-Fa-f]{6}/.exec(gradient);
  return m ? m[0] : "#2B2928";
}

/** CSS variables written onto <html> whenever the active theme changes. */
export const THEME_CSS_VARS: ReadonlyArray<readonly [string, keyof MembershipTheme]> = [
  ["--bv-accent", "accent"],
  ["--bv-badge-bg", "badgeBg"],
  ["--bv-badge-fg", "badgeFg"],
  ["--bv-indicator", "indicator"],
  ["--bv-tab-indicator", "tabIndicator"],
  ["--bv-loader", "loader"],
  ["--bv-scan-icon", "scanIcon"],
  ["--bv-rosette-stroke", "rosetteStroke"],
  ["--bv-lifetime-pill", "lifetimePill"],
  ["--bv-header-gradient", "headerGradient"],
  ["--bv-greeter-gradient", "greeterGradient"],
  ["--bv-card-gradient", "cardGradient"],
  ["--bv-button-gradient", "buttonGradient"],
  ["--bv-cta-gradient", "ctaGradient"],
  ["--bv-trips-gradient", "tripsGradient"],
  ["--bv-progress-from", "progressFrom"],
  ["--bv-progress-to", "progressTo"],
  ["--bv-progress-reached", "progressReached"],
] as const;
