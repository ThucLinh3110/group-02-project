import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Clock, Tag } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Ticket } from '../types';
import { TicketStatus } from '../types';
import CreateTicket from './CreateTicket';

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await apiClient.get<Ticket[]>('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleTicketCreated = () => {
    setShowCreatePopup(false);
    fetchTickets();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Yêu cầu hỗ trợ của tôi</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý và theo dõi các yêu cầu bạn đã gửi cho bộ phận IT</p>
        </div>
        <button
          onClick={() => setShowCreatePopup(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          <PlusCircle size={20} />
          <span>Tạo Yêu Cầu Mới</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-semibold text-slate-800">Danh sách vé</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm vé..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Bạn chưa gửi yêu cầu hỗ trợ nào.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Mã vé</th>
                  <th className="p-4 font-semibold">Tiêu đề</th>
                  <th className="p-4 font-semibold">Trạng thái</th>
                  <th className="p-4 font-semibold">Ngày tạo</th>
                  <th className="p-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <span className="font-medium text-indigo-600">{ticket.ticket_code}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800 mb-1">{ticket.title}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Tag size={12} /> {ticket.category}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === TicketStatus.CLOSED ? 'bg-slate-700 text-white shadow-sm' :
                        ticket.status === TicketStatus.RESOLVED ? 'bg-green-100 text-green-700' :
                        ticket.status === TicketStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                        ticket.status === TicketStatus.NEW ? 'bg-cyan-100 text-cyan-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {new Date(ticket.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/tickets/${ticket.id}`} className="text-indigo-600 font-medium hover:text-indigo-800 text-xs px-3 py-1.5 bg-indigo-50 rounded-lg transition-colors">
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showCreatePopup && (
        <CreateTicket onClose={handleTicketCreated} />
      )}
    </div>
  );
};

export default MyTickets;
