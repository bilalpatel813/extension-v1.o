"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AuthCard } from "@/components/AuthCard";
import { PasswordField } from "@/components/PasswordField";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ fullName, email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Track every application in one place, for free."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="fullName" className="block text-[10.5px] tracking-[0.6px] uppercase text-ink-faint mb-2">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jordan Rivera"
            className="w-full rounded-[10px] border border-line-soft bg-bg px-4 py-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent transition-colors outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-[10.5px] tracking-[0.6px] uppercase text-ink-faint mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-[10px] border border-line-soft bg-bg px-4 py-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent transition-colors outline-none"
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />

        <PasswordField
          id="confirmPassword"
          label="Re-enter password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] text-rejected"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 w-full py-3 rounded-full bg-accent text-[#100a06] text-[13px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <p className="text-[11px] text-ink-faint text-center leading-relaxed">
          By continuing you agree to our{" "}
          <Link href="/privacy-policy" className="text-ink-dim hover:text-accent underline">
            privacy policy
          </Link>
          .
        </p>
      </form>
    </AuthCard>
  );
}
