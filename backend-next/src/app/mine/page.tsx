'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/request';
import {
    User, Settings, LogOut, ChevronRight, Calendar, Crown,
    BookOpen, Clock, Star, Medal, Zap, Shield, FileText,
    HelpCircle, Trash2, Smartphone
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MinePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user_info');
        if (stored) {
            setUser(JSON.parse(stored));
            setLoading(false);
        }

        apiFetch('/api/user/profile')
            .then(data => {
                setUser(data);
                localStorage.setItem('user_info', JSON.stringify(data));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_info');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.replace('/login');
    };

    const stats = [
        { label: '打卡天数', value: user?.checkInDays || 16, unit: '天' },
        { label: '已学单词', value: user?.learnedWords || 160, unit: '个' },
        { label: '学习时长', value: user?.studyMinutes || 83, unit: '分钟' },
        { label: '连续坚持', value: user?.streakDays || 28, unit: '天' },
    ];

    const gridItems = [
        { icon: Star, label: '我的收藏', color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { icon: FileText, label: '学习详情', color: 'text-blue-500', bg: 'bg-blue-50' },
        { icon: Medal, label: '勋章墙', color: 'text-orange-500', bg: 'bg-orange-50' },
        { icon: Smartphone, label: '桌面组件', color: 'text-green-500', bg: 'bg-green-50' },
        { icon: Zap, label: '优惠券', color: 'text-purple-500', bg: 'bg-purple-50' },
        { icon: Settings, label: '设置', color: 'text-gray-500', bg: 'bg-gray-100' },
    ];

    const menuItems = [
        { icon: BookOpen, label: '词汇量测试' },
        { icon: Shield, label: '隐私设置' },
        { icon: HelpCircle, label: '关于我们' },
        { icon: Trash2, label: '清除缓存', value: '4.54MB' },
        { icon: Zap, label: '检查更新', value: '4.3.0' },
        { icon: FileText, label: '意见反馈' },
    ];

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-gray-400">加载中...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {/* Header / User Info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-yellow-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-extrabold text-gray-800">{user?.name || '访客用户'}</h2>
                            <span className="px-2 py-0.5 bg-gray-200 rounded-full text-[10px] font-bold text-gray-500">
                                Lv.1
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                ID: {user?._id?.substring(0, 8) || 'fqfewd389a'}
                            </span>
                            <button className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md hover:bg-gray-200 transition-colors">
                                编辑 &gt;
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <Smartphone size={20} />
                    </button>
                    <button className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* VIP Banner */}
            <div
                onClick={() => router.push('/vip')}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-100 to-yellow-100 p-4 flex items-center justify-between cursor-pointer border border-orange-200/50 shadow-sm hover:shadow-md transition-shadow"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white shadow-md">
                        <Crown size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="font-bold text-orange-800">芝士 VIP 会员中心</h3>
                        <p className="text-xs text-orange-600/80">加入即刻解锁所有高级功能</p>
                    </div>
                </div>
                <button className="px-4 py-1.5 bg-white text-orange-600 text-xs font-bold rounded-full shadow-sm">
                    开通 VIP &gt;
                </button>

                {/* Decorative elements */}
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Stats Panel */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 grid grid-cols-4 gap-2">
                {stats.map((stat, i) => (
                    <div key={i} className="flex flex-col items-center text-center">
                        <div className="text-xl font-extrabold text-gray-800">{stat.value}</div>
                        <div className="text-[10px] text-gray-400 font-medium mt-1">{stat.label}</div>
                    </div>
                ))}
                <div className="col-span-4 mt-4 pt-4 border-t border-gray-50 flex items-center justify-center text-xs text-gray-400 cursor-pointer hover:text-yellow-500 transition-colors">
                    上周学习周报已生成 <ChevronRight size={12} />
                </div>
            </div>

            {/* Function Grid */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="grid grid-cols-3 gap-y-6">
                    {gridItems.map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                                <item.icon size={24} strokeWidth={2} />
                            </div>
                            <span className="text-xs font-bold text-gray-600 group-hover:text-gray-800">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Banner Ad (Placeholder) */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-300 p-4 text-white flex items-center justify-between shadow-md shadow-blue-100 cursor-pointer hover:shadow-lg transition-shadow">
                <div>
                    <h3 className="font-bold text-lg">学习地道表达</h3>
                    <p className="text-xs text-blue-50 opacity-90">沉浸式对话练习</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm border-2 border-white/40">
                    GO
                </div>
            </div>

            {/* Menu List */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                {menuItems.map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer border-b border-gray-50 last:border-none"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={18} className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-700">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.value && (
                                <span className="text-xs text-gray-400 font-medium">{item.value}</span>
                            )}
                            <ChevronRight size={16} className="text-gray-300" />
                        </div>
                    </div>
                ))}

                <div
                    onClick={handleLogout}
                    className="flex items-center justify-between p-4 hover:bg-red-50 transition-colors cursor-pointer text-red-500"
                >
                    <div className="flex items-center gap-3">
                        <LogOut size={18} />
                        <span className="text-sm font-bold">退出登录</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
