"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useTheme } from 'next-themes';
import { 
  ArrowLeft, Sun, Moon, User, Mail, MapPin, Loader2, Edit3, Rss, Star, 
  ShieldCheck, GraduationCap, Users, Globe, Camera, PlaySquare, Music2, 
  MessageCircle, Award, X, Camera as CameraIcon, CheckCircle2
} from 'lucide-react';

function ProfileContent() {
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetEmail = searchParams.get('user');

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  
  // States cho Chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    setMounted(true);
    const initProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      const emailToShow = targetEmail || user?.email;
      if (!emailToShow) { router.push('/login'); return; }

      // Fetch Profile, Posts và đóng góp cùng lúc
      const [pRes, postsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('email', emailToShow).single(),
        supabase.from('posts').select('*').eq('user_email', emailToShow).order('created_at', { ascending: false })
      ]);

      if (pRes.data) {
        setProfileData(pRes.data);
        setFormData(pRes.data);
      } else {
        // Nếu chưa có profile trong DB, tạo object rỗng với email
        setProfileData({ email: emailToShow });
        setFormData({ email: emailToShow });
      }

      if (postsRes.data) setUserPosts(postsRes.data);
      setLoading(false);
    };
    initProfile();
  }, [targetEmail, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      ...formData,
      email: profileData.email,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    if (!error) {
      setProfileData(formData);
      setIsEditing(false);
    } else {
      alert("Lỗi lưu dữ liệu: " + error.message);
    }
    setSaving(false);
  };

  if (!mounted || loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1120]"><Loader2 className="animate-spin text-indigo-500 h-10 w-10" /></div>;

  const isMyProfile = currentUser?.email === profileData?.email;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] font-sans relative overflow-x-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <nav className="sticky top-0 z-[100] bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <span className="font-black text-xl tracking-tight dark:text-white">Gizmo<span className="text-indigo-500">Profile</span></span>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto py-8 px-4 space-y-8">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-white dark:border-slate-800 overflow-hidden">
          <div className="h-32 md:h-48 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />
          <div className="px-6 md:px-12 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end -mt-12 md:-mt-16 gap-6">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-[6px] border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-2xl overflow-hidden flex items-center justify-center text-5xl font-black text-indigo-500">
                  {profileData?.avatar_url ? (
                    <img src={profileData.avatar_url} className="w-full h-full object-cover" alt="Avt" />
                  ) : (profileData?.full_name?.[0] || profileData?.email?.[0] || '?').toUpperCase()}
                </div>
              </div>
              {isMyProfile && (
                <button onClick={() => setIsEditing(true)} className="bg-slate-900 dark:bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Edit3 size={18} /> Chỉnh sửa
                </button>
              )}
            </div>

            <div className="mt-8 text-center md:text-left space-y-4">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight dark:text-white flex items-center justify-center md:justify-start gap-3">
                {profileData?.full_name || "Thành viên mới"}
                <CheckCircle2 className="text-indigo-500" size={24} />
              </h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-bold text-slate-500">
                <span className="flex items-center gap-1.5"><Mail size={16} /> {profileData?.email}</span>
                {profileData?.university && <span className="flex items-center gap-1.5"><MapPin size={16} /> {profileData.university}</span>}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                {profileData?.major && <div className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-500/20 font-bold text-xs uppercase tracking-wider">{profileData.major}</div>}
                {profileData?.clubs && <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20 font-bold text-xs uppercase tracking-wider">{profileData.clubs}</div>}
              </div>

              {/* Social Links */}
              <div className="flex justify-center md:justify-start gap-3 pt-4">
                {[
                  { key: 'facebook', icon: Globe, color: 'text-blue-600' },
                  { key: 'instagram', icon: Camera, color: 'text-pink-600' },
                  { key: 'tiktok', icon: Music2, color: 'text-slate-900 dark:text-white' },
                  { key: 'youtube', icon: PlaySquare, color: 'text-red-600' },
                  { key: 'zalo', icon: MessageCircle, color: 'text-sky-500' }
                ].map(social => profileData?.[social.key] && (
                  <a key={social.key} href={profileData[social.key]} target="_blank" rel="noreferrer" className={`p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-all ${social.color}`}>
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200/50 dark:border-slate-800">
              <h3 className="font-black text-lg mb-6 flex items-center gap-2 dark:text-white"><Award className="text-amber-500" /> Thành tích</h3>
              <div className="space-y-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-sm">Bài viết</span>
                  <span className="text-2xl font-black text-indigo-600">{userPosts.length}</span>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-sm">Điểm cống hiến</span>
                  <span className="text-2xl font-black text-amber-600">{userPosts.length * 10}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-black text-xl px-4 flex items-center gap-2 dark:text-white"><Rss className="text-indigo-500" /> Hoạt động gần đây</h3>
            {userPosts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-20 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 font-bold">Chưa có hoạt động công khai.</div>
            ) : (
              userPosts.map(post => (
                <div key={post.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString('vi-VN')}</div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{post.content}</p>
                  {post.image_url && <img src={post.image_url} alt="Post" className="w-full max-h-80 object-cover rounded-3xl border border-slate-100 dark:border-slate-800" />}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* New Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsEditing(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-8 md:p-10 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black dark:text-white">Chỉnh sửa hồ sơ</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <section className="space-y-4">
                <div className="text-xs font-black text-indigo-500 uppercase tracking-widest">Thông tin cá nhân</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Họ và Tên" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-indigo-500 font-bold dark:text-white" />
                  <input value={formData.university || ''} onChange={e => setFormData({...formData, university: e.target.value})} placeholder="Trường Đại học" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-indigo-500 font-bold dark:text-white" />
                  <input value={formData.major || ''} onChange={e => setFormData({...formData, major: e.target.value})} placeholder="Chuyên ngành" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-indigo-500 font-bold dark:text-white" />
                  <input value={formData.clubs || ''} onChange={e => setFormData({...formData, clubs: e.target.value})} placeholder="Câu lạc bộ" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-indigo-500 font-bold dark:text-white" />
                </div>
              </section>

              <section className="space-y-4">
                <div className="text-xs font-black text-rose-500 uppercase tracking-widest">Liên kết xã hội</div>
                <div className="space-y-3">
                  <div className="relative"><Globe className="absolute left-4 top-4 text-blue-600" size={18} /><input value={formData.facebook || ''} onChange={e => setFormData({...formData, facebook: e.target.value})} placeholder="Link Facebook" className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white" /></div>
                  <div className="relative"><Camera className="absolute left-4 top-4 text-pink-600" size={18} /><input value={formData.instagram || ''} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="Link Instagram" className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white" /></div>
                  <div className="relative"><Music2 className="absolute left-4 top-4 text-slate-400" size={18} /><input value={formData.tiktok || ''} onChange={e => setFormData({...formData, tiktok: e.target.value})} placeholder="Link TikTok" className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white" /></div>
                  <div className="relative"><MessageCircle className="absolute left-4 top-4 text-sky-500" size={18} /><input value={formData.zalo || ''} onChange={e => setFormData({...formData, zalo: e.target.value})} placeholder="Link Zalo hoặc Số điện thoại" className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white" /></div>
                </div>
              </section>

              <button disabled={saving} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} /> Lưu hồ sơ ngay</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return <Suspense><ProfileContent /></Suspense>;
}