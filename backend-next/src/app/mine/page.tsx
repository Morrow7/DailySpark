'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/request';
import { User, Settings, LogOut, ChevronRight, Calendar, Crown, BookOpen, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MinePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load user from local storage first (fast)
    const stored = localStorage.getItem('user_info');
    if (stored) {
      setUser(JSON.parse(stored));
      setLoading(false);
    }
    
    // Then fetch fresh data
    apiFetch('/api/user/profile')
      .then(data => {
        setUser(data);
        localStorage.setItem('user_info', JSON.stringify(data));
      })
      .catch(() => {
        // If fail, maybe just keep local or show error
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_info');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.replace('/login');
  };

  const stats = [
    { label: 'Words', value: 1280, color: 'text-blue-600', bg: 'bg-blue-50', icon: BookOpen },
    { label: 'Days', value: 15, color: 'text-green-600', bg: 'bg-green-50', icon: Calendar },
    { label: 'Minutes', value: 420, color: 'text-pink-600', bg: 'bg-pink-50', icon: Clock },
  ];

  const chartData = [30, 45, 25, 60, 75, 50, 80];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 mb-24 md:mb-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 md:hidden">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card & Menu */}
        <div className="lg:col-span-1 space-y-8">
            {/* Profile Card */}
            <div className="relative bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl p-8 shadow-lg shadow-pink-200 text-white overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm p-1.5 mb-4 shadow-inner">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-pink-300 overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User size={48} />
                        )}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{user?.name || 'Guest User'}</h2>
                    <p className="text-pink-100 text-sm mb-4">{user?.email || 'Not logged in'}</p>
                    <div className="inline-flex items-center bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-white/10 hover:bg-black/30 transition-colors cursor-pointer" onClick={() => router.push('/vip')}>
                        <Crown size={12} className="mr-1.5 text-yellow-300 fill-yellow-300" />
                        {user?.membership?.level?.toUpperCase() || 'FREE PLAN'}
                    </div>
                </div>
            </div>

            {/* Menu List (Desktop) */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 overflow-hidden hidden lg:block">
                {[
                { icon: Calendar, label: 'Daily Check-in', action: () => alert('Checked in successfully! +10 points'), color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: Crown, label: 'Membership Plan', action: () => router.push('/vip'), color: 'text-amber-500', bg: 'bg-amber-50' },
                { icon: Settings, label: 'Settings', action: () => {}, color: 'text-gray-500', bg: 'bg-gray-100' },
                { icon: LogOut, label: 'Logout', action: handleLogout, color: 'text-red-500', bg: 'bg-red-50' },
                ].map((item, i) => (
                <button
                    key={i}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none group"
                >
                    <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon size={20} />
                    </div>
                    <span className="font-semibold text-gray-700">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                </button>
                ))}
            </div>
        </div>

        {/* Right Column: Stats & Charts */}
        <div className="lg:col-span-2 space-y-8">
             {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                <div key={i} className={`${stat.bg} rounded-3xl p-6 flex flex-col items-center justify-center shadow-sm border border-white/50 transition-all hover:-translate-y-1 hover:shadow-md`}>
                    <div className={`p-3 rounded-2xl bg-white mb-3 shadow-sm ${stat.color}`}>
                    <stat.icon size={24} />
                    </div>
                    <div className={`text-3xl font-extrabold ${stat.color} mb-1`}>{stat.value}</div>
                    <div className="text-sm text-gray-500 font-medium uppercase tracking-wide opacity-80">{stat.label}</div>
                </div>
                ))}
            </div>

            {/* Weekly Chart */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-pink-500 rounded-full" />
                    Learning Activity
                </h3>
                <div className="flex gap-2">
                     <button className="text-xs font-bold text-pink-500 bg-pink-50 px-3 py-1.5 rounded-lg">Weekly</button>
                     <button className="text-xs font-bold text-gray-400 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">Monthly</button>
                </div>
                </div>
                <div className="h-64 flex items-end justify-between gap-4 md:gap-8 px-2">
                {chartData.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer h-full justify-end">
                    <div 
                        className="w-full bg-gradient-to-t from-pink-100 to-pink-200 rounded-t-2xl transition-all duration-500 group-hover:from-pink-400 group-hover:to-rose-400 relative"
                        style={{ height: `${h}%` }}
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-bold py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none shadow-lg">
                        {h}min
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                        </div>
                    </div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider group-hover:text-pink-500 transition-colors">
                        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}
                    </span>
                    </div>
                ))}
                </div>
            </div>

             {/* Menu List (Mobile Only) */}
             <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 overflow-hidden lg:hidden">
                {[
                { icon: Calendar, label: 'Daily Check-in', action: () => alert('Checked in successfully! +10 points'), color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: Crown, label: 'Membership Plan', action: () => router.push('/vip'), color: 'text-amber-500', bg: 'bg-amber-50' },
                { icon: Settings, label: 'Settings', action: () => {}, color: 'text-gray-500', bg: 'bg-gray-100' },
                { icon: LogOut, label: 'Logout', action: handleLogout, color: 'text-red-500', bg: 'bg-red-50' },
                ].map((item, i) => (
                <button
                    key={i}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none group"
                >
                    <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon size={20} />
                    </div>
                    <span className="font-semibold text-gray-700">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
