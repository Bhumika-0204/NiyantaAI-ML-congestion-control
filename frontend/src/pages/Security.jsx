import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Security() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-3 bg-red-500/10 rounded-xl">
             <ShieldAlert className="text-red-400" size={28} />
          </div>
          Security & Anomalies
        </h2>
        <p className="text-gray-400 mt-2 pl-14">Monitoring malicious traffic and IP blocking rules.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-red-500">Critical Alerts</h3>
             <AlertTriangle className="text-red-500" />
          </div>
          <p className="text-3xl font-bold">12</p>
          <p className="text-gray-400 mt-2 text-sm">IPs blocked in the last hour</p>
        </div>
        <div className="bg-gray-900 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-emerald-500">System Integrity</h3>
             <ShieldCheck className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold">99.8%</p>
          <p className="text-gray-400 mt-2 text-sm">Clean packets routed gracefully</p>
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800">
           <h3 className="text-xl font-bold">Recent Blocked Traffic</h3>
        </div>
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
             <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition duration-150">
               <td className="px-6 py-4 font-mono">192.168.1.105</td>
               <td className="px-6 py-4 text-gray-400">Spike Anomaly (&gt;2000 req/s)</td>
               <td className="px-6 py-4 text-gray-400">2 mins ago</td>
               <td className="px-6 py-4"><span className="text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-xs font-bold tracking-wider">BLOCKED</span></td>
             </tr>
             <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition duration-150">
               <td className="px-6 py-4 font-mono">10.0.0.42</td>
               <td className="px-6 py-4 text-gray-400">High Risk ML Prediction</td>
               <td className="px-6 py-4 text-gray-400">12 mins ago</td>
               <td className="px-6 py-4"><span className="text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full text-xs font-bold tracking-wider">THROTTLED</span></td>
             </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
