import React from 'react';
import { BrainCircuit, FileSearch } from 'lucide-react';

export default function AiInsights() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-xl">
             <BrainCircuit className="text-purple-400" size={28} />
          </div>
          AI & RAG Insights
        </h2>
        <p className="text-gray-400 mt-2 pl-14">LLM-generated explanations for recent policy actions.</p>
      </header>
      
      <div className="space-y-6">
        {/* Insight Item 1 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded uppercase font-bold tracking-wider">Blocked</span>
              Anomaly Detected (IP: 192.168.1.105)
            </h3>
            <span className="text-xs text-gray-500 font-mono">2 mins ago</span>
          </div>
          <div className="bg-gray-950 p-5 rounded-lg border border-gray-800">
            <p className="text-gray-300 text-base leading-relaxed">
              <span className="text-purple-400 font-semibold">Agent Reasoning:</span> The routing policy agent aggressively blocked the user to maintain system stability. The current matrix indicates a severe incoming rate spike (1200 req/s from single IP) matching earlier DDoS failure signatures. Connection dropped entirely.
            </p>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1"><FileSearch size={14}/> network_optimization.md</div>
            <div className="flex items-center gap-1"><FileSearch size={14}/> anomaly_signatures.md</div>
          </div>
        </div>

        {/* Insight Item 2 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs rounded uppercase font-bold tracking-wider">Throttled</span>
              Congestion Risk High (Score: 0.88)
            </h3>
            <span className="text-xs text-gray-500 font-mono">15 mins ago</span>
          </div>
          <div className="bg-gray-950 p-5 rounded-lg border border-gray-800">
            <p className="text-gray-300 text-base leading-relaxed">
              <span className="text-purple-400 font-semibold">Agent Reasoning:</span> ML prediction engine flagged an 88% probability of router queue saturation within the next 500ms based on the rising error rate. Throttle policy enacted down to 5 req/s to allow backend recovery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
