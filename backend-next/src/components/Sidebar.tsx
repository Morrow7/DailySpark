'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, MessageCircle, User, Sparkles, List, LogOut } from "lucide-react";

const items = [
  { href: "/home", label: "首页", icon: Home, color: "text-pink-500", bg: "hover:bg-pink-50" },
  { href: "/words", label: "单词", icon: List, color: "text-blue-500", bg: "hover:bg-blue-50" },
  { href: "/reading", label: "阅读", icon: BookOpen, color: "text-green-500", bg: "hover:bg-green-50" },
  { href: "/chat", label: "聊天", icon: MessageCircle, color: "text-blue-400", bg: "hover:bg-blue-50" },
  { href: "/mine", label: "我的", icon: User, color: "text-pink-500", bg: "hover:bg-pink-50" },
  { href: "/vip", label: "会员", icon: Sparkles, color: "text-amber-500", bg: "hover:bg-amber-50" },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  // Don't show sidebar on login page
  if (pathname === '/login') return null;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-sm z-50 py-8 px-4">
      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-xl shadow-lg shadow-pink-200">
          🐰
        </div>
        <div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            DailySpark
          </h1>
          <p className="text-xs text-gray-400 font-medium tracking-wide">English Learning</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {items.map(({ href, label, icon: Icon, color, bg }) => {
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-white shadow-md shadow-gray-100 scale-105 font-bold' 
                  : `text-gray-500 ${bg} hover:translate-x-1`
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? `${color} bg-opacity-10 bg-current` : 'text-gray-400 group-hover:text-gray-600'}`}>
                <Icon size={20} className={isActive ? color : ""} />
              </div>
              <span className={isActive ? "text-gray-800" : ""}>{label}</span>
              {isActive && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`} />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4">
        <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl p-4 border border-white/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-pink-200" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-800 truncate">User</div>
              <div className="text-xs text-gray-400">Free Plan</div>
            </div>
          </div>
          <button className="w-full py-2 bg-white rounded-xl text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
