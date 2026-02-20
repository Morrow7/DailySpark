'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace("/home"), 800);
    return () => clearTimeout(t);
  }, [router]);
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100dvh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 72 }}>🐰</div>
        <div style={{ marginTop: 8, color: "#9ca3af" }}>DailySpark</div>
      </div>
    </div>
  );
}
