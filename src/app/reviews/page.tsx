"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { Star, MessageSquare, Plus, X, ShieldAlert, CheckCircle2, School, ArrowLeft, Loader2 } from 'lucide-react';

type Review = {
  id: number;
  teacher_name: string;
  course_name: string;
  school_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function ReviewsPage() {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 py-4 sticky top-0 z-30 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm">
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </Link>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all text-sm"
          >
            <Plus className="h-4 w-4" /> Viết Đánh Giá
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Cộng đồng Đánh giá</h1>
          <p className="text-slate-500 font-medium">Những chia sẻ thực tế từ sinh viên các trường đại học.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold uppercase">
                    {rev.teacher_name.charAt(0)}
                  </div>
                  <div className="text-right">
                    <div className="flex gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                      {rev.school_name}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{rev.teacher_name}</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-wider">{rev.course_name}</p>
                <div className="bg-slate-50 p-4 rounded-2xl italic text-sm text-slate-600 leading-relaxed">
                  "{rev.comment}"
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                  <CheckCircle2 className="h-3 w-3" /> Kiểm duyệt bởi sinh viên uy tín
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative">
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition"><X className="h-6 w-6 text-slate-400" /></button>
              <h2 className="text-2xl font-black mb-6">Đánh giá mới</h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Trường đại học</label>
                    <input required value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium" placeholder="VD: UET, HUST..." />
                  </div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Giảng viên</label>
                    <input required value={teacherName} onChange={e => setTeacherName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Họ tên" />
                  </div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Môn học</label>
                    <input required value={courseName} onChange={e => setCourseName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Mã môn" />
                  </div>
                </div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Số sao</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button key={num} type="button" onClick={() => setRating(num)} className={`flex-1 py-2 rounded-xl border-2 font-black transition-all ${rating === num ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-100 text-slate-400'}`}>{num}</button>
                    ))}
                  </div>
                </div>
                <textarea required value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Cảm nhận của bạn về phong cách dạy, đề thi..." />
                <button disabled={submitting} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg mt-2">{submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}