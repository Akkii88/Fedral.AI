import React, { useState, useEffect } from 'react';
import { CpuIcon, Shield, Lock, CheckCircle2, Activity, Database, FileBarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { BrowserAnalysis } from '../services/BrowserAnalysis';

const Testing = ({ data, onNext }) => {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Initializing Secure AI Node...');
    const [activeNode, setActiveNode] = useState(0);

    const nodes = [
        { id: 0, label: 'Initialization', icon: <CpuIcon size={18} />, match: /Initializing/i },
        { id: 1, label: 'Dataset Loaded', icon: <Database size={18} />, match: /Dataset|Loading/i },
        { id: 2, label: 'Computing Metrics', icon: <Activity size={18} />, match: /Metrics|Analyzing/i },
        { id: 3, label: 'Verifying Results', icon: <FileBarChart size={18} />, match: /Finalizing|Optimized/i },
    ];

    const [error, setError] = useState(null);

    useEffect(() => {
        const handleUpdate = (update) => {
            if (update.type === 'status') {
                // Safe state updates
                const cleanMessage = typeof update.message === 'string' ? update.message : 'Processing...';
                const cleanProgress = typeof update.progress === 'number' ? update.progress : 0;

                setStatusText(cleanMessage);
                setProgress(cleanProgress);

                // Logic to advance nodes based on status message keywords
                nodes.forEach(node => {
                    if (node.match.test(update.message)) {
                        setActiveNode(node.id);
                    }
                });
            } else if (update.type === 'result') {
                setActiveNode(3);
                setStatusText('Analysis verified. Finalizing report...');
                setProgress(100);
                setTimeout(() => onNext(update), 1500);
            } else if (update.type === 'error') {
                console.error("Analysis Error:", update.message);
                setError(update.message);
                setStatusText(`System Error: ${update.message}`);
                setProgress(0);
            }
        };

        const startTesting = async () => {
            if (window.electronAPI) {
                // Electron Environment (Desktop App)
                window.electronAPI.onAnalysisUpdate(handleUpdate);
                window.electronAPI.runAnalysis(data.filePath, data.rowCount);
            } else {
                // Browser Environment (Real Client-Side ML)
                const runBrowserML = async () => {
                    if (data.data) {
                        const result = await BrowserAnalysis.run(data.data, handleUpdate);
                        if (result) handleUpdate(result);
                    } else {
                        handleUpdate({ type: 'error', message: "No data available for browser analysis." });
                    }
                };
                runBrowserML();
            }
        };

        startTesting();

        return () => {
            if (window.electronAPI) {
                window.electronAPI.removeAnalysisListeners();
            }
        };
    }, [data.filePath, onNext, data.data, data.rowCount]);

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center p-8">
                <div className="bg-red-50 border border-red-200 rounded-[32px] p-12 max-w-2xl w-full shadow-xl">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Activity size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Analysis Failed</h2>
                    <p className="text-slate-600 mb-8 font-medium leading-relaxed">
                        {error}
                    </p>
                    <div className="p-4 bg-white/50 rounded-2xl border border-red-100 text-left mb-8 overflow-auto max-h-40">
                        <code className="text-xs text-red-800 break-all">{error}</code>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        Restart Application
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center p-8">
            {/* Header Section */}
            <div className="mb-16">
                <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">
                    Private <span className="text-primary-500">Analysis</span>
                </h2>
                <div className="flex items-center justify-center gap-2 text-slate-400 font-bold uppercase tracking-[4px] text-xs">
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                    Local Compute Active
                </div>
            </div>

            {/* Premium Node Progress Line */}
            <div className="w-full max-w-4xl relative mb-24 px-12">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(activeNode / (nodes.length - 1)) * 100}%` }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                    />
                </div>

                {/* Nodes */}
                <div className="relative flex justify-between items-center w-full">
                    {nodes.map((node, index) => {
                        const isCompleted = index < activeNode;
                        const isActive = index === activeNode;

                        return (
                            <div key={node.id} className="relative flex flex-col items-center group">
                                <motion.div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500
                                        ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' :
                                            isActive ? 'bg-primary-500 text-white shadow-2xl shadow-primary-200' :
                                                'bg-white text-slate-300 border-2 border-slate-100 shadow-sm'}`}
                                    animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    {isCompleted ? <CheckCircle2 size={24} /> : node.icon}

                                    {isActive && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-primary-500"
                                            animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        />
                                    )}
                                </motion.div>

                                <div className="absolute top-20 flex flex-col items-center w-40">
                                    <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-500
                                        ${isActive ? 'text-primary-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {node.label}
                                    </span>
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-[9px] font-bold text-primary-400 mt-1"
                                        >
                                            PROCESSING...
                                        </motion.span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Status Footer */}
            <div className="bg-white/50 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm max-w-lg w-full">
                <p className="text-slate-700 font-bold mb-4 flex items-center justify-center gap-3">
                    <Activity size={20} className="text-primary-500 animate-pulse" />
                    {statusText}
                </p>
                <div className="w-full bg-slate-200/50 h-3 rounded-full overflow-hidden p-0.5">
                    <motion.div
                        className="h-full bg-primary-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 50 }}
                    />
                </div>
            </div>

            {/* Security Badges */}
            <div className="flex gap-8 mt-16 opacity-40">
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 tracking-[4px] uppercase">
                    <Lock size={14} /> NO PII LEAKAGE
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 tracking-[4px] uppercase">
                    <Shield size={14} /> ISO-CERTIFIED COMPUTE
                </div>
            </div>
        </div>
    );
};

export default Testing;
