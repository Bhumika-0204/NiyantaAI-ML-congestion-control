import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTTooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  const data = [
    { name: 'Mon', Allowed: 4000, Throttled: 2400, Blocked: 200 },
    { name: 'Tue', Allowed: 3000, Throttled: 1398, Blocked: 150 },
    { name: 'Wed', Allowed: 2000, Throttled: 9800, Blocked: 1200 },
    { name: 'Thu', Allowed: 2780, Throttled: 3908, Blocked: 240 },
    { name: 'Fri', Allowed: 1890, Throttled: 4800, Blocked: 310 },
    { name: 'Sat', Allowed: 2390, Throttled: 3800, Blocked: 180 },
    { name: 'Sun', Allowed: 3490, Throttled: 4300, Blocked: 100 },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
             <BarChart3 className="text-emerald-400" size={28} />
          </div>
          Traffic Analytics
        </h2>
        <p className="text-gray-400 mt-2 pl-14">Historical performance and action breakdown.</p>
      </header>
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-[500px]">
        <h3 className="text-xl font-semibold mb-6 text-gray-200">Weekly Routing Decisions</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
            <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
            <RTTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
            <Bar dataKey="Allowed" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Throttled" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Blocked" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
