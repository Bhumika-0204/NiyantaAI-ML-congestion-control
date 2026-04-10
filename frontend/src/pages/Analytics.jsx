import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, TrendingUp, RefreshCw } from 'lucide-react';

export default function Analytics() {
  const [totals, setTotals] = useState({ allowed: 0, throttled: 0, blocked: 0 });
  const [timeline, setTimeline] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace(/^http/, 'ws').replace('/api/v1', '') + '/ws/analytics-client'
        : 'ws://localhost:8000/ws/analytics-client';

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const action = payload.decision?.action?.toLowerCase() || 'allow';

      setTotals(prev => ({
        allowed: prev.allowed + (action === 'allow' ? 1 : 0),
        throttled: prev.throttled + (action === 'throttle' ? 1 : 0),
        blocked: prev.blocked + (action === 'block' ? 1 : 0),
      }));

      const now = new Date();
      const label = now.toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: 'numeric', second: 'numeric' });

      setTimeline(prev => {
        const last = prev.length > 0 ? prev[prev.length - 1] : null;
        if (last && last.name === label) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            Allowed: last.Allowed + (action === 'allow' ? 1 : 0),
            Throttled: last.Throttled + (action === 'throttle' ? 1 : 0),
            Blocked: last.Blocked + (action === 'block' ? 1 : 0),
          };
          return updated;
        }
        const newPoint = {
          name: label,
          Allowed: action === 'allow' ? 1 : 0,
          Throttled: action === 'throttle' ? 1 : 0,
          Blocked: action === 'block' ? 1 : 0,
        };
        const updated = [...prev, newPoint];
        if (updated.length > 30) updated.shift();
        return updated;
      });
    };

    return () => ws.close();
  }, []);

  const total = totals.allowed + totals.throttled + totals.blocked;

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
               <BarChart3 className="text-emerald-400" size={28} />
            </div>
            Traffic Analytics
          </h2>
          <p className="text-gray-400 mt-2 pl-14">Live performance and routing decision breakdown.</p>
        </div>
        <div className={`flex gap-2 items-center px-4 py-2 rounded-full text-sm font-semibold ${connected ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
          {connected ? 'Live Stream' : 'Disconnected'}
        </div>
      </header>

      {/* Live Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Total Decisions</p>
          <p className="text-3xl font-bold text-white">{total.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Since page load</p>
        </div>
        <div className="bg-gray-900 border border-emerald-500/20 rounded-xl p-6">
          <p className="text-sm text-emerald-400 mb-1">Allowed</p>
          <p className="text-3xl font-bold text-emerald-400">{totals.allowed.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">{total > 0 ? ((totals.allowed / total) * 100).toFixed(1) : 0}% of traffic</p>
        </div>
        <div className="bg-gray-900 border border-orange-500/20 rounded-xl p-6">
          <p className="text-sm text-orange-400 mb-1">Throttled</p>
          <p className="text-3xl font-bold text-orange-400">{totals.throttled.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">{total > 0 ? ((totals.throttled / total) * 100).toFixed(1) : 0}% of traffic</p>
        </div>
        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
          <p className="text-sm text-red-400 mb-1">Blocked</p>
          <p className="text-3xl font-bold text-red-400">{totals.blocked.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">{total > 0 ? ((totals.blocked / total) * 100).toFixed(1) : 0}% of traffic</p>
        </div>
      </div>

      {/* Live Streaming Line Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" />
            Live Routing Decisions
          </h3>
          {connected && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <RefreshCw size={12} className="animate-spin" /> Streaming
            </span>
          )}
        </div>
        <div style={{ width: '100%', height: 350 }}>
          {timeline.length < 2 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-center">
              <p>{connected ? 'Collecting live data... chart appears in a few seconds.' : 'Start the backend to see live data.'}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ paddingTop: '12px' }}/>
                <Line type="monotone" dataKey="Allowed" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="Throttled" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="Blocked" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Cumulative Bar Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-200">Cumulative Decision Breakdown</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Allowed', value: totals.allowed },
              { name: 'Throttled', value: totals.throttled },
              { name: 'Blocked', value: totals.blocked },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
              <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
