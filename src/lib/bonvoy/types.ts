export interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  memberNumber: string;
  memberLevel: string;
  nights: number; // "Nights This Year" — drives the dashboard arc gauge
  lifetimeNights: number; // greeting bar "N Nights • Pts" + Lifetime Progress row
  spend: number; // Annual Qualifying Spend (USD)
  points: number; // Points Balance
  expiryDate: string; // e.g. "Nov 22, 2028"
  memberSince: string; // e.g. "2026"
  updatedAt: string;
}

export type Tab = "home" | "book" | "trips" | "wishlists" | "account";

export type Sub =
  | null
  | "profile"
  | "personal-info"
  | "preferences"
  | "payment-methods"
  | "security-page"
  | "member-support"
  | "privacy"
  | "wallet"
  | "admin-login"
  | "admin-dashboard";

export const fmtInt = (n: number) => n.toLocaleString("en-US");

export const fullName = (p: ProfileData | null) =>
  p ? `${p.firstName} ${p.lastName}`.trim() : "";

export const firstNameOnly = (p: ProfileData | null) => (p ? p.firstName : "");

/** "Titanium Elite" -> "Titanium" (card tier line). */
export const levelTier = (level: string) => level.replace(/\s*Elite$/i, "").trim() || level;

export const fmtSpend = (n: number) => `$${Math.round(n).toLocaleString("en-US")} USD`;
