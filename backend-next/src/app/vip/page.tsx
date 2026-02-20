'use client';

import React, { useState } from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VipPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '¥18',
      period: '/mo',
      desc: 'Flexible plan',
      features: ['Unlimited Words', 'AI Chat (100 msgs/day)', 'Basic Stats'],
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '¥168',
      period: '/yr',
      desc: 'Best Value (Save 20%)',
      features: ['Unlimited Words', 'Unlimited AI Chat', 'Advanced Stats', 'Phone Call Mode', 'Priority Support'],
      popular: true,
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: '¥298',
      period: ' one-time',
      desc: 'Pay once, own forever',
      features: ['All Yearly features', 'Future Updates', 'Vip Badge'],
    },
  ];

  const handleSubscribe = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Subscription successful! (Mock)');
      router.push('/mine');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mb-24">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade to Pro</h1>
        <p className="text-gray-500">Unlock your full potential with DailySpark Premium</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? 'border-pink-500 bg-pink-50 shadow-xl scale-105 z-10'
                : 'border-gray-100 bg-white hover:border-pink-200 shadow-sm'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center">
                <Crown size={12} className="mr-1" />
                MOST POPULAR
              </div>
            )}
            
            <div className="text-center mb-6 pt-2">
              <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
              <div className="text-pink-500 font-extrabold text-3xl my-2">
                {plan.price}
                <span className="text-gray-400 text-sm font-normal">{plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm">{plan.desc}</p>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-sm text-gray-600">
                  <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className={`w-6 h-6 rounded-full border-2 mx-auto flex items-center justify-center ${
              selectedPlan === plan.id ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
            }`}>
              {selectedPlan === plan.id && <Check size={14} className="text-white" />}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
          <Star size={20} className="text-yellow-400 mr-2 fill-yellow-400" />
          Pro Features
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-3 text-blue-600">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-sm">AI Voice Chat</h4>
              <p className="text-xs text-gray-500 mt-1">Unlimited practice with AI tutor</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-lg mr-3 text-green-600">
              <Crown size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Advanced Stats</h4>
              <p className="text-xs text-gray-500 mt-1">Track your progress in detail</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Subscribe Now'}
      </button>
      
      <p className="text-center text-gray-400 text-xs mt-4">
        Secure payment powered by Stripe (Mock). Cancel anytime.
      </p>
    </div>
  );
}
