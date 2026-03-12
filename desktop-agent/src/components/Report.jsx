import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Radar, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import {
    Download, Share2, ChevronRight, CheckCircle2,
    Target, Activity, Zap, Info, Shield, Lock,
    AlertTriangle, HeartPulse, BrainCircuit, Share
} from 'lucide-react';
import { motion } from 'framer-motion';

const Report = ({ results, onNext }) => {
    // If no results, show empty state
    if (!results) return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#fafafa]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-3xl shadow-xl max-w-md"
            >
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Analysis Incomplete</h2>
                <p className="text-slate-500 mb-6 leading-relaxed">The AI could not generate a complete report. This usually happens if the data format was incorrect.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                >
                    Restart System
                </button>
            </motion.div>
        </div>
    );

    const COLORS = ['#ef4444', '#f59e0b', '#10b981']; // High, Med, Low
    const RADAR_COLORS = { stroke: '#6366f1', fill: '#6366f1' };

    // Essential values
    const accuracy = results.accuracy || 0;
    const sensitivity = results.sensitivity || 0;
    const specificity = results.specificity || 0;
    const precision = results.precision || 0;
    const high_risk = results.high_risk || 0;
    const medium_risk = results.medium_risk || 0;
    const low_risk = results.low_risk || 0;
    const totalCount = results.totalCount || 0;

    const riskData = [
        { name: 'High Risk', value: high_risk, description: 'Requires Immediate Attention' },
        { name: 'Med Risk', value: medium_risk, description: 'Requires Monitoring' },
        { name: 'Low Risk', value: low_risk, description: 'Stable/Routine' },
    ];

    const radarData = [
        { subject: 'Accuracy', A: accuracy, fullMark: 100 },
        { subject: 'Sensitivity', A: sensitivity, fullMark: 100 },
        { subject: 'Specificity', A: specificity, fullMark: 100 },
        { subject: 'Precision', A: precision, fullMark: 100 },
    ];

    const metrics = [
        {
            label: 'Accuracy',
            value: accuracy.toFixed(1),
            icon: <Target />,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50',
            desc: 'Overall model correctness'
        },
        {
            label: 'Sensitivity',
            value: sensitivity.toFixed(1),
            icon: <Activity />,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            desc: 'True Positive Rate'
        },
        {
            label: 'Specificity',
            value: specificity.toFixed(1),
            icon: <Shield />,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            desc: 'True Negative Rate'
        },
        {
            label: 'Precision',
            value: precision.toFixed(1),
            icon: <CheckCircle2 />,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            desc: 'Positive Predictive Value'
        },
    ];

    const handleExport = async () => {
        const timestamp = new Date().toLocaleString();
        const csvContent = [
            `FEDRAL AI - CLINICAL INTELLIGENCE SUMMARY`,
            `Generated on: ${timestamp}`,
            ``,
            `METRICS`,
            `Accuracy,${accuracy}%`,
            `Sensitivity,${sensitivity}%`,
            `Specificity,${specificity}%`,
            `Precision,${precision}%`,
            ``,
            `RISK DISTRIBUTION`,
            `High Risk,${high_risk}`,
            `Medium Risk,${medium_risk}`,
            `Low Risk,${low_risk}`,
        ].join('\n');

        const res = await window.electronAPI.saveReport(
            csvContent,
            `Fedral_Report_${Date.now()}.csv`
        );
        if (res.success) alert(`Report exported: ${res.filePath}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col bg-[#fafafa]/50 overflow-y-auto pr-2 custom-scrollbar"
        >
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/80 backdrop-blur-md py-6 px-2 z-20 border-b border-slate-100">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <BrainCircuit size={20} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Analysis <span className="text-primary-600">Results</span></h2>
                    </div>
                    <p className="text-slate-500 font-medium pl-14">
                        Processed {totalCount.toLocaleString()} patients • {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:border-primary-500 hover:text-primary-600 hover:shadow-lg transition-all flex items-center gap-2 font-bold"
                    >
                        <Download size={18} />
                        Export Data
                    </button>
                    <div className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold flex items-center gap-2 uppercase tracking-wider shadow-xl">
                        <Lock size={14} className="text-emerald-400" />
                        Secure Environment
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-2">
                {metrics.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${m.bg} rounded-bl-[100px] -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110`}></div>

                        <div className="relative z-10">
                            <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center mb-4`}>
                                {m.icon}
                            </div>
                            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{m.label}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900">{m.value}</span>
                                <span className="text-sm font-bold text-slate-400">%</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 font-medium">{m.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 px-2">

                {/* Radar Chart: Performance Shape */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative"
                >
                    <h3 className="absolute top-8 left-8 text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Zap size={18} className="text-indigo-500" />
                        Model Performance
                    </h3>
                    <div className="w-full h-[300px] mt-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="AI Model"
                                    dataKey="A"
                                    stroke={RADAR_COLORS.stroke}
                                    strokeWidth={3}
                                    fill={RADAR_COLORS.fill}
                                    fillOpacity={0.2}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Bar Chart: Risk Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                <Activity className="text-primary-400" />
                                Patient Risk Triage
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">Classification of {totalCount} analyzed patients</p>
                        </div>
                        <div className="flex gap-4">
                            {riskData.map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                    <span className="text-xs font-bold text-slate-300 uppercase">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full h-[280px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={riskData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const d = payload[0].payload;
                                            return (
                                                <div className="bg-slate-800 text-white p-4 rounded-xl shadow-xl border border-slate-700">
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">{d.name}</p>
                                                    <p className="text-2xl font-black">{d.value}</p>
                                                    <p className="text-[10px] text-primary-400 mt-1">{d.description}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Actions */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mx-2 mb-8 bg-gradient-to-r from-white to-[#fafafa] rounded-[32px] p-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8"
            >
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0">
                        <Share2 size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 mb-1">Collaborative Learning</h3>
                        <p className="text-slate-500 text-sm max-w-md">
                            Contribute the learnable patterns (weights) to the global model.
                            <span className="font-bold text-slate-700 block mt-1">Zero patient data leaves your device.</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-[#fafafa] transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={onNext}
                        className="px-10 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center gap-2 group"
                    >
                        Contribute Patterns
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </motion.div>

        </motion.div>
    );
};

export default Report;
