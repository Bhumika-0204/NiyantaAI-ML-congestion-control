import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AiInsights from './pages/AiInsights';
import Security from './pages/Security';
import Analytics from './pages/Analytics';
import ApiPlayground from './pages/ApiPlayground';
import { LayoutDashboard, BrainCircuit, ShieldAlert, BarChart3, TerminalSquare } from 'lucide-react';

function NavLink({ to, icon: Icon, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`}
    >
      <Icon size={20} className={isActive ? 'text-blue-400' : ''} />
      {children}
    </Link>
  );
}

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 bg-gray-900 border-r border-gray-800 flex-col hidden md:flex">
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent transform scale-105 origin-left">
              Niyanta AI
            </h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Intelligence Platform</p>
          </div>
          <div className="flex-1 py-6 flex flex-col gap-2 px-4">
            <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
            <NavLink to="/ai-insights" icon={BrainCircuit}>AI Insights</NavLink>
            <NavLink to="/security" icon={ShieldAlert}>Security</NavLink>
            <NavLink to="/analytics" icon={BarChart3}>Analytics</NavLink>
            <NavLink to="/api-playground" icon={TerminalSquare}>API Playground</NavLink>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full relative overflow-y-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ai-insights" element={<AiInsights />} />
            <Route path="/security" element={<Security />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/api-playground" element={<ApiPlayground />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
