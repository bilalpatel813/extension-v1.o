"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { PasswordField } from "@/components/PasswordField";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);
    await updateProfile({ fullName, email });
    setProfileSaving(false);
    setProfileMessage("Profile updated.");
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    if (!user) return;

    setPasswordSaving(true);
    try {
      await api.changePassword(user.id, { currentPassword, newPassword });
      setPasswordMessage("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-[32px] font-semibold mb-1">Profile</h1>
        <p className="text-[13px] text-ink-dim mb-10">Manage your account details.</p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-2xl border border-line-soft bg-bg-card p-6 mb-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-accent-dim text-accent flex items-center justify-center text-[20px] font-display font-semibold flex-shrink-0">
            {user?.fullName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <div className="text-[15px] font-medium">{user?.fullName}</div>
            <div className="text-[12px] text-ink-faint">{user?.email}</div>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="fullName" className="block text-[10.5px] tracking-[0.6px] uppercase text-ink-faint mb-2">
              Full name
            </label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-[10px] border border-line-soft bg-bg px-4 py-3 text-[13px] text-ink focus:border-accent transition-colors outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-[10.5px] tracking-[0.6px] uppercase text-ink-faint mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[10px] border border-line-soft bg-bg px-4 py-3 text-[13px] text-ink focus:border-accent transition-colors outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2.5 rounded-full bg-accent text-[#100a06] text-[12.5px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {profileSaving ? "Saving…" : "Save changes"}
            </button>
            {profileMessage && <span className="text-[12px] text-ok">{profileMessage}</span>}
          </div>
        </form>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-line-soft bg-bg-card p-6"
      >
        <h2 className="font-display text-[19px] font-semibold mb-5">Change password</h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
          <PasswordField
            id="currentPassword"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
          <PasswordField
            id="newPassword"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
          />
          <PasswordField
            id="confirmNewPassword"
            label="Re-enter new password"
            value={confirmNewPassword}
            onChange={setConfirmNewPassword}
            autoComplete="new-password"
          />

          {passwordError && <p className="text-[12px] text-rejected">{passwordError}</p>}
          {passwordMessage && <p className="text-[12px] text-ok">{passwordMessage}</p>}

          <div>
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-5 py-2.5 rounded-full border border-line-soft text-[12.5px] hover:border-line transition-colors disabled:opacity-50"
            >
              {passwordSaving ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </motion.section>
    </div>
  );
}
