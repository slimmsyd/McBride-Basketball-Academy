"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#2979FF] flex items-center justify-center">
            <span className="font-[family-name:var(--font-headline)] text-sm font-extrabold text-white">IM</span>
          </div>
          <h1 className="font-[family-name:var(--font-headline)] text-2xl font-extrabold text-[#18181B]">
            IMB Admin
          </h1>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-[#E4E4E7]">
          <div className="flex flex-col gap-1.5">
            <label className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-[#52525B]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full h-11 px-4 bg-[#F4F4F5] rounded-lg border border-[#E4E4E7] text-sm font-[family-name:var(--font-body)] text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#2979FF] transition-colors"
            />
          </div>
          {error && (
            <p className="font-[family-name:var(--font-body)] text-sm text-[#FA541C]">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-10 rounded-lg bg-[#2979FF] text-white font-[family-name:var(--font-body)] text-sm font-bold tracking-wide hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
