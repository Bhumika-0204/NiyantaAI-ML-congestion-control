import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, RefreshCw, Ban, Wifi } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function Security() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/security-events`);
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch security events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const blockedCount = data?.blocked_last_hour ?? 0;
  const integrity = data?.integrity_pct ?? 100;
  const events = data?.events ?? [];

  return (
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-xl">
               <ShieldAlert className="text-red-400" size={28} />
            </div>
            Security & Anomalies
          </h2>
          <p className="text-gray-400 mt-2 pl-14">Live monitoring of malicious traffic and IP blocking rules.</p>
        </div>
        <button 
          onClick={fetchEvents} 
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition text-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-red-500">Critical Alerts</h3>
             <AlertTriangle className="text-red-500" />
          </div>
          <p className="text-3xl font-bold">{blockedCount}</p>
          <p className="text-gray-400 mt-2 text-sm">IPs blocked in the last hour</p>
        </div>

        <div className="bg-gray-900 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-emerald-500">System Integrity</h3>
             <ShieldCheck className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold">{integrity}%</p>
          <p className="text-gray-400 mt-2 text-sm">Clean packets routed gracefully</p>
        </div>

        <div className="bg-gray-900 border border-orange-500/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-orange-400">Active Blocklist</h3>
             <Ban className="text-orange-400" />
          </div>
          <p className="text-3xl font-bold">{data?.active_blocklist_size ?? 0}</p>
          <p className="text-gray-400 mt-2 text-sm">Permanently banned IPs</p>
        </div>

        <div className="bg-gray-900 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-yellow-400">Active Throttles</h3>
             <Wifi className="text-yellow-400" />
          </div>
          <p className="text-3xl font-bold">{data?.active_throttle_count ?? 0}</p>
          <p className="text-gray-400 mt-2 text-sm">IPs currently rate-limited</p>
        </div>
      </div>
      
      {/* Live Events Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
           <h3 className="text-xl font-bold">Live Security Events</h3>
           {lastRefresh && (
             <span className="text-xs text-gray-500">
               Last update: {lastRefresh.toLocaleTimeString()}
             </span>
           )}
        </div>

        {events.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShieldCheck size={48} className="mx-auto mb-4 text-emerald-500/30" />
            <p className="text-lg font-semibold">All Clear</p>
            <p className="text-sm mt-1">No security events detected. System running clean.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-950 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 border-b border-gray-800">IP Address</th>
                <th className="px-6 py-4 border-b border-gray-800">Reason</th>
                <th className="px-6 py-4 border-b border-gray-800">Timestamp</th>
                <th className="px-6 py-4 border-b border-gray-800">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {events.map((evt, idx) => (
                <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50 transition duration-150">
                  <td className="px-6 py-4 font-mono">{evt.ip}</td>
                  <td className="px-6 py-4 text-gray-400">{evt.reason}</td>
                  <td className="px-6 py-4 text-gray-400">{evt.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                      evt.status === 'BLOCK' 
                        ? 'text-red-400 bg-red-400/10' 
                        : 'text-orange-400 bg-orange-400/10'
                    }`}>
                      {evt.status === 'BLOCK' ? 'BLOCKED' : 'THROTTLED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
