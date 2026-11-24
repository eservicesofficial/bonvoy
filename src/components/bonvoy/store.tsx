"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ProfileData, Sub, Tab } from "@/lib/bonvoy/types";
import { getTheme, statusBarColorFor, THEME_CSS_VARS, type MembershipTheme } from "@/lib/bonvoy/theme";

/**
 * Navigation architecture (browser-history integrated):
 *
 * Every screen change (tab switch, sub-page open, scan sheet) pushes a history
 * entry that fully describes the screen. `popstate` (Android back button, back
 * gesture, browser back) restores that state — so Back always lands on the
 * immediately previous screen, and the app only "exits" when the user presses
 * Back while already on the Home base entry (no in-app history left).
 *
 * Each entry stores its stack depth so we always know how many screens deep
 * we are, even across page reloads.
 */
interface NavPayload {
  tab: Tab;
  sub: Sub;
  scan: boolean;
  depth: number;
}

const HOME_PAYLOAD: Omit<NavPayload, "depth"> = { tab: "home", sub: null, scan: false };

const isAdminSub = (s: Sub) => s === "admin-login" || s === "admin-dashboard";

/** Navigation direction for screen transitions: push = forward, pop = back. */
export type NavDir = "forward" | "back" | "none";

interface AppCtx {
  profile: ProfileData | null;
  profileLoading: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
  /** Active global membership theme — derived from profile.memberLevel. */
  theme: MembershipTheme;
  tab: Tab;
  sub: Sub;
  switchTab: (t: Tab) => void;
  openSub: (s: Sub) => void;
  /** Replace the current history entry instead of pushing (admin login → dashboard). */
  openSubReplace: (s: Sub) => void;
  /** Go back one entry (UI back buttons, Android back, browser back all converge here). */
  back: () => void;
  /** Leave the admin section and land back on the app screen it was opened from. */
  exitToApp: () => void;
  adminAuthed: boolean | undefined; // undefined = unknown yet
  setAdminAuthed: (b: boolean) => void;
  scanOpen: boolean;
  setScanOpen: (b: boolean) => void;
  navVisible: boolean;
  /** Direction of the most recent navigation (drives transition animations). */
  navDir: NavDir;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>(HOME_PAYLOAD.tab);
  const [sub, setSub] = useState<Sub>(HOME_PAYLOAD.sub);
  const [scanOpen, setScanOpenState] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState<boolean | undefined>(undefined);
  const [navDir, setNavDir] = useState<NavDir>("none");

  // Mirror of the currently applied navigation payload + stack depth.
  const stateRef = useRef<Omit<NavPayload, "depth">>({ ...HOME_PAYLOAD });
  const depthRef = useRef(0);
  // Depth of the app screen the admin section was entered from, so "exit to app"
  // can unwind exactly that many entries (falls back to full unwind when unknown).
  const adminBaseDepthRef = useRef<number | null>(null);

  const applyNav = useCallback((next: Omit<NavPayload, "depth">) => {
    stateRef.current = next;
    setTab(next.tab);
    setSub(next.sub);
    setScanOpenState(next.scan);
  }, []);

  const pushNav = useCallback(
    (next: Omit<NavPayload, "depth">) => {
      const cur = stateRef.current;
      if (isAdminSub(next.sub) && !isAdminSub(cur.sub)) {
        adminBaseDepthRef.current = depthRef.current;
      }
      depthRef.current += 1;
      window.history.pushState({ bv: { ...next, depth: depthRef.current } } satisfies HistoryState, "");
      setNavDir("forward");
      applyNav(next);
    },
    [applyNav]
  );

  const replaceNav = useCallback(
    (next: Omit<NavPayload, "depth">) => {
      const cur = stateRef.current;
      if (isAdminSub(next.sub) && !isAdminSub(cur.sub) && adminBaseDepthRef.current === null) {
        adminBaseDepthRef.current = Math.max(0, depthRef.current - 1);
      }
      window.history.replaceState({ bv: { ...next, depth: depthRef.current } } satisfies HistoryState, "");
      setNavDir("forward"); // admin login → dashboard feels like a forward step
      applyNav(next);
    },
    [applyNav]
  );

