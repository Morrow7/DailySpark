'use client';

import React, { useState } from 'react';
import { Check, Crown, Star, Zap, Shield, X, ChevronRight, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VipPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);

  const plans = {
    monthly: {
      id: 'monthly',
      name: '月度会员',
      price: '¥18',
      period: '/月',
      desc: '灵活订阅，随时取消',
      savings: null,
    },
    yearly: {
      id: 'yearly',
      name: '年度会员',
      price: '¥168',
      period: '/年',
      desc: '认真学习者的最佳选择',
      savings: '立省 22%',
    }
  };

  const features = [
    { name: '每日单词上限', free: '20 个', vip: '无限量' },
    { name: 'AI 发音教练', free: '基础版', vip: '高级版' },
    { name: '词汇复习', free: '标准模式', vip: '智能间隔重复' },
    { name: '自定义词单', free: <X size={16} className="text-gray-300" />, vip: <Check size={16} className="text-orange-500" /> },
    { name: '离线模式', free: <X size={16} className="text-gray-300" />, vip: <Check size={16} className="text-orange-500" /> },
    { name: '免广告体验', free: <X size={16} className="text-gray-300" />, vip: <Check size={16} className="text-orange-500" /> },
  ];

  const handleSubscribe = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert(`成功订阅 ${plans[selectedPlan].name}!`);
      router.push('/mine');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 md:pb-12">
      {/* Header Section */}
      <div className="text-center mb-10 pt-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-lg mb-6 text-white transform hover:scale-105 transition-transform duration-300">
          <Crown size={40} fill="currentColor" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 font-heading">
          升级为 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">芝士 VIP</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          解锁 DailySpark 全部功能，利用高级特性加速您的语言学习之旅。
        </p>
      </div>

      {/* Plan Selection Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-16 max-w-3xl mx-auto">
        {/* Monthly Plan */}
        <div
          onClick={() => setSelectedPlan('monthly')}
          className={`relative rounded-3xl p-1 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${selectedPlan === 'monthly'
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl scale-105 z-10'
              : 'bg-gray-100 hover:bg-gray-200'
            }`}
        >
          <div className="h-full bg-white rounded-[20px] p-6 flex flex-col items-center text-center relative overflow-hidden">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{plans.monthly.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-gray-900">{plans.monthly.price}</span>
              <span className="text-gray-500 font-medium">{plans.monthly.period}</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">{plans.monthly.desc}</p>

            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-auto transition-colors ${selectedPlan === 'monthly' ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
              }`}>
              {selectedPlan === 'monthly' && <Check size={14} className="text-white" />}
            </div>
          </div>
        </div>

        {/* Yearly Plan */}
        <div
          onClick={() => setSelectedPlan('yearly')}
          className={`relative rounded-3xl p-1 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${selectedPlan === 'yearly'
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl scale-105 z-10'
              : 'bg-gray-100 hover:bg-gray-200'
            }`}
        >
          <div className="absolute top-0 right-0 left-0 -mt-3 flex justify-center z-20">
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
              超值推荐
            </span>
          </div>
          <div className="h-full bg-white rounded-[20px] p-6 flex flex-col items-center text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">{plans.yearly.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-gray-900">{plans.yearly.price}</span>
              <span className="text-gray-500 font-medium">{plans.yearly.period}</span>
            </div>
            <p className="text-sm text-green-600 font-bold mb-6 bg-green-50 px-3 py-1 rounded-full">
              {plans.yearly.savings}
            </p>

            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-auto transition-colors ${selectedPlan === 'yearly' ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
              }`}>
              {selectedPlan === 'yearly' && <Check size={14} className="text-white" />}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Comparison */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" size={24} />
            会员权益对比
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-500">权益功能</th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-gray-500">免费版</th>
                <th className="py-4 px-6 text-center text-sm font-bold text-orange-600 bg-orange-50/30">VIP 会员</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {features.map((feature, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-gray-700">{feature.name}</td>
                  <td className="py-4 px-6 text-center text-sm text-gray-500">{feature.free}</td>
                  <td className="py-4 px-6 text-center text-sm font-bold text-gray-800 bg-orange-50/10">{feature.vip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:relative md:bg-transparent md:border-0 md:shadow-none md:p-0 z-50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="hidden md:block text-left">
            <p className="text-sm text-gray-500">支付总额</p>
            <p className="text-2xl font-extrabold text-gray-900">{plans[selectedPlan].price}<span className="text-sm font-normal text-gray-400">/{selectedPlan === 'monthly' ? '月' : '年'}</span></p>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full md:w-auto md:min-w-[300px] bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-4 px-8 rounded-full font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                立即订阅 <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
        <p className="text-center text-gray-400 text-[10px] mt-2 md:mt-4 flex items-center justify-center gap-1">
          <Shield size={10} /> 安全支付由 Stripe 支持 (Mock)。随时取消。
        </p>
      </div>

      {/* Spacer for mobile fixed footer */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
}
