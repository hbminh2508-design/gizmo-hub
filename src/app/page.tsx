"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { 
  BookOpen, Bell, User, LogOut, ArrowRight, 
  UploadCloud, Star, Calendar, Search, ChevronDown, 
  MessageCircle, Rss, Hash, X, FileText, Loader2, Video 
} from 'lucide-react';

type SearchResult = {
  type: 'doc' | 'review' | 'post' | 'msg';
  title: string;
  subtitle: string;
  link: string;
};

export default function GizmoHubDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email ?? null);
    };
    checkUser();

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchResults([]);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGlobalSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    
    const [docs, reviews, posts, msgs] = await Promise.all([
      supabase.from('documents').select('title, subject').ilike('title', `%${query}%`).limit(3),
      supabase.from('reviews').select('teacher_name, course_name').ilike('teacher_name', `%${query}%`).limit(3),
      supabase.from('posts').select('content, tags').or(`content.ilike.%${query}%, tags.cs.{${query}}`).limit(3),
      supabase.from('messages').select('content, sender_email').ilike('content', `%${query}%`).limit(3)
    ]);

    const results: SearchResult[] = [];
    if (docs.data) docs.data.forEach(d => results.push({ type: 'doc', title: d.title, subtitle: d.subject, link: '/documents' }));
    if (reviews.data) reviews.data.forEach(r => results.push({ type: 'review', title: r.teacher_name, subtitle: r.course_name, link: '/reviews' }));
    if (posts.data) posts.data.forEach(p => results.push({ type: 'post', title: p.content.substring(0, 40) + "...", subtitle: "New Feed", link: '/feed' }));
    if (msgs.data) msgs.data.forEach(m => results.push({ type: 'msg', title: m.content, subtitle: `Chat từ ${m.sender_email.split('@')[0]}`, link: '/chat' }));

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setIsDropdownOpen(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/icon.png" alt="GizmoHUB Logo" className="h-9 w-9 rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">Gizmo<span className="text-blue-600">HUB</span></span>
          </Link>

          {/* MENU ĐÃ ĐƯỢC THÊM VIDEO CALL */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <Link href="/documents" className="hover:text-blue-600 transition">Tài liệu</Link>
            <Link href="/reviews" className="hover:text-blue-600 transition">Giảng viên</Link>
            <Link href="/schedule" className="hover:text-blue-600 transition">Lịch học</Link>
            <Link href="/chat" className="hover:text-blue-600 transition">Trò chuyện</Link>
            <Link href="/feed" className="hover:text-blue-600 transition">Bảng tin</Link>
            <Link href="/meet" className="hover:text-blue-600 transition text-rose-600">Video Call</Link>
          </div>

          <div className="flex items-center gap-4">
            {userEmail ? (
              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition">
                  <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase">{userEmail.charAt(0)}</div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"><User className="h-4 w-4" /> Trang cá nhân</Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"><LogOut className="h-4 w-4" /> Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition">Đăng nhập</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-grow">
        <div className="bg-[#0f172a] rounded-[3rem] p-12 md:p-20 shadow-2xl mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              Tìm kiếm <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">mọi thứ</span> <br/> cho sinh viên.
            </h1>
            
            <div className="relative w-full max-w-lg" ref={searchRef}>
              <div className="bg-[#1e293b] rounded-2xl p-2 flex items-center border border-slate-700 focus-within:border-blue-500 transition-all">
                <div className="pl-4 pr-2">
                  {isSearching ? <Loader2 className="h-5 w-5 text-blue-400 animate-spin" /> : <Search className="h-5 w-5 text-slate-500" />}
                </div>
                <input 
                  type="text" value={searchQuery} onChange={(e) => handleGlobalSearch(e.target.value)}
                  placeholder="Môn học, Giảng viên, Tags bài viết..." 
                  className="bg-transparent w-full py-3 text-white placeholder-slate-500 focus:outline-none font-medium"
                />
                {searchQuery && <X className="mr-3 h-4 w-4 text-slate-500 cursor-pointer hover:text-white" onClick={() => setSearchQuery("")} />}
              </div>

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-40 animate-in fade-in slide-in-from-top-2">
                  {searchResults.map((result, i) => (
                    <Link key={i} href={result.link} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition border-b border-slate-50 last:border-none">
                      <div className={`p-2 rounded-lg ${result.type === 'doc' ? 'bg-emerald-50 text-emerald-600' : result.type === 'review' ? 'bg-amber-50 text-amber-600' : result.type === 'msg' ? 'bg-sky-50 text-sky-600' : 'bg-blue-50 text-blue-600'}`}>
                        {result.type === 'doc' ? <FileText size={16} /> : result.type === 'review' ? <Star size={16} /> : result.type === 'msg' ? <MessageCircle size={16} /> : <Hash size={16} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 line-clamp-1">{result.title}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{result.subtitle}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-4 text-slate-500 text-xs font-bold italic tracking-wide uppercase opacity-60">* Tin nhắn chat tự xóa sau 24h để bảo vệ server.</p>
          </div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
        </div>

        {/* 6 Thẻ Grid với mô tả "Quốc dân" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/documents" className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div>
              <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><UploadCloud className="h-6 w-6" /></div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 leading-tight">Tài Liệu</h2>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-4">Kho giáo trình, đề thi và tài liệu học tập đa dạng cho sinh viên.</p>
            </div>
            <div className="text-emerald-600 font-bold text-[10px] flex items-center gap-1 uppercase tracking-widest">Khám phá <ArrowRight size={12} /></div>
          </Link>

          <Link href="/reviews" className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div>
              <div className="bg-amber-50 text-amber-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Star className="h-6 w-6" /></div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 leading-tight">Review GV</h2>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-4">Góc nhìn đa chiều và chân thực về cách giảng dạy của giảng viên.</p>
            </div>
            <div className="text-amber-500 font-bold text-[10px] flex items-center gap-1 uppercase tracking-widest">Xem review <ArrowRight size={12} /></div>
          </Link>

          <Link href="/schedule" className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div>
              <div className="bg-purple-50 text-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Calendar className="h-6 w-6" /></div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 leading-tight">Lịch Học</h2>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-4">Tự động nhắc nhở tiết học và lịch trình cá nhân hóa.</p>
            </div>
            <div className="text-purple-600 font-bold text-[10px] flex items-center gap-1 uppercase tracking-widest">Cài đặt <ArrowRight size={12} /></div>
          </Link>

          <Link href="/chat" className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div>
              <div className="bg-sky-50 text-sky-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><MessageCircle className="h-6 w-6" /></div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 leading-tight">Phòng Chat</h2>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-4">Kết nối cộng đồng, nhắn tin và chia sẻ file đa phương tiện nhanh chóng.</p>
            </div>
            <div className="text-sky-500 font-bold text-[10px] flex items-center gap-1 uppercase tracking-widest">Vào chat <ArrowRight size={12} /></div>
          </Link>

          <Link href="/feed" className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div>
              <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Rss className="h-6 w-6" /></div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 leading-tight">New Feed</h2>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-4">Đăng bài, hỏi đáp kiến thức và theo dõi các chủ đề đang hot.</p>
            </div>
            <div className="text-blue-600 font-bold text-[10px] flex items-center gap-1 uppercase tracking-widest">Khám phá <ArrowRight size={12} /></div>
          </Link>

          <Link href="/meet" className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between ring-2 ring-rose-500/10">
            <div>
              <div className="bg-rose-50 text-rose-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Video className="h-6 w-6" /></div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 leading-tight">Học Nhóm Video</h2>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-4">Phòng họp trực tuyến miễn phí lên tới 20 người. Tối ưu cho làm việc nhóm.</p>
            </div>
            <div className="text-rose-500 font-bold text-[10px] flex items-center gap-1 uppercase tracking-widest">Tạo phòng ngay <ArrowRight size={12} /></div>
          </Link>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">GizmoHUB © 2026 • Ecosystem for Students</p>
      </footer>
    </div>
  );
}