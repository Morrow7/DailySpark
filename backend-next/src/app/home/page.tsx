'use client'
import Link from "next/link";
import { BookOpen, MessageCircle, TrendingUp, Coffee } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 pb-24">
      <div className="max-w-md mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-2 py-8">
          <h1 className="text-4xl font-extrabold text-cheese-800 tracking-tight">
            Daily Spark
          </h1>
          <p className="text-cheese-600 font-medium">
            用英语探索广阔世界
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/words"
            className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border-2 border-orange-100 hover:border-orange-300 transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen size={48} className="text-orange-500" />
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 text-orange-600 group-hover:scale-110 transition-transform">
              <BookOpen size={24} fill="currentColor" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">每日单词</h3>
            <p className="text-xs text-gray-400 font-medium">积累核心词汇</p>
          </Link>

          <Link
            href="/reading"
            className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Coffee size={48} className="text-green-500" />
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4 text-green-600 group-hover:scale-110 transition-transform">
              <Coffee size={24} fill="currentColor" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">精选阅读</h3>
            <p className="text-xs text-gray-400 font-medium">地道文章精读</p>
          </Link>

          <Link
            href="/chat"
            className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <MessageCircle size={48} className="text-blue-500" />
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform">
              <MessageCircle size={24} fill="currentColor" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">AI 对话</h3>
            <p className="text-xs text-gray-400 font-medium">口语实战演练</p>
          </Link>

          <Link
            href="/mine"
            className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={48} className="text-purple-500" />
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 text-purple-600 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} fill="currentColor" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">成长统计</h3>
            <p className="text-xs text-gray-400 font-medium">查看学习进度</p>
          </Link>
        </div>

        {/* Daily Quote - Placeholder for dynamic content */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cheese-400 to-orange-400"></div>
          <div className="flex items-start gap-4">
            <div className="text-4xl text-cheese-300 font-serif">"</div>
            <div className="flex-1">
              <p className="text-gray-600 italic font-serif text-lg leading-relaxed mb-2">
                The limits of my language mean the limits of my world.
              </p>
              <p className="text-gray-400 text-sm font-medium text-right">
                — Ludwig Wittgenstein
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
