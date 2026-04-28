"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useTheme } from 'next-themes';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, X, ArrowLeft, Trash2, BellRing, Loader2, Sun, Moon } from 'lucide-react';

type Schedule = {
  id: number;
  subject_name: string;
  day_of_week: string;
  start_time: string;
  location: string;
};

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export default function GizmoCalendarPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [permission, setPermission] = useState('default');
  
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState('Thứ 2');
  const [time, setTime] = useState('');
  const [room, setRoom] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(window.Notification.permission);
    }

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchSchedules(user.id);
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const fetchSchedules = async (userId: string) => {
    const { data } = await supabase.from('schedules').select('*').eq('user_id', userId).order('start_time', { ascending: true });
    if (data) setSchedules(data);
    setLoading(false);
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('schedules').insert([{ user_id: user.id, subject_name: subject, day_of_week: day, start_time: time, location: room }]);
    if (!error) {
      setShowAdd(false);
      setSubject(''); setTime(''); setRoom('');
      fetchSchedules(user.id);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa tiết học này không?")) {
      await supabase.from('schedules').delete().eq('id', id);
      fetchSchedules(user.id);
    }
  };

  const requestNotification = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("Trình duyệt trên thiết bị của bạn hiện không hỗ trợ tính năng thông báo này!");
      return;
    }
    window.Notification.requestPermission().then((perm) => {
      setPermission(perm);
      if (perm === "granted") {
        new window.Notification("GizmoHUB", { body: "Tuyệt vời! Bạn sẽ nhận được nhắc nhở lịch học." });
      }
    });
  };

  // Màn hình chờ khi chưa đăng nhập
  if (!loading && !user && mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1120] p-4 transition-colors duration-500">
        <div className="text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-10 rounded-[2.5rem] shadow-2xl max-w-sm">
          <CalendarIcon className="h-16 w-16 text-purple-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Gizmo Calendar</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Vui lòng đăng nhập để xem lịch học cá nhân của bạn.</p>
          <Link href="/login" className="block bg-slate-900 dark:bg-purple-600 hover:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg">Đăng nhập ngay</Link>
        </div>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans relative z-0 overflow-hidden">
      {/* Background Liquid Glass */}
      <div className="fixed inset-0 z-[-1] bg-slate-50 dark:bg-[#0b1120] transition-colors duration-500">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[30%] rounded-full bg-fuchsia-400/20 dark:bg-fuchsia-800/20 blur-[100px] pointer-events-none"></div>
      </div>

      {/* Navbar Kính mờ */}
      <header className="sticky top-0 z-30 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-500 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </Link>
          
          <div className="font-black text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Gizmo<span className="text-purple-500">Calendar</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md hidden sm:block"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-700/50 shadow-sm">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Thời Khóa Biểu</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <UserAvatar email={user?.email} /> {user?.email?.split('@')[0]}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={requestNotification} 
                className={`px-5 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all border ${permission === 'granted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'}`}
              >
                <BellRing className="h-5 w-5" /> {permission === 'granted' ? 'Đã bật nhắc nhở' : 'Bật nhắc nhở'}
              </button>
              <button 
                onClick={() => setShowAdd(true)} 
                className="bg-slate-900 dark:bg-purple-600 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-purple-600 dark:hover:bg-purple-500 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5" /> Thêm tiết học
              </button>
            </div>
          </div>

          {/* Schedule List */}
          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-purple-500" /></div>
          ) : (
            <div className="space-y-10">
              {DAYS.map((dayLabel) => {
                const daySchedules = schedules.filter(s => s.day_of_week === dayLabel);
                if (daySchedules.length === 0) return null;
                return (
                  <div key={dayLabel} className="animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-5 flex items-center gap-3 ml-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>{dayLabel}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {daySchedules.map((item) => (
                        <div key={item.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between group hover:shadow-xl hover:border-purple-300/50 dark:hover:border-purple-500/50 hover:-translate-y-1 transition-all relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-center gap-5 relative z-10">
                            <div className="bg-purple-100 dark:bg-purple-500/20 p-3.5 rounded-2xl text-purple-600 dark:text-purple-400 shadow-sm"><Clock className="h-6 w-6" /></div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">{item.subject_name}</h3>
                              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50"><Clock className="h-3.5 w-3.5 text-purple-500" /> {item.start_time.slice(0, 5)}</span>
                                <span className="flex items-center gap-1 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50"><MapPin className="h-3.5 w-3.5 text-rose-500" /> {item.location}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleDelete(item.id)} className="relative z-10 p-2.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all" title="Xóa tiết học">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {schedules.length === 0 && (
                <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold">
                  Chưa có lịch học nào. Hãy thêm tiết học đầu tiên của bạn!
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal Form Thêm Lịch - Siêu Kính */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-white/50 dark:border-slate-700/50 animate-in slide-in-from-bottom-4">
            <button onClick={() => setShowAdd(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition"><X className="h-6 w-6 text-slate-400 dark:text-slate-500" /></button>
            <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="text-purple-500 h-6 w-6" /> Thêm tiết học
            </h2>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5">Môn học</label>
                <input required value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-purple-500/50 font-medium dark:text-white placeholder-slate-400 transition-all outline-none" placeholder="VD: Giải tích 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5">Ngày trong tuần</label>
                  <select value={day} onChange={e => setDay(e.target.value)} className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-purple-500/50 font-medium dark:text-white transition-all outline-none">
                    {DAYS.map(d => <option key={d} value={d} className="dark:bg-slate-800">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5">Giờ bắt đầu</label>
                  <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-purple-500/50 font-medium dark:text-white transition-all outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5">Phòng học</label>
                <input required value={room} onChange={e => setRoom(e.target.value)} className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-purple-500/50 font-medium dark:text-white placeholder-slate-400 transition-all outline-none" placeholder="VD: G3-201" />
              </div>
              <button disabled={submitting} className="w-full bg-slate-900 dark:bg-purple-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-purple-600 dark:hover:bg-purple-500 transition-all mt-6">
                {submitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Lưu lịch học'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component nhỏ để hiển thị Avatar chữ cái
function UserAvatar({ email }: { email?: string }) {
  if (!email) return null;
  return (
    <span className="h-5 w-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black">
      {email.charAt(0).toUpperCase()}
    </span>
  );
}