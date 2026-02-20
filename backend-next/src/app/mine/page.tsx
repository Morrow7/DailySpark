'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/request';
import { User, Settings, LogOut, ChevronRight, Calendar, Crown } from 'lucide-react';
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
    apiFetch('/api/user/profile') // Corrected endpoint
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
    { label: 'Words', value: 1280, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Days', value: 15, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Articles', value: 42, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const chartData = [30, 45, 25, 60, 75, 50, 80];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mb-24">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mr-4 overflow-hidden">
          {user?.avatar ? (
             <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
             <User size={32} />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Guest User'}</h2>
          <p className="text-gray-500 text-sm">{user?.email || 'Not logged in'}</p>
        </div>
        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
          <Crown size={12} className="mr-1 fill-yellow-700" />
          {user?.membership?.level || 'Free'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-xl p-4 flex flex-col items-center justify-center`}>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800">Weekly Progress</h3>
          <div className="text-xs text-gray-400">Last 7 days</div>
        </div>
        <div className="h-32 flex items-end justify-between gap-2">
          {chartData.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div 
                className="w-full bg-pink-200 rounded-t-md transition-all duration-500 group-hover:bg-pink-400 relative"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h}
                </div>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {['M','T','W','T','F','S','S'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {[
          { icon: Calendar, label: 'Check In', action: () => alert('Checked in successfully! +10 points') },
          { icon: Crown, label: 'Membership', action: () => router.push('/vip') },
          { icon: Settings, label: 'Settings', action: () => {} },
          { icon: LogOut, label: 'Logout', action: handleLogout, color: 'text-red-500' },
        ].map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none ${item.color || 'text-gray-700'}`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className={item.color || 'text-gray-400'} />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
