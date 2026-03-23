import React from 'react';
import { BrainCircuit, Database, GitBranch, ShieldCheck } from 'lucide-react';

export default function ModelArchitecture() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4 text-gray-200 pb-12">
      
      <div className="mb-10 bg-white/[0.02] border border-white/5 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-4xl font-bold text-white flex items-center gap-4 mb-4 tracking-tight">
          <BrainCircuit className="text-cyan-400" size={40} />
          Niyanta ML Pipeline
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">Deep dive into the machine learning engineering powering the dynamic active network controller. Every aspect of this model was designed to handle large-scale network congestion patterns efficiently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-2xl shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all"></div>
           <Database className="text-cyan-400 mb-6" size={32} />
           <h2 className="text-xl font-bold text-white mb-3">Stratified Sampling</h2>
           <p className="text-gray-400 text-sm leading-relaxed mb-4">
             Network congestion events are naturally imbalanced (congestion happens rarely compared to normal flow). 
             To combat this, the dataset is split using strict <code className="text-cyan-300 font-mono bg-cyan-500/10 px-1 rounded">stratify=y</code> partitioning ensuring the training set 
             always maintains the exact real-world ratio of congestion vectors.
           </p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-2xl shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
           <GitBranch className="text-emerald-400 mb-6" size={32} />
           <h2 className="text-xl font-bold text-white mb-3">Pipeline Preprocessing</h2>
           <p className="text-gray-400 text-sm leading-relaxed mb-4">
             Logistic Regression models are highly sensitive to feature scales. The entire Niyanta model is strictly wrapped in a native Scikit-Learn <code className="text-emerald-300 font-mono bg-emerald-500/10 px-1 rounded break-words">Pipeline(StandardScaler() -{'>'} LogisticRegression(class_weight="balanced"))</code>.
             This fundamentally eliminates data leakage across testing sets and standardizes absolute inference.
           </p>
        </div>

        <div className="bg-gradient-to-br from-white/[0.05] to-cyan-500/[0.02] border border-cyan-500/20 p-8 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.05)] md:col-span-2 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-colors"></div>
           <ShieldCheck className="text-cyan-400 mb-6" size={36} />
           <h2 className="text-2xl font-bold text-white mb-4">ROC-AUC Target Thresholding</h2>
           <p className="text-gray-300 leading-relaxed mb-4 max-w-4xl">
             Instead of a hard binary 1/0 cutoff, the model uses <code className="text-cyan-300 font-mono bg-cyan-500/20 px-1 rounded">predict_proba()</code> against a customizable <code className="text-cyan-300 font-mono bg-cyan-500/20 px-1 rounded">0.6</code> probability threshold. 
             This unique capability aggressively slices the area under the ROC curve to specifically target and penalize <b className="text-white">False Negatives</b>, 
             which is critical in active network nodes where missing an early congestion signal causes massive cascade dropping.
           </p>
        </div>

      </div>
    </div>
  );
}
