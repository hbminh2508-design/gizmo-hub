"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useTheme } from 'next-themes';
import { 
  Send, ArrowLeft, MessageCircle, Paperclip, 
  Trash2, FileText, Loader2, X, Sun, Moon 
} from 'lucide-react';

type Message = {
  id: number;
  sender_email: string;
  content: string;
  file_url?: string;
  file_type?: 'image' | 'file';
  created_at: string;
};

export default function GizmoMessagePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (data) setMessages(data);
      setLoading(false);

      const channelName = `realtime-chat-${Date.now()}`;
      const channel = supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    initChat();
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt?.toLowerCase() || '');

    const { data, error } = await supabase.storage.from('chat-attachments').upload(fileName, file);

    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('chat-attachments').getPublicUrl(fileName);
      await supabase.from('messages').insert([{
        sender_email: user.email,
        content: file.name,
        file_url: publicUrl,
        file_type: isImage ? 'image' : 'file'
      }]);
    }
    setUploading(false);
  };

  const deleteMessage = async (id: number, createdAt: string) => {
    const sentTime = new Date(createdAt).getTime();
    const now = new Date().getTime();
    if (now - sentTime > 5 * 60 * 1000) {
      alert("Đã quá 5 phút, bạn không thể xóa tin nhắn này!");
      return;
    }
    await supabase.from('messages').delete().eq('id', id);
  };

  // Màn hình đăng nhập
  if (!loading && !user && mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1120] p-4 transition-colors duration-500">
        <div className="text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-10 rounded-[2.5rem] shadow-2xl max-w-sm">
          <MessageCircle className="h-16 w-16 text-sky-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Gizmo Message</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Vui lòng đăng nhập để tham gia trò chuyện cùng cộng đồng.</p>
          <Link href="/login" className="block bg-slate-900 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg">Đăng nhập ngay</Link>
        </div>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <div className="h-screen flex flex-col font-sans relative z-0 overflow-hidden">
      {/* Background Liquid Glass */}
      <div className="fixed inset-0 z-[-1] bg-slate-50 dark:bg-[#0b1120] transition-colors duration-500">
        <div className="absolute top-[30%] left-[20%] w-[50%] h-[50%] rounded-full bg-sky-400/20 dark:bg-sky-600/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-400/20 dark:bg-blue-800/20 blur-[100px] pointer-events-none"></div>
      </div>

      {/* Header Kính mờ */}
      <header className="bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30 transition-all duration-500">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
          <ArrowLeft size={18} /> <span className="hidden sm:inline">Trang chủ</span>
        </Link>
        
        <div className="flex flex-col items-center">
          <span className="font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight text-lg">
            Gizmo<span className="text-sky-500">Message</span>
          </span>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Trực tuyến
          </span>
        </div>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Khu vực tin nhắn chính */}
      <main className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
        {loading ? (
           <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-sky-500 h-10 w-10" /></div>
        ) : messages.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
             <div className="bg-sky-50 dark:bg-sky-500/10 p-6 rounded-[2rem] mb-4">
               <MessageCircle className="h-16 w-16 text-sky-500/50" />
             </div>
             <p className="font-bold">Chưa có tin nhắn nào. Mở lời ngay!</p>
           </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_email === user?.email;
            const isConsecutive = index > 0 && messages[index - 1].sender_email === msg.sender_email;
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2`}>
                {!isMe && !isConsecutive && <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-1 ml-2 uppercase tracking-wider">{msg.sender_email.split('@')[0]}</span>}
                
                <div className={`flex items-center gap-2 ${isConsecutive ? 'mt-[-12px]' : ''}`}>
                  {isMe && (
                    <button onClick={() => deleteMessage(msg.id, msg.created_at)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-all rounded-full hover:bg-red-50 dark:hover:bg-red-500/10">
                      <Trash2 size={16} />
                    </button>
                  )}
                  
                  <div className={`p-1.5 rounded-[1.5rem] max-w-[85vw] md:max-w-md shadow-sm border backdrop-blur-md ${isMe ? 'bg-sky-600 dark:bg-sky-600 text-white border-sky-500 dark:border-sky-500 rounded-br-sm' : 'bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-white/50 dark:border-slate-700/50 rounded-bl-sm'}`}>
                    {msg.file_url ? (
                      msg.file_type === 'image' ? (
                        <img 
                          src={msg.file_url} 
                          className="rounded-3xl max-h-60 w-auto object-cover cursor-zoom-in hover:opacity-90 transition-opacity border border-black/5 dark:border-white/5" 
                          alt="attachment" 
                          onClick={() => window.open(msg.file_url)} 
                        />
                      ) : (
                        <a 
                          href={msg.file_url} 
                          target="_blank" rel="noreferrer"
                          className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isMe ? 'hover:bg-black/10' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                          <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isMe ? 'bg-white text-sky-600' : 'bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400'}`}>
                            {msg.content.toLowerCase().endsWith('.pdf') ? <span className="text-[10px] font-black uppercase tracking-tighter">PDF</span> :
                             (msg.content.toLowerCase().endsWith('.zip') || msg.content.toLowerCase().endsWith('.rar')) ? <span className="text-[10px] font-black uppercase tracking-tighter">ZIP</span> :
                             <FileText size={20} />}
                          </div>
                          <div className="flex flex-col overflow-hidden pr-2">
                            <span className="text-sm font-bold truncate max-w-[180px]">{msg.content}</span>
                            <span className={`text-[10px] font-medium mt-0.5 ${isMe ? 'text-sky-100' : 'text-slate-400 dark:text-slate-400'}`}>Nhấn để tải về thiết bị</span>
                          </div>
                        </a>
                      )
                    ) : (
                      <p className="text-[15px] px-4 py-2.5 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Input Chat - Liquid Glass Form */}
      <footer className="p-4 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 relative z-20 transition-all duration-500">
        <form onSubmit={(e) => { e.preventDefault(); if (newMessage.trim()) { supabase.from('messages').insert([{ sender_email: user.email, content: newMessage }]); setNewMessage(''); }}} className="flex items-end gap-3 max-w-4xl mx-auto relative">
          
          <label className="p-4 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full cursor-pointer transition-all shrink-0 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            {uploading ? <Loader2 className="animate-spin text-sky-500" size={20} /> : <Paperclip size={20} />}
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
          
          <textarea 
            value={newMessage} 
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (newMessage.trim()) {
                  supabase.from('messages').insert([{ sender_email: user.email, content: newMessage }]);
                  setNewMessage('');
                }
              }
            }}
            className="flex-grow bg-white/80 dark:bg-slate-800/80 px-6 py-4 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all resize-none max-h-32 text-[15px] font-medium dark:text-white border border-slate-200/50 dark:border-slate-700/50 shadow-sm placeholder-slate-400" 
            placeholder="Nhập tin nhắn..." 
            rows={1}
            disabled={uploading}
          />
          
          <button 
            type="submit" 
            disabled={!newMessage.trim() || uploading}
            className="bg-sky-600 disabled:bg-sky-300 dark:disabled:bg-sky-800 text-white p-4 rounded-full shadow-lg shadow-sky-500/30 active:scale-95 transition-all shrink-0 flex items-center justify-center border border-sky-500/50"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </form>
      </footer>
    </div>
  );
}