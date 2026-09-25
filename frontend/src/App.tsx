import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { TicketIcon, LayoutDashboard, Library, LogOut, Bot, ShieldAlert } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import KBPage from './pages/KBPage';
import MyTickets from './pages/MyTickets';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  const isAgent = user?.role === 'Agent';

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-4 text-xl font-bold border-b border-slate-700 flex items-center gap-2">
            <Bot size={24} className="text-indigo-400" />
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
          
          <div className="p-4 border-t border-slate-700">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                   {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold truncate w-36" title={user?.full_name}>{user?.full_name}</p>
                  <p className="text-xs text-slate-400">{isAgent ? 'IT Agent' : 'Nhân Viên'}</p>
                </div>
             </div>
             <button 
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full p-2 text-sm text-red-400 bg-slate-800/50 hover:bg-red-500 hover:text-white rounded-lg transition-all"
             >
                <LogOut size={16} /> Đăng xuất
             </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {isAgent ? 'Không gian làm việc (IT)' : 'Cổng hỗ trợ Nhân Viên'}
            </h1>
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
              <Route path="*" element={<Navigate to={isAgent ? '/' : '/my-tickets'} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
