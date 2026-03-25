import React, { useState } from 'react';
import { TerminalSquare, Play } from 'lucide-react';

export default function ApiPlayground() {
  const [response, setResponse] = useState('');
  
  const handleTest = async () => {
    setResponse('Loading network route logic...');
    try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const res = await fetch(`${baseUrl}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                metrics: {
                    incoming_rate: 1500,
                    latency: 250,
                    error_rate: 0.05,
                    queue_length: 85,
                    dropped_packets: 12
                }
            })
        });
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
        setResponse(`Connection Error: ${err.message}\n\nPlease check that your VITE_API_URL environment variable is set to your Render URL starting with https://`);
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
        <p className="text-gray-400 mt-2 pl-14">Test the REST endpoints locally.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col hover:border-sky-500/30 transition duration-300 hover:-translate-y-1 shadow-lg shadow-black/50">
          <h3 className="font-bold text-lg mb-4 text-sky-400 bg-sky-500/10 py-1 px-3 rounded inline-block w-max">POST /api/v1/analyze</h3>
          <p className="text-sm text-gray-400 mb-4">Send a simulation payload to trigger the Prediction and Policy agents.</p>
          
          <div className="bg-gray-950 p-4 rounded-lg font-mono text-sm text-emerald-400 flex-1 border border-gray-800 leading-relaxed overflow-hidden">
{`{
  "metrics": {
    "incoming_rate": 1500,
    "latency": 250,
    "error_rate": 0.05,
    "queue_length": 85,
    "dropped_packets": 12
  }
}`}
          </div>
          
          <button onClick={handleTest} className="mt-6 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95">
            <Play size={18} fill="currentColor" /> Send Request
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col hover:border-gray-700 transition duration-300">
          <h3 className="font-bold text-lg mb-4 text-gray-200">Response Data</h3>
          <div className="bg-[#0b0e14] p-5 rounded-lg font-mono text-sm flex-1 border border-gray-800 overflow-y-auto whitespace-pre-wrap text-emerald-300 shadow-inner block">
            {response || <span className="text-gray-600 italic">// Waiting for request...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
