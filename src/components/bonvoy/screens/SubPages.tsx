"use client";

import { useState } from "react";
import { ArrowLeft, CreditCard, Phone, Mail, HelpCircle, FileText, Trash2, Fingerprint, KeyRound, ShieldCheck, Gift } from "lucide-react";
import { useApp } from "@/components/bonvoy/store";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Pressable } from "@/components/bonvoy/motion";

function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { back } = useApp();
  return (
    <div className="absolute inset-0 z-30 bg-[#2E2C2B]">
      <div className="h-full overflow-y-auto no-scrollbar pt-[calc(20px+env(safe-area-inset-top,0px))] pb-[60px]">
        <div className="px-5 pt-2 flex items-center gap-4">
          <Pressable aria-label="Back" scale={0.9} onClick={back} className="text-white p-1 -ml-1">
            <ArrowLeft size={24} strokeWidth={2.1} />
          </Pressable>
          <h1 className="text-[22px] font-bold text-white">{title}</h1>
        </div>
        <div className="px-5 mt-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#3A3736] rounded-[12px] px-4 py-3">
      <p className="text-[12px] text-[#A19E9B]">{label}</p>
      <p className="text-[16px] font-semibold text-white mt-[2px]">{value}</p>
    </div>
  );
}

function RowButton({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <Pressable
      onClick={onClick}
      scale={0.98}
      className="w-full bg-[#3A3736] rounded-[12px] px-4 py-[14px] flex items-center gap-4 text-left"
    >
      <span className="text-white">{icon}</span>
      <span className="flex-1">
        <span className="block text-[16px] font-semibold text-white">{label}</span>
        {sub && <span className="block text-[13px] text-[#A19E9B] mt-[2px]">{sub}</span>}
      </span>
    </Pressable>
  );
}

export function PersonalInfoScreen() {
  const { profile } = useApp();
  return (
    <Shell title="Personal Information">
      <div className="flex flex-col gap-3">
        <Field label="First Name" value={profile?.firstName ?? ""} />
        <Field label="Last Name" value={profile?.lastName ?? ""} />
        <Field label="Membership Number" value={`#${profile?.memberNumber ?? ""}`} />
        <Field label="Membership Level" value={profile?.memberLevel ?? ""} />
        <Field label="Member Since" value={profile?.memberSince ?? ""} />
        <Field label="Membership Expiry" value={profile?.expiryDate ?? ""} />
        <p className="text-[13px] text-[#8F8C89] leading-relaxed mt-2">
          This information is managed from the central profile and updates everywhere in the app
          automatically.
        </p>
      </div>
    </Shell>
  );
}

