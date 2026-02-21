'use client'
import Link from "next/link";
import RabbitBackground from "@/components/RabbitBackground";
import { BookOpen, List, MessageCircle, Sparkles, User, Crown } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <RabbitBackground>
        <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
          <div className="text-center mb-16 animate-float">
            <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
              DailySpark
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium tracking-wide">
              词汇 · 阅读 · 聊天 · 成长
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Card 
              title="单词" 
              href="/words" 
              icon={List} 
              color="text-blue-500" 
              bg="bg-blue-50"
              desc="记忆与复习"
            />
            <Card 
              title="阅读" 
              href="/reading" 
              icon={BookOpen} 
              color="text-green-500" 
              bg="bg-green-50"
              desc="精选双语文章"
            />
            <Card 
              title="聊天" 
              href="/chat" 
              icon={MessageCircle} 
              color="text-blue-400" 
              bg="bg-blue-50"
              desc="AI 口语教练"
            />
            <Card 
              title="我的" 
              href="/mine" 
              icon={User} 
              color="text-pink-500" 
              bg="bg-pink-50"
              desc="数据与成就"
            />
            <Card 
              title="会员" 
              href="/vip" 
              icon={Crown} 
              color="text-amber-500" 
              bg="bg-amber-50"
              desc="解锁高级功能"
            />
          </div>
          
          <div className="mt-12 text-center text-sm text-gray-400 font-light">
             Explore the world with English
          </div>
        </div>
      </RabbitBackground>
    </div>
  );
}

function Card({ 
  title, 
  href, 
  icon: Icon, 
  color, 
  bg,
  desc 
}: { 
  title: string; 
  href: string; 
  icon: any; 
  color: string; 
  bg: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="glass-card group p-6 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center border-white/60"
    >
      <div className={`w-16 h-16 rounded-2xl ${bg} ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-xs text-gray-400 font-medium">{desc}</p>
    </Link>
  );
}
