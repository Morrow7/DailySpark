'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, MessageCircle, User, Sparkles, List, LogOut, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

const items = [
  { href: "/home", label: "首页", icon: Home },
  { href: "/words", label: "单词", icon: List },
  { href: "/reading", label: "阅读", icon: BookOpen },
  { href: "/chat", label: "聊天", icon: MessageCircle },
  { href: "/mine", label: "我的", icon: User },
  { href: "/vip", label: "会员", icon: Sparkles },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/login') return null;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-yellow-200 group-hover:scale-110 transition-transform">
            🐰
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800 tracking-tight group-hover:text-yellow-600 transition-colors">
              DailySpark
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">英语学习</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-white/50 backdrop-blur-sm p-1.5 rounded-full border border-white/50 shadow-sm">
          {items.map(({ href, label, icon: Icon }) => {
            const isActive = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm font-bold ${
                  isActive
                    ? 'bg-yellow-400 text-white shadow-md shadow-yellow-200'
                    : 'text-gray-500 hover:bg-yellow-50 hover:text-yellow-600'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden lg:block">
              <div className="text-sm font-bold text-gray-800">User</div>
              <div className="text-xs text-gray-400">Free Plan</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-white shadow-sm overflow-hidden">
               {/* Placeholder Avatar */}
               <div className="w-full h-full flex items-center justify-center text-yellow-600 font-bold">我</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
