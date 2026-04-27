"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { 
  Send, ArrowLeft, MessageCircle, Paperclip, 
  Trash2, FileText, Image as ImageIcon, Loader2, X 
} from 'lucide-react';

type Message = {
  id: number;
  sender_email: string;
  content: string;
  file_url?: string;
  file_type?: 'image' | 'file';
  created_at: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Lấy lịch sử tin nhắn
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (data) setMessages(data);
      setLoading(false);

      // SỬA LỖI TẠI ĐÂY: Thêm Date.now() để tên channel luôn là duy nhất, tránh kẹt cache của React Strict Mode
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
        content: file.name, // Lưu tên file vào content để hiển thị
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

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b p-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-500 hover:text-blue-600 transition bg-slate-100 px-3 py-2 rounded-xl">
          <ArrowLeft size={18} /> Quay lại
        </Link>
        <div className="flex flex-col items-center">
          <span className="font-black text-slate-900 flex items-center gap-2">
            <MessageCircle className="text-blue-600" size={20} /> Phòng Chat
          </span>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Trực tuyến
          </span>
        </div>
        <div className="w-20"></div> {/* Spacer để cân bằng Header */}
      </header>

      <main className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
        {loading ? (
           <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>
        ) : messages.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
             <p className="font-bold">Chưa có tin nhắn nào. Bắt đầu trò chuyện!</p>
           </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_email === user?.email;
            const isConsecutive = index > 0 && messages[index - 1].sender_email === msg.sender_email;
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                {!isMe && !isConsecutive && <span className="text-[10px] font-black text-slate-400 mb-1 ml-1 uppercase tracking-wider">{msg.sender_email.split('@')[0]}</span>}
                
                <div className={`flex items-center gap-2 ${isConsecutive ? 'mt-[-12px]' : ''}`}>
                  {isMe && (
                    <button onClick={() => deleteMessage(msg.id, msg.created_at)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  )}
                  
                  <div className={`p-1.5 rounded-3xl max-w-[85vw] md:max-w-md shadow-sm border ${isMe ? 'bg-blue-600 text-white border-blue-600 rounded-br-sm' : 'bg-white text-slate-800 border-slate-200 rounded-bl-sm'}`}>
                    {msg.file_url ? (
                      msg.file_type === 'image' ? (
                        <img 
                          src={msg.file_url} 
                          className="rounded-2xl max-h-60 w-auto object-cover cursor-zoom-in hover:opacity-90 transition-opacity" 
                          alt="attachment" 
                          onClick={() => window.open(msg.file_url)} 
                        />
                      ) : (
                        // NÂNG CẤP TÍNH NĂNG Ở ĐÂY: Hiển thị icon theo đuôi file cực đẹp
                        <a 
                          href={msg.file_url} 
                          target="_blank" 
                          className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isMe ? 'hover:bg-black/10' : 'hover:bg-slate-50'}`}
                        >
                          <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isMe ? 'bg-white text-blue-600' : 'bg-blue-50 text-blue-600'}`}>
                            {msg.content.toLowerCase().endsWith('.pdf') ? <span className="text-[10px] font-black uppercase tracking-tighter">PDF</span> :
                             (msg.content.toLowerCase().endsWith('.zip') || msg.content.toLowerCase().endsWith('.rar')) ? <span className="text-[10px] font-black uppercase tracking-tighter">ZIP</span> :
                             <FileText size={20} />}
                          </div>
                          <div className="flex flex-col overflow-hidden pr-2">
                            <span className="text-sm font-bold truncate max-w-[180px]">{msg.content}</span>
                            <span className="text-[10px] opacity-70 font-medium mt-0.5">Nhấn để tải về thiết bị</span>
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
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 relative z-20">
        <form onSubmit={(e) => { e.preventDefault(); if (newMessage.trim()) { supabase.from('messages').insert([{ sender_email: user.email, content: newMessage }]); setNewMessage(''); }}} className="flex items-end gap-2 max-w-4xl mx-auto relative">
          
          <label className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer transition-all shrink-0">
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
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
            className="flex-grow bg-slate-100 px-5 py-3.5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none max-h-32 text-[15px]" 
            placeholder="Nhập tin nhắn (Enter để gửi)..." 
            rows={1}
            disabled={uploading}
          />
          
          <button 
            type="submit" 
            disabled={!newMessage.trim() || uploading}
            className="bg-blue-600 disabled:bg-blue-300 text-white p-3.5 rounded-full shadow-lg shadow-blue-200 active:scale-95 transition-all shrink-0 flex items-center justify-center"
          >
            <Send size={20} className="ml-1" />
          </button>
        </form>
      </footer>
    </div>
  );
}