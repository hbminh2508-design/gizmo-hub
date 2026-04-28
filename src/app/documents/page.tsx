"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTheme } from 'next-themes';
import { 
  UploadCloud, FileText, BookOpen, Search, Loader2, ArrowLeft, Sun, Moon 
} from 'lucide-react';
import Link from 'next/link';

type Document = { id: number; title: string; subject: string; file_url: string; created_at: string; };

export default function GizmoDocsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); 
  
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Tránh lỗi Hydration
  useEffect(() => setMounted(true), []);

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (data) setDocuments(data);
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !subject) return;
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('gizmo_documents').upload(`uploads/${fileName}`, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('gizmo_documents').getPublicUrl(`uploads/${fileName}`);
      await supabase.from('documents').insert([{ title, subject, file_url: publicUrl }]);
      
      alert("Tải lên thành công!");
      setTitle(''); setSubject(''); setFile(null); fetchDocuments();
    } catch (error) {
      alert("Lỗi tải lên!");
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans relative z-0 overflow-hidden">
      {/* Background Liquid Glass */}
      <div className="fixed inset-0 z-[-1] bg-slate-50 dark:bg-[#0b1120] transition-colors duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-900/20 blur-[120px] pointer-events-none"></div>
      </div>

      {/* Navbar Kính mờ */}
      <nav className="sticky top-0 z-50 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-500 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </Link>
          <div className="font-black text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Gizmo<span className="text-emerald-600 dark:text-emerald-500">Docs</span>
          </div>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Form Tải lên (Cột trái) */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-white/50 dark:border-slate-700/50 sticky top-28">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <UploadCloud className="h-5 w-5" />
                </div>
                Chia sẻ tài liệu
              </h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <input 
                  required value={title} onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Tên tài liệu..." 
                  className="w-full px-5 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all dark:text-white placeholder-slate-400" 
                />
                <input 
                  required value={subject} onChange={(e) => setSubject(e.target.value)} 
                  placeholder="Môn học..." 
                  className="w-full px-5 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all dark:text-white placeholder-slate-400" 
                />
                <div className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-2 transition-all">
                  <input 
                    type="file" required onChange={(e) => setFile(e.target.files?.[0] || null)} 
                    className="w-full text-sm font-medium text-slate-600 dark:text-slate-300 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:bg-emerald-50 dark:file:bg-emerald-500/20 file:text-emerald-600 dark:file:text-emerald-400 file:font-bold hover:file:bg-emerald-100 dark:hover:file:bg-emerald-500/30 transition-all cursor-pointer" 
                  />
                </div>
                <button 
                  type="submit" disabled={uploading} 
                  className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-lg mt-2"
                >
                  {uploading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Tải lên'}
                </button>
              </form>
            </div>
          </div>

          {/* Danh sách Tài liệu (Cột phải) */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-[2rem] border border-white/50 dark:border-slate-700/50">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white pl-2">Thư viện</h2>
              
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input 
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên môn, tên file..." 
                  className="w-full pl-11 pr-5 py-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium dark:text-white transition-all shadow-sm" 
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500 h-10 w-10" /></div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold">Không tìm thấy tài liệu phù hợp</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDocs.map((doc) => (
                  <div key={doc.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 dark:border-slate-700/50 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-100 dark:bg-emerald-500/20 p-3 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-sm"><FileText className="h-6 w-6" /></div>
                        <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300">{doc.subject}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2 mb-6 leading-relaxed">{doc.title}</h3>
                    </div>
                    <a 
                      href={doc.file_url} target="_blank" rel="noreferrer"
                      className="relative z-10 w-full text-center bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold py-3.5 rounded-xl text-sm transition-colors border border-slate-200/50 dark:border-slate-700/50"
                    >
                      Tải Xuống
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}