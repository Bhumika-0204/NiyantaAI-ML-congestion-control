import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTTooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { BarChart3, RefreshCw, TrendingUp } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function Analytics() {
  const [totals, setTotals] = useState({ total_allowed: 0, total_throttled: 0, total_blocked: 0 });
  const [timeline, setTimeline] = useState([]);
  const prevTotals = useRef(null);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      const json = await res.json();
      
      // Calculate deltas from previous fetch to build a rolling timeline
      const now = new Date();
      const label = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      if (prevTotals.current) {
        const delta = {
          name: label,
          Allowed: Math.max(0, json.total_allowed - prevTotals.current.total_allowed),
          Throttled: Math.max(0, json.total_throttled - prevTotals.current.total_throttled),
          Blocked: Math.max(0, json.total_blocked - prevTotals.current.total_blocked),
        };
        setTimeline(prev => [...prev.slice(-29), delta]); // Keep last 30 data points
      }
      
      prevTotals.current = json;
      setTotals(json);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  const totalDecisions = totals.total_allowed + totals.total_throttled + totals.total_blocked;

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
             <BarChart3 className="text-emerald-400" size={28} />
          </div>
          Traffic Analytics
        </h2>
        <p className="text-gray-400 mt-2 pl-14">Live performance and routing decision breakdown.</p>
      </header>

      {/* Cumulative Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Total Decisions</p>
          <p className="text-3xl font-bold text-white">{totalDecisions.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-emerald-500/20 rounded-xl p-6">
          <p className="text-sm text-emerald-400 mb-1">✅ Allowed</p>
          <p className="text-3xl font-bold text-emerald-400">{totals.total_allowed.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-orange-500/20 rounded-xl p-6">
          <p className="text-sm text-orange-400 mb-1">⚡ Throttled</p>
          <p className="text-3xl font-bold text-orange-400">{totals.total_throttled.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
          <p className="text-sm text-red-400 mb-1">🚫 Blocked</p>
          <p className="text-3xl font-bold text-red-400">{totals.total_blocked.toLocaleString()}</p>
        </div>
      </div>

      {/* Rolling Live Area Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" />
            Live Routing Decisions (per 3s interval)
          </h3>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <RefreshCw size={12} className="animate-spin" /> Streaming
          </span>
        </div>
        <div className="h-[350px]">
          {timeline.length < 2 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Collecting live data... chart will appear in a few seconds.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="gradAllowed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradThrottled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                <RTTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ paddingTop: '12px' }}/>
                <Area type="monotone" dataKey="Allowed" stroke="#10b981" fillOpacity={1} fill="url(#gradAllowed)" strokeWidth={2} />
                <Area type="monotone" dataKey="Throttled" stroke="#f59e0b" fillOpacity={1} fill="url(#gradThrottled)" strokeWidth={2} />
                <Area type="monotone" dataKey="Blocked" stroke="#ef4444" fillOpacity={1} fill="url(#gradBlocked)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Cumulative Bar Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-[400px]">
        <h3 className="text-xl font-semibold mb-6 text-gray-200">Cumulative Decision Breakdown</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={[
            { name: 'Allowed', value: totals.total_allowed, fill: '#10b981' },
            { name: 'Throttled', value: totals.total_throttled, fill: '#f59e0b' },
            { name: 'Blocked', value: totals.total_blocked, fill: '#ef4444' },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
            <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
            <RTTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
