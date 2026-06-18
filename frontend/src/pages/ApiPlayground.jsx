import React, { useState, useEffect } from 'react';
import { TerminalSquare, Play, Activity } from 'lucide-react';

export default function ApiPlayground() {
  const [response, setResponse] = useState('');
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [customPayload, setCustomPayload] = useState('');

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace(/^http/, 'ws').replace('/api/v1', '') + '/ws/playground-client'
        : 'ws://localhost:8000/ws/playground-client';

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      setLiveMetrics(payload.metrics);
      const realPayload = {
        ip: "127.0.0.1",
        metrics: {
          incoming_rate: Math.floor(payload.metrics.incoming_rate || 0),
          cpu_percent: parseFloat((payload.metrics.cpu_percent || 0).toFixed(1)),
          memory_percent: parseFloat((payload.metrics.memory_percent || 0).toFixed(1)),
          bytes_recv_rate: Math.floor(payload.metrics.bytes_recv_rate || 0),
          latency: parseFloat((payload.metrics.latency || 0).toFixed(1)),
          error_rate: parseFloat((payload.metrics.error_rate || 0).toFixed(3)),
          queue_length: Math.floor(payload.metrics.queue_length || 0),
          dropped_packets: Math.floor(payload.metrics.dropped_packets || 0),
        }
      };
      setCustomPayload(JSON.stringify(realPayload, null, 2));
    };

    return () => ws.close();
  }, []);

  const handleTest = async () => {
    setResponse('Sending live metrics to analyze endpoint...');
    try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const payloadToSend = JSON.parse(customPayload);
        
        const res = await fetch(`${baseUrl}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadToSend)
        });
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
        setResponse(`Connection Error: ${err.message}\n\nEnsure the backend is running on port 8000.`);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 rounded-xl">
             <TerminalSquare className="text-sky-400" size={28} />
          </div>
          API Playground
        </h2>
        <p className="text-gray-400 mt-2 pl-14">Test REST endpoints with live system metrics.</p>
      </header>

      {}
      {liveMetrics && (
        <div className="bg-gray-900 border border-sky-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Activity size={16} className="text-sky-400" />
          <span className="text-sm text-sky-400 font-semibold">Payload auto-populated with live OS metrics</span>
          <div className="ml-auto flex gap-4 text-xs text-gray-400">
            <span>CPU: {(liveMetrics.cpu_percent || 0).toFixed(1)}%</span>
            <span>Rate: {Math.floor(liveMetrics.incoming_rate || 0)}/s</span>
            <span>BW: {((liveMetrics.bytes_recv_rate || 0) / 1024).toFixed(1)} KB/s</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col hover:border-sky-500/30 transition duration-300 hover:-translate-y-1 shadow-lg shadow-black/50">
          <h3 className="font-bold text-lg mb-4 text-sky-400 bg-sky-500/10 py-1 px-3 rounded inline-block w-max">POST /api/v1/analyze</h3>
          <p className="text-sm text-gray-400 mb-4">Sending live system metrics to the Prediction and Policy agents.</p>
          
          <textarea
            value={customPayload || '{}'}
            onChange={(e) => setCustomPayload(e.target.value)}
            className="bg-gray-950 p-4 rounded-lg font-mono text-sm text-emerald-400 flex-1 border border-gray-800 leading-relaxed resize-none focus:outline-none focus:border-sky-500"
            rows={12}
          />
          
          <button onClick={handleTest} className="mt-6 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95">
            <Play size={18} fill="currentColor" /> Send Live Request
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col hover:border-gray-700 transition duration-300">
          <h3 className="font-bold text-lg mb-4 text-gray-200">Response Data</h3>
          <div className="bg-[#0b0e14] p-5 rounded-lg font-mono text-sm flex-1 border border-gray-800 overflow-y-auto whitespace-pre-wrap text-emerald-300 shadow-inner block">
            {response || <span className="text-gray-600 italic">Awaiting execution...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
