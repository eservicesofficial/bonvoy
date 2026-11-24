"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { useApp } from "@/components/bonvoy/store";
import { Pressable } from "@/components/bonvoy/motion";

/**
 * Hidden Admin Login screen.
 * Initial password (first-time setup only): 741504 — stored server-side as a scrypt hash.
 */
export default function AdminLoginScreen() {
  const { back, setAdminAuthed, openSubReplace, adminAuthed } = useApp();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  // If a valid admin session already exists, skip straight to the dashboard.
  // Replace (not push) so that Back from the dashboard returns to the app
  // screen the admin section was opened from, never into a login/dashboard loop.
  useEffect(() => {
    if (adminAuthed === true) {
      openSubReplace("admin-dashboard");
      return;
    }
    if (adminAuthed === false) setChecking(false);
  }, [adminAuthed, openSubReplace]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAdminAuthed(true);
        openSubReplace("admin-dashboard");
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#232120]">
      <div className="pt-[calc(20px+env(safe-area-inset-top,0px))] px-5">
        <Pressable aria-label="Back" scale={0.9} onClick={back} className="text-white p-1 -ml-1">
          <ArrowLeft size={24} strokeWidth={2.1} />
        </Pressable>
      </div>

      <div className="mt-14 flex flex-col items-center px-8">
        <div className="w-[64px] h-[64px] rounded-[18px] bg-[var(--bv-badge-bg)] flex items-center justify-center text-[var(--bv-badge-fg)]">
          <ShieldCheck size={30} strokeWidth={1.9} />
        </div>
        <h1 className="mt-5 text-[24px] font-bold text-white">Admin Access</h1>
        <p className="mt-2 text-[14px] text-[#A19E9B] text-center leading-relaxed">
          Restricted area. Enter the admin password to manage the member profile, membership and
          wallet QR.
        </p>

        <div className="mt-8 w-full max-w-[340px] flex flex-col gap-3">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Admin password"
            className="w-full h-[48px] rounded-[12px] bg-[#3A3736] border border-[#4A4745] px-4 text-[16px] text-white placeholder:text-[#8F8C89] outline-none focus:border-[var(--bv-accent)]"
          />
          {error && <p className="text-[13px] text-[#E4793C] font-medium">{error}</p>}
          <Pressable
            onClick={submit}
            disabled={busy || !password}
            scale={0.96}
            className="h-[48px] rounded-full text-[16px] font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--bv-cta-gradient)" }}
          >
            {busy ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Sign In"}
          </Pressable>
        </div>

        {checking && (
          <p className="mt-6 text-[13px] text-[#8F8C89] flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Checking existing session…
          </p>
        )}
      </div>
    </div>
  );
}
