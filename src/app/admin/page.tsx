"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle, Trash2, Activity, HardDrive, Users, ArrowLeft, Loader2, Server } from 'lucide-react';
import Link from 'next/link';

// Danh sách Email được quyền truy cập trang Admin
const ADMIN_EMAILS = ['hoangbinhminh2508@gmail.com', '25024004@vnu.edu.vn'];

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, docs: 0 });

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
      setIsAdmin(true);
      // Lấy danh sách đánh giá chưa duyệt
      const { data: reviews } = await supabase.from('reviews').select('*').eq('is_approved', false);
      if (reviews) setPendingReviews(reviews);

      // Lấy thống kê cơ bản
      const { count: docsCount } = await supabase.from('documents').select('*', { count: 'exact', head: true });
      setStats({ users: 0, docs: docsCount || 0 }); // Supabase client không đếm được user dễ dàng, ta đếm Docs
    }
    setLoading(false);
  };

  const handleApprove = async (id: number) => {
    await supabase.from('reviews').update({ is_approved: true }).eq('id', id);
    setPendingReviews(pendingReviews.filter(r => r.id !== id));
  };

  const handleDelete = async (id: number) => {
    if (confirm("Xóa vĩnh viễn đánh giá này?")) {
      await supabase.from('reviews').delete().eq('id', id);
      setPendingReviews(pendingReviews.filter(r => r.id !== id));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white flex-col">
        <ShieldCheck className="h-20 w-20 text-red-500 mb-4" />
        <h1 className="text-2xl font-black mb-2">Truy cập bị từ chối</h1>
        <p className="text-slate-400 mb-6">Bạn không có quyền quản trị viên.</p>
        <button onClick={() => router.push('/')} className="bg-blue-600 px-6 py-2 rounded-xl font-bold">Quay lại trang chủ</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span className="font-black text-xl">Admin Panel</span>
          </div>
          <p className="text-xs text-slate-400">GizmoHUB Core</p>
        </div>
        <nav className="p-4 space-y-2 flex-grow">
          <div className="bg-blue-600/20 text-blue-400 px-4 py-3 rounded-xl flex items-center gap-3 font-bold text-sm">
            <CheckCircle className="h-4 w-4" /> Duyệt đánh giá
          </div>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
            <ArrowLeft className="h-4 w-4" /> Thoát trang Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Tổng quan hệ thống</h1>

        {/* Thông số Server giả lập & Docs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><Activity className="h-6 w-6" /></div>
              <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
            </div>
            <p className="text-slate-500 font-medium text-sm">Trạng thái Server (Ping)</p>
            <p className="text-2xl font-black text-slate-900">Ổn định (12ms)</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600 w-fit mb-4"><HardDrive className="h-6 w-6" /></div>
            <p className="text-slate-500 font-medium text-sm">Tổng tài liệu lưu trữ</p>
            <p className="text-2xl font-black text-slate-900">{stats.docs} Files</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600 w-fit mb-4"><Server className="h-6 w-6" /></div>
            <p className="text-slate-500 font-medium text-sm">Dung lượng Supabase</p>
            <p className="text-2xl font-black text-slate-900">Quản lý trên Supabase</p>
          </div>
        </div>

        {/* Khu vực duyệt bài */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            Hàng đợi kiểm duyệt ({pendingReviews.length})
          </h2>

          {pendingReviews.length === 0 ? (
            <div className="text-center py-10 text-slate-500">Không có bài đánh giá nào cần duyệt.</div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map(rev => (
                <div key={rev.id} className="border border-slate-100 p-5 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{rev.teacher_name}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase font-bold">{rev.course_name}</span>
                    </div>
                    <p className="text-sm text-slate-600 italic mb-2">"{rev.comment}"</p>
                    <p className="text-xs text-slate-400 font-medium">Gửi bởi: {rev.student_email}</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => handleApprove(rev.id)} className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition">
                      <CheckCircle className="h-4 w-4" /> Duyệt
                    </button>
                    <button onClick={() => handleDelete(rev.id)} className="flex-1 md:flex-none bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition">
                      <Trash2 className="h-4 w-4" /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}