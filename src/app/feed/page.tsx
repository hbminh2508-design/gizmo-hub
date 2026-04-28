"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTheme } from 'next-themes';
import { 
  Rss, Hash, Send, Image as ImageIcon, 
  Heart, MessageSquare, ArrowLeft, Loader2, X, Share2, Smartphone, Search, UserCircle, Sun, Moon
} from 'lucide-react';
import Link from 'next/link';

// Cấu hình các loại cảm xúc chuẩn Facebook
const REACTIONS = [
  { id: 'like', emoji: '👍', label: 'Thích', color: 'text-blue-500' },
  { id: 'love', emoji: '❤️', label: 'Yêu thích', color: 'text-rose-500' },
  { id: 'care', emoji: '🥰', label: 'Thương thương', color: 'text-yellow-500' },
  { id: 'haha', emoji: '😆', label: 'Haha', color: 'text-yellow-500' },
  { id: 'wow', emoji: '😮', label: 'Wow', color: 'text-yellow-500' },
  { id: 'sad', emoji: '😢', label: 'Buồn', color: 'text-yellow-500' },
  { id: 'angry', emoji: '😡', label: 'Phẫn nộ', color: 'text-orange-500' },
];

export default function GizmoFeedPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tải danh bạ Profile để hiển thị Avatar + Tên Thật
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [userReactions, setUserReactions] = useState<Record<number, string>>({});
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);
  
  const [activeCommentPost, setActiveCommentPost] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let channel: any;

    const initFeed = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // 1. Tải danh bạ Profile (Mới: bao gồm avatar_url)
      const { data: profilesData } = await supabase.from('profiles').select('email, full_name, avatar_url');
      if (profilesData) {
        const pMap: Record<string, any> = {};
        profilesData.forEach(p => pMap[p.email] = p);
        setProfilesMap(pMap);
      }

      fetchPosts();

      // Tải cảm xúc đã thả của user này
      if (user) {
        const { data: reactionsData } = await supabase.from('reactions').select('*').eq('user_email', user.email);
        if (reactionsData) {
          const reactionsMap: Record<number, string> = {};
          reactionsData.forEach(r => { reactionsMap[r.post_id] = r.reaction_type; });
          setUserReactions(reactionsMap);
        }
      }

      // 2. Cấu hình Realtime - FIX: Đăng ký trước khi Subscribe
      const channelName = `feed-channel-${Date.now()}`;
      channel = supabase.channel(channelName);
      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload: any) => {
          setPosts((prev) => [payload.new, ...prev]);
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload: any) => {
          const newComment = payload.new;
          setComments((prev) => ({
            ...prev,
            [newComment.post_id]: [...(prev[newComment.post_id] || []), newComment]
          }));
        })
        .subscribe();
    };

    initFeed();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!content.trim() || !user || uploading) return;
    setUploading(true);
    let imageUrl = null;

    if (selectedImage) {
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage.from('feed-media').upload(fileName, selectedImage);
      if (data) imageUrl = supabase.storage.from('feed-media').getPublicUrl(fileName).data.publicUrl;
    }

    const tags = tagInput ? tagInput.split(',').map(t => t.trim().replace(/[^a-zA-Z0-9]/g, '')).filter(t => t !== "") : [];
    await supabase.from('posts').insert([{ user_email: user.email, content, tags, image_url: imageUrl }]);

    setContent(''); setTagInput(''); setSelectedImage(null); setPreviewUrl(null); setUploading(false);
  };

  const handleReaction = async (postId: number, reactionId: string) => {
    if (!user) { alert("Vui lòng đăng nhập!"); return; }
    const currentReaction = userReactions[postId];

    setUserReactions(prev => {
      if (prev[postId] === reactionId) {
        const newState = { ...prev }; delete newState[postId]; return newState;
      }
      return { ...prev, [postId]: reactionId };
    });
    setHoveredPost(null);

    if (currentReaction === reactionId) {
      await supabase.from('reactions').delete().match({ post_id: postId, user_email: user.email });
    } else {
      await supabase.from('reactions').upsert({ post_id: postId, user_email: user.email, reaction_type: reactionId }, { onConflict: 'post_id, user_email' });
    }
  };

  const handleShare = async (post: any) => {
    const author = profilesMap[post.user_email]?.full_name || post.user_email?.split('@')[0];
    if (navigator.share) {
      try { await navigator.share({ title: 'GizmoHUB Feed', text: `${author}: "${post.content.substring(0, 50)}..."`, url: window.location.href }); } catch (e) {}
    } else { navigator.clipboard.writeText(window.location.href); alert("Đã copy link bài viết!"); }
  };

  const toggleCommentSection = async (postId: number) => {
    if (activeCommentPost === postId) { setActiveCommentPost(null); return; }
    setActiveCommentPost(postId);
    if (!comments[postId]) {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      const { data } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
      if (data) setComments(prev => ({ ...prev, [postId]: data }));
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleSendComment = async (postId: number) => {
    if (!commentText.trim() || !user) return;
    const textToSubmit = commentText; setCommentText('');
    await supabase.from('comments').insert([{ post_id: postId, user_email: user.email, content: textToSubmit }]);
  };

  // FIX LỖI tag.toLowerCase: Thêm kiểm tra Array và Type an toàn
  // Tìm đến đoạn này khoảng dòng 175-180
  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase();
    const contentMatch = post.content?.toLowerCase().includes(query);
    const emailMatch = post.user_email?.toLowerCase().includes(query);
    const nameMatch = profilesMap[post.user_email]?.full_name?.toLowerCase().includes(query);
    
    // SỬA DÒNG NÀY: Thêm : string cho biến tag
    const tagMatch = Array.isArray(post.tags) && post.tags.some((tag: string) => 
      typeof tag === 'string' && tag.toLowerCase().includes(query)
    );

    return contentMatch || emailMatch || nameMatch || tagMatch;
  });

  // Helper để lấy Avatar mượt mà
  const getAvatar = (email: string) => {
    const profile = profilesMap[email];
    if (profile?.avatar_url) return <img src={profile.avatar_url} alt="Avt" className="w-full h-full object-cover" />;
    const initial = profile?.full_name ? profile.full_name.charAt(0) : (email ? email.charAt(0) : '?');
    return <span className="font-black uppercase">{initial}</span>;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans relative z-0 overflow-hidden bg-slate-50 dark:bg-[#0b1120]">
      {/* Background Liquid Glass */}
      <div className="fixed inset-0 z-[-1] transition-colors duration-500">
        <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-700/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 dark:bg-indigo-800/20 blur-[100px] pointer-events-none"></div>
      </div>

      <header className="sticky top-0 z-40 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-500 py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 transition bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
            <ArrowLeft size={18} /> <span className="hidden sm:inline">Trang chủ</span>
          </Link>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Gizmo<span className="text-blue-500">Feed</span></h1>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-8 px-4 flex-grow w-full space-y-8">
        
        {/* Tìm kiếm bạn bè / Nội dung */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white/50 dark:border-slate-700/50 shadow-sm relative">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên thật, email, bài viết hoặc hashtag..." 
            className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium dark:text-white transition-all"
          />
        </div>

        {/* Form Đăng bài */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-sm border border-white/50 dark:border-slate-700/50">
          <div className="flex gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md overflow-hidden">
              {getAvatar(user?.email)}
            </div>
            <textarea 
              value={content} onChange={e => setContent(e.target.value)}
              className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[100px] text-[15px] font-medium dark:text-white placeholder-slate-400 resize-none" 
              placeholder={`${profilesMap[user?.email]?.full_name || 'Bạn'} ơi, có tài liệu gì mới không?`}
              disabled={uploading}
            />
          </div>

          {previewUrl && (
            <div className="relative mb-4 ml-16 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 bg-slate-100/50 dark:bg-slate-800/50">
              <img src={previewUrl} alt="Preview" className="w-full max-h-[300px] object-contain" />
              <button onClick={() => { setSelectedImage(null); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-slate-900/60 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-red-500 transition-all"><X size={16} /></button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4 ml-0 sm:ml-16 pt-2">
            <div className="flex w-full gap-2">
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-500/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-2xl cursor-pointer transition-all font-bold text-sm shrink-0">
                <ImageIcon size={18} /> <span className="hidden sm:inline">Ảnh</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} disabled={uploading} />
              </label>
              <div className="flex items-center gap-2 flex-grow bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 px-4 py-3 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                <Hash size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} className="bg-transparent flex-grow text-sm focus:outline-none font-bold dark:text-white placeholder-slate-400" placeholder="HSA, UET, GiaiTich..." disabled={uploading} />
              </div>
            </div>
            <button onClick={handlePost} disabled={!content.trim() || uploading} className="w-full sm:w-auto px-8 py-3 bg-slate-900 dark:bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0">
              {uploading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Send size={18} /> Đăng</>}
            </button>
          </div>
        </div>

        {/* Danh sách bài đăng */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500 h-10 w-10" /></div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 font-bold">Không tìm thấy bài viết nào.</div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/50 dark:border-slate-700/50 shadow-sm transition-all">
                
                {/* Header người dùng */}
                <div className="flex items-center gap-3 mb-4">
                  <Link href={`/profile?user=${post.user_email}`} className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform shrink-0 overflow-hidden border-2 border-white dark:border-slate-800">
                    {getAvatar(post.user_email)}
                  </Link>
                  <div>
                    <Link href={`/profile?user=${post.user_email}`} className="font-bold text-slate-900 dark:text-white hover:text-blue-500 transition-colors flex items-center gap-1.5">
                      {profilesMap[post.user_email]?.full_name || post.user_email?.split('@')[0]}
                      <UserCircle size={14} className="text-slate-400" />
                    </Link>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(post.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-200 mb-4 leading-relaxed whitespace-pre-wrap text-[15px] font-medium">{post.content}</p>

                {post.image_url && (
                  <div className="mb-4 rounded-[2rem] overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                    <img src={post.image_url} alt="Post media" className="w-full max-h-[500px] object-cover cursor-pointer" onClick={() => window.open(post.image_url, '_blank')} />
                  </div>
                )}

                <div className="flex gap-2 flex-wrap mb-5">
                  {Array.isArray(post.tags) && post.tags.map((tag: string) => (
                    <span key={tag} className="text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-100/50">#{tag}</span>
                  ))}
                </div>

                {/* Thanh tương tác */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50 px-2 relative">
                  <div className="relative group/reaction" onMouseEnter={() => setHoveredPost(post.id)} onMouseLeave={() => setHoveredPost(null)}>
                    {hoveredPost === post.id && (
                      <div className="absolute bottom-full left-[-10px] pb-3 z-50">
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-3xl border border-white/50 dark:border-slate-600/50 rounded-full shadow-2xl p-2 flex gap-1 animate-in zoom-in-75 slide-in-from-bottom-4 fade-in duration-300 origin-bottom-left">
                          {REACTIONS.map((reaction) => (
                            <button key={reaction.id} onClick={(e) => { e.stopPropagation(); handleReaction(post.id, reaction.id); }} className="text-3xl hover:scale-[1.3] transition-transform duration-200 hover:-translate-y-3 origin-bottom p-1.5" title={reaction.label}>{reaction.emoji}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <button onClick={() => handleReaction(post.id, userReactions[post.id] || 'like')} className={`flex items-center gap-2 transition-all font-bold text-sm px-3 py-2 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 ${userReactions[post.id] ? REACTIONS.find(r => r.id === userReactions[post.id])?.color : 'text-slate-500 dark:text-slate-400'}`}>
                      {userReactions[post.id] ? <span className="text-xl leading-none">{REACTIONS.find(r => r.id === userReactions[post.id])?.emoji}</span> : <Heart size={20} />}
                      <span className="hidden sm:inline">{userReactions[post.id] ? REACTIONS.find(r => r.id === userReactions[post.id])?.label : 'Thích'}</span>
                    </button>
                  </div>
                  <button onClick={() => toggleCommentSection(post.id)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-white/50 dark:hover:bg-slate-800/50 px-3 py-2 rounded-xl transition-all font-bold text-sm"><MessageSquare size={20} /> <span className="hidden sm:inline">{comments[post.id]?.length > 0 ? `${comments[post.id].length} Bình luận` : 'Bình luận'}</span></button>
                  <button onClick={() => handleShare(post)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-500 hover:bg-white/50 dark:hover:bg-slate-800/50 px-3 py-2 rounded-xl transition-all font-bold text-sm"><Share2 size={20} /> <span className="hidden sm:inline">Chia sẻ</span></button>
                </div>

                {/* Khu vực Bình luận */}
                {activeCommentPost === post.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {loadingComments[post.id] ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin h-5 w-5 text-blue-500" /></div>
                      ) : comments[post.id]?.length > 0 ? (
                        comments[post.id].map(cmt => (
                          <div key={cmt.id} className="flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <Link href={`/profile?user=${cmt.user_email}`} className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                              {getAvatar(cmt.user_email)}
                            </Link>
                            <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-200 flex-grow font-medium">
                              <Link href={`/profile?user=${cmt.user_email}`} className="font-bold text-slate-900 dark:text-white mb-0.5 text-xs hover:text-blue-500 block">{profilesMap[cmt.user_email]?.full_name || cmt.user_email.split('@')[0]}</Link>
                              <p className="whitespace-pre-wrap">{cmt.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-xs text-slate-400 py-2">Chưa có bình luận nào.</p>
                      )}
                    </div>
                    <div className="flex gap-3 items-end">
                       <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0 mb-1 overflow-hidden">{getAvatar(user?.email)}</div>
                       <div className="flex-grow flex gap-2">
                        <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(post.id); } }} placeholder="Viết bình luận..." className="flex-grow bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none min-h-[44px] max-h-24 dark:text-white placeholder-slate-400" rows={1} />
                        <button onClick={() => handleSendComment(post.id)} disabled={!commentText.trim()} className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 shrink-0 mb-0.5"><Send size={18} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 p-4 sticky bottom-0 z-30 transition-colors duration-500">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 dark:bg-blue-500/20 p-2 rounded-xl text-blue-600 dark:text-blue-400">
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white">Cài đặt GizmoHUB</p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Nhấn <Share2 size={10} className="inline mx-0.5" /> Chia sẻ ➜ Thêm vào MH chính</p>
            </div>
          </div>
          <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 px-3 py-1.5 rounded-lg uppercase tracking-wider">iOS / Safari</div>
        </div>
      </footer>
    </div>
  );
}