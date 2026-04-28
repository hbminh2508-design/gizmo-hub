"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // Đã fix đường dẫn import
import { 
  FileText, Table, Presentation, Cloud, Clock, 
  ChevronRight, Home, Loader2, Plus, HardDrive, 
  Search, Trash2, MoreVertical, LayoutGrid, List as ListIcon
} from 'lucide-react';

export default function GizmoOfficeLauncher() {
  const router = useRouter();
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const initOffice = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push('/login'); return; }
      setUser(authUser);

      // Lấy danh sách tài liệu gần đây (Tất cả các loại)
      const { data } = await supabase.from('gizmo_docs')
        .select('*')
        .eq('owner_email', authUser.email)
        .order('last_opened', { ascending: false });
      
      if (data) setRecentDocs(data);
      setLoading(false);
    };
    initOffice();
  }, [router]);

  const apps = [
    { 
      id: 'text',
      name: 'Gizmo Text', 
      desc: 'Tạo văn bản, báo cáo chuyên nghiệp', 
      icon: FileText, 
      color: 'bg-blue-600', 
      href: '/office/text',
      hover: 'hover:border-blue-500/50'
    },
    { 
      id: 'sheet',
      name: 'Gizmo Sheet', 
      desc: 'Bảng tính và phân tích dữ liệu', 
      icon: Table, 
      color: 'bg-emerald-600', 
      href: '/office/sheet',
      hover: 'hover:border-emerald-500/50'
    },
    { 
      id: 'slide',
      name: 'Gizmo Slide', 
      desc: 'Trình chiếu ý tưởng sáng tạo', 
      icon: Presentation, 
      color: 'bg-orange-500', 
      href: '/office/slide',
      hover: 'hover:border-orange-500/50'
    }
  ];

  const deleteDoc = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa tài liệu này?")) {
      await supabase.from('gizmo_docs').delete().eq('id', id);
      setRecentDocs(prev => prev.filter(d => d.id !== id));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1120]"><Loader2 className="animate-spin text-indigo-500 h-10 w-10" /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#020617] font-sans relative overflow-hidden transition-colors duration-500">
      
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-500">
            <Home size={20}/>
          </button>
          <div className="flex items-center gap-2">
            <Cloud className="text-indigo-600" size={24} />
            <h1 className="font-black text-xl dark:text-white tracking-tighter">Gizmo<span className="text-indigo-600">Office</span></h1>
          </div>
        </div>

        <div className="flex-grow max-w-xl mx-12 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tài liệu của bạn..." 
              className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 ring-indigo-500/20 transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="w-9 h-9 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-white font-black text-xs uppercase">
             {user?.email?.charAt(0)}
           </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-12 relative z-10">
        
        {/* Create New Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black dark:text-white tracking-tight uppercase text-slate-400 text-[12px]">Bắt đầu tạo mới</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {apps.map(app => (
              <button 
                key={app.id} 
                onClick={() => router.push(app.href)} 
                className={`bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 transition-all text-left group relative overflow-hidden ${app.hover}`}
              >
                <div className={`${app.color} text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10 group-hover:rotate-6 transition-transform`}>
                  <app.icon size={28}/>
                </div>
                <h3 className="text-xl font-black dark:text-white mb-2">{app.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed">{app.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Mở ứng dụng <ChevronRight size={14}/>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Documents Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-black flex items-center gap-3 dark:text-white">
              <Clock className="text-indigo-600" size={24}/> Tài liệu gần đây
            </h2>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}><LayoutGrid size={18}/></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}><ListIcon size={18}/></button>
            </div>
          </div>

          {recentDocs.length === 0 ? (
             <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
               <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                 <HardDrive size={32}/>
               </div>
               <p className="text-slate-500 font-bold">Chưa có tài liệu nào trong kho lưu trữ của bạn.</p>
               <p className="text-slate-400 text-sm mt-1">Hãy bắt đầu bằng cách chọn một ứng dụng phía trên.</p>
             </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentDocs.map(doc => (
                <div key={doc.id} className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col" onClick={() => router.push(`/office/${doc.type}?id=${doc.id}`)}>
                  <div className={`h-32 flex items-center justify-center ${doc.type === 'text' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'}`}>
                    {doc.type === 'text' ? <FileText size={48} className="opacity-40" /> : <Table size={48} className="opacity-40" />}
                  </div>
                  <div className="p-5 flex-grow relative">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate mb-1 pr-6">{doc.title}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Clock size={10}/> {new Date(doc.last_opened).toLocaleDateString('vi-VN')}
                    </p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }}
                      className="absolute right-4 bottom-5 p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
               {recentDocs.map(doc => (
                <div key={doc.id} onClick={() => router.push(`/office/${doc.type}?id=${doc.id}`)} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-500/50 cursor-pointer group transition-all">
                  <div className={`p-2 rounded-lg ${doc.type === 'text' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {doc.type === 'text' ? <FileText size={20}/> : <Table size={20}/>}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-sm truncate dark:text-white">{doc.title}</h4>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase hidden sm:block">{new Date(doc.last_opened).toLocaleDateString('vi-VN')}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-7xl mx-auto p-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">Gizmo Office Cloud • Ecosystem for Students</p>
      </footer>
    </div>
  );
}