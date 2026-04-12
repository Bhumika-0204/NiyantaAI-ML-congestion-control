import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Zap, Activity } from 'lucide-react';

export default function AiInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [liveAction, setLiveAction] = useState('allow');
  const [liveAnomaly, setLiveAnomaly] = useState(false);
  const wsRef = useRef(null);

  // Connect to WebSocket for live metrics (same stream as Dashboard)
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace(/^http/, 'ws').replace('/api/v1', '') + '/ws/ai-insights-client'
        : 'ws://localhost:8000/ws/ai-insights-client';

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      setLiveMetrics(payload.metrics);
      setLiveAction(payload.decision?.action || 'allow');
      setLiveAnomaly(payload.decision?.anomaly_detected || false);
    };

    return () => ws.close();
  }, []);

  const generateLiveInsight = async () => {
      setLoading(true);
      try {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
          
          // Use REAL live metrics from WebSocket, not hardcoded values
          const metricsToSend = liveMetrics || {
              cpu_percent: 0, memory_percent: 0, incoming_rate: 0, bytes_recv_rate: 0
          };
          
          const res = await fetch(`${baseUrl}/explain`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  metrics: metricsToSend,
                  action: liveAction,
                  anomaly: liveAnomaly
              })
          });
          const data = await res.json();
          
          setInsights(prev => [
            { 
              id: Date.now(), 
              title: `${liveAction.toUpperCase()} Decision Analysis`, 
              desc: data.explanation, 
              time: new Date().toLocaleTimeString(),
              action: liveAction,
              metrics: { ...metricsToSend }
            },
            ...prev
          ].slice(0, 10)); // Keep last 10 insights
      } catch (err) {
          setInsights(prev => [
            { id: Date.now(), title: 'Backend Unreachable', desc: `Could not connect to reasoning engine: ${err.message}. Ensure the backend is running on port 8000.`, time: new Date().toLocaleTimeString(), action: 'error', metrics: {} },
            ...prev
          ]);
      }
      setLoading(false);
  };

  const actionColor = liveAction === 'block' ? 'text-red-400' : liveAction === 'throttle' ? 'text-orange-400' : 'text-emerald-400';

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
            <p className="text-gray-400 mt-2 pl-14">LLM-generated explanations using real-time system telemetry.</p>
        </div>
        <button 
            onClick={generateLiveInsight} 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-bold transition">
            <Zap size={18} />
            {loading ? "Analyzing..." : "Generate Live LLM Insight"}
        </button>
      </header>

      {/* Live Metrics Preview */}
      {liveMetrics && (
        <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">Current Live Telemetry (used for next insight)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-gray-500">CPU</span>
              <p className="text-white font-mono font-bold">{(liveMetrics.cpu_percent || 0).toFixed(1)}%</p>
            </div>
            <div>
              <span className="text-gray-500">Memory</span>
              <p className="text-white font-mono font-bold">{(liveMetrics.memory_percent || 0).toFixed(1)}%</p>
            </div>
            <div>
              <span className="text-gray-500">Packet Rate</span>
              <p className="text-white font-mono font-bold">{Math.floor(liveMetrics.incoming_rate || 0)}/s</p>
            </div>
            <div>
              <span className="text-gray-500">Bandwidth</span>
              <p className="text-white font-mono font-bold">{((liveMetrics.bytes_recv_rate || 0) / 1024).toFixed(1)} KB/s</p>
            </div>
            <div>
              <span className="text-gray-500">Current Action</span>
              <p className={`font-mono font-bold ${actionColor}`}>{liveAction.toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {insights.length === 0 && (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-xl">
                Click the button above to analyze current live system state with the AI reasoning engine.
            </div>
        )}
        {insights.map(item => (
            <div key={item.id} className={`bg-gray-900 border rounded-xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition duration-300 ${item.action === 'block' ? 'border-red-500/20' : item.action === 'throttle' ? 'border-orange-500/20' : 'border-gray-800'}`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${item.action === 'block' ? 'bg-red-500' : item.action === 'throttle' ? 'bg-orange-500' : 'bg-purple-500'}`}></div>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded uppercase font-bold tracking-wider ${item.action === 'block' ? 'bg-red-500/10 text-red-400' : item.action === 'throttle' ? 'bg-orange-500/10 text-orange-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  {item.action === 'error' ? 'ERROR' : 'AI Generated'}
                </span>
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
