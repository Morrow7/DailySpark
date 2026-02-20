'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/clientAuth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "登录失败");
      setToken(data.token);
      router.replace("/home");
    } catch (e: any) {
      setError(e.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "80px auto 0", padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>登录</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <input
          placeholder="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />
        {error && <div style={{ color: "#d00" }}>{error}</div>}
        <button
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "#ff7aa2",
            color: "#fff",
            border: "none",
          }}
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
    </div>
  );
}

