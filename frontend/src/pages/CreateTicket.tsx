import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadClient } from '../api/client';
import { UploadCloud, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface CreateTicketProps {
  onClose?: () => void;
}

const CreateTicket: React.FC<CreateTicketProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 5) {
      setError('Bạn chỉ được chọn tối đa 5 ảnh.');
      return;
    }

    const newFiles = [...files];
    const newPreviews = [...previews];
    
    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước mỗi ảnh phải <= 5MB');
        return;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    setError(null);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Vui lòng nhập đầy đủ Tiêu đề và Mô tả');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    files.forEach(f => {
      formData.append('files', f);
    });

    try {
      const response = await uploadClient.post('/tickets', formData);
      // Navigate to ticket details
      navigate(`/tickets/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Có lỗi xảy ra khi tạo ticket');
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-1.5 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>
        )}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shrink-0">
          <h2 className="text-2xl font-black tracking-tight">Tạo Yêu Cầu Hỗ Trợ</h2>
          <p className="mt-1 text-sm text-indigo-100 opacity-90">Mô tả chi tiết vấn đề của bạn để AI phân loại và hỗ trợ nhanh nhất.</p>
        </div>
        
        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Tiêu đề (Tóm tắt vấn đề)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Không thể kết nối VPN từ nhà..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Mô tả chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vui lòng cung cấp càng nhiều thông tin càng tốt (lỗi hiển thị gì, từ bao giờ...)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm bg-slate-50 focus:bg-white resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Đính kèm ảnh màn hình (Tối đa 5 ảnh, dưới 5MB/ảnh)</label>
            <div 
              className={`w-full p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${files.length > 0 ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400'}`}
              onClick={(e) => {
                // Chỉ trigger click input nếu không bấm vào nút xoá ảnh (X)
                if ((e.target as HTMLElement).closest('.remove-btn')) return;
                if (files.length < 5) fileInputRef.current?.click();
              }}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                disabled={files.length >= 5}
              />
              
              {files.length > 0 ? (
                <div className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-indigo-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={16}/> Đã chọn {files.length}/5 ảnh
                    </span>
                    {files.length < 5 && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="text-xs font-bold px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-1.5 hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                         <UploadCloud size={16} /> Thêm ảnh
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {previews.map((previewUrl, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white group/item">
                        <img src={previewUrl} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFile(idx); }}
                          className="remove-btn absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white p-1 rounded-full transition-colors opacity-0 group-hover/item:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3 text-slate-500 py-2">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <UploadCloud size={28} className="text-indigo-500" />
                  </div>
                  <span className="text-sm font-medium">Kéo thả hoặc</span>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition-colors"
                  >
                    Bấm để chọn ảnh
                  </button>
                  <span className="text-xs opacity-75 mt-1">Hỗ trợ tải lên tối đa 5 ảnh (Dưới 5MB/ảnh)</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all shadow-lg shadow-indigo-200 ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'}`}
            >
              {isSubmitting ? 'Đang gửi & Phân loại tự động...' : 'Gửi Yêu Cầu'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-2xl my-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default CreateTicket;
