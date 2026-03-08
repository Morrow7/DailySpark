import Link from 'next/link';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-20 hidden md:block">
      <div className="container-custom mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-white font-bold shadow-lg shadow-yellow-200">
                🐰
              </div>
              <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">DailySpark</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              让英语学习变得有趣、引人入胜且触手可及。立即开始您的旅程！
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-gray-800 transition-colors"><Github size={20} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">产品</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/words" className="hover:text-yellow-600 transition-colors">单词本</Link></li>
              <li><Link href="/reading" className="hover:text-yellow-600 transition-colors">阅读</Link></li>
              <li><Link href="/chat" className="hover:text-yellow-600 transition-colors">AI 对话</Link></li>
              <li><Link href="/vip" className="hover:text-yellow-600 transition-colors">会员计划</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-4">资源</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-yellow-600 transition-colors">博客</Link></li>
              <li><Link href="#" className="hover:text-yellow-600 transition-colors">社区</Link></li>
              <li><Link href="#" className="hover:text-yellow-600 transition-colors">帮助中心</Link></li>
              <li><Link href="#" className="hover:text-yellow-600 transition-colors">隐私政策</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">保持更新</h3>
            <p className="text-sm text-gray-500 mb-4">订阅我们的通讯以获取新功能和技巧。</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="输入您的邮箱"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
              />
              <button className="px-4 py-2 bg-yellow-400 text-white font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-200 text-sm">
                加入
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-12 pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} DailySpark. 版权所有。
        </div>
      </div>
    </footer>
  );
}
