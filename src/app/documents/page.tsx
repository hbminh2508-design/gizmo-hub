"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UploadCloud, FileText, Download, BookOpen, Search, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Document = { id: number; title: string; subject: string; file_url: string; created_at: string; };

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // State cho tìm kiếm
  
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  // Lọc tài liệu theo từ khóa tìm kiếm (bất kể viết hoa viết thường)
  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition">
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </Link>
          <div className="font-bold text-slate-900">Kho Tài Liệu</div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900"><UploadCloud className="h-5 w-5 text-emerald-600" /> Chia sẻ tài liệu</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên tài liệu..." className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-medium" />
                <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Môn học..." className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-medium" />
                <input type="file" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 font-medium" />
                <button type="submit" disabled={uploading} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition">{uploading ? 'Đang tải...' : 'Tải lên'}</button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-black text-slate-900">Danh sách tài liệu</h2>
              {/* Ô Tìm kiếm đã được kích hoạt */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên môn, tên file..." 
                  className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-medium" 
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold">Không tìm thấy tài liệu phù hợp</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => (
                  <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex justify-between mb-3">
                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><FileText className="h-5 w-5" /></div>
                        <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded-md text-slate-600">{doc.subject}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-4">{doc.title}</h3>
                    </div>
                    <a href={doc.file_url} target="_blank" className="w-full text-center bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold py-2 rounded-xl text-sm transition">Tải Xuống</a>
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