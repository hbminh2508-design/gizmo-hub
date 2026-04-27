"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, X, BookOpen, ArrowLeft, Trash2, BellRing } from 'lucide-react';

type Schedule = {
  id: number;
  subject_name: string;
  day_of_week: string;
  start_time: string;
  location: string;
};

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Sửa lỗi: Khởi tạo mặc định an toàn, không gọi Notification ngay lập tức
  const [permission, setPermission] = useState('default');
  
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState('Thứ 2');
  const [time, setTime] = useState('');
  const [room, setRoom] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Sửa lỗi: Chỉ kiểm tra quyền thông báo khi giao diện đã tải xong và trình duyệt có hỗ trợ
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
    // Sửa lỗi: Kiểm tra an toàn trước khi gọi Notification
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

  if (!loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center bg-white p-8 rounded-[2.5rem] shadow-xl max-w-sm">
          <Link href="/login" className="block bg-blue-600 text-white font-bold py-3 rounded-xl">Vui lòng đăng nhập</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10"><div className="bg-blue-600 p-1.5 rounded-lg"><BookOpen className="h-5 w-5 text-white" /></div><span className="font-black text-lg text-slate-900 tracking-tighter">GizmoHUB</span></div>
        <nav className="space-y-1">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-blue-600 font-bold text-sm"><ArrowLeft className="h-4 w-4" /> Quay lại chủ</Link>
          <div className="px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center gap-3"><CalendarIcon className="h-4 w-4" /> Lịch học</div>
        </nav>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-1">Thời Khóa Biểu</h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{user?.email?.split('@')[0]}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={requestNotification} className={`px-4 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${permission === 'granted' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                <BellRing className="h-5 w-5" /> {permission === 'granted' ? 'Đã bật thông báo' : 'Bật thông báo'}
              </button>
              <button onClick={() => setShowAdd(true)} className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all"><Plus className="h-5 w-5" /> Thêm</button>
            </div>
          </div>

          <div className="space-y-8">
            {DAYS.map((dayLabel) => {
              const daySchedules = schedules.filter(s => s.day_of_week === dayLabel);
              if (daySchedules.length === 0) return null;
              return (
                <div key={dayLabel} className="animate-in fade-in slide-in-from-bottom-2">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>{dayLabel}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {daySchedules.map((item) => (
                      <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-50 p-3 rounded-xl text-slate-400"><Clock className="h-5 w-5" /></div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{item.subject_name}</h3>
                            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.start_time.slice(0, 5)}</span>
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Xóa">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowAdd(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition"><X className="h-6 w-6 text-slate-400" /></button>
            <h2 className="text-2xl font-black mb-6">Thêm tiết học</h2>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <input required value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold" placeholder="Môn học (VD: Giải tích 1)" />
              <div className="grid grid-cols-2 gap-4">
                <select value={day} onChange={e => setDay(e.target.value)} className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold">{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold" />
              </div>
              <input required value={room} onChange={e => setRoom(e.target.value)} className="w-full px-5 py-3 bg-slate-50 rounded-xl font-bold" placeholder="Phòng học (VD: G3-201)" />
              <button disabled={submitting} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg mt-4">{submitting ? 'Đang lưu...' : 'Lưu lịch học'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}