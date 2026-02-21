'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/clientAuth";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleWeChatLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // Simulate WeChat Auth Flow
      // In a real app, this would redirect to WeChat OAuth or show a QR code
      // Here we mock a successful login directly
      const res = await fetch("/api/auth/wechat-login-mock", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "微信授权失败");

      setToken(data.token);

      // Store user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_info', JSON.stringify(data.user));
      }

      router.replace("/home");
    } catch (e: any) {
      setError(e.message || "登录失败");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-cheese-50 via-white to-orange-50">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-white text-center">
        <div className="mb-10">
          <div className="w-20 h-20 bg-cheese-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm text-cheese-600">
            💬
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">欢迎回来</h1>
          <p className="text-gray-500">请使用微信登录以继续</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 text-sm py-3 px-4 rounded-xl flex items-center justify-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <button
            onClick={handleWeChatLogin}
            disabled={loading}
            className="w-full bg-[#07C160] hover:bg-[#06ad56] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? (
              "正在连接..."
            ) : (
              <>
                <span className="text-xl">微信一键登录</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 mt-4">
            登录即代表您同意我们的服务条款和隐私政策。
          </p>
        </div>
      </div>
    </div>
  );
}