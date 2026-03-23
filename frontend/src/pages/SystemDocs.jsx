import React from 'react';
import { BookOpen, Code, ServerCrash, Cpu, Activity } from 'lucide-react';

export default function SystemDocs() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4 text-gray-200 pb-12">
      
      <div className="mb-10 bg-white/[0.02] border border-white/5 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-4xl font-bold text-white flex items-center gap-4 mb-4 tracking-tight">
          <BookOpen className="text-blue-400" size={40} />
          System Documentation
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">Engineering architecture and design justifications detailing how the Niyanta Core infrastructure actively manages ultra-low latency data pipelines and isolates comparative states.</p>
      </div>

      <div className="space-y-6">
        
        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-2xl shadow-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
            <ServerCrash className="text-rose-400" size={24} /> Websocket Streams vs REST
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-4xl">
            The Niyanta frontend completely abandons traditional REST API polling in favor of persistent <code className="text-blue-300 font-mono bg-blue-500/10 px-1 rounded">ws://</code> layer connections. 
            This native web socket integration enables sub-millisecond tick streaming identically matching internal backend router clock speeds. This establishes a true zero-latency, full-duplex dashboard architecture without overloading maximum HTTP simultaneous connection constraints.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-2xl shadow-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
            <Cpu className="text-indigo-400" size={24} /> Dual-State Isolation Architecture
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-4xl">
            Every simulation spun up by a frontend React client initiates an independent backend <code className="text-indigo-300 font-mono bg-indigo-500/10 px-1 rounded">SimulationSession</code> keyed by a unique UUID.
            Within this session, two isolated network Router objects run completely synchronously. 
            By feeding the exact identical traffic loads into both the Static baseline and the Niyanta Adaptive path simultaneously, the system scientifically enforces control constraints, highlighting the pure marginal gain of the applied machine learning policies.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-2xl shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
            <Activity className="text-emerald-400" size={24} /> Incremental Active Throttling 
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-4xl">
            Legacy congestion scripts usually enforce a "hard-throttle", instantaneously dropping load from Maximum capacity down to Minimum threshold upon a congestion trigger. 
            The modernized Niyanta controller dynamically scales probability flags into gradual <code className="text-emerald-300 font-mono bg-emerald-500/10 px-1 rounded">rate - 2</code> decelerations or <code className="text-emerald-300 font-mono bg-emerald-500/10 px-1 rounded">rate + 1</code> accelerations. 
            This smoothly simulates advanced TCP Tahoe/Reno congestion avoidance protocols natively via active ML, rather than rigid rule-based systems.
          </p>
        </div>
      </div>
    </div>
  );
}
