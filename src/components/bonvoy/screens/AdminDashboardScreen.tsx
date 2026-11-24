"use client";

import { useCallback, useEffect, useState } from "react";
import {
  UserRound,
  Gauge,
  QrCode,
  ShieldCheck,
  Settings2,
  LogOut,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Save,
  RotateCcw,
  ClipboardCheck,
  Crown,
} from "lucide-react";
import { useApp } from "@/components/bonvoy/store";
import { useToast } from "@/hooks/use-toast";
import { Pressable } from "@/components/bonvoy/motion";
import type { ProfileData } from "@/lib/bonvoy/types";
import { MEMBERSHIP_THEMES, type MembershipLevel } from "@/lib/bonvoy/theme";

type Form = Pick<
  ProfileData,
  "firstName" | "lastName" | "memberNumber" | "memberSince" | "nights" | "lifetimeNights" | "spend" | "points" | "expiryDate"
>;

const EMPTY_QR_EXAMPLE = `{
"accountId": "087584268",
"acctStat": "Active",
"dateDTM": "2026-11-22T12:57:18.692Z",
"eliteLvl": "Member",
"encryptedPayLoad": "n/a",
"expireDateTime": "2026-11-25T12:57:18.7425565Z",
"frstn": "SARBJEET",
"lstn": "RATHOUR",
"lvlTypeId": "MRD",
"refId": "t97zVeXhw3rE4Y4STV7MeiSUcqoAAAAAvwYkmblk03y9faUdi+l278kyfY4/8AGJ"
}`;

