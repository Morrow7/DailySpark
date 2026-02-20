'use client'
import Link from "next/link";
import RabbitBackground from "@/components/RabbitBackground";

export default function HomePage() {
  return (
    <RabbitBackground>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26, marginBottom: 12 }}>DailySpark</h1>
        <p style={{ color: "#6b7280", marginBottom: 20 }}>词汇·阅读·聊天·打卡</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 12,
          }}
        >
          <Card title="单词" href="/words" />
          <Card title="阅读" href="/reading" />
          <Card title="聊天" href="/chat" />
          <Card title="我的" href="/mine" />
          <Card title="会员" href="/vip" />
        </div>
      </div>
    </RabbitBackground>
  );
}

function Card({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: 16,
        border: "1px solid #f1f1f1",
        boxShadow: "0 4px 16px rgba(0,0,0,.06)",
      }}
    >
      <div style={{ fontSize: 16 }}>{title}</div>
      <div style={{ color: "#9ca3af", fontSize: 12 }}>进入</div>
    </Link>
  );
}

