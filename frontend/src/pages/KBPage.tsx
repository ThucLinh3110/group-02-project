import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Search, Plus, Edit2, Trash2, Upload } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  category: string;
  content: string;
  updated_at: string;
}

const KBPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchArticles = async () => {
    try {
      const query = search ? `?q=${search}` : '?q=all';
      const res = await apiClient.get<Article[]>(`/kb/search${query}`);
      setArticles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchArticles();
    }, 500); // debounce
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const title = file.name.replace(/\.[^/.]+$/, ""); // Xóa đuôi file
      
      await apiClient.post('/kb', {
        title: title,
        category: 'Khác',
        content: text
      });
      alert('Tải tài liệu lên thành công!');
      
      // Refresh list
      fetchArticles();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải tài liệu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
      await apiClient.delete(`/kb/${id}`);
      setSelectedArticle(null);
      setIsEditing(false);
      fetchArticles();
    } catch(err) {
      console.error(err);
      alert("Lỗi khi xóa bài viết");
    }
  };

  const handleEditStart = (article: Article) => {
    setEditTitle(article.title);
    setEditCategory(article.category);
    setEditContent(article.content);
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    if (!selectedArticle) return;
    try {
      await apiClient.put(`/kb/${selectedArticle.id}`, {
        title: editTitle,
        category: editCategory,
        content: editContent
      });
      setIsEditing(false);
      setSelectedArticle({
        ...selectedArticle,
        title: editTitle,
        category: editCategory,
        content: editContent,
        updated_at: new Date().toISOString()
      });
      fetchArticles();
      alert("Đã cập nhật bài viết thành công!");
    } catch(err) {
      console.error(err);
      alert("Lỗi khi cập nhật bài viết");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Knowledge Base</h2>
          <p className="text-slate-500 mt-1">Tìm kiếm tài liệu hướng dẫn xử lý sự cố (Dành cho AI RAG & Agent)</p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-medium shadow-sm transition-all cursor-pointer border border-slate-200">
            <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
            <Upload size={18} /> Upload File (.txt, .md)
          </label>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm tài liệu, lỗi thường gặp..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-all"
        />
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search className="text-slate-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Không tìm thấy kết quả</h3>
          <p className="text-slate-500 mt-1 mb-6">Thử thay đổi từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map(article => (
            <div 
              key={article.id} 
              onClick={() => setSelectedArticle(article)}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col h-48"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                  {article.category}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(article.updated_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2 mb-2">
                {article.title}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-3 mt-auto">
                {article.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Chi Tiết */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {setSelectedArticle(null); setIsEditing(false);}}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                {!isEditing && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 mb-3 inline-block">
                    {selectedArticle.category}
                  </span>
                )}
                <h2 className="text-2xl font-bold text-slate-800 leading-tight">{isEditing ? "Chỉnh sửa tài liệu" : selectedArticle.title}</h2>
              </div>
              <button 
                onClick={() => {setSelectedArticle(null); setIsEditing(false);}}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
                    <input type="text" className="w-full p-2 border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Chuyên mục</label>
                    <input type="text" className="w-full p-2 border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg" value={editCategory} onChange={e => setEditCategory(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                    <textarea rows={10} className="w-full p-2 border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg resize-none" value={editContent} onChange={e => setEditContent(e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {selectedArticle.content}
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-2xl">
               <span className="text-sm text-slate-500">Cập nhật lần cuối: {new Date(selectedArticle.updated_at).toLocaleString()}</span>
               <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium shadow-sm">Hủy</button>
                      <button onClick={handleEditSave} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors font-medium shadow-sm">Lưu thay đổi</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditStart(selectedArticle)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(selectedArticle.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KBPage;
