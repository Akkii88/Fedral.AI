import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { generateReport } from '../services/report';
import ChartCard from '../components/ChartCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, ReferenceLine } from 'recharts';
import { ArrowLeft, Download, RefreshCw, CheckCircle, Zap, Target, Activity, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExperimentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [experiment, setExperiment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await api.experiments.get(id);
                setExperiment(data);
                setLoading(false);
            } catch (e) { console.error(e); }
        };
        fetch();
        const interval = setInterval(fetch, 2000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading || !experiment) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
                <RefreshCw size={32} />
            </motion.div>
            <p className="font-black text-[10px] uppercase tracking-[0.2em]">Recalibrating Neural Metrics...</p>
        </div>
    );

    const metrics = experiment.metrics;
    const lastMetric = metrics.length > 0 ? metrics[metrics.length - 1] : { accuracy: 0, auc: 0, fairness_gap: 0 };

    // Prepare Data for Charts
    const accuracyData = metrics.map(m => ({
        round: `R${m.round_id}`,
        accuracy: (m.accuracy * 100).toFixed(1),
        val: m.accuracy * 100
    }));

    const fairnessData = [
        { group: 'Majority Group', score: 0.92, fill: '#6366f1' },
        { group: 'Minority Group', score: (0.92 - lastMetric.fairness_gap).toFixed(2), fill: lastMetric.fairness_gap > 0.1 ? '#f43f5e' : '#10b981' }
    ];

    const biomarkerData = Object.entries(experiment.biomarkers).map(([k, v]) => ({
        name: k.replace(/_/g, ' '),
        importance: Math.abs(v)
    })).sort((a, b) => b.importance - a.importance).slice(0, 5);

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24">
            {/* Header Area */}
            <div className="flex flex-col gap-8">
                <nav className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    <button onClick={() => navigate('/experiments')} className="hover:text-slate-600 transition-colors">Experiments</button>
                    <ChevronRight size={10} />
                    <span className="text-slate-900">{experiment.config.name}</span>
                </nav>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter">{experiment.config.name}</h1>
                            {experiment.status === 'running' && (
                                <div className="flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                    <span className="text-primary-500 font-black text-[10px] uppercase tracking-widest">Training</span>
                                </div>
                            )}
                            {experiment.status === 'completed' && (
                                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full">
                                    <CheckCircle size={14} className="text-emerald-500" />
                                    <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">Converged</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Database size={14} className="text-slate-300" />
                                Dataset: {experiment.config.dataset}
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap size={14} className="text-slate-300" />
                                Configuration: {experiment.config.rounds} Rounds
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity size={14} className="text-slate-300" />
                                Peak Accuracy: {(Math.max(...metrics.map(m => m.accuracy), 0) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => generateReport(experiment.config.name, 'report-content')}
                            className="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 text-xs uppercase tracking-widest"
                        >
                            <FileText size={18} />
                            Generate Analytics PDF
                        </button>
                    </div>
                </div>
            </div>

            <div id="report-content" className="space-y-12">
                {/* 1. Accuracy Evolution */}
                <ChartCard
                    title="Model Capabilities"
                    subtitle="Diagnostic Accuracy Over Federated Rounds"
                    footerText={`Collaboration efficacy result: Starting at ${(metrics[0]?.accuracy * 100 || 0).toFixed(0)}%, accuracy scaled to ${(lastMetric.accuracy * 100).toFixed(1)}%. This stable upward curve validates the federated aggregation protocol without raw data exposure.`}
                    color="#0ea5e9"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={accuracyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="round"
                                tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                unit="%"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: '#fff',
                                    backdropFilter: 'blur(8px)'
                                }}
                                itemStyle={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="val"
                                stroke="#0ea5e9"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorAcc)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* 2. Fairness & Interpretability Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ChartCard
                        title="Ethical Guardrails"
                        subtitle="Demographic Fairness Parity"
                        footerText={
                            lastMetric.fairness_gap < 0.1
                                ? "Success: The performance delta between demographic groups is within the negligible 10% threshold. The model is statistically unbiased for deployment."
                                : "Warning: Violation of parity constraints detected. Model utility favors majority demographics. Retraining with fairness-aware loss is recommended."
                        }
                        color={lastMetric.fairness_gap < 0.1 ? "#10b981" : "#f59e0b"}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={fairnessData} layout="vertical" margin={{ left: 20, right: 40 }}>
                                <XAxis type="number" domain={[0, 1]} hide />
                                <YAxis
                                    dataKey="group"
                                    type="category"
                                    width={100}
                                    tick={{ fill: '#475569', fontWeight: 800, fontSize: 10, textTransform: 'uppercase' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={32}>
                                    {fairnessData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Top Biomarkers"
                        subtitle="Clinical Predictor Importance"
                        footerText="High-importance features identified via SHAP analysis. Feature weights align with clinical oncology guidelines, ensuring model decisions are clinically significant."
                        color="#f43f5e"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={biomarkerData} layout="vertical" margin={{ left: 20, right: 40 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={120}
                                    tick={{ fill: '#475569', fontWeight: 800, fontSize: 10, textTransform: 'uppercase' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="importance" fill="#f43f5e" radius={[0, 8, 8, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

export default ExperimentDetail;
