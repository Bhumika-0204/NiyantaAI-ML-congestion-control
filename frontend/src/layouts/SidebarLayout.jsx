import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, BookOpen, Search, Bell, Hexagon, User, Settings, LogOut, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';

export default function SidebarLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) setShowSearch(false);
    }
    
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        setShowSearch(true);
      }
      if (event.key === 'Escape') {
        setShowSearch(false);
        searchInputRef.current?.blur();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getPageTitle = () => {
    if (location.pathname.includes('dashboard')) return 'Live Dashboard';
    if (location.pathname.includes('model-info')) return 'ML Pipeline Architecture';
    if (location.pathname.includes('system-docs')) return 'System Documentation';
    return 'Niyanta AI Dashboard';
  };

  const searchIndex = [
    { id: 1, title: 'Live Dashboard', dest: '/dashboard', label: 'Real-time telemetry and dual-simulation.' },
    { id: 2, title: 'ML Architecture', dest: '/model-info', label: 'Pipeline engineering and layer details.' },
    { id: 3, title: 'System Documentation', dest: '/system-docs', label: 'WebSocket concurrency logic.' },
    { id: 4, title: 'Export JSON Dataset', dest: '/dashboard', label: 'Feature within the Live Dashboard.' },
    { id: 5, title: 'Node Alpha Diagnostics', dest: '/dashboard', label: 'Terminal analytics view.' }
  ];

  const filteredResults = searchIndex.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchResultClick = (dest) => {
    setShowSearch(false);
    setSearchQuery('');
    navigate(dest);
  };

  return (
    <div className="flex z-[9999] h-screen bg-[#050505] text-gray-200 font-sans overflow-hidden selection:bg-cyan-500/30 relative">
      
      {}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none overflow-hidden mix-blend-overlay">
        <h1 className="text-[25vw] font-black text-white whitespace-nowrap -rotate-12 tracking-tight">NIYANTA</h1>
      </div>

      {}
      <aside className="w-64 bg-[#050505]/90 backdrop-blur-2xl border-r border-white/5 flex flex-col shrink-0 relative shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-40">
        <div className="p-6 border-b border-white/5 flex items-center gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] relative z-10">
            <Hexagon className="text-white" size={24} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <h1 className="text-xl font-bold text-white tracking-tight">Niyanta AI</h1>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold mt-0.5">Core Intelligence</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2 relative z-10">
          <p className="px-4 text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-3">Platform Operations</p>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium duration-200 ${isActive ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'}`
            }
          >
            <LayoutDashboard size={18} />
            Live Dashboard
          </NavLink>
          
          <NavLink
            to="/model-info"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium duration-200 ${isActive ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'}`
            }
          >
            <BrainCircuit size={18} />
            ML Architecture
          </NavLink>

          <NavLink
            to="/system-docs"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium duration-200 ${isActive ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'}`
            }
          >
            <BookOpen size={18} />
            Documentation
          </NavLink>
        </nav>
        
        <div className="p-4 m-4 rounded-xl border border-emerald-500/20 bg-[#0a0a0a] flex flex-col gap-1 relative overflow-hidden group hover:border-emerald-500/40 transition-colors shadow-lg z-10">
           <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
           <span className="text-xs text-gray-400 font-medium">System Environment</span>
           <div className="flex items-center gap-2 mt-0.5">
             <span className="relative flex h-2.5 w-2.5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
             </span>
             <span className="text-emerald-400 font-bold text-sm">Online & Secure</span>
           </div>
        </div>
      </aside>

      {}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/30 via-transparent to-transparent z-10">
        
        {}
        <header className="h-24 border-b border-white/5 bg-[#050505]/70 backdrop-blur-2xl shrink-0 flex items-center justify-between px-8 z-30 sticky top-0 relative">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
          
          <div className="flex items-center gap-5">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                <span>Niyanta Core</span> <span className="text-gray-700">/</span> <span className="text-cyan-500">Node Alpha</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight leading-none">{getPageTitle()}</h2>
            </div>
            
            <div className="hidden lg:flex items-center gap-2 ml-6 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-full shadow-inner shadow-white/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Prod Engine</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            
            {}
            <div className="relative hidden xl:block z-50" ref={searchContainerRef}>
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${showSearch ? 'text-cyan-400' : 'text-gray-500'} transition-colors duration-200`} size={16} />
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder="Search parameters via AI..." 
                className="bg-[#0f0f0f] border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 w-72 lg:w-96 transition-all shadow-inner focus:bg-[#1a1a1a] focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] placeholder:text-gray-600" 
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <div className="text-[10px] font-mono font-bold text-gray-500 bg-black/50 px-1.5 py-0.5 rounded border border-white/5">Ctrl</div>
                <div className="text-[10px] font-mono font-bold text-gray-500 bg-black/50 px-1.5 py-0.5 rounded border border-white/5">K</div>
              </div>
              
              {}
              {showSearch && (
                <div className="absolute top-14 left-0 w-full bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] py-2 animate-in fade-in slide-in-from-top-2 duration-150 border-t-cyan-500/30 overflow-hidden">
                  <div className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">
                    {searchQuery ? 'Search Results' : 'Suggested Parameters'}
                  </div>
                  
                  {filteredResults.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto custom-scroll">
                      {filteredResults.map((item, idx) => (
                        <div 
                          key={item.id} 
                          onClick={() => handleSearchResultClick(item.dest)}
                          className="px-4 py-2.5 hover:bg-white/[0.04] cursor-pointer group flex items-center justify-between transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-300 group-hover:text-cyan-400 transition-colors">{item.title}</span>
                            <span className="text-[11px] text-gray-600">{item.label}</span>
                          </div>
                          <ChevronRight size={14} className="text-gray-700 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center flex flex-col items-center justify-center opacity-50">
                      <Search size={24} className="text-gray-500 mb-2" />
                      <span className="text-sm text-gray-400 font-medium">No system parameters found matching "{searchQuery}"</span>
                    </div>
                  )}
                  
                  <div className="px-4 py-2 text-[10px] font-mono text-gray-600 border-t border-white/5 bg-black/20 mt-2 flex justify-between items-center">
                    <span>Press <kbd className="bg-white/10 px-1 py-0.5 rounded ml-1">Esc</kbd> to exit</span>
                    <span className="font-bold flex items-center gap-1"><Hexagon size={10} className="text-cyan-500"/> Niyanta Index</span>
                  </div>
                </div>
              )}
            </div>
            
            {}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotif(!showNotif)}
                className="relative text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full border border-white/5 hover:border-white/20"
              >
                <Bell size={18} />
                <span className="absolute 0 -right-0 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)] border border-black"></span>
                </span>
              </button>
              
              {showNotif && (
                <div className="absolute top-12 right-0 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <span className="text-sm font-semibold text-white">System Alerts</span>
                    <span className="text-[10px] bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">2 New</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-5 py-3 hover:bg-white/5 cursor-pointer flex gap-3 border-b border-white/5 transition-colors">
                      <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-200 font-bold mb-0.5">Elevated Traffic Detected</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">Niyanta AI has identified a 40% spike in inbound queue loads. Active thresholds automatically adjusted to compensate.</p>
                        <p className="text-[9px] text-cyan-500 mt-1 font-bold uppercase tracking-widest">Just now</p>
                      </div>
                    </div>
                    <div className="px-5 py-3 hover:bg-white/5 cursor-pointer flex gap-3 transition-colors">
                      <CheckCircle size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-200 font-bold mb-0.5">Pipeline Initialization Complete</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">Dual-state isolation architecture successfully successfully established secure WebSocket streams via port 8000.</p>
                        <p className="text-[9px] text-gray-600 mt-1 font-bold uppercase tracking-widest">1 hr ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-white/5 text-center bg-white/[0.02] mt-1">
                    <button className="text-[11px] uppercase tracking-wider text-cyan-500 hover:text-cyan-400 font-bold w-full py-1 transition-colors">Mark all as read</button>
                  </div>
                </div>
              )}
            </div>

            {}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setShowProfile(!showProfile)}
                className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.5)] ring-2 ring-black flex items-center justify-center font-bold text-white text-sm hover:scale-105 transition-transform"
              >
                 NK
              </div>
              
              {showProfile && (
                <div className="absolute top-14 right-0 w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-5 py-4 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-inner shrink-0 text-lg">
                       NK
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-white tracking-tight">Niyanta Admin</p>
                      <p className="text-[11px] text-cyan-400 font-medium">engineering@niyanta.ai</p>
                    </div>
                  </div>
                  <div className="py-2.5">
                    <button className="w-full text-left px-5 py-2.5 text-xs font-semibold text-gray-400 hover:bg-white/5 hover:text-cyan-400 flex items-center gap-3 transition-colors">
                      <User size={16} /> Account Overview
                    </button>
                    <button className="w-full text-left px-5 py-2.5 text-xs font-semibold text-gray-400 hover:bg-white/5 hover:text-cyan-400 flex items-center gap-3 transition-colors">
                      <Settings size={16} /> Global Security Preferences
                    </button>
                  </div>
                  <div className="border-t border-white/5 py-2.5 bg-rose-500/[0.02]">
                    <button className="w-full text-left px-5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-3 transition-colors font-bold tracking-wide">
                      <LogOut size={16} /> Secure Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {}
        <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col z-20">
           <div className="flex-1 p-8">
              <Outlet />
           </div>
           
           {}
           <footer className="mt-auto py-10 z-20 relative">
             <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
               
               {}
               <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[14px] text-gray-400 font-medium mb-6">
                 <span className="cursor-pointer hover:text-white hover:underline underline-offset-4 transition-all">Home</span>
                 <span className="cursor-pointer hover:text-white hover:underline underline-offset-4 transition-all">Features</span>
                 <span className="cursor-pointer hover:text-white hover:underline underline-offset-4 transition-all">Pricing</span>
                 <span className="cursor-pointer hover:text-white hover:underline underline-offset-4 transition-all">FAQs</span>
                 <span className="cursor-pointer hover:text-white hover:underline underline-offset-4 transition-all">About</span>
               </div>
               
               {}
               <div className="w-full h-px bg-white/[0.08] mb-6 shadow-[0_1px_0_rgba(0,0,0,0.5)]"></div>
               
               {}
               <div className="text-[14px] text-gray-400 font-medium tracking-wide">
                 © 2026 Niyanta AI, Inc
               </div>
               
             </div>
           </footer>
        </div>

      </main>
    </div>
  );
}
