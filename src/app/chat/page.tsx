"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { Send, ArrowLeft, MessageCircle, Info, Loader2 } from 'lucide-react';

type Message = {
  id: number;
  sender_email: string;
  content: string;
  created_at: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkUserAndFetchMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Lấy lịch sử tin nhắn
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true }); // Lấy từ cũ đến mới

      if (data) setMessages(data);
      setLoading(false);

      // Lắng nghe tin nhắn mới theo thời gian thực (Realtime)
      const channel = supabase.channel('realtime-chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkUserAndFetchMessages();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage;
    setNewMessage(''); // Xóa ô nhập ngay lập tức để tạo cảm giác mượt

    await supabase.from('messages').insert([
      { sender_email: user.email, content: messageText }
    ]);
    // Không cần setMessages ở đây vì Realtime sẽ tự động bắt sự kiện INSERT và cập nhật
  };

  if (!loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center bg-white p-8 rounded-[2.5rem] shadow-xl max-w-sm">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"><MessageCircle className="text-blue-600 h-8 w-8" /></div>
          <h2 className="text-xl font-black mb-2 text-slate-900">Tham gia trò chuyện</h2>
          <p className="text-slate-500 text-sm mb-6 font-medium">Vui lòng đăng nhập để chat cùng cộng đồng sinh viên.</p>
          <Link href="/login" className="block bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">Đến trang Đăng nhập</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-0 md:p-6">
      <div className="w-full max-w-4xl bg-white md:rounded-[2rem] shadow-sm border border-slate-200 flex flex-col h-[100dvh] md:h-[90vh] overflow-hidden relative">
        
        {/* Header Chat */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500 hover:text-blue-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h1 className="font-black text-slate-900 text-lg leading-tight">Cộng đồng GizmoHUB</h1>
                <p className="text-xs font-bold text-slate-400">Đang hoạt động</p>
              </div>
            </div>
          </div>
          <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition">
            <Info className="h-5 w-5" />
          </button>
        </header>

        {/* Khung chứa tin nhắn */}
        <main className="flex-grow p-4 overflow-y-auto bg-slate-50/50 flex flex-col gap-4">
          {loading ? (
            <div className="flex-grow flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : messages.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400">
              <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm font-medium">Chưa có tin nhắn nào. Hãy gửi lời chào!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.sender_email === user?.email;
              const senderName = msg.sender_email.split('@')[0];
              
              // Kiểm tra xem tin nhắn trước đó có phải cùng một người gửi không để gộp bong bóng
              const isConsecutive = index > 0 && messages[index - 1].sender_email === msg.sender_email;

              return (
                <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-[-8px]' : 'mt-2'}`}>
                  {!isMe && !isConsecutive && (
                     <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 mr-2 shrink-0 self-end mb-1">
                       {senderName.charAt(0).toUpperCase()}
                     </div>
                  )}
                  {(!isMe && isConsecutive) && <div className="w-10 shrink-0"></div>} {/* Spacer cho tin nhắn gộp */}

                  <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && !isConsecutive && <span className="text-[10px] font-bold text-slate-400 ml-1 mb-1">{senderName}</span>}
                    
                    <div className={`px-4 py-2.5 text-[15px] ${isMe ? 'bg-blue-600 text-white rounded-[1.25rem] rounded-br-[4px]' : 'bg-slate-200 text-slate-800 rounded-[1.25rem] rounded-bl-[4px]'} shadow-sm break-words`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} /> {/* Điểm neo để cuộn xuống */}
        </main>

        {/* Khung nhập tin nhắn */}
        <footer className="p-4 bg-white border-t border-slate-100 relative z-20">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <textarea 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                // Nhấn Enter để gửi (trừ khi giữ Shift để xuống dòng)
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="flex-grow bg-slate-100 text-slate-900 placeholder-slate-500 rounded-2xl px-4 py-3 max-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-[15px]"
              rows={1}
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-3.5 rounded-full transition-colors flex items-center justify-center shrink-0 shadow-md shadow-blue-200"
            >
              <Send className="h-5 w-5 ml-1" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] font-bold text-slate-400">Nhấn Enter để gửi</span>
          </div>
        </footer>

      </div>
    </div>
  );
}