// src/app/meet/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Users, Clock, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function MeetingRoom() {
  const { id } = useParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 phút = 3600 giây

  // Xử lý đếm ngược thời gian 60 phút
  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Đã hết 60 phút giới hạn. Cảm ơn bạn đã sử dụng GizmoHUB Video Call!");
      router.push('/meet');
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, router]);

  // Format thời gian hiển thị (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden font-sans">
      {/* Header Room */}
      <header className="bg-slate-800 border-b border-slate-700 h-16 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/meet" className="text-slate-400 hover:text-white transition-colors bg-slate-700/50 p-2 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-white font-bold text-sm sm:text-base hidden sm:block">Phòng: {id}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Trực tuyến
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Cảnh báo khi còn dưới 5 phút */}
          {timeLeft < 300 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-400/10 px-3 py-1.5 rounded-lg border border-rose-400/20">
              <AlertCircle size={14} /> Sắp hết giờ
            </div>
          )}

          <div className={`flex items-center gap-2 font-mono font-bold px-4 py-2 rounded-xl text-sm transition-colors ${timeLeft < 300 ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
            <Clock size={16} /> {formatTime(timeLeft)}
          </div>

          <button 
            onClick={copyLink}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span className="hidden sm:inline">{copied ? "Đã chép link" : "Mời bạn bè"}</span>
          </button>
        </div>
      </header>

      {/* Main Video Call Area (Nhúng Jitsi Meet qua Iframe - Ổn định nhất, không cần cài thư viện) */}
      <main className="flex-grow relative bg-black w-full h-full">
        <iframe
          src={`https://meet.jit.si/${id}#config.prejoinPageEnabled=false&config.disableDeepLinking=true`}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-full border-none"
          style={{ height: '100%', width: '100%' }}
        />
      </main>
    </div>
  );
}