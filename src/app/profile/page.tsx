"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, Edit3, Camera, Check, X, ShieldCheck, 
  Award, Clock, BookOpen, Loader2, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // States cho chế độ chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', class_name: '', bio: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Lấy thông tin từ bảng profiles
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      if (data) {
        setProfile(data);
        setEditForm({ full_name: data.full_name || '', class_name: data.class_name || '', bio: data.bio || '' });
      } else {
        // Nếu chưa có profile, tạo một cái mặc định
        const defaultName = user.email?.split('@')[0] || 'Sinh viên';
        const newProfile = { id: user.id, email: user.email, full_name: defaultName, bio: 'Là một sinh viên yêu khoa học.' };
        await supabase.from('profiles').insert([newProfile]);
        setProfile(newProfile);
        setEditForm({ full_name: defaultName, class_name: '', bio: newProfile.bio });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  // Hàm Lưu thông tin
  const handleSaveProfile = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      full_name: editForm.full_name,
      class_name: editForm.class_name,
      bio: editForm.bio
    }).eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
    }
    setLoading(false);
  };

  // Hàm Đổi Ảnh Đại Diện
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      setProfile({ ...profile, avatar_url: publicUrl });
    }
    setUploadingAvatar(false);
  };

  if (loading && !profile) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      <header className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-3 bg-white hover:bg-slate-100 rounded-2xl shadow-sm transition-all text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Hồ sơ của tôi</h1>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100 font-bold text-slate-700 hover:text-blue-600 transition-all">
            <Edit3 size={18} /> Chỉnh sửa
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-slate-100 px-4 py-2.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-all">
              <X size={18} /> Hủy
            </button>
            <button onClick={handleSaveProfile} className="flex items-center gap-2 bg-blue-600 px-5 py-2.5 rounded-2xl font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} Lưu
            </button>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4">
        {/* Khung Cover & Avatar */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
          </div>
          
          <div className="px-8 pb-8 relative">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4 inline-block">
              <div className="h-32 w-32 bg-white rounded-full p-1.5 shadow-xl">
                <div className="h-full w-full bg-slate-100 rounded-full overflow-hidden flex items-center justify-center text-4xl font-black text-blue-600 relative group">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="h-full w-full object-cover" alt="avatar" />
                  ) : (
                    profile?.full_name?.charAt(0).toUpperCase() || '?'
                  )}
                  
                  {/* Overlay upload ảnh */}
                  <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                    {uploadingAvatar ? <Loader2 className="animate-spin mb-1" /> : <Camera size={24} className="mb-1" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{uploadingAvatar ? 'Đang tải...' : 'Đổi ảnh'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                  </label>
                </div>
              </div>
            </div>

            {/* Thông tin Text */}
            <div className="max-w-2xl">
              {isEditing ? (
                <div className="space-y-4 animate-in fade-in">
                  <input 
                    value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                    className="w-full text-3xl font-black text-slate-900 border-b-2 border-blue-500 bg-slate-50 px-4 py-2 rounded-t-xl focus:outline-none" placeholder="Họ và tên..."
                  />
                  <div className="flex gap-4">
                    <input 
                      value={editForm.class_name} onChange={e => setEditForm({...editForm, class_name: e.target.value})}
                      className="w-1/2 text-sm font-bold text-slate-600 border-b-2 border-slate-300 bg-slate-50 px-4 py-2 focus:border-blue-500 focus:outline-none rounded-t-xl" placeholder="Lớp / Khoa (VD: QH2025-I/CQ)..."
                    />
                  </div>
                  <textarea 
                    value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full text-slate-600 bg-slate-50 p-4 rounded-xl border-2 border-transparent focus:border-blue-500 focus:outline-none min-h-[100px]" placeholder="Viết gì đó về bạn..."
                  />
                </div>
              ) : (
                <div className="animate-in fade-in">
                  <h2 className="text-3xl font-black text-slate-900 mb-1 flex items-center gap-3">
                    {profile?.full_name}
                  </h2>
                  <div className="flex items-center gap-4 text-sm font-bold text-slate-500 mb-4">
                    <span>{user?.email}</span>
                    {profile?.class_name && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{profile.class_name}</span>
                      </>
                    )}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block mb-4">
                    <p className="text-slate-600 italic font-medium">"{profile?.bio || 'Chưa có tiểu sử.'}"</p>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest">
                      <ShieldCheck size={16} /> Sinh viên xác thực
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Khung Thống kê (Stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0"><Clock size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ngày tham gia</p>
              <p className="text-xl font-black text-slate-900">{new Date(profile?.created_at || Date.now()).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shrink-0"><Award size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Điểm cống hiến</p>
              <p className="text-xl font-black text-slate-900 flex items-center gap-1">150 <span className="text-sm font-bold text-amber-500">SP</span></p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0"><BookOpen size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tài liệu đã chia sẻ</p>
              <p className="text-xl font-black text-slate-900">0 <span className="text-sm font-bold text-slate-400">files</span></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}