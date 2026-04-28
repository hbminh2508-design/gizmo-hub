"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useTheme } from 'next-themes';
import { Star, MessageSquare, Plus, X, ShieldAlert, CheckCircle2, School, ArrowLeft, Loader2, Sun, Moon, BookOpen } from 'lucide-react';

type Review = {
  id: number;
  teacher_name: string;
  course_name: string;
  school_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function GizmoStarsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [teacherName, setTeacherName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Tránh lỗi Hydration
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      fetchApprovedReviews();
    };
    getData();
  }, []);

  const fetchApprovedReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (data) setReviews(data);
    setLoading(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Bạn cần đăng nhập để thực hiện đánh giá!");
      return;
    }
    setSubmitting(true);

    const { error } = await supabase.from('reviews').insert([
      { 
        teacher_name: teacherName, 
        course_name: courseName, 
        school_name: schoolName,
        rating, 
        comment, 
        is_approved: false,
        student_email: user.email 
      }
    ]);

    if (!error) {
      alert("Gửi thành công! Đánh giá đang chờ kiểm duyệt.");
      setShowForm(false);
      setTeacherName('');
      setCourseName('');
      setSchoolName('');
      setComment('');
    }
    setSubmitting(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans relative z-0 overflow-hidden">
      {/* Background Liquid Glass */}
      <div className="fixed inset-0 z-[-1] bg-slate-50 dark:bg-[#0b1120] transition-colors duration-500">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-amber-400/20 dark:bg-amber-600/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-orange-400/20 dark:bg-orange-800/20 blur-[120px] pointer-events-none"></div>
      </div>

      {/* Navbar Kính mờ */}
      <header className="sticky top-0 z-30 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-500 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </Link>
          
          <div className="font-black text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Gizmo<span className="text-amber-500">Stars</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md hidden sm:block"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-slate-900 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all text-sm"
            >
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Viết Đánh Giá</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-grow">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Cộng đồng Đánh giá</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium bg-white/40 dark:bg-slate-800/40 inline-block px-4 py-2 rounded-xl backdrop-blur-md border border-white/50 dark:border-slate-700/50">Những chia sẻ thực tế từ sinh viên các trường đại học.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-amber-500" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold">Chưa có đánh giá nào được duyệt.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 dark:border-slate-700/50 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-5">
                    <div className="h-12 w-12 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-lg uppercase shadow-sm">
                      {rev.teacher_name.charAt(0)}
                    </div>
                    <div className="text-right">
                      <div className="flex gap-0.5 mb-1.5 justify-end">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-2 py-1 rounded-lg uppercase tracking-wider">
                        {rev.school_name}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg mb-1">{rev.teacher_name}</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase mb-4 tracking-wider flex items-center gap-1.5">
                    <BookOpen size={14} /> {rev.course_name}
                  </p>
                  <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl italic text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-white/30 dark:border-slate-700/30">
                    "{rev.comment}"
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50/50 dark:bg-emerald-500/10 inline-flex px-3 py-1.5 rounded-lg border border-emerald-100/50 dark:border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Đã kiểm duyệt
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form - Siêu kính */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative border border-white/50 dark:border-slate-700/50 animate-in slide-in-from-bottom-4">
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition"><X className="h-6 w-6 text-slate-400 dark:text-slate-500" /></button>
              
              <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500 h-6 w-6" /> Đánh giá mới
              </h2>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5">Trường đại học</label>
                    <input required value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-amber-500/50 font-medium dark:text-white placeholder-slate-400 transition-all outline-none" placeholder="VD: UET, HUST..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5">Giảng viên</label>
                    <input required value={teacherName} onChange={e => setTeacherName(e.target.value)} className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-amber-500/50 font-medium dark:text-white placeholder-slate-400 transition-all outline-none" placeholder="Họ tên" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5">Môn học</label>
                    <input required value={courseName} onChange={e => setCourseName(e.target.value)} className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-amber-500/50 font-medium dark:text-white placeholder-slate-400 transition-all outline-none" placeholder="Mã môn" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5">Mức độ hài lòng</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button 
                        key={num} type="button" onClick={() => setRating(num)} 
                        className={`flex-1 py-3 rounded-2xl font-black transition-all border-2 ${rating === num ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-white/50 dark:bg-slate-800/50 border-transparent text-slate-400 dark:text-slate-500 hover:border-amber-200 dark:hover:border-amber-900'}`}
                      >
                        {num} <Star className={`inline h-3 w-3 mb-0.5 ${rating === num ? 'fill-white' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5">Chi tiết đánh giá</label>
                  <textarea required value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-amber-500/50 font-medium dark:text-white placeholder-slate-400 transition-all outline-none resize-none" placeholder="Cảm nhận của bạn về phong cách dạy, mức độ khó của đề thi..." />
                </div>
                
                <button disabled={submitting} className="w-full bg-slate-900 dark:bg-amber-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-amber-600 dark:hover:bg-amber-500 transition-all mt-4">
                  {submitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Gửi Đánh Giá Kín'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}