function Section({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#2E2C2B] rounded-[16px] p-5">
      <div className="flex items-center gap-3">
        <span className="w-[38px] h-[38px] rounded-[10px] bg-[var(--bv-badge-bg)] flex items-center justify-center text-[var(--bv-badge-fg)]">
          {icon}
        </span>
        <div>
          <h2 className="text-[17px] font-bold text-white">{title}</h2>
          {desc && <p className="text-[12px] text-[#A19E9B]">{desc}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8F8C89] mb-[6px]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full h-[42px] rounded-[10px] bg-[#3A3736] border border-[#4A4745] px-3 text-[15px] text-white placeholder:text-[#8F8C89] outline-none focus:border-[var(--bv-accent)]";

function Status({ ok, msg }: { ok: boolean; msg: string }) {
  return (
    <p
      className={`mt-2 text-[13px] font-medium flex items-center gap-2 ${
        ok ? "text-[#7BC47F]" : "text-[#E4793C]"
      }`}
    >
      {ok ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />} {msg}
    </p>
  );
}

function AdminDashboardInner() {
  const { profile, profileLoading, profileError, refreshProfile, exitToApp, setAdminAuthed } = useApp();
  const { toast } = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; msg: string } | null>(null);

  // Membership level selector state — chosen here, applied globally on Save.
  const activeLevel = profile?.memberLevel ?? "Titanium Elite";
  const [selLevel, setSelLevel] = useState<MembershipLevel | null>(null);
  const [levelBusy, setLevelBusy] = useState(false);
  const [levelMsg, setLevelMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const chosen: MembershipLevel = selLevel ?? (activeLevel as MembershipLevel);

  // QR state
  const [qrText, setQrText] = useState("");
  const [qrLoaded, setQrLoaded] = useState(false);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [qrMsg, setQrMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [qrBusy, setQrBusy] = useState<"validate" | "save" | "download" | null>(null);

  // Security state
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confPw, setConfPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  // Load profile into the form (once).
  useEffect(() => {
    if (profile && !form) {
      setForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        memberNumber: profile.memberNumber,
        memberSince: profile.memberSince,
        nights: profile.nights,
        lifetimeNights: profile.lifetimeNights,
        spend: profile.spend,
        points: profile.points,
        expiryDate: profile.expiryDate,
      });
    }
  }, [profile, form]);

  /** Save the selected membership level — re-themes the entire app instantly. */
  const saveLevel = async () => {
    setLevelBusy(true);
    setLevelMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberLevel: chosen }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await refreshProfile(); // theme + every membership label update without a reload
        setSelLevel(null);
        setLevelMsg({ ok: true, msg: `Membership level saved — the entire app now uses the ${chosen} theme.` });
        toast({ title: "Theme updated", description: `The whole app now uses the ${chosen} theme.` });
      } else {
        setLevelMsg({ ok: false, msg: data.error || "Save failed." });
      }
    } catch {
      setLevelMsg({ ok: false, msg: "Network error while saving the membership level." });
    } finally {
      setLevelBusy(false);
    }
  };

  // Load saved QR JSON.
  useEffect(() => {
    fetch("/api/qr", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setQrText(typeof d.data === "string" && d.data ? d.data : EMPTY_QR_EXAMPLE);
        setQrLoaded(true);
      })
      .catch(() => {
        setQrText(EMPTY_QR_EXAMPLE);
        setQrLoaded(true);
      });
  }, []);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm((f) => (f ? { ...f, [k]: k === "nights" || k === "lifetimeNights" || k === "spend" || k === "points" ? (v === "" ? 0 : parseFloat(v) || 0) : v } : f));
  };

  const saveProfile = async () => {
    if (!form) return;
    setSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await refreshProfile();
        setProfileMsg({ ok: true, msg: "Changes saved — every screen has been updated." });
        toast({ title: "Profile updated", description: "All screens now reflect the new data." });
      } else {
        setProfileMsg({ ok: false, msg: data.error || "Save failed." });
      }
    } catch {
      setProfileMsg({ ok: false, msg: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  };

  const resetProfile = () => {
    if (profile) {
      setForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        memberNumber: profile.memberNumber,
        memberSince: profile.memberSince,
        nights: profile.nights,
        lifetimeNights: profile.lifetimeNights,
        spend: profile.spend,
        points: profile.points,
        expiryDate: profile.expiryDate,
      });
      setProfileMsg({ ok: true, msg: "Form reset to the last saved values." });
    }
  };

  const validateQr = async () => {
    setQrBusy("validate");
    setQrMsg(null);
    try {
      const res = await fetch("/api/qr/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: qrText }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.png) {
        setQrPreview(data.png);
        setQrMsg({ ok: true, msg: "Valid JSON — QR preview generated (not saved yet)." });
      } else {
        setQrPreview(null);
        setQrMsg({ ok: false, msg: data.error || "Invalid JSON." });
      }
    } catch {
      setQrMsg({ ok: false, msg: "Network error during validation." });
    } finally {
      setQrBusy(null);
    }
  };

  const saveQr = async () => {
    setQrBusy("save");
    setQrMsg(null);
    try {
      const res = await fetch("/api/qr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: qrText }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setQrMsg({ ok: true, msg: "QR data saved — the Wallet Scan Code screen now shows this QR." });
        // refresh preview from the saved payload
        const img = await fetch("/api/qr/image", { cache: "no-store" }).then((r) => r.json());
        if (img.png) setQrPreview(img.png);
        toast({ title: "Wallet QR updated", description: "The Scan Code screen shows the new QR." });
      } else {
        setQrMsg({ ok: false, msg: data.error || "Save failed — check the JSON." });
      }
    } catch {
      setQrMsg({ ok: false, msg: "Network error while saving QR data." });
    } finally {
      setQrBusy(null);
    }
  };

  const downloadQr = useCallback(async () => {
    setQrBusy("download");
    try {
      let png = qrPreview;
      if (!png) {
        const img = await fetch("/api/qr/image", { cache: "no-store" }).then((r) => r.json());
        png = img.png || null;
      }
      if (!png) {
        setQrMsg({ ok: false, msg: "Nothing to download yet — save QR data first." });
        return;
      }
      const a = document.createElement("a");
      a.href = png;
      a.download = "wallet-qr.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setQrMsg({ ok: true, msg: "QR downloaded as wallet-qr.png." });
    } finally {
      setQrBusy(null);
    }
  }, [qrPreview]);

  const changePassword = async () => {
    setPwBusy(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw, confirmPassword: confPw }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPwMsg({ ok: true, msg: "Password changed successfully. The old password no longer works." });
        setCurPw("");
        setNewPw("");
        setConfPw("");
      } else {
        setPwMsg({ ok: false, msg: data.error || "Password change failed." });
      }
    } catch {
      setPwMsg({ ok: false, msg: "Network error while changing password." });
    } finally {
      setPwBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAdminAuthed(false);
    toast({ title: "Logged out", description: "The admin session has ended." });
    exitToApp();
  };

  if (profileLoading || (!form && !profileError && !profile)) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={26} className="text-[var(--bv-loader)] animate-spin" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="mx-5 rounded-[16px] bg-[#2E2C2B] p-5 text-center" role="alert">
        <AlertTriangle size={28} className="mx-auto text-[#E4793C]" />
        <p className="mt-3 text-[16px] font-semibold text-white">Profile could not load</p>
        <p className="mt-2 text-[13px] leading-relaxed text-[#A19E9B]">
          {profileError || "The account profile is not available."}
        </p>
        <Pressable
          onClick={() => void refreshProfile()}
          scale={0.96}
          className="mt-4 rounded-full px-6 py-3 text-[14px] font-semibold text-white"
          style={{ background: "var(--bv-cta-gradient)" }}
        >
          Try Again
        </Pressable>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={26} className="text-[var(--bv-loader)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pb-16 flex flex-col gap-4">
      {/* A. MEMBERSHIP LEVEL & THEME — controls the ENTIRE application theme */}
      <Section
        icon={<Crown size={20} />}
        title="A. Membership Level & Theme"
        desc="Select the active level — the whole app re-themes instantly"
      >
        <div className="grid grid-cols-2 gap-2">
          {MEMBERSHIP_THEMES.map((t) => {
            const selected = chosen === t.level;
            return (
              <Pressable
                key={t.level}
                onClick={() => setSelLevel(t.level)}
                scale={0.96}
                aria-pressed={selected}
                className={`relative rounded-[12px] border p-[10px] flex flex-col gap-[8px] text-left transition-colors ${
                  selected
                    ? "border-[var(--bv-accent)] bg-[#3A3736]"
                    : "border-[#4A4745] bg-[#33302F]"
                }`}
              >
                {/* gradient preview chip (the membership-card colours) */}
                <span
                  aria-hidden
                  className="block h-[34px] rounded-[8px] border border-black/20"
                  style={{ background: t.cardGradient }}
                />
                <span className="flex items-center justify-between gap-1">
                  <span className="text-[13px] font-bold text-white leading-tight">{t.level}</span>
                  {selected && <CheckCircle2 size={15} className="text-[var(--bv-accent)] shrink-0" />}
                </span>
                <span className="text-[10.5px] text-[#8F8C89] leading-tight">{t.tagline}</span>
              </Pressable>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Pressable
            onClick={saveLevel}
            disabled={levelBusy || chosen === activeLevel}
            scale={0.96}
            className="h-[44px] rounded-full text-[14px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "var(--bv-cta-gradient)" }}
          >
            {levelBusy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Level
          </Pressable>
          <Pressable
            onClick={() => setSelLevel(null)}
            disabled={selLevel === null}
            scale={0.96}
            className="h-[44px] rounded-full border border-[#4A4745] text-[14px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RotateCcw size={14} /> Undo Selection
          </Pressable>
        </div>
        {levelMsg && <Status ok={levelMsg.ok} msg={levelMsg.msg} />}
        <p className="mt-3 text-[12px] text-[#8F8C89] leading-relaxed">
          Saving applies the level's colours to every screen — headers, cards, buttons, badges,
          progress arc, navigation indicator — and updates the membership name everywhere.
          All six levels are always selectable; nights and points stay independently editable in
          section C.
        </p>
      </Section>

      {/* B. USER PROFILE */}
      <Section icon={<UserRound size={20} />} title="B. User Profile" desc="Name and membership identity">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name">
            <input className={inputCls} value={form.firstName} onChange={set("firstName")} />
          </Field>
          <Field label="Last Name">
            <input className={inputCls} value={form.lastName} onChange={set("lastName")} />
          </Field>
          <Field label="Membership Number">
            <input className={inputCls} value={form.memberNumber} onChange={set("memberNumber")} />
          </Field>
          <Field label="Member Since">
            <input className={inputCls} value={form.memberSince} onChange={set("memberSince")} />
          </Field>
        </div>
      </Section>

      {/* C. MEMBERSHIP MANAGEMENT */}
      <Section icon={<Gauge size={20} />} title="C. Membership Management" desc="Nights, spend, points and expiry">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Membership Nights">
            <input type="number" min={0} className={inputCls} value={form.nights} onChange={set("nights")} />
          </Field>
          <Field label="Lifetime Nights (greeting)">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.lifetimeNights}
              onChange={set("lifetimeNights")}
            />
          </Field>
          <Field label="Annual Qualifying Spend (USD)">
            <input type="number" min={0} className={inputCls} value={form.spend} onChange={set("spend")} />
          </Field>
          <Field label="Points Balance">
            <input type="number" min={0} className={inputCls} value={form.points} onChange={set("points")} />
          </Field>
          <Field label="Membership Expiry Date">
            <input className={inputCls} placeholder="Nov 22, 2028" value={form.expiryDate} onChange={set("expiryDate")} />
          </Field>
          <Field label="Member Since">
            <input className={inputCls} value={form.memberSince} onChange={set("memberSince")} />
          </Field>
        </div>
      </Section>

      {/* D. WALLET QR MANAGEMENT */}
      <Section icon={<QrCode size={20} />} title="D. Wallet QR Management" desc="Exact JSON is encoded into the QR">
        <Field label="Wallet QR JSON">
          <textarea
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            spellCheck={false}
            rows={10}
            className="w-full rounded-[10px] bg-[#3A3736] border border-[#4A4745] px-3 py-2 text-[12.5px] leading-relaxed font-mono text-white outline-none focus:border-[#C4879B] resize-y"
          />
        </Field>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Pressable
            onClick={validateQr}
            disabled={qrBusy !== null}
            scale={0.95}
            className="h-[40px] rounded-full border border-[#4A4745] text-[13px] font-semibold text-white flex items-center justify-center gap-[6px] disabled:opacity-50"
          >
            {qrBusy === "validate" ? <Loader2 size={14} className="animate-spin" /> : <ClipboardCheck size={15} />}
            Validate JSON
          </Pressable>
          <Pressable
            onClick={saveQr}
            disabled={qrBusy !== null}
            scale={0.95}
            className="h-[40px] rounded-full text-[13px] font-semibold text-white flex items-center justify-center gap-[6px] disabled:opacity-50"
            style={{ background: "var(--bv-cta-gradient)" }}
          >
            {qrBusy === "save" ? <Loader2 size={14} className="animate-spin" /> : <Save size={15} />}
            Save QR Data
          </Pressable>
          <Pressable
            onClick={downloadQr}
            disabled={qrBusy !== null}
            scale={0.95}
            className="h-[40px] rounded-full border border-[#4A4745] text-[13px] font-semibold text-white flex items-center justify-center gap-[6px] disabled:opacity-50"
          >
            {qrBusy === "download" ? <Loader2 size={14} className="animate-spin" /> : <Download size={15} />}
            Download QR
          </Pressable>
        </div>
        {qrMsg && <Status ok={qrMsg.ok} msg={qrMsg.msg} />}
        {qrPreview && (
          <div className="mt-3 flex flex-col items-center">
            <div className="bg-white p-[10px] rounded-[10px]">
              { }
              <img src={qrPreview} alt="QR preview" className="w-[190px] h-[190px] block" />
            </div>
            <p className="mt-2 text-[12px] text-[#8F8C89]">QR Preview (generated locally)</p>
          </div>
        )}
      </Section>

      {/* E. SECURITY */}
      <Section icon={<ShieldCheck size={20} />} title="E. Security" desc="Change the admin password or log out">
        <div className="flex flex-col gap-3">
          <Field label="Current Password">
            <input
              type="password"
              className={inputCls}
              value={curPw}
              onChange={(e) => setCurPw(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="New Password">
              <input
                type="password"
                className={inputCls}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
            </Field>
            <Field label="Confirm New Password">
              <input
                type="password"
                className={inputCls}
                value={confPw}
                onChange={(e) => setConfPw(e.target.value)}
              />
            </Field>
          </div>
          <Pressable
            onClick={changePassword}
            disabled={pwBusy || !curPw || !newPw || !confPw}
            scale={0.96}
            className="h-[44px] rounded-full text-[15px] font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--bv-cta-gradient)" }}
          >
            {pwBusy ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Change Password"}
          </Pressable>
          {pwMsg && <Status ok={pwMsg.ok} msg={pwMsg.msg} />}
          <Pressable
            onClick={logout}
            scale={0.96}
            className="mt-1 h-[44px] rounded-full border border-[#4A4745] text-[15px] font-semibold text-white flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Logout
          </Pressable>
        </div>
      </Section>

      {/* F. SETTINGS */}
      <Section icon={<Settings2 size={20} />} title="F. Settings" desc="All changes are saved persistently">
        <div className="grid grid-cols-2 gap-2">
          <Pressable
            onClick={saveProfile}
            disabled={saving}
            scale={0.96}
            className="h-[44px] rounded-full text-[15px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "var(--bv-cta-gradient)" }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Save Changes
          </Pressable>
          <Pressable
            onClick={resetProfile}
            scale={0.96}
            className="h-[44px] rounded-full border border-[#4A4745] text-[15px] font-semibold text-white flex items-center justify-center gap-2"
          >
            <RotateCcw size={15} /> Reset Changes
          </Pressable>
        </div>
        {profileMsg && <Status ok={profileMsg.ok} msg={profileMsg.msg} />}
        <p className="mt-3 text-[12px] text-[#8F8C89] leading-relaxed">
          Saving syncs the Home greeting, Account header, My Profile, Wallet card, membership
          dashboard and Wallet QR automatically.
        </p>
      </Section>
    </div>
  );
}

export default function AdminDashboardScreen() {
  const { adminAuthed, exitToApp } = useApp();

  return (
    <div className="absolute inset-0 z-50 bg-[#232120]">
      {adminAuthed === false ? (
        <div className="pt-24 text-center px-8">
          <ShieldCheck size={40} className="mx-auto text-[#8F8C89]" />
          <p className="mt-4 text-[17px] font-semibold text-white">Admin session expired</p>
          <p className="mt-2 text-[14px] text-[#A19E9B]">
            Sign in again from the Account screen (tap the name five times).
          </p>
          <Pressable
            onClick={exitToApp}
            scale={0.96}
            className="mt-6 bg-white text-[#1B1918] text-[15px] font-semibold rounded-full px-6 py-[11px]"
          >
            Back to App
          </Pressable>
        </div>
      ) : adminAuthed === undefined ? (
        <div className="pt-24 flex justify-center">
          <Loader2 size={26} className="text-[var(--bv-loader)] animate-spin" />
        </div>
      ) : (
        <div className="h-full overflow-y-auto no-scrollbar pt-[calc(20px+env(safe-area-inset-top,0px))]">
          <div className="px-5 pt-2 flex items-center gap-4">
            <Pressable aria-label="Exit to app" scale={0.9} onClick={exitToApp} className="text-white p-1 -ml-1">
              <ArrowLeft size={24} strokeWidth={2.1} />
            </Pressable>
            <div>
              <h1 className="text-[22px] font-bold text-white">Admin Dashboard</h1>
              <p className="text-[12px] text-[#8F8C89]">Marriott Bonvoy clone — hidden console</p>
            </div>
          </div>
          <div className="mt-6">
            <AdminDashboardInner />
          </div>
        </div>
      )}
    </div>
  );
}
