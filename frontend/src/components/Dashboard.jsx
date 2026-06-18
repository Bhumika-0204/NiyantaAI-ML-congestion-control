import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Square, Activity, Server, AlertCircle, Terminal, Download, RefreshCw, Layers, Zap, TrendingDown, AlignVerticalSpaceAround, Crosshair } from 'lucide-react';

export default function Dashboard() {
  const [sessionState, setSessionState] = useState('idle'); 
  const [loadProfile, setLoadProfile] = useState('medium');
  const [metrics, setMetrics] = useState({ status: 'offline', description: 'Systems pending...' });
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState(["[SYSTEM] Niyanta Core initializing. Standby..."]);
  const ws = useRef(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/metrics')
      .then(r => r.json())
      .then(d => setMetrics(d))
      .catch(e => console.error("Metrics API offline", e));
      
    const clientId = "client_" + Math.random().toString(36).substring(2, 9);
    
    try {
      ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/stream/${clientId}`);
      ws.current.onopen = () => addLog("[SYSTEM] WebSocket secured to Niyanta ML engine.");
      
      ws.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "tick") {
          const data = msg.data;
          
          const tickPoint = {
            time: data.time,
            static_queue: data.static.queue_length,
            static_dropped: data.static.dropped,
            static_sent: data.static.sent,
            adaptive_queue: data.adaptive.queue_length,
            adaptive_dropped: data.adaptive.dropped,
            adaptive_sent: data.adaptive.sent,
            confidence: data.adaptive.confidence || 0
          };
          setHistory(prev => [...prev].slice(-100).concat(tickPoint)); 
          
          if (data.adaptive.is_throttling) {
             addLog(`[WARNING] [t=${data.time}] Niyanta Controller: Throttling bandwidth to ${data.adaptive.incoming} pkts/s (Risk: ${(data.adaptive.confidence * 100).toFixed(1)}%)`);
          } else if (data.time % 10 === 0) {
             addLog(`[OK] [t=${data.time}] Niyanta Controller: Active stream mapping. Traffic nominal. (Risk: ${(data.adaptive.confidence * 100).toFixed(1)}%)`);
          }
        } else if (msg.type === "complete" || msg.type === "stopped") {
          setSessionState('stopped');
          addLog("[SYSTEM] Simulation " + msg.type + ".");
        }
      };
      
      ws.current.onerror = () => addLog("[ERROR] Engine uplink failed.");
      ws.current.onclose = () => {
         addLog("[SYSTEM] Uplink severed. Attempting handshake...");
      }
    } catch(err) {
      addLog("[ERROR] Failed to bind WebSocket interface.");
    }
    
    return () => {
      if (ws.current) ws.current.close();
    }
  }, []);

  const addLog = (line) => setLogs(prev => [...prev].slice(-150).concat(line));

  const startSimulation = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      setHistory([]);
      setSessionState('running');
      addLog(`[SYSTEM] Engaging dual-simulation on ${loadProfile.toUpperCase()} environment constraints...`);
      ws.current.send(JSON.stringify({ action: "start", load: loadProfile }));
    } else {
      addLog("[ERROR] Cannot execute: Subsystems offline.");
    }
  };

  const stopSimulation = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: "stop" }));
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "niyanta_replay.json");
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addLog("[SYSTEM] Exported dataset to secure local storage.");
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedData = JSON.parse(event.target.result);
        setHistory(loadedData);
        setSessionState('replaying');
        addLog("[SYSTEM] Niyanta replay module injected successfully.");
      } catch (err) {
        addLog("[ERROR] Payload parse failure on JSON ingestion.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const latest = history.length > 0 ? history[history.length - 1] : null;
  const adaptiveLossPercent = latest ? (((latest.adaptive_dropped / Math.max(1, latest.adaptive_dropped + latest.adaptive_sent)) * 100) || 0).toFixed(1) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      
      {}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] xl:col-span-5 flex flex-wrap gap-5 items-center">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className="text-[11px] text-cyan-400 font-semibold uppercase tracking-widest flex items-center gap-1.5"><Layers size={12}/> Network Load</label>
            <select 
              value={loadProfile}
              onChange={e => setLoadProfile(e.target.value)}
              disabled={sessionState === 'running'}
              className="bg-black/50 border border-white/10 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/80 transition-all font-medium"
             >
              <option value="low">Low Traffic Volume</option>
              <option value="medium">Medium Baseline</option>
              <option value="high">Stress Test (Spike Risk)</option>
            </select>
          </div>
          
          <button 
            onClick={startSimulation}
            disabled={sessionState === 'running'}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-400/50 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] font-semibold transition-all hover:-translate-y-0.5"
          >
            <Play size={16} fill="white" /> Execute
          </button>
          
          <button 
            onClick={stopSimulation}
            disabled={sessionState !== 'running'}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-rose-500/20 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg border border-white/10 font-semibold transition-all hover:text-rose-400"
          >
            <Square size={16} /> Halt
          </button>
        </div>

        {}
        <div className="xl:col-span-7 grid grid-cols-3 gap-4">
           {}
           <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-5 border border-white/5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none transition-colors"></div>
             <div className="absolute -right-4 -top-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors pointer-events-none"><Zap size={64}/></div>
             <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1 ml-1 z-10">Live Throughput</p>
             <div className="flex items-baseline gap-2 z-10">
               <span className="text-4xl font-mono text-white tracking-tight">{latest ? latest.adaptive_sent : 0}</span>
               <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase mt-4">↑ Vol</span>
             </div>
           </div>
           
           {}
           <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-5 border border-white/5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 text-rose-500/10 group-hover:text-rose-500/20 transition-colors pointer-events-none"><TrendingDown size={64}/></div>
             <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1 ml-1 z-10">Packet Loss %</p>
             <div className="flex items-baseline gap-2 z-10">
               <span className="text-4xl font-mono text-white tracking-tight">{adaptiveLossPercent}</span>
               <span className="text-xs text-rose-400 font-bold tracking-widest uppercase mt-4">↓ %</span>
             </div>
           </div>

           {}
           <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-5 border border-white/5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 text-cyan-500/10 group-hover:text-cyan-500/20 transition-colors pointer-events-none"><AlignVerticalSpaceAround size={64}/></div>
             <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1 ml-1 z-10">Avg Queue Size</p>
             <div className="flex items-baseline gap-2 z-10">
               <span className="text-4xl font-mono text-white tracking-tight">{latest ? latest.adaptive_queue : 0}</span>
               <span className="text-xs text-cyan-400 font-bold tracking-widest uppercase mt-4">Load</span>
             </div>
           </div>
        </div>
      </div>

      {}
      <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden group hover:border-cyan-500/20 transition-all">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none transition-colors"></div>
        <div className="border-b border-white/5 pb-4 mb-5 flex justify-between items-end">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-cyan-400" />
              Niyanta Intelligence: Throughput Volume Delivery
            </h2>
            <p className="text-sm text-gray-400 mt-1">Comparing total packets successfully delivered dynamically reacting to traffic spikes.</p>
          </div>
          <div className="hidden md:flex gap-3">
             <button onClick={exportJSON} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 transition-colors"><Download size={12}/> Dump JSON</button>
             <label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 transition-colors cursor-pointer">
               <RefreshCw size={12}/> Load Profile
               <input type="file" accept=".json" className="hidden" onChange={importJSON} />
             </label>
          </div>
        </div>
        <div className="h-[250px] w-full z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAdaptive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorStatic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="time" stroke="#4b5563" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
              <YAxis stroke="#4b5563" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{backgroundColor: 'rgba(5,5,5,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)', color: '#fff'}} />
              <Legend verticalAlign="top" height={36}/>
              <Area type="monotone" dataKey="adaptive_sent" name="Niyanta Adaptive Delivery" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorAdaptive)" isAnimationActive={false} />
              <Area type="monotone" dataKey="static_sent" name="Static Baseline Delivery" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorStatic)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
         {}
         <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl p-6 border border-white/5 flex flex-col gap-5 shadow-xl">
           <div className="flex justify-between items-center">
             <h2 className="text-md font-bold text-gray-200 uppercase tracking-widest flex items-center gap-2"><Server size={14} className="text-gray-500"/> Static Legacy</h2>
             <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.1)]">UNMANAGED</span>
           </div>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="time" stroke="#4b5563" tick={{fontSize: 11}} />
                  <YAxis stroke="#4b5563" tick={{fontSize: 11}} />
                  <Tooltip contentStyle={{backgroundColor: 'rgba(5,5,5,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} />
                  <Legend />
                  <Line type="monotone" dataKey="static_queue" name="Queue Load" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="static_dropped" name="Packets Dropped" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
           </div>
         </div>

         {}
         <div className="bg-cyan-500/[0.02] backdrop-blur-md rounded-2xl p-6 border border-cyan-500/20 flex flex-col gap-5 shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
           
           <div className="flex justify-between items-center z-10 w-full flex-wrap gap-2">
             <h2 className="text-md font-bold text-white uppercase tracking-widest flex items-center gap-2"><Crosshair size={14} className="text-cyan-500"/> Niyanta AI Node</h2>
             <div className="flex gap-2 items-center">
               {latest?.adaptive?.confidence > 0 && (
                 <span className="text-[10px] bg-white/5 text-gray-300 border border-white/10 px-2 py-0.5 rounded flex items-center gap-1.5 font-bold tracking-wider">
                   Confidence: {(latest.adaptive.confidence * 100).toFixed(1)}%
                 </span>
               )}
               <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded flex items-center gap-1.5 font-bold tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                 <RefreshCw size={10} className={sessionState === 'running' ? 'animate-spin' : ''} /> 
                 ACTIVE MODEL
               </span>
             </div>
           </div>
           
           <div className="h-[250px] w-full z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{fontSize: 11}} />
                  <YAxis stroke="#6b7280" tick={{fontSize: 11}} />
                  <Tooltip contentStyle={{backgroundColor: 'rgba(5,5,5,0.9)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '12px'}} />
                  <Legend />
                  <Line type="monotone" dataKey="adaptive_queue" name="Queue Load" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="adaptive_dropped" name="Packets Dropped" stroke="#f59e0b" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
           </div>
         </div>
      </div>
      
      {}
      <div className="bg-[#020202] rounded-2xl border border-white/10 flex flex-col overflow-hidden h-[300px] shadow-2xl font-mono text-sm relative">
         <div className="bg-white/5 border-b border-white/10 px-5 py-3 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Terminal size={14} className="text-cyan-500" />
             <span className="text-gray-300 text-xs font-semibold uppercase tracking-widest">Niyanta Terminal Diagnostics</span>
           </div>
           <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50 hover:bg-rose-500 transition-colors cursor-pointer"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50 hover:bg-amber-500 transition-colors cursor-pointer"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 hover:bg-emerald-500 transition-colors cursor-pointer"></div>
           </div>
         </div>
         <div className="p-5 overflow-y-auto flex-1 text-[13px] leading-relaxed select-text tracking-wide break-words space-y-1">
           {logs.map((log, i) => {
              const isWarning = log.includes('[WARNING]');
              const isError = log.includes('[ERROR]');
              const isSystem = log.includes('[SYSTEM]');
              const isOk = log.includes('[OK]');
              
              const rawText = log.replace(/\[WARNING\] |\[OK\] |\[ERROR\] |\[SYSTEM\] /, '');
              const colorClass = isWarning ? 'text-amber-400 font-medium' : isError ? 'text-rose-400 font-bold' : isSystem ? 'text-cyan-400' : isOk ? 'text-emerald-400/80' : 'text-gray-400';
              
              return (
                <div key={i} className={`${colorClass} hover:bg-white/[0.02] px-2 py-0.5 -mx-2 rounded transition-colors break-words`}>
                  <span className="text-gray-600 mr-3">[{new Date().toLocaleTimeString('en-US', {hour12: false})}]</span> 
                  <span className="text-indigo-500/50 mr-2 font-bold">❯</span> 
                  {rawText}
                </div>
              );
           })}
           <div ref={logsEndRef} />
         </div>
         <div className="h-6 bg-white/[0.02] border-t border-white/5 px-4 flex items-center justify-between text-[10px] text-gray-500 font-mono">
            <span>WebSocket Uplink: ACTIVE</span>
            <span>Port: 8000</span>
         </div>
      </div>

    </div>
  );
}
