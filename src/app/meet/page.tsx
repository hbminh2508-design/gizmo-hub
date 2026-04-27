// src/app/meet/page.tsx
"use client";

import React, { useState } from 'react';
import { Video, ArrowLeft, Users, Clock, Copy, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MeetLobby() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');

  const createRoom = () => {
    // Tạo một mã phòng ngẫu nhiên và bảo mật
    const randomId = Math.random().toString(36).substring(2, 10);
    router.push(`/meet/gizmo-${randomId}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      // Cho phép dán cả link hoặc chỉ nhập mã
      const code = roomCode.split('/').pop()?.replace(/[^a-zA-Z0-9-]/g, '');
      router.push(`/meet/${code}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 font-bold text-slate-500 hover:text-blue-600 transition bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
        <ArrowLeft size={18} /> Về trang chủ
      </Link>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Cột trái: Thông tin */}
        <div className="space-y-6">
          <div className="bg-rose-100 text-rose-600 w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner">
            <Video size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Phòng Học Nhóm <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Trực Tuyến</span>
          </h1>
          <p className="text-slate-600 font-medium leading-relaxed max-w-md">
            Hệ thống video call được tối ưu hóa cho sinh viên UET. Chỉ cần 1 cú click để tạo phòng, chia sẻ link cho bạn bè và bắt đầu học ngay không cần cài đặt.
          </p>
          
          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <div className="p-2 bg-slate-200/50 rounded-lg"><Users size={18} className="text-blue-600"/></div> Max 20 người
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <div className="p-2 bg-slate-200/50 rounded-lg"><Clock size={18} className="text-rose-600"/></div> 60 phút/phòng
            </div>
          </div>
        </div>

        {/* Cột phải: Form tương tác */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <button 
            onClick={createRoom}
            className="w-full bg-slate-900 text-white font-black text-lg py-5 rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-3 mb-8 group"
          >
            <Video size={24} className="group-hover:scale-110 transition-transform" /> Tạo phòng mới ngay
          </button>

          <div className="relative flex items-center py-2 mb-8">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-slate-300 font-bold text-xs uppercase tracking-widest">Hoặc tham gia</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <form onSubmit={joinRoom} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Nhập mã phòng hoặc dán link..." 
                className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-700 transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={!roomCode.trim()}
              className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 disabled:opacity-50 transition-all"
            >
              Tham gia phòng
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}