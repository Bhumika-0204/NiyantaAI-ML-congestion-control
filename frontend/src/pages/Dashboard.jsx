import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ArrowDownToLine, Zap } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ cpu: 45, memory: 60, active: 1560, blocked: 12 });
  const [data, setData] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({ time: i, traffic: Math.floor(Math.random() * 800 + 400) }))
  );

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Traffic Control Dashboard</h2>
          <p className="text-gray-400 mt-2">Live monitoring of system ingress and policy decisions.</p>
        </div>
        <div className="flex gap-2 items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-semibold shadow-[0_0_15px_rgba(52,211,153,0.1)]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          System Live
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-gray-700 transition duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 font-medium">Active Requests</span>
            <div className="p-2 bg-blue-500/10 rounded-lg"><Activity className="text-blue-400" size={20} /></div>
          </div>
          <span className="text-4xl font-bold font-mono">{metrics.active}</span>
          <span className="text-sm text-emerald-400 mt-2">+12% from last min</span>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-gray-700 transition duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 font-medium">System GPU/CPU Load</span>
            <div className="p-2 bg-yellow-500/10 rounded-lg"><Zap className="text-yellow-400" size={20} /></div>
          </div>
          <span className="text-4xl font-bold font-mono">{metrics.cpu}%</span>
          <span className="text-sm text-gray-500 mt-2">Normal Load</span>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-gray-700 transition duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 font-medium">Network Throughput</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg"><ArrowDownToLine className="text-emerald-400" size={20} /></div>
          </div>
          <span className="text-4xl font-bold font-mono">14.2<span className="text-lg text-gray-400 ml-1">MB/s</span></span>
          <span className="text-sm text-gray-500 mt-2">Peak: 18 MB/s</span>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-[400px]">
        <h3 className="text-xl font-semibold mb-6">Traffic Volume (req/sec)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="time" stroke="#6b7280" tick={{fill: '#6b7280'}} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" tick={{fill: '#6b7280'}} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} itemStyle={{ color: '#60a5fa' }} />
            <Line type="monotone" dataKey="traffic" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#60a5fa', stroke: '#1e3a8a', strokeWidth: 2 }} fill="url(#colorTraffic)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
