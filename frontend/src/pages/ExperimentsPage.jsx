import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import CreateExperimentModal from '../components/modals/CreateExperimentModal';
import { Play, Pause, BarChart2, Plus, Zap, Activity, Target, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ExperimentsPage = () => {
    const [experiments, setExperiments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const fetchExperiments = async () => {
        try {
            const data = await api.experiments.list();
            setExperiments(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchExperiments();
        const interval = setInterval(fetchExperiments, 2000); // Poll for updates
        return () => clearInterval(interval);
    }, []);

    const handleCreate = async (config) => {
        const newExp = await api.experiments.create(config);
        await api.experiments.start(newExp.id);
        setShowModal(false);
        fetchExperiments();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-primary-500 font-bold text-[10px] uppercase tracking-[0.2em]"
                    >
                        <Zap size={14} className="fill-current" />
                        Simulation Lab
                    </motion.div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter leading-tight">Federated Experiments</h1>
                    <p className="text-slate-400 font-medium">Configure, launch, and monitor federated learning experiments across nodes.</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center gap-3 shrink-0"
                >
                    <Plus size={20} />
                    Launch Experiment
                </button>
            </div>

            {/* Experiment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {experiments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-32 glass-card border-dashed flex flex-col items-center justify-center gap-6"
                        >
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                <Activity size={32} />
                            </div>
                            <div className="text-center">
                                <p className="font-black text-slate-900 text-xl">No active streams</p>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Initialize your first clinical simulation</p>
                            </div>
                        </motion.div>
                    ) : (
                        experiments.map((exp, idx) => (
                            <motion.div
                                key={exp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glass-card group flex flex-col cursor-pointer transition-all border-2 border-transparent hover:border-primary-500/10"
                                onClick={() => navigate(`/experiments/${exp.id}`)}
                            >
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-black text-slate-950 leading-tight group-hover:text-primary-500 transition-colors">
                                                    {exp.name || 'Unnamed Experiment'}
                                                </h3>
                                                <ArrowUpRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all font-black" />
                                            </div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Target size={12} />
                                                {exp.dataset || 'No Dataset'}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${exp.status === 'running' ? 'bg-primary-50 text-primary-500' : 'bg-emerald-50 text-emerald-500'
                                            }`}>
                                            {exp.status}
                                        </span>
                                    </div>

                                    {/* Progress Widget */}
                                    <div className="space-y-3 bg-slate-50/50 p-6 rounded-2xl">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Iterative Rounds</span>
                                            <span className="text-lg font-black text-slate-900 tabular-nums">
                                                {exp.current_round || 0}
                                                <span className="text-slate-300 mx-1">/</span>
                                                {exp.rounds || 0}
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((exp.current_round || 0) / (exp.rounds || 1)) * 100}%` }}
                                                className={`h-full transition-colors ${exp.status === 'completed' ? 'bg-emerald-500' : 'bg-primary-500'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Key Metrics Strip */}
                                    <div className="grid grid-cols-2 gap-4 pb-2">
                                        <div className="space-y-1 border-l-2 border-primary-500/20 pl-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Acc</p>
                                            <p className="text-xl font-black text-slate-900 tracking-tighter">
                                                {(() => {
                                                    try {
                                                        const m = JSON.parse(exp.metrics_json || '[]');
                                                        return m.length > 0 ? (m[m.length - 1].accuracy * 100).toFixed(1) + '%' : '--%';
                                                    } catch { return '--%'; }
                                                })()}
                                            </p>
                                        </div>
                                        <div className="space-y-1 border-l-2 border-emerald-500/20 pl-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fairness Gap</p>
                                            <p className="text-xl font-black text-slate-900 tracking-tighter">
                                                {(() => {
                                                    try {
                                                        const m = JSON.parse(exp.metrics_json || '[]');
                                                        return m.length > 0 ? m[m.length - 1].fairness_gap.toFixed(3) : '--';
                                                    } catch { return '--'; }
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                        Federated Protection
                                    </div>
                                    <button className="text-xs font-black text-primary-500 uppercase tracking-widest flex items-center gap-1.5 hover:gap-3 transition-all">
                                        Analysis
                                        <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {showModal && <CreateExperimentModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
        </div>
    );
};

export default ExperimentsPage;
