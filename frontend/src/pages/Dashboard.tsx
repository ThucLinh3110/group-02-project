import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { SLAMetrics, Ticket } from '../types';
import SLABadge from '../components/SLABadge';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SLAMetrics | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<'all' | 'on_track' | 'at_risk' | 'breached' | 'done'>('all');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, ticketsRes] = await Promise.all([
          apiClient.get<SLAMetrics>('/dashboard/sla-metrics'),
          apiClient.get<Ticket[]>('/tickets')
        ]);
        setMetrics(metricsRes.data);
        setTickets(ticketsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };
    fetchDashboardData();
    // Auto polling every 5 seconds to update dashboard
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'done') return t.status === 'Closed' || t.status === 'Resolved';
    
    // Filter active tickets for SLA status
    if (t.status === 'Closed' || t.status === 'Resolved') return false;
    
    if (!t.sla_due_at) return false;
    const due = new Date(t.sla_due_at).getTime();
    const created = new Date(t.created_at).getTime();
    const now = new Date().getTime();
    const diffSecs = (due - now) / 1000;
    const totalSecs = (due - created) / 1000;
    
    const isAtRisk = diffSecs <= (totalSecs * 0.25) || diffSecs <= 3600;

    if (filter === 'breached') return diffSecs <= 0;
    if (filter === 'at_risk') return diffSecs > 0 && isAtRisk;
    if (filter === 'on_track') return diffSecs > 0 && !isAtRisk;
    return true;
  });

  const doneCount = tickets.filter(t => t.status === 'Closed' || t.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">SLA Dashboard</h2>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <button 
          onClick={() => setFilter('all')}
          className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md flex flex-col items-center justify-center gap-2 ${filter === 'all' ? 'bg-slate-800 text-white border-slate-900 ring-2 ring-slate-400 ring-offset-2' : 'bg-white text-slate-800 border-slate-200'}`}
        >
          <div className="text-3xl font-black">{tickets.length}</div>
          <div className="text-sm font-medium opacity-80 uppercase tracking-wider">All Tickets</div>
        </button>

        <button 
          onClick={() => setFilter('on_track')}
          className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md flex flex-col items-center justify-center gap-2 ${filter === 'on_track' ? 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-400 ring-offset-2' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
        >
          <ShieldCheck size={28} className={filter === 'on_track' ? 'text-white' : 'text-emerald-500'} />
          <div className="text-3xl font-black">{metrics?.on_track || 0}</div>
          <div className="text-sm font-medium opacity-80 uppercase tracking-wider">On Track</div>
        </button>

        <button 
          onClick={() => setFilter('at_risk')}
          className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md flex flex-col items-center justify-center gap-2 ${filter === 'at_risk' ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400 ring-offset-2' : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'}`}
        >
          <Shield size={28} className={filter === 'at_risk' ? 'text-white' : 'text-amber-500'} />
          <div className="text-3xl font-black">{metrics?.at_risk || 0}</div>
          <div className="text-sm font-medium opacity-80 uppercase tracking-wider">At Risk</div>
        </button>

        <button 
          onClick={() => setFilter('breached')}
          className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md flex flex-col items-center justify-center gap-2 ${filter === 'breached' ? 'bg-red-500 text-white border-red-600 ring-2 ring-red-400 ring-offset-2' : 'bg-white text-red-700 border-red-200 hover:bg-red-50'}`}
        >
          <ShieldAlert size={28} className={filter === 'breached' ? 'text-white' : 'text-red-500'} />
          <div className="text-3xl font-black">{metrics?.breached || 0}</div>
          <div className="text-sm font-medium opacity-80 uppercase tracking-wider">Breached</div>
        </button>

        <button 
          onClick={() => setFilter('done')}
          className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md flex flex-col items-center justify-center gap-2 ${filter === 'done' ? 'bg-slate-600 text-white border-slate-700 ring-2 ring-slate-400 ring-offset-2' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          <div className="w-7 h-7 rounded-full bg-slate-400 flex items-center justify-center mb-1">
             <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <div className="text-3xl font-black">{doneCount}</div>
          <div className="text-sm font-medium opacity-80 uppercase tracking-wider">Done</div>
        </button>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-800">
            {filter === 'all' ? 'All Tickets' : `Filtered Tickets: ${filter.toUpperCase()}`}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Priority</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">SLA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <Link to={`/tickets/${ticket.id}`} className="font-mono text-indigo-600 hover:text-indigo-800 font-medium">
                      {ticket.ticket_code}
                    </Link>
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    <Link to={`/tickets/${ticket.id}`} className="hover:underline">
                      {ticket.title}
                    </Link>
                    {ticket.needs_manual_review && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Needs Review
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      ticket.priority === 'Urgent' ? 'bg-red-100 text-red-800' : 
                      ticket.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      ticket.status === 'Closed' ? 'bg-slate-700 text-white shadow-sm' :
                      ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                      ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      ticket.status === 'New' ? 'bg-cyan-100 text-cyan-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <SLABadge dueDate={ticket.sla_due_at} createdAt={ticket.created_at} status={ticket.status} />
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">No tickets found for this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
