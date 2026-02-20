'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, MessageCircle, User, Sparkles, List } from "lucide-react";
import styles from "./tabbar.module.css";

const items = [
  { href: "/home", label: "首页", icon: Home },
  { href: "/words", label: "单词", icon: List },
  { href: "/reading", label: "阅读", icon: BookOpen },
  { href: "/chat", label: "聊天", icon: MessageCircle },
  { href: "/mine", label: "我的", icon: User },
  { href: "/vip", label: "会员", icon: Sparkles },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link key={href} href={href} className={`${styles.item} ${active ? styles.active : ""}`}>
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

