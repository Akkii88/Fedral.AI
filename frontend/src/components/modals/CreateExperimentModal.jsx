import React, { useState } from 'react';
import { X, Zap, Target, Layers, ShieldCheck, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateExperimentModal = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        dataset: 'breast_cancer',
        rounds: 10,
        clients: 5,
        fairness_enforced: false,
        robust_aggregation: false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card w-full max-w-xl overflow-hidden shadow-2xl border border-white/20"
            >
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <Zap size={24} className="fill-current" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">New Simulation</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Configure Stream Parameters</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Experiment Name */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Target size={14} />
                            Experiment Alias
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Oncology-Stream-01"
                            className="w-full bg-white border-2 border-slate-200 focus:border-primary-500/50 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 transition-all outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Numeric Inputs Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Layers size={14} />
                                Rounds
                            </label>
                            <input
                                type="number"
                                className="w-full bg-white border-2 border-slate-200 focus:border-primary-500/50 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 transition-all outline-none"
                                value={formData.rounds}
                                onChange={e => setFormData({ ...formData, rounds: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Cpu size={14} />
                                Active Nodes
                            </label>
                            <input
                                type="number"
                                className="w-full bg-white border-2 border-slate-200 focus:border-primary-500/50 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 transition-all outline-none"
                                value={formData.clients}
                                onChange={e => setFormData({ ...formData, clients: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Advanced Toggles */}
                    <div className="space-y-4 pt-2">
                        <div
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => setFormData({ ...formData, fairness_enforced: !formData.fairness_enforced })}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${formData.fairness_enforced ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800">Demographic Parity</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enforce AI Fairness</p>
                                </div>
                            </div>
                            <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${formData.fairness_enforced ? 'bg-primary-500' : 'bg-slate-200'}`}>
                                <motion.div animate={{ x: formData.fairness_enforced ? 20 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>

                        <div
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => setFormData({ ...formData, robust_aggregation: !formData.robust_aggregation })}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${formData.robust_aggregation ? 'bg-primary-50 text-primary-500' : 'bg-slate-100 text-slate-400'}`}>
                                    <Layers size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800">Robust Aggregation</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Median-based fusion</p>
                                </div>
                            </div>
                            <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${formData.robust_aggregation ? 'bg-primary-500' : 'bg-slate-200'}`}>
                                <motion.div animate={{ x: formData.robust_aggregation ? 20 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-6 border-t border-slate-100 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold py-4 rounded-2xl transition-all"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] bg-primary-500 hover:bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-3"
                        >
                            <Zap size={20} className="fill-current" />
                            Initialize Stream
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default CreateExperimentModal;
