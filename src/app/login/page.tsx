"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter(); // Khởi tạo công cụ chuyển hướng trang
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  // Hàm xử lý Đăng nhập / Đăng ký
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        // Gọi API Đăng nhập của Supabase
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        setMessage({ text: 'Đăng nhập thành công! Đang chuyển hướng...', type: 'success' });
        
        // Tự động chuyển hướng về trang chủ (Dashboard)
        router.push('/');
        
      } else {
        // Kiểm tra mail sinh viên (ví dụ đuôi .edu.vn)
        if (!email.endsWith('.edu.vn') && !email.endsWith('@gmail.com')) {
           setMessage({ text: 'Vui lòng sử dụng email đuôi .edu.vn hoặc @gmail.com', type: 'error' });
           setLoading(false);
           return;
        }

        // Gọi API Đăng ký của Supabase
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        setMessage({ text: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.', type: 'success' });
        setIsLogin(true); // Chuyển sang form đăng nhập
      }
    } catch (error: any) {
      setMessage({ text: error.message || 'Có lỗi xảy ra, vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Khung Form kính mờ (Glassmorphism) */}
      <div className="glass-card w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        {/* Đồ họa trang trí góc */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-[50px] opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500 rounded-full blur-[50px] opacity-20"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4 transform -rotate-6">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              {isLogin ? 'Đăng nhập để truy cập kho tài liệu GizmoHUB' : 'Tham gia mạng lưới sinh viên công nghệ lớn nhất'}
            </p>
          </div>

          {/* Hiển thị thông báo (Lỗi hoặc Thành công) */}
          {message && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email trường / Cá nhân</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="masv@vnu.edu.vn" 
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
            >
              {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-200 pt-6">
            <p className="text-slate-500 text-sm">
              {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isLogin ? "Đăng ký ngay" : "Đăng nhập tại đây"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}