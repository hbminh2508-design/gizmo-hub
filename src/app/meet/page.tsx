"use client";

import React, { useState, useEffect } from 'react';
import { Video, ArrowLeft, Users, Clock, Link as LinkIcon, Sun, Moon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function GizmoCallingLobby() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  // Tránh lỗi Hydration
  useEffect(() => setMounted(true), []);

  const createRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    router.push(`/meet/gizmo-${randomId}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      const code = roomCode.split('/').pop()?.replace(/[^a-zA-Z0-9-]/g, '');
      router.push(`/meet/${code}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans relative z-0 overflow-hidden bg-slate-50 dark:bg-[#0b1120]">
      {/* Background Liquid Glass Blobs */}
      <div className="fixed inset-0 z-[-1] transition-colors duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-rose-400/20 dark:bg-rose-600/20 blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-400/20 dark:bg-orange-800/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
      </div>

      {/* Navbar Kính mờ */}
      <header className="sticky top-0 z-40 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-500 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
            <ArrowLeft size={18} /> <span className="hidden sm:inline">Quay lại</span>
          </Link>
          
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            Gizmo<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Calling</span>
          </h1>

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Cột trái: Nội dung giới thiệu */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest">
              <Sparkles size={14} /> New Feature
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Phòng học nhóm <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500">
                  Siêu kết nối.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-lg">
                Hệ thống Video Call hiệu năng cao dành riêng cho sinh viên GizmoHUB. Kết nối bài giảng, thảo luận nhóm 24/7.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-3 text-sm font-black text-slate-700 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 dark:border-slate-700/50">
                <div className="p-2 bg-blue-500/10 rounded-xl"><Users size={20} className="text-blue-500"/></div> Max 20 người
              </div>
              <div className="flex items-center gap-3 text-sm font-black text-slate-700 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 dark:border-slate-700/50">
                <div className="p-2 bg-rose-500/10 rounded-xl"><Clock size={20} className="text-rose-500"/></div> Không giới hạn
              </div>
            </div>
          </div>

          {/* Cột phải: Form tương tác - Kính lỏng cực mạnh */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            {/* Đổ bóng nghệ thuật */}
            <div className="absolute -inset-4 bg-gradient-to-r from-rose-500 to-orange-500 rounded-[3.5rem] blur-2xl opacity-20 dark:opacity-40"></div>
            
            <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] border border-white dark:border-slate-700/50 shadow-2xl">
              
              {/* Nút Tạo phòng - Điểm nhấn chính */}
              <button 
                onClick={createRoom}
                className="w-full bg-slate-900 dark:bg-rose-600 text-white font-black text-xl py-6 rounded-[2rem] hover:bg-rose-600 dark:hover:bg-rose-500 transition-all shadow-[0_20px_50px_rgba(225,29,72,0.3)] flex items-center justify-center gap-4 group mb-10 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Video size={28} className="relative z-10 group-hover:scale-110 transition-transform" /> 
                <span className="relative z-10">Tạo phòng học ngay</span>
              </button>

              <div className="relative flex items-center mb-10 px-4">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink-0 mx-6 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Hoặc nhập mã phòng</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <form onSubmit={joinRoom} className="space-y-5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                  </div>
                  <input 
                    type="text" value={roomCode} onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Dán link hoặc mã phòng..." 
                    className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 pl-14 pr-5 py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 font-bold text-slate-800 dark:text-white transition-all placeholder-slate-400"
                  />
                </div>
                <button 
                  type="submit" disabled={!roomCode.trim()}
                  className="w-full bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-black py-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all shadow-sm"
                >
                  Tham gia thảo luận
                </button>
              </form>

              <p className="text-center mt-8 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-60">
                Mọi cuộc gọi đều được mã hóa đầu cuối bởi GizmoHUB
              </p>
            </div>
          </div>

        </div>
      </main>

      <footer className="py-8 text-center border-t border-slate-200/30 dark:border-slate-800/30 transition-colors">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.5em]">GizmoHUB © 2026 • Realtime Communication</p>
      </footer>
    </div>
  );
}