export function PreferencesScreen() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState({ email: true, sms: false, push: true });
  const items: { key: keyof typeof prefs; label: string; sub: string }[] = [
    { key: "email", label: "Email Notifications", sub: "Offers, promotions and account updates" },
    { key: "sms", label: "SMS Alerts", sub: "Stay reminders and check-in messages" },
    { key: "push", label: "Push Notifications", sub: "Points activity and trip alerts" },
  ];
  return (
    <Shell title="Preferences">
      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <div
            key={it.key}
            className="bg-[#3A3736] rounded-[12px] px-4 py-[14px] flex items-center gap-4"
          >
            <span className="flex-1">
              <span className="block text-[16px] font-semibold text-white">{it.label}</span>
              <span className="block text-[13px] text-[#A19E9B] mt-[2px]">{it.sub}</span>
            </span>
            <Switch
              checked={prefs[it.key]}
              onCheckedChange={(v) => {
                setPrefs((p) => ({ ...p, [it.key]: v }));
                toast({ title: it.label, description: v ? "Enabled" : "Disabled" });
              }}
            />
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function PaymentMethodsScreen() {
  const { toast } = useToast();
  return (
    <Shell title="Payment Methods">
      <div className="mt-16 text-center">
        <CreditCard size={44} className="mx-auto text-[#8F8C89]" strokeWidth={1.6} />
        <p className="mt-4 text-[17px] font-semibold text-white">0 Saved Cards</p>
        <p className="mt-1 text-[14px] text-[#A19E9B]">
          Save a card to speed up checkout at participating hotels.
        </p>
        <Pressable
          onClick={() => toast({ title: "Add Payment Method", description: "Card entry is disabled in this demo." })}
          scale={0.96}
          className="mt-6 bg-white text-[#1B1918] text-[15px] font-semibold rounded-full px-6 py-[11px]"
        >
          Add Payment Method
        </Pressable>
      </div>
    </Shell>
  );
}

export function SecurityScreen() {
  const { toast } = useToast();
  return (
    <Shell title="Security">
      <div className="flex flex-col gap-3">
        <RowButton
          icon={<Fingerprint size={22} strokeWidth={1.9} />}
          label="Biometric Sign-In"
          sub="Use Face ID or fingerprint to unlock the app"
          onClick={() => toast({ title: "Biometric Sign-In", description: "Not available on this device (demo)." })}
        />
        <RowButton
          icon={<KeyRound size={22} strokeWidth={1.9} />}
          label="Change PIN"
          sub="Update the 4-digit PIN for quick access"
          onClick={() => toast({ title: "Change PIN", description: "PIN management is disabled in this demo." })}
        />
        <RowButton
          icon={<ShieldCheck size={22} strokeWidth={1.9} />}
          label="Two-Factor Authentication"
          sub="Add an extra layer of protection"
          onClick={() => toast({ title: "Two-Factor Authentication", description: "2FA setup is disabled in this demo." })}
        />
      </div>
    </Shell>
  );
}

export function MemberSupportScreen() {
  const { toast } = useToast();
  return (
    <Shell title="Member Support">
      <div className="flex flex-col gap-3">
        <RowButton
          icon={<Phone size={22} strokeWidth={1.9} />}
          label="Call Member Support"
          sub="Available 24/7 for members worldwide"
          onClick={() => toast({ title: "Member Support", description: "Dialing is disabled in this demo." })}
        />
        <RowButton
          icon={<Mail size={22} strokeWidth={1.9} />}
          label="Email Us"
          sub="We usually reply within one business day"
          onClick={() => toast({ title: "Email Us", description: "Email composer is disabled in this demo." })}
        />
        <RowButton
          icon={<HelpCircle size={22} strokeWidth={1.9} />}
          label="Frequently Asked Questions"
          sub="Points, stays, benefits and more"
          onClick={() => toast({ title: "FAQs", description: "Opening FAQs is disabled in this demo." })}
        />
      </div>
    </Shell>
  );
}

export function PrivacyScreen() {
  const { toast } = useToast();
  return (
    <Shell title="Privacy & Account Management">
      <div className="flex flex-col gap-3">
        <RowButton
          icon={<FileText size={22} strokeWidth={1.9} />}
          label="Privacy Policy"
          sub="How your data is collected and used"
          onClick={() => toast({ title: "Privacy Policy", description: "Document viewer is disabled in this demo." })}
        />
        <RowButton
          icon={<FileText size={22} strokeWidth={1.9} />}
          label="Terms & Conditions"
          sub="Membership program terms"
          onClick={() => toast({ title: "Terms & Conditions", description: "Document viewer is disabled in this demo." })}
        />
        <RowButton
          icon={<Gift size={22} strokeWidth={1.9} />}
          label="Download Account Data"
          sub="Receive a copy of your information"
          onClick={() => toast({ title: "Download Data", description: "Export is disabled in this demo." })}
        />
        <RowButton
          icon={<Trash2 size={22} strokeWidth={1.9} />}
          label="Close Account"
          sub="Permanently close this membership"
          onClick={() => toast({ title: "Close Account", description: "Account closure is disabled in this demo." })}
        />
      </div>
    </Shell>
  );
}
