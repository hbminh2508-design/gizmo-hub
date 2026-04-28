"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useTheme } from 'next-themes';
import { 
  User, LogOut, ArrowRight, UploadCloud, Star, Calendar, Search, 
  ChevronDown, MessageCircle, Rss, Hash, X, FileText, Loader2, Video, Sun, Moon, UserCircle
} from 'lucide-react';

type SearchResult = { 
  type: 'doc' | 'review' | 'post' | 'user'; 
  title: string; 
  subtitle: string; 
  link: string; 
  avatarUrl?: string; 
};

export default function GizmoHubDashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (data?.user) {
          setUserEmail(data.user.email ?? null);
          const { data: profile } = await supabase.from('profiles').select('*').eq('email', data.user.email).single();
          if (profile) setUserProfile(profile);
        }
      } catch (error) {
        await supabase.auth.signOut();
        setUserEmail(null);
      }
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
    if (query.trim().length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    
    const safeQuery = `%${query.trim()}%`;

    const [docs, reviews, posts, users] = await Promise.all([
      supabase.from('documents').select('title, subject').or(`title.ilike.${safeQuery},subject.ilike.${safeQuery}`).limit(2),
      supabase.from('reviews').select('teacher_name, course_name').or(`teacher_name.ilike.${safeQuery},course_name.ilike.${safeQuery}`).limit(2),
      supabase.from('posts').select('content').ilike('content', safeQuery).limit(2),
      supabase.from('profiles').select('full_name, email, avatar_url').or(`full_name.ilike.${safeQuery},email.ilike.${safeQuery}`).limit(2)
    ]);

    const results: SearchResult[] = [];
    
    if (users.data) users.data.forEach(u => results.push({ type: 'user', title: u.full_name || u.email.split('@')[0], subtitle: "Trang cá nhân", link: `/profile?user=${u.email}`, avatarUrl: u.avatar_url }));
    if (docs.data) docs.data.forEach(d => results.push({ type: 'doc', title: d.title, subtitle: `Tài liệu: ${d.subject}`, link: '/documents' }));
    if (reviews.data) reviews.data.forEach(r => results.push({ type: 'review', title: r.teacher_name, subtitle: `Giảng viên: ${r.course_name}`, link: '/reviews' }));
    if (posts.data) posts.data.forEach(p => results.push({ type: 'post', title: p.content.substring(0, 40) + "...", subtitle: "Bài viết trên Feed", link: '/feed' }));

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setIsDropdownOpen(false);
    router.refresh();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans relative z-0 overflow-hidden bg-slate-50 dark:bg-[#0b1120]">
      {/* Background Decor */}
      <div className="fixed inset-0 z-[-1] transition-colors duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-400/20 dark:bg-rose-600/20 blur-[100px] pointer-events-none"></div>
      </div>

      <nav className="sticky top-0 z-[100] bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/icon.png" alt="Logo" className="h-9 w-9 rounded-xl shadow-sm group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">Gizmo<span className="text-blue-600 dark:text-blue-400">HUB</span></span>
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/documents" className="hover:text-blue-600 transition">Tài liệu</Link>
            <Link href="/reviews" className="hover:text-blue-600 transition">Giảng viên</Link>
            <Link href="/schedule" className="hover:text-blue-600 transition">Lịch học</Link>
            <Link href="/chat" className="hover:text-blue-600 transition">Trò chuyện</Link>
            <Link href="/feed" className="hover:text-blue-600 transition">Bảng tin</Link>
            <Link href="/meet" className="hover:text-rose-500 transition text-rose-600 font-bold">Video Call</Link>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:scale-110 transition-all">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {userEmail ? (
              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition backdrop-blur-md">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase overflow-hidden border border-white/50 dark:border-slate-700">
                    {userProfile?.avatar_url ? <img src={userProfile.avatar_url} alt="Avt" className="w-full h-full object-cover" /> : (userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : userEmail.charAt(0))}
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-300 mr-1" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 py-2 z-50">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition"><User className="h-4 w-4" /> Trang cá nhân</Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-slate-800 transition"><LogOut className="h-4 w-4" /> Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="bg-slate-900 dark:bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 dark:hover:bg-blue-500 transition shadow-lg">Đăng nhập</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-grow">
        <div className="bg-[#0f172a]/90 dark:bg-[#020617]/80 backdrop-blur-3xl rounded-[3rem] p-12 md:p-20 shadow-2xl mb-12 relative border border-white/10 z-50">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
              Tìm kiếm <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">mọi thứ</span> <br/> cho sinh viên.
            </h1>
            
            <div className="relative w-full max-w-lg" ref={searchRef}>
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl p-2 flex items-center border border-white/20 focus-within:border-blue-400 focus-within:bg-white/20 transition-all shadow-2xl z-50">
                <div className="pl-4 pr-2">
                  {isSearching ? <Loader2 className="h-5 w-5 text-blue-400 animate-spin" /> : <Search className="h-5 w-5 text-slate-300" />}
                </div>
                <input 
                  type="text" value={searchQuery} onChange={(e) => handleGlobalSearch(e.target.value)}
                  placeholder="Môn học, Giảng viên, Bài viết..." 
                  className="bg-transparent w-full py-3 text-white placeholder-slate-400 focus:outline-none font-medium"
                />
                {searchQuery && <X className="mr-3 h-4 w-4 text-slate-300 cursor-pointer hover:text-white" onClick={() => setSearchQuery("")} />}
              </div>

              {searchResults.length > 0 && (
                <div className="absolute top-[120%] left-0 w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-700 overflow-y-auto overflow-x-hidden max-h-[320px] z-[9999]">
                  {searchResults.map((result, i) => (
                    <Link key={i} href={result.link} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition border-b border-slate-200/50 dark:border-slate-700/50 last:border-none">
                      <div className={`p-2 rounded-lg flex shrink-0 items-center justify-center overflow-hidden
                        ${result.type === 'doc' ? 'bg-emerald-500/20 text-emerald-600' : 
                          result.type === 'review' ? 'bg-amber-500/20 text-amber-600' : 
                          result.type === 'user' ? 'bg-blue-500/20 text-blue-600 h-10 w-10 !p-0 rounded-full' : 
                          'bg-indigo-500/20 text-indigo-600'}`}
                      >
                        {result.type === 'doc' ? <FileText size={16} /> : 
                         result.type === 'review' ? <Star size={16} /> : 
                         result.type === 'post' ? <Hash size={16} /> : 
                         (result.avatarUrl ? <img src={result.avatarUrl} alt="Avt" className="w-full h-full object-cover" /> : <UserCircle size={20} />)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{result.title}</span>
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{result.subtitle}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-30 mix-blend-screen pointer-events-none z-0"></div>
        </div>

        {/* Feature Grid - Đã loại bỏ Office */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {[
            { href: "/documents", icon: UploadCloud, title: "Gizmo Docs", desc: "Kho giáo trình, đề thi và tài liệu học tập đa dạng cho sinh viên.", color: "emerald" },
            { href: "/reviews", icon: Star, title: "Gizmo Stars", desc: "Góc nhìn đa chiều và chân thực về cách giảng dạy của giảng viên.", color: "amber" },
            { href: "/schedule", icon: Calendar, title: "Gizmo Calendar", desc: "Tự động nhắc nhở tiết học và lịch trình cá nhân hóa.", color: "purple" },
            { href: "/chat", icon: MessageCircle, title: "Gizmo Message", desc: "Kết nối cộng đồng, nhắn tin và chia sẻ file nhanh chóng.", color: "sky" },
            { href: "/feed", icon: Rss, title: "Gizmo Feed", desc: "Đăng bài, hỏi đáp kiến thức và theo dõi các chủ đề đang hot.", color: "blue" }
          ].map((item, idx) => (
            <Link key={idx} href={item.href} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/50 dark:border-slate-700/50 hover:-translate-y-1 transition-all group flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className={`bg-${item.color}-100 dark:bg-${item.color}-500/20 text-${item.color}-600 dark:text-${item.color}-400 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}><item.icon className="h-6 w-6" /></div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">{item.title}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-relaxed mb-4">{item.desc}</p>
              </div>
              <div className={`text-${item.color}-600 dark:text-${item.color}-400 font-bold text-[10px] flex items-center gap-1 uppercase tracking-widest relative z-10`}>Khám phá <ArrowRight size={12} /></div>
            </Link>
          ))}

          <Link href="/meet" className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-lg border border-rose-200/50 dark:border-rose-500/30 hover:-translate-y-1 transition-all group flex flex-col justify-between relative overflow-hidden ring-1 ring-rose-500/20">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-rose-400 to-orange-500 text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md"><Video className="h-6 w-6" /></div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">Gizmo Calling</h2>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-relaxed mb-4">Phòng họp trực tuyến miễn phí. Tối ưu cho làm việc nhóm.</p>
            </div>
            <div className="text-rose-500 dark:text-rose-400 font-bold text-[10px] flex items-center gap-1 uppercase tracking-widest relative z-10">Tạo phòng ngay <ArrowRight size={12} /></div>
          </Link>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-200/50 dark:border-slate-800/50 text-center">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">GizmoHUB © 2026 • Ecosystem for Students</p>
      </footer>
    </div>
  );
}