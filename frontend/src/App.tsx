import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { TicketIcon, LayoutDashboard, Library, User, Bot, ShieldAlert } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import KBPage from './pages/KBPage';
import MyTickets from './pages/MyTickets';
import { RoleProvider, useRole } from './context/RoleContext';

function AppContent() {
  const { currentRole, setCurrentRole } = useRole();
  const isAgent = currentRole === 'AGENT';

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-4 text-xl font-bold border-b border-slate-700">
            AI Helpdesk
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {!isAgent && (
              <Link to="/my-tickets" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition">
                <TicketIcon size={20} />
                <span>My Ticket</span>
              </Link>
            )}
            {isAgent && (
              <>
                <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition">
                  <LayoutDashboard size={20} />
                  <span>SLA Dashboard</span>
                </Link>
                <Link to="/kb" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition">
                  <Library size={20} />
                  <span>Knowledge Base</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {isAgent ? 'Không gian làm việc (IT)' : 'Cổng hỗ trợ Nhân Viên'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium">Chuyển vai trò (Test):</span>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setCurrentRole('EMPLOYEE')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${!isAgent ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <User size={16} /> Nhân Viên
                </button>
                <button 
                  onClick={() => setCurrentRole('AGENT')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${isAgent ? 'bg-indigo-600 shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Bot size={16} /> IT Agent
                </button>
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <Routes>
              {isAgent ? (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/my-tickets" element={<Navigate to="/" replace />} />
                  <Route path="/kb" element={<KBPage />} />
                </>
              ) : (
                <>
                  <Route path="/my-tickets" element={<MyTickets />} />
                  <Route path="/" element={<Navigate to="/my-tickets" replace />} />
                  <Route path="/kb" element={
                    <div className="flex flex-col items-center justify-center h-full pt-20">
                      <ShieldAlert size={64} className="text-red-500 mb-4" />
                      <h2 className="text-2xl font-bold text-slate-800">403 Forbidden</h2>
                      <p className="text-slate-500 mt-2">Bạn không có quyền truy cập vào Thư viện nội bộ của IT.</p>
                    </div>
                  } />
                </>
              )}
              <Route path="/tickets/new" element={<CreateTicket />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <RoleProvider>
      <AppContent />
    </RoleProvider>
  );
}

export default App;
