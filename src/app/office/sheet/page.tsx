"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { 
  ArrowLeft, Save, FileSpreadsheet, Download, Share2, 
  ChevronDown, Search, Type, Bold, Italic, AlignCenter, 
  AlignLeft, AlignRight, Plus, Table, Loader2, Check, 
  X, FolderOpen, FilePlus, Clock, Trash2, Sigma
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

// Khởi tạo khung dữ liệu mặc định (Hàng x Cột)
const ROWS = 50;
const COLS = 26; // A-Z
const generateEmptyGrid = () => 
  Array(ROWS).fill(null).map(() => Array(COLS).fill(''));

function GizmoSheetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get('id');

  const [title, setTitle] = useState('Bảng tính không tên');
  const [currentId, setCurrentId] = useState<string | null>(fileId);
  const [gridData, setGridData] = useState<string[][]>(generateEmptyGrid());
  const [activeCell, setActiveCell] = useState<{r: number, c: number} | null>(null);
  const [formulaValue, setFormulaValue] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isBackstageOpen, setIsBackstageOpen] = useState(false);
  const [myDocs, setMyDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // 1. Tải dữ liệu file
  useEffect(() => {
    if (fileId) {
      const loadFile = async () => {
        const { data } = await supabase.from('gizmo_docs').select('*').eq('id', fileId).single();
        if (data) {
          setTitle(data.title);
          setGridData(JSON.parse(data.content));
          setCurrentId(data.id);
        }
      };
      loadFile();
    }
  }, [fileId]);

  // 2. Xử lý nhập liệu ô
  const handleCellChange = (r: number, c: number, value: string) => {
    const newData = [...gridData];
    newData[r][c] = value;
    setGridData(newData);
    setFormulaValue(value);
  };

  const onCellFocus = (r: number, c: number) => {
    setActiveCell({r, c});
    setFormulaValue(gridData[r][c]);
  };

  // 3. Hệ thống Lưu file
  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const docData: any = {
        owner_email: user.email,
        title: title,
        content: JSON.stringify(gridData),
        type: 'sheet',
        last_opened: new Date().toISOString()
      };
      if (currentId) docData.id = currentId;

      const { data, error } = await supabase.from('gizmo_docs').upsert(docData).select().single();
      if (!error && data) {
        setCurrentId(data.id);
        window.history.replaceState(null, '', `/office/sheet?id=${data.id}`);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }
    setSaving(false);
  };

  const fetchMyDocs = async () => {
    setLoadingDocs(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('gizmo_docs').select('*').eq('owner_email', user.email).eq('type', 'sheet').order('last_opened', { ascending: false });
      if (data) setMyDocs(data);
    }
    setLoadingDocs(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#020617] flex flex-col font-sans relative overflow-hidden">
      
      {/* Excel Style Toolbar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-3">
            <button onClick={() => { setIsBackstageOpen(true); fetchMyDocs(); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1 rounded font-black text-xs transition-all">FILE</button>
            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700" />
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent border-none focus:ring-0 font-bold text-slate-700 dark:text-white text-sm w-48 md:w-64" placeholder="Tên bảng tính..." />
          </div>
          <div className="flex items-center gap-2">
             <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black transition-all">
              {saving ? <Loader2 size={12} className="animate-spin"/> : (saved ? <Check size={12}/> : <Save size={12}/>)} {saved ? 'ĐÃ LƯU' : 'LƯU'}
            </button>
            <button onClick={() => router.push('/')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={18}/></button>
          </div>
        </div>

        {/* Ribbon - Thao tác nhanh */}
        <div className="flex items-center gap-1 px-4 py-1 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500"><Bold size={14}/></button>
          <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500"><Italic size={14}/></button>
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
          <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500"><AlignLeft size={14}/></button>
          <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500"><AlignCenter size={14}/></button>
          <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500"><AlignRight size={14}/></button>
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
          <button className="flex items-center gap-1 p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-emerald-600 font-bold text-[10px]"><Sigma size={14}/> TÍNH TỔNG</button>
        </div>

        {/* Formula Bar */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800">
          <div className="text-[10px] font-black text-slate-400 w-10 text-center italic">fx</div>
          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
          <input 
            value={formulaValue}
            onChange={(e) => {
              setFormulaValue(e.target.value);
              if (activeCell) handleCellChange(activeCell.r, activeCell.c, e.target.value);
            }}
            className="flex-grow bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 dark:text-slate-300"
            placeholder={activeCell ? `Ô ${String.fromCharCode(65 + activeCell.c)}${activeCell.r + 1}` : "Chọn một ô..."}
          />
        </div>
      </nav>

      {/* Spreadsheet Grid */}
      <main className="flex-grow overflow-auto bg-slate-200 dark:bg-slate-950 custom-scrollbar">
        <table className="border-collapse bg-white dark:bg-slate-900 table-fixed">
          <thead>
            <tr>
              <th className="w-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 sticky top-0 left-0 z-30"></th>
              {Array.from({length: COLS}).map((_, i) => (
                <th key={i} className="w-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-400 uppercase sticky top-0 z-20 h-6">
                  {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gridData.map((row, rIdx) => (
              <tr key={rIdx}>
                <td className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-400 text-center sticky left-0 z-10 w-10">
                  {rIdx + 1}
                </td>
                {row.map((cell, cIdx) => (
                  <td 
                    key={cIdx}
                    className={`border border-slate-200 dark:border-slate-700 p-0 relative h-8 ${activeCell?.r === rIdx && activeCell?.c === cIdx ? 'ring-2 ring-emerald-500 z-10' : ''}`}
                  >
                    <input 
                      value={cell}
                      onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                      onFocus={() => onCellFocus(rIdx, cIdx)}
                      className="w-full h-full border-none focus:ring-0 bg-transparent px-2 text-sm text-slate-700 dark:text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* Backstage View */}
      {isBackstageOpen && (
        <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl animate-in fade-in flex">
          <div className="w-64 border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/50">
            <button onClick={() => setIsBackstageOpen(false)} className="flex items-center gap-3 text-slate-500 font-bold hover:text-emerald-600 transition mb-8"><ArrowLeft size={20}/> Quay lại</button>
            <button onClick={() => { router.push('/office/sheet'); setIsBackstageOpen(false); setGridData(generateEmptyGrid()); setCurrentId(null); setTitle('Bảng tính mới'); }} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 font-black text-slate-700 dark:text-white hover:scale-105 transition-all"><FilePlus className="text-emerald-600"/> TẠO MỚI</button>
          </div>
          <div className="flex-grow p-12 overflow-y-auto">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 italic">Gizmo Sheet <span className="text-emerald-600">Cloud</span></h2>
            {loadingDocs ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" /></div> : myDocs.length === 0 ? <div className="text-center py-20 text-slate-400 font-bold">Chưa có bảng tính nào.</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myDocs.map(doc => (
                  <div key={doc.id} onClick={() => { router.push(`/office/sheet?id=${doc.id}`); setIsBackstageOpen(false); }} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl w-fit mb-4 text-emerald-600"><Table size={24}/></div>
                    <h3 className="font-black text-slate-900 dark:text-white line-clamp-1">{doc.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-400 uppercase"><Clock size={12}/> {new Date(doc.last_opened).toLocaleDateString('vi-VN')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GizmoSheetPage() {
  return <Suspense><GizmoSheetContent /></Suspense>;
}