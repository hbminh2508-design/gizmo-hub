"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { User, Mail, ShieldCheck, ArrowLeft, Clock, Award, Edit3, Save, X, BookOpen, GraduationCap } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // States cho Form
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || '');
        setMajor(user.user_metadata?.major || '');
        setBio(user.user_metadata?.bio || '');
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: fullName, major: major, bio: bio }
    });

    if (!error && data.user) {
      setUser(data.user);
      setIsEditing(false);
      alert("Đã cập nhật hồ sơ thành công!");
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 py-4 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Hồ sơ của tôi</h1>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition">
              <Edit3 className="h-4 w-4" /> Chỉnh sửa
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Card Thông tin chính */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          <div className="relative z-10 pt-16 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-black">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-grow w-full">
              {isEditing ? (
                <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Họ và tên</label>
                    <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200" placeholder="Nguyễn Văn A" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Chuyên ngành</label>
                    <input value={major} onChange={e => setMajor(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200" placeholder="VD: Khoa học máy tính" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Giới thiệu bản thân</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} className="w-full px-4 py-2 rounded-xl border border-slate-200" placeholder="Vài nét về bạn..." />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveProfile} disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex gap-2 items-center">
                      <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex gap-2 items-center">
                      <X className="h-4 w-4" /> Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-black text-slate-900">{user.user_metadata?.full_name || user.email?.split('@')[0]}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium">
                    <div className="flex items-center gap-1.5 text-slate-500"><Mail className="h-4 w-4" /> {user.email}</div>
                    {user.user_metadata?.major && (
                      <div className="flex items-center gap-1.5 text-blue-600"><GraduationCap className="h-4 w-4" /> {user.user_metadata.major}</div>
                    )}
                  </div>
                  {user.user_metadata?.bio && (
                    <p className="mt-4 text-slate-600 italic bg-slate-50 p-4 rounded-xl">"{user.user_metadata.bio}"</p>
                  )}
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <ShieldCheck className="h-4 w-4" /> Sinh viên xác thực
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Các tính năng phong phú khác */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-4"><Clock className="h-6 w-6" /></div>
            <p className="text-slate-500 text-sm font-medium">Ngày tham gia</p>
            <p className="text-lg font-bold text-slate-900">{new Date(user.created_at).toLocaleDateString('vi-VN')}</p>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="bg-amber-50 w-12 h-12 rounded-xl flex items-center justify-center text-amber-500 mb-4"><Award className="h-6 w-6" /></div>
            <p className="text-slate-500 text-sm font-medium">Điểm cống hiến</p>
            <p className="text-lg font-bold text-slate-900">150 SP</p>
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">Sắp ra mắt</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-600 mb-4"><BookOpen className="h-6 w-6" /></div>
            <p className="text-slate-500 text-sm font-medium">Tài liệu đã chia sẻ</p>
            <p className="text-lg font-bold text-slate-900">0 files</p>
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">Sắp ra mắt</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}