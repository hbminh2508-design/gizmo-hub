"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
// Dòng 9: Sửa Highlight
import { Highlight } from '@tiptap/extension-highlight';

// Dòng 10: (Dòng này của bạn đã đúng sẵn)
import { Color } from '@tiptap/extension-color';

// Dòng 11: LỖI CHÍNH Ở ĐÂY - Sửa TextStyle
import { TextStyle } from '@tiptap/extension-text-style';

// Dòng 12: Sửa Link
import { Link } from '@tiptap/extension-link';

// Dòng 13: Sửa TaskList
import { TaskList } from '@tiptap/extension-task-list';

// Dòng 14: Sửa TaskItem
import { TaskItem } from '@tiptap/extension-task-item';

import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Save, ArrowLeft, 
  FileText, Share2, Type, Star, Folder, CloudCheck, MessageSquare, 
  Menu, Plus, Undo, Redo, Printer, SpellCheck, ChevronDown, X, Loader2,
  Highlighter, Palette, CheckSquare, Trash2, Clock, StickyNote, Mail, Home
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { supabase } from '../../../lib/supabase';

function TextEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get('id');

  const [title, setTitle] = useState('Tài liệu không có tiêu đề');
  const [currentId, setCurrentId] = useState<string | null>(fileId);
  const [saving, setSaving] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [outline, setOutline] = useState<{ id: string; text: string; level: number }[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Gõ @ để chèn mục, hoặc bắt đầu viết...' }),
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Tự động cập nhật mục lục ở thanh bên trái
      const headings: any[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          headings.push({ id: `h-${pos}`, text: node.textContent, level: node.attrs.level });
        }
      });
      setOutline(headings);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[1100px] p-[2cm] bg-white dark:bg-slate-900 shadow-xl transition-all duration-500 mb-20',
      },
    },
  });

  // Khởi tạo người dùng
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // Tải file nếu có ID
  useEffect(() => {
    if (fileId && editor) {
      const loadFile = async () => {
        const { data, error } = await supabase.from('gizmo_docs').select('*').eq('id', fileId).single();
        if (data && !error) {
          setTitle(data.title);
          editor.commands.setContent(data.content);
          setCurrentId(data.id);
        }
      };
      loadFile();
    }
  }, [fileId, editor]);

  // Hàm Lưu file thông minh
  const handleSave = async () => {
    if (!editor || !user) return;
    setSaving(true);

    const docData: any = {
      owner_email: user.email,
      title: title,
      content: editor.getHTML(),
      type: 'text',
      last_opened: new Date().toISOString()
    };

    if (currentId) docData.id = currentId;

    const { data, error } = await supabase
      .from('gizmo_docs')
      .upsert(docData, { onConflict: 'id' })
      .select()
      .single();

    if (!error && data) {
      setCurrentId(data.id);
      window.history.replaceState(null, '', `/office/text?id=${data.id}`);
    }
    setSaving(false);
  };

  // Chèn mẫu văn bản nhanh
  const insertTemplate = (type: string) => {
    if (!editor) return;
    if (type === 'meeting') {
      editor.chain().focus().insertContent('<h2>📅 Ghi chú cuộc họp</h2><p><strong>Ngày:</strong> </p><p><strong>Thành phần:</strong> </p><ul><li></li></ul>').run();
    } else if (type === 'draft') {
      editor.chain().focus().insertContent('<h2>✉️ Thư nháp</h2><p>Kính gửi ...</p>').run();
    }
  };

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-[#f9fbfd] dark:bg-[#020617] flex flex-col font-sans overflow-hidden">
      
      {/* 1. TOP HEADER (Google Docs/Word Style) */}
      <header className="bg-white dark:bg-[#0f172a] px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 z-[60]">
        <div className="flex items-center gap-3">
          {/* Logo Word Blue */}
          <div onClick={() => router.push('/office')} className="bg-blue-600 p-2 rounded-lg text-white shadow-lg flex items-center justify-center font-black text-xl w-10 h-10 cursor-pointer hover:scale-105 transition-transform">W</div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                className="text-lg font-medium bg-transparent border-none focus:ring-1 ring-blue-500 rounded px-1 w-fit min-w-[200px] dark:text-white outline-none"
              />
              <Star size={16} className="text-slate-400 cursor-pointer hover:text-amber-400 transition-colors" />
              <button onClick={() => router.push('/')} title="Về trang chủ" className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"><Home size={16}/></button>
              {saving ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <CloudCheck size={18} className="text-slate-400" />}
            </div>
            <div className="flex items-center gap-4 text-[13px] text-slate-500 dark:text-slate-400 px-1 font-medium">
              {['Tệp', 'Chỉnh sửa', 'Xem', 'Chèn', 'Định dạng', 'Công cụ'].map(m => (
                <span key={m} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 px-1.5 py-0.5 rounded transition-all">{m}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <MessageSquare size={20} className="text-slate-500 cursor-pointer" />
          <button onClick={handleSave} className="flex items-center gap-2 bg-[#c2e7ff] hover:bg-[#b3d7ef] text-[#001d35] px-6 py-2.5 rounded-full font-bold text-sm shadow-sm transition-all active:scale-95">
            <Share2 size={18} /> Chia sẻ
          </button>
          <div className="w-9 h-9 rounded-full bg-indigo-600 border-2 border-white shadow-sm flex items-center justify-center text-white font-black text-xs">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      {/* 2. PRO TOOLBAR */}
      <div className="bg-[#edf2fa] dark:bg-[#1e293b]/50 px-4 py-1 flex flex-wrap items-center gap-0.5 border-b border-slate-200 dark:border-slate-800 z-[50]">
        <button onClick={() => editor.chain().focus().undo().run()} className="p-1.5 hover:bg-slate-200 rounded transition-colors"><Undo size={16}/></button>
        <button onClick={() => editor.chain().focus().redo().run()} className="p-1.5 hover:bg-slate-200 rounded transition-colors"><Redo size={16}/></button>
        <button onClick={() => window.print()} className="p-1.5 hover:bg-slate-200 rounded transition-colors"><Printer size={16}/></button>
        <div className="w-[1px] h-5 bg-slate-300 mx-2" />
        <div className="flex items-center gap-2 px-2 hover:bg-slate-200 rounded cursor-pointer h-8 transition-colors"><span className="text-xs font-bold">Arial</span> <ChevronDown size={14}/></div>
        <div className="w-[1px] h-5 bg-slate-300 mx-2" />
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded transition-all ${editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200'}`}><Bold size={16}/></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded transition-all ${editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200'}`}><Italic size={16}/></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded transition-all ${editor.isActive('underline') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200'}`}><UnderlineIcon size={16}/></button>
        <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={`p-1.5 rounded transition-all ${editor.isActive('highlight') ? 'bg-yellow-200' : 'hover:bg-slate-200'}`}><Highlighter size={16}/></button>
        <div className="w-[1px] h-5 bg-slate-300 mx-2" />
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100' : ''}`}><AlignLeft size={16}/></button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100' : ''}`}><AlignCenter size={16}/></button>
        <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100' : ''}`}><AlignJustify size={16}/></button>
        <div className="w-[1px] h-5 bg-slate-300 mx-2" />
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded transition-all ${editor.isActive('bulletList') ? 'bg-blue-100' : ''}`}><List size={16}/></button>
        <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`p-1.5 rounded transition-all ${editor.isActive('taskList') ? 'bg-blue-100' : ''}`}><CheckSquare size={16}/></button>
      </div>

      <div className="flex flex-grow overflow-hidden h-full">
        {/* 3. SIDE PANEL (Dynamic Outline) */}
        <aside className={`${isSidePanelOpen ? 'w-64' : 'w-12'} transition-all bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col z-40`}>
          <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            {isSidePanelOpen && <span className="font-bold text-xs text-slate-500 uppercase tracking-widest">Các thẻ tài liệu</span>}
            <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
              <Menu size={18} className="text-slate-500" />
            </button>
          </div>
          {isSidePanelOpen && (
            <div className="p-4 overflow-y-auto flex-grow space-y-2 custom-scrollbar">
              {outline.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic">Mục lục tài liệu sẽ tự động xuất hiện tại đây khi bạn dùng các Heading.</div>
              ) : (
                outline.map(h => (
                  <div key={h.id} className={`text-sm py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${h.level === 1 ? 'font-bold text-blue-600' : 'pl-6 text-slate-500'}`}>
                    {h.text}
                  </div>
                ))
              )}
            </div>
          )}
        </aside>

        {/* 4. EDITOR AREA */}
        <main className="flex-grow overflow-y-auto bg-[#f9fbfd] dark:bg-[#020617] pt-8 custom-scrollbar">
          {/* SMART CHIPS BUTTONS */}
          <div className="max-w-[850px] mx-auto mb-4 flex gap-3 px-1">
             <button onClick={() => insertTemplate('meeting')} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"><StickyNote size={14} className="text-blue-500"/> Ghi chú cuộc họp</button>
             <button onClick={() => insertTemplate('draft')} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"><Mail size={14} className="text-rose-500"/> Thư nháp</button>
             <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"><Plus size={14}/> Tùy chọn khác</button>
          </div>

          <div className="max-w-[850px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <EditorContent editor={editor} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function GizmoTextProPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>}>
      <TextEditorContent />
    </Suspense>
  );
}