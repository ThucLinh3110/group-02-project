import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { TicketDetail as ITicketDetail, Message } from '../types';
import { MessageRole, TicketStatus } from '../types';
import SLABadge from '../components/SLABadge';
import { Send, Bot, User, ShieldAlert, Sparkles, X, Loader2, Edit2, Check, X as XIcon } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { TicketCategory, TicketPriority } from '../types';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<ITicketDetail | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editCategory, setEditCategory] = useState<TicketCategory | ''>('');
  const [editPriority, setEditPriority] = useState<TicketPriority | ''>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentRole } = useRole();
  const isAgent = currentRole === 'AGENT';

  const fetchTicket = async () => {
    try {
      const res = await apiClient.get<ITicketDetail>(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTicket();
    
    // Auto polling to update AI tags in real-time
    const interval = setInterval(() => {
      fetchTicket();
    }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket) return;

    setIsSending(true);
    try {
      await apiClient.post(`/tickets/${ticket.id}/messages`, {
        sender_id: isAgent ? "agent_01" : "emp_01",
        sender_name: isAgent ? "Agent Hỗ Trợ" : "Customer",
        role: isAgent ? MessageRole.AGENT : MessageRole.EMPLOYEE,
        content: newMessage
      });
      setNewMessage('');
      await fetchTicket();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleResolve = async () => {
    if (!ticket) return;
    try {
      await apiClient.post(`/tickets/${ticket.id}/resolve`);
      await fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = async () => {
    if (!ticket) return;
    try {
      await apiClient.post(`/tickets/${ticket.id}/close`);
      await fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTags = async () => {
    if (!ticket || (!editCategory && !editPriority)) return;
    try {
      await apiClient.patch(`/tickets/${ticket.id}`, {
        category: editCategory || undefined,
        priority: editPriority || undefined
      });
      setIsEditingTags(false);
      await fetchTicket();
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi lưu tags');
    }
  };

  const requestAIDraft = async () => {
    if (!ticket) return;
    setIsDrafting(true);
    try {
      const res = await apiClient.post(`/tickets/${ticket.id}/ai-suggest`);
      if (res.data.status === 'no_match') {
        alert(res.data.draft); // Show toast in real app
      } else {
        setNewMessage(res.data.draft);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi gọi AI');
    } finally {
      setIsDrafting(false);
    }
  };

  if (!ticket) return <div className="p-8 text-center text-slate-500">Đang tải...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar Info */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xs font-bold text-indigo-600 tracking-wider mb-1 uppercase">{ticket.ticket_code}</div>
              <h2 className="text-xl font-bold text-slate-800">{ticket.title}</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              ticket.status === TicketStatus.RESOLVED ? 'bg-green-100 text-green-700' :
              ticket.status === TicketStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {ticket.status}
            </span>
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-500">Phân loại (AI)</span>
              {isEditingTags ? (
                <select 
                  className="bg-slate-50 border border-slate-200 rounded p-1 text-xs"
                  value={editCategory || ticket.category}
                  onChange={(e) => setEditCategory(e.target.value as TicketCategory)}
                >
                  {Object.values(TicketCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <span className="font-semibold text-slate-800">{ticket.category}</span>
              )}
            </div>
            <div className="flex justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-500">Độ ưu tiên (AI)</span>
              {isEditingTags ? (
                <select 
                  className="bg-slate-50 border border-slate-200 rounded p-1 text-xs"
                  value={editPriority || ticket.priority}
                  onChange={(e) => setEditPriority(e.target.value as TicketPriority)}
                >
                  {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <span className={`font-bold ${ticket.priority === 'Urgent' ? 'text-red-600' : 'text-slate-800'}`}>
                  {ticket.priority}
                </span>
              )}
            </div>
            {isAgent && (
              <div className="flex justify-end gap-2">
                {isEditingTags ? (
                  <>
                    <button onClick={() => setIsEditingTags(false)} className="text-slate-500 hover:text-slate-700"><XIcon size={16}/></button>
                    <button onClick={handleUpdateTags} className="text-green-600 hover:text-green-800"><Check size={16}/></button>
                  </>
                ) : (
                  <button onClick={() => {
                    setEditCategory(ticket.category);
                    setEditPriority(ticket.priority);
                    setIsEditingTags(true);
                  }} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs font-semibold">
                    <Edit2 size={12}/> Edit Tags
                  </button>
                )}
              </div>
            )}
            <div className="flex justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-500">Trạng thái SLA</span>
              <SLABadge dueDate={ticket.sla_due_at} createdAt={ticket.created_at} status={ticket.status} />
            </div>
            {isAgent && ticket.needs_manual_review && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2 border border-red-100">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span className="text-xs font-medium">AI có độ tin cậy thấp. Yêu cầu quản lý xem xét lại Category/Priority.</span>
              </div>
            )}
            
            <div className="pt-2">
              <p className="text-slate-500 mb-2">Mô tả gốc:</p>
              <div className="bg-slate-50 p-3 rounded-lg text-slate-700 border border-slate-100">
                {ticket.description}
              </div>
            </div>
            
            {ticket.attachment_urls && ticket.attachment_urls.length > 0 && (
              <div className="pt-2">
                <p className="text-slate-500 mb-2">Ảnh đính kèm ({ticket.attachment_urls.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachment_urls.map((url, idx) => (
                    <a key={idx} href={`http://localhost:8000${url}`} target="_blank" rel="noopener noreferrer" className="block cursor-zoom-in">
                      <img src={`http://localhost:8000${url}`} alt={`Attachment ${idx}`} className="rounded-lg border border-slate-200 h-24 w-24 object-cover shadow-sm hover:ring-2 hover:ring-indigo-400 transition-all" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {isAgent && ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED && (
            <button onClick={handleResolve} className="mt-6 w-full py-2 bg-slate-100 hover:bg-green-50 hover:text-green-700 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors">
              Đánh dấu đã giải quyết (Resolve)
            </button>
          )}

          {!isAgent && ticket.status === TicketStatus.RESOLVED && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-sm text-blue-800 mb-3 font-medium">IT đã xử lý xong lỗi này. Xác nhận đóng vé?</p>
              <button onClick={handleClose} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors">
                Nghiệm thu & Đóng vé (Close)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Box */}
      <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Trao đổi & Hỗ trợ</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {ticket.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 italic">Chưa có tin nhắn nào.</div>
          ) : (
            ticket.messages.map((msg) => {
              const isAgent = msg.role === MessageRole.AGENT;
              return (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAgent ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAgent ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                    {isAgent ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-slate-500 mb-1 px-1">{msg.sender_name}</span>
                    <div className={`p-4 rounded-2xl ${isAgent ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-white border-t border-slate-100">
          {newMessage && (
            <div className="mb-3 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg flex justify-between items-center text-xs text-indigo-700 font-medium">
              <span>Đang chỉnh sửa bản nháp (Bạn có thể sửa trước khi gửi)</span>
              <button type="button" onClick={() => setNewMessage('')} className="hover:bg-indigo-200 p-1 rounded-full transition-colors"><X size={14}/></button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn hỗ trợ..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none max-h-32 min-h-[52px]"
                rows={newMessage ? 3 : 1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              {isAgent && (
                <button
                  type="button"
                  onClick={requestAIDraft}
                  disabled={isDrafting}
                  title="Nhờ AI Gợi Ý (Từ Knowledge Base)"
                  className="absolute right-3 bottom-2.5 p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDrafting ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="p-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shrink-0 shadow-sm"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
