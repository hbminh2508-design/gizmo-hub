"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { 
  BookOpen, Bell, User, LogOut, ArrowRight, 
  UploadCloud, Star, Calendar, Search, ChevronDown, MessageCircle
} from 'lucide-react';

export default function GizmoHubDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setIsDropdownOpen(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">Gizmo<span className="text-blue-600">HUB</span></span>
          </Link>

          {/* Center Links - Đã thêm link Trò chuyện */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <Link href="/documents" className="hover:text-blue-600 transition">Tài liệu</Link>
            <Link href="/reviews" className="hover:text-blue-600 transition">Giảng viên</Link>
            <Link href="/schedule" className="hover:text-blue-600 transition">Lịch học</Link>
            <Link href="/chat" className="hover:text-blue-600 transition">Trò chuyện</Link>
          </div>

          {/* Right Area (User & Notifications) */}
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {userEmail ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 pl-2 pr-3 py-1.5 rounded-full transition"
                >
                  <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 mb-2">
                      <p className="text-xs text-slate-400 font-medium">Đang đăng nhập với</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{userEmail}</p>
                    </div>
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <User className="h-4 w-4" /> Trang cá nhân
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="h-4 w-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer shadow-md shadow-blue-200 hover:scale-105 transition">
                  <User className="h-4 w-4 text-white" />
                </div>
                <Link href="/login" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition">
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-grow">
        {/* Hero Section */}
        <div className="bg-[#0f172a] rounded-[2.5rem] p-12 md:p-20 shadow-2xl mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
              Nâng tầm trải nghiệm <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Đại học của bạn.</span>
            </h1>
            <p className="text-slate-400 text-lg mb-10 max-w-xl leading-relaxed">
              Lưu trữ tài liệu, đánh giá giảng viên và quản lý lịch học thông minh. Dành cho sinh viên, bởi sinh viên.
            </p>
            
            {/* Search Bar giả lập */}
            <div className="bg-[#1e293b] rounded-2xl p-2 flex items-center max-w-lg border border-slate-700/50 focus-within:border-blue-500 transition-colors">
              <div className="pl-4 pr-2"><Search className="h-5 w-5 text-slate-500" /></div>
              <input 
                type="text" 
                placeholder="Tìm tên môn học, mã học phần..." 
                className="bg-transparent w-full py-3 text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>
          {/* Đồ họa nền */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-900/40 to-transparent"></div>
        </div>

        {/* 4 Thẻ tính năng - Chuyển sang md:grid-cols-4 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card: Tài liệu */}
          <Link href="/documents" className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer flex flex-col justify-between">
            <div>
              <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Kho Tài Liệu</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">Chia sẻ và tải xuống giáo trình, đề thi nhanh chóng. Phân loại thông minh theo khoa.</p>
            </div>
            <div className="text-emerald-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
              Khám phá ngay <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Card: Đánh giá */}
          <Link href="/reviews" className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer flex flex-col justify-between">
            <div>
              <div className="bg-amber-50 text-amber-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Star className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Review Giảng Viên</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">Những chia sẻ chân thực nhất. Kiểm duyệt nghiêm ngặt bởi thành viên uy tín.</p>
            </div>
            <div className="text-amber-500 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
              Xem đánh giá <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Card: Lịch học */}
          <Link href="/schedule" className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer flex flex-col justify-between">
            <div>
              <div className="bg-purple-50 text-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Lịch Học</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">Đồng bộ lịch thi, lịch học. Nhắc nhở tự động qua Email và điện thoại của bạn.</p>
            </div>
            <div className="text-purple-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
              Thiết lập lịch <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Card: Phòng Chat - MỚI THÊM */}
          <Link href="/chat" className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer flex flex-col justify-between">
            <div>
              <div className="bg-sky-50 text-sky-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Phòng Chat</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">Trò chuyện trực tuyến thời gian thực. Kết nối cùng cộng đồng sinh viên ngay lập tức.</p>
            </div>
            <div className="text-sky-500 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
              Vào nhắn tin <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}