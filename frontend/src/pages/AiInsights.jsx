import React, { useState } from 'react';
import { BrainCircuit, FileSearch, Zap } from 'lucide-react';

export default function AiInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateLiveInsight = async () => {
      setLoading(true);
      try {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
          const res = await fetch(`${baseUrl}/explain`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  metrics: {
                      incoming_rate: 1800,
                      latency: 350,
                      error_rate: 0.08,
                      queue_length: 95,
                      dropped_packets: 40
                  },
                  action: "block",
                  anomaly: true
              })
          });
          const data = await res.json();
          
          setInsights(prev => [
            { id: Date.now(), title: 'Live LLM Diagnostics', desc: data.explanation, time: new Date().toLocaleTimeString() },
            ...prev
          ]);
      } catch (err) {
          setInsights(prev => [
            { id: Date.now(), title: 'Error Connecting to Backend', desc: err.message, time: new Date().toLocaleTimeString() },
            ...prev
          ]);
      }
      setLoading(false);
  };

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
                <BrainCircuit className="text-purple-400" size={28} />
            </div>
            AI Reasoning Insights
            </h2>
            <p className="text-gray-400 mt-2 pl-14">LLM-generated explanations for active subsystem triggers.</p>
        </div>
        <button 
            onClick={generateLiveInsight} 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-bold transition">
            <Zap size={18} />
            {loading ? "Generating..." : "Generate Live LLM Insight"}
        </button>
      </header>
      
      <div className="space-y-6">
        {insights.length === 0 && (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-xl">
                Click the button above to dynamically query the LLM backend for a live system explanation.
            </div>
        )}
        {insights.map(item => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded uppercase font-bold tracking-wider">AI Generated</span>
                {item.title}
                </h3>
                <span className="text-xs text-gray-500 font-mono">{item.time}</span>
            </div>
            <div className="bg-gray-950 p-5 rounded-lg border border-gray-800">
                <p className="text-gray-300 text-base leading-relaxed">
                <span className="text-purple-400 font-semibold">Reasoning Agent:</span> {item.desc}
                </p>
            </div>
            </div>
        ))}
      </div>
    </div>
  );
}
