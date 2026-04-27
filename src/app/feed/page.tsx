"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Rss, Hash, Send, Image as ImageIcon, 
  Heart, MessageSquare, ArrowLeft, Loader2, X, Share2, Smartphone
} from 'lucide-react';
import Link from 'next/link';

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // States upload ảnh
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // States tương tác UI
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  
  // States cho Bình luận
  const [activeCommentPost, setActiveCommentPost] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Record<number, any[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const initFeed = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      fetchPosts();

      const channelName = `realtime-posts-${Date.now()}`;
      const channel = supabase.channel(channelName)
        // Lắng nghe bài viết mới
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
          setPosts((prev) => [payload.new, ...prev]);
        })
        // Lắng nghe bình luận mới
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
          const newComment = payload.new;
          setComments((prev) => ({
            ...prev,
            [newComment.post_id]: [...(prev[newComment.post_id] || []), newComment]
          }));
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    initFeed();
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
      else if (uploadError) {
        alert("Không thể tải ảnh lên. Vui lòng thử lại!");
        setUploading(false);
        return;
      }
    }

    const tags = tagInput ? tagInput.split(',').map(t => t.trim().replace(/[^a-zA-Z0-9]/g, '')).filter(t => t !== "") : [];
    const { error } = await supabase.from('posts').insert([{ user_email: user.email, content, tags, image_url: imageUrl }]);

    if (!error) {
      setContent('');
      setTagInput('');
      setSelectedImage(null);
      setPreviewUrl(null);
    }
    setUploading(false);
  };

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  const handleShare = async (post: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GizmoHUB Feed',
          text: `Đọc bài viết của ${post.user_email.split('@')[0]} trên GizmoHUB: "${post.content.substring(0, 50)}..."`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Lỗi chia sẻ:', error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.href}`);
      alert("Đã copy link bài viết!");
    }
  };

  // Hàm mở khu vực bình luận và tải dữ liệu
  const toggleCommentSection = async (postId: number) => {
    if (activeCommentPost === postId) {
      setActiveCommentPost(null);
      return;
    }
    setActiveCommentPost(postId);
    
    // Nếu chưa có dữ liệu bình luận thì tải về
    if (!comments[postId]) {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      const { data } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
      if (data) {
        setComments(prev => ({ ...prev, [postId]: data }));
      }
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Hàm Gửi bình luận
  const handleSendComment = async (postId: number) => {
    if (!commentText.trim() || !user) return;
    
    const textToSubmit = commentText;
    setCommentText(''); // Xóa ô input ngay lập tức cho mượt
    
    const { error } = await supabase.from('comments').insert([
      { post_id: postId, user_email: user.email, content: textToSubmit }
    ]);

    if (error) {
      alert("Lỗi khi đăng bình luận: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 py-4">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-4">
          <Link href="/" className="bg-slate-100 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm text-slate-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Rss className="text-blue-600" /> Gizmo Feed
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-8 px-4 flex-grow w-full">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shrink-0">
              {user?.email ? user.email.charAt(0).toUpperCase() : '?'}
            </div>
            <textarea 
              value={content} onChange={e => setContent(e.target.value)}
              className="w-full bg-slate-50 p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px] text-[15px]" 
              placeholder="Chia sẻ tài liệu, kinh nghiệm học tập..."
              disabled={uploading}
            />
          </div>

          {previewUrl && (
            <div className="relative mb-4 ml-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
              <img src={previewUrl} alt="Preview" className="w-full max-h-[300px] object-contain" />
              <button 
                onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                className="absolute top-2 right-2 bg-slate-900/60 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-red-500 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4 ml-0 sm:ml-16 pt-2">
            <div className="flex w-full gap-2">
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-2xl cursor-pointer transition-all font-bold text-sm shrink-0">
                <ImageIcon size={18} />
                <span className="hidden sm:inline">Ảnh</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} disabled={uploading} />
              </label>
              
              <div className="flex items-center gap-2 flex-grow bg-slate-100 px-4 py-3 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <Hash size={16} className="text-slate-400 shrink-0" />
                <input 
                  value={tagInput} onChange={e => setTagInput(e.target.value)}
                  className="bg-transparent flex-grow text-sm focus:outline-none font-bold" 
                  placeholder="HSA, UET, GiaiTich..." disabled={uploading}
                />
              </div>
            </div>

            <button 
              onClick={handlePost} disabled={!content.trim() || uploading}
              className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 disabled:bg-slate-300 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0"
            >
              {uploading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Send size={18} /> Đăng</>}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-slate-400 font-bold">
              Chưa có bài viết nào. Hãy là người mở bát!
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black shadow-md">
                    {post.user_email ? post.user_email.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{post.user_email?.split('@')[0]}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {new Date(post.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <p className="text-slate-700 mb-4 leading-relaxed whitespace-pre-wrap text-[15px]">{post.content}</p>

                {post.image_url && (
                  <div className="mb-4 rounded-3xl overflow-hidden border border-slate-100 bg-slate-50">
                    <img src={post.image_url} alt="Post media" className="w-full max-h-[500px] object-contain cursor-pointer" onClick={() => window.open(post.image_url, '_blank')} />
                  </div>
                )}

                <div className="flex gap-2 flex-wrap mb-5">
                  {Array.isArray(post.tags) && post.tags.map((tag: string) => (
                    <span key={tag} className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100/50">#{tag}</span>
                  ))}
                </div>

                {/* Thanh công cụ tương tác */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 px-2">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-2 transition-colors font-bold text-sm ${likedPosts.has(post.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                  >
                    <Heart size={20} fill={likedPosts.has(post.id) ? "currentColor" : "none"} /> 
                    <span className="hidden sm:inline">{likedPosts.has(post.id) ? 'Đã thích' : 'Thích'}</span>
                  </button>
                  <button 
                    onClick={() => toggleCommentSection(post.id)}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-bold text-sm"
                  >
                    <MessageSquare size={20} /> 
                    <span className="hidden sm:inline">
                      {comments[post.id]?.length > 0 ? `${comments[post.id].length} Bình luận` : 'Bình luận'}
                    </span>
                  </button>
                  <button 
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition-colors font-bold text-sm"
                  >
                    <Share2 size={20} /> <span className="hidden sm:inline">Chia sẻ</span>
                  </button>
                </div>

                {/* Khu vực Bình luận mở rộng */}
                {activeCommentPost === post.id && (
                  <div className="mt-4 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
                    
                    {/* Danh sách bình luận */}
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                      {loadingComments[post.id] ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin h-5 w-5 text-blue-500" /></div>
                      ) : comments[post.id] && comments[post.id].length > 0 ? (
                        comments[post.id].map(cmt => (
                          <div key={cmt.id} className="flex gap-2">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                              {cmt.user_email.charAt(0).toUpperCase()}
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 text-[13px] text-slate-700 flex-grow">
                              <p className="font-bold text-slate-900 mb-0.5 text-xs">{cmt.user_email.split('@')[0]}</p>
                              <p className="whitespace-pre-wrap">{cmt.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-xs text-slate-400 font-medium py-2">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                      )}
                    </div>

                    {/* Khung nhập bình luận */}
                    <div className="flex gap-3 items-end">
                       <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 mb-1">
                        {user?.email ? user.email.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-grow flex gap-2">
                        <textarea 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendComment(post.id);
                            }
                          }}
                          placeholder="Viết bình luận (Enter để gửi)..." 
                          className="flex-grow bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none min-h-[44px] max-h-24"
                          rows={1}
                        />
                        <button 
                          onClick={() => handleSendComment(post.id)}
                          disabled={!commentText.trim()}
                          className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors shrink-0 mb-0.5"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer hướng dẫn cài đặt iOS */}
      <footer className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Cài đặt GizmoHUB</p>
              <p className="text-[10px] font-bold text-slate-500">Nhấn <Share2 size={10} className="inline mx-0.5" /> Chia sẻ ➜ Thêm vào MH chính</p>
            </div>
          </div>
          <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase">
            iOS / Safari
          </div>
        </div>
      </footer>
    </div>
  );
}