  const refreshProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetch("/api/profile", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Could not load account details."
        );
      }
      if (!data || typeof data !== "object" || typeof data.id !== "string") {
        throw new Error("The server returned empty account details.");
      }
      setProfile(data as ProfileData);
      setProfileError(null);
    } catch (error) {
      setProfile(null);
      setProfileError(error instanceof Error ? error.message : "Could not load account details.");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  /**
   * GLOBAL THEME ENGINE — the active membership level drives the whole app.
   * Whenever the level changes (admin save → refreshProfile → new profile),
   * the matching theme's colours are written onto <html> as CSS variables;
   * every themed component updates instantly, no reload required.
   */
  const theme = useMemo(() => getTheme(profile?.memberLevel), [profile?.memberLevel]);

  useEffect(() => {
    const root = document.documentElement;
    for (const [cssVar, key] of THEME_CSS_VARS) {
      root.style.setProperty(cssVar, String(theme[key]));
    }
  }, [theme]);

  /**
   * REAL STATUS BAR SYNC (no fake in-app status bar): Chrome colours the OS
   * status bar from <meta name="theme-color">. Keep it matched to the top
   * surface of the active screen + membership theme so the system bar blends
   * into the app exactly like the native Marriott Bonvoy app (hero sky on
   * Home, themed header gradient on Account, light sheet on Trips, …).
   * The same tone is mirrored into --bv-bar-tone so gradient surfaces can
   * fade their top edge into the flat system bar (globals.css .bv-barfade).
   */
  useEffect(() => {
    const color = statusBarColorFor(tab, sub, theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", color);
    document.documentElement.style.setProperty("--bv-bar-tone", color);
  }, [tab, sub, theme]);

  /**
   * Edge-to-edge detection. Older Chrome paints the OS status bar as a flat
   * strip above the page (safe-area-inset-top = 0); newer Chrome draws the
   * page BEHIND the transparent system bar (inset > 0). In that mode the
   * themed gradients show through the real bar by themselves, so the fade
   * must be disabled and fixed headers simply pad by the inset — both are
   * driven by the html.bv-e2e class. Zero visual impact today; automatic
   * native-like edge-to-edge as soon as the device's Chrome enables it.
   */
  useEffect(() => {
    const probe = document.createElement("div");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none;";
    document.body.appendChild(probe);
    const root = document.documentElement;
    const measure = () => {
      const inset = parseFloat(getComputedStyle(probe).height) || 0;
      root.classList.toggle("bv-e2e", inset > 4);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      probe.remove();
    };
  }, []);

  // Boot: adopt the existing history entry if this is a reload of a deep screen,
  // otherwise stamp the base entry. Then listen for back/forward.
  useEffect(() => {
    const adopt = () => {
      const existing = (window.history.state as HistoryState | null)?.bv;
      const directAdminEntry =
        window.location.pathname === "/admin" ||
        new URLSearchParams(window.location.search).get("admin") === "1";
      if (directAdminEntry) {
        depthRef.current = 0;
        adminBaseDepthRef.current = 0;
        setNavDir("none");
        applyNav({ tab: "account", sub: "admin-login", scan: false });
        window.history.replaceState(
          { bv: { tab: "account", sub: "admin-login", scan: false, depth: 0 } } satisfies HistoryState,
          ""
        );
      } else if (existing && typeof existing.depth === "number" && existing.tab) {
        depthRef.current = existing.depth;
        setNavDir("none"); // reload of a deep screen: no direction
        applyNav({ tab: existing.tab, sub: existing.sub ?? null, scan: !!existing.scan });
      } else {
        depthRef.current = 0;
        applyNav({ ...HOME_PAYLOAD });
        window.history.replaceState({ bv: { ...HOME_PAYLOAD, depth: 0 } } satisfies HistoryState, "");
      }
    };
    // Defer to a macrotask so the effect stays free of synchronous setState calls.
    const id = setTimeout(adopt, 0);

    const onPop = (e: PopStateEvent) => {
      const prevDepth = depthRef.current;
      const st = (e.state as HistoryState | null)?.bv;
      if (st && typeof st.depth === "number" && st.tab) {
        depthRef.current = st.depth;
        setNavDir(st.depth < prevDepth ? "back" : "forward");
        applyNav({ tab: st.tab, sub: st.sub ?? null, scan: !!st.scan });
      } else {
        // Entry outside our app (or state lost): show Home at base depth.
        depthRef.current = 0;
        setNavDir("back");
        applyNav({ ...HOME_PAYLOAD });
      }
    };
    window.addEventListener("popstate", onPop);
    return () => {
      clearTimeout(id);
      window.removeEventListener("popstate", onPop);
    };
  }, [applyNav]);

  useEffect(() => {
    // Defer to a macrotask so effects stay free of synchronous setState calls.
    const id = setTimeout(() => {
      refreshProfile();
      fetch("/api/admin/session", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setAdminAuthed(!!d.authenticated))
        .catch(() => setAdminAuthed(false));
    }, 0);
    return () => clearTimeout(id);
  }, [refreshProfile]);

  const switchTab = useCallback(
    (t: Tab) => {
      const cur = stateRef.current;
      // Tapping the already-active tab (with nothing open) is a no-op.
      if (t === cur.tab && cur.sub === null && !cur.scan) return;
      pushNav({ tab: t, sub: null, scan: false });
    },
    [pushNav]
  );

  const openSub = useCallback(
    (s: Sub) => {
      const cur = stateRef.current;
      if (cur.sub === s && !cur.scan) return; // already on this screen
      pushNav({ tab: cur.tab, sub: s, scan: false });
    },
    [pushNav]
  );

  const openSubReplace = useCallback(
    (s: Sub) => {
      replaceNav({ tab: stateRef.current.tab, sub: s, scan: false });
    },
    [replaceNav]
  );

  const back = useCallback(() => {
    if (depthRef.current > 0) {
      window.history.back(); // popstate handler applies the previous screen
    } else {
      // No in-app history left: safely close any stray overlay instead of leaving the app.
      applyNav({ tab: stateRef.current.tab, sub: null, scan: false });
    }
  }, [applyNav]);

  /** Scan sheet participates in the stack: opening pushes, closing goes back. */
  const setScanOpen = useCallback(
    (b: boolean) => {
      const cur = stateRef.current;
      if (b && !cur.scan) {
        pushNav({ tab: cur.tab, sub: cur.sub, scan: true });
      } else if (!b && cur.scan) {
        back();
      }
    },
    [pushNav, back]
  );

  /** Leave any admin screen and land on the app screen the admin section was opened from. */
  const exitToApp = useCallback(() => {
    const base = adminBaseDepthRef.current;
    const delta = base === null ? depthRef.current : depthRef.current - base;
    if (delta > 0) {
      window.history.go(-delta); // single popstate applies the underlying app screen
    } else if (stateRef.current.sub !== null || stateRef.current.scan) {
      pushNav({ tab: stateRef.current.tab, sub: null, scan: false });
    }
  }, [pushNav]);

  const navVisible = sub === null || sub === "profile";

  const value = useMemo(
    () => ({
      profile,
      profileLoading,
      profileError,
      refreshProfile,
      theme,
      tab,
      sub,
      switchTab,
      openSub,
      openSubReplace,
      back,
      exitToApp,
      adminAuthed,
      setAdminAuthed,
      scanOpen,
      setScanOpen,
      navVisible,
      navDir,
    }),
    [profile, profileLoading, profileError, refreshProfile, theme, tab, sub, switchTab, openSub, openSubReplace, back, exitToApp, adminAuthed, scanOpen, setScanOpen, navVisible, navDir]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

/** Shape we store inside every history entry. */
interface HistoryState {
  bv: NavPayload;
}
