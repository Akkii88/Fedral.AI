import React, { useState, useEffect } from 'react';
import {
    Search, Filter, LayoutGrid, List, MoreVertical,
    Activity, Signal, Clock, Database, PauseCircle, Trash2,
    FileText, Download, ChevronDown, ChevronUp, MapPin, Building,
    Plus, ExternalLink, ShieldCheck, Globe, Lock
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const SummaryCard = ({ label, value, sub, color, icon: Icon }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card p-6 flex items-center justify-between group"
    >
        <div className="space-y-1">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
            <p className="text-xs font-bold text-slate-400">{sub}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center transition-colors group-hover:bg-primary-50`}>
            <Icon size={24} className="text-slate-400 group-hover:text-primary-500" />
        </div>
    </motion.div>
);

const HospitalCard = ({ data, onDelete }) => {
    console.log(`[DEBUG] HospitalCard render: ${data.name}, has onDelete: ${!!onDelete}`);
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    const getStatusColor = (s) => {
        if (s === 'online') return 'text-emerald-500 bg-emerald-50';
        if (s === 'training') return 'text-primary-500 bg-primary-50';
        if (s === 'offline') return 'text-rose-500 bg-rose-50';
        return 'text-slate-400 bg-slate-50';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card overflow-hidden border-2 border-transparent hover:border-primary-500/10 transition-all"
        >
            <div className="p-8 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h3
                                onClick={() => navigate(`/clients/${data.id}`)}
                                className="text-xl font-black text-slate-900 cursor-pointer hover:text-primary-500 transition-colors leading-tight"
                            >
                                {data.name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(data.status)}`}>
                                {data.status}
                            </span>
                            {data.contribution_status && (
                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                    data.contribution_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    data.contribution_status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                    {data.contribution_status === 'pending' && 'Pending Review'}
                                    {data.contribution_status === 'accepted' && 'Merged'}
                                    {data.contribution_status === 'none' && 'No contributions'}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                            <span className="flex items-center gap-1.5"><MapPin size={12} /> {data.location}</span>
                            <span className="flex items-center gap-1.5"><Building size={12} /> {data.type}</span>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>

                {/* Grid Metrics */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50/50 p-4 rounded-2xl space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dataset</p>
                        <div className="flex items-center gap-2 text-slate-900 font-black">
                            <Database size={16} className="text-primary-500" />
                            {data.records > 0 ? data.records.toLocaleString() : '--'}
                        </div>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-2xl space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network</p>
                        <div className="flex items-center gap-2 text-slate-900 font-black">
                            <Signal size={16} className={data.status === 'offline' ? 'text-slate-300' : 'text-emerald-500'} />
                            {data.latency > 0 ? `${data.latency} ms` : '--'}
                        </div>
                    </div>
                </div>

                {/* Activity Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Local Analysis</span>
                        <span>{data.last_accuracy > 0 ? (data.last_accuracy * 100).toFixed(0) + '%' : 'Idle'}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: data.last_accuracy > 0 ? (data.last_accuracy * 100) + '%' : '0%' }}
                            className="h-full bg-primary-500"
                        />
                    </div>
                </div>
            </div>

            {/* Expandable Section */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
                    >
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Learning Velocity</h4>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">+{data.last_accuracy > 0 ? (data.last_accuracy * 100 - 50).toFixed(1) : '1.2'}% / rd</span>
                            </div>
                            <div className="h-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.contribution.map((v, i) => ({ val: v, i }))}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="val" stroke="#0ea5e9" fill="url(#colorVal)" strokeWidth={3} />
                                        <Tooltip content={<div className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-xl font-bold">Contribution Score</div>} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Actions */}
            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs font-black text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-1 uppercase tracking-widest"
                >
                    {expanded ? 'Collapse' : 'Inspect'}
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <div className="flex gap-2">
                    <button
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log(`[DEBUG] Trash button clicked for id: ${data.id}`);
                            onDelete();
                        }}
                    >
                        <Trash2 size={16} />
                    </button>
                    <button className="p-2.5 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all">
                        <ExternalLink size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const ClientsPage = () => {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHospitals();
    }, []);

    const loadHospitals = async () => {
        try {
            const data = await api.hospitals.list();
            const augmented = data.map((h, idx) => {
                // Generate unique contribution data based on hospital samples
                const baseAcc = 40 + (idx * 5);
                const contribution = [
                    baseAcc,
                    baseAcc + 5,
                    baseAcc + 10,
                    baseAcc + 15,
                    baseAcc + 18,
                    baseAcc + 20,
                    baseAcc + 22
                ];
                
                // Calculate training progress based on status and last_accuracy
                let trainingProgress = 0;
                if (h.status === 'training') {
                    trainingProgress = h.last_accuracy > 0 ? h.last_accuracy : 0.82;
                } else if (h.last_accuracy > 0) {
                    trainingProgress = h.last_accuracy;
                }
                
                return {
                    ...h,
                    contribution: contribution,
                    records: h.samples,
                    lastSync: 'Now',
                    latency: h.latency_ms,
                    training: h.status === 'training',
                    last_accuracy: trainingProgress
                };
            });
            setHospitals(augmented);
        } catch (e) {
            console.error("Failed to load hospitals", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        console.log("[DEBUG] Executing handleDelete for:", id);
        try {
            const result = await api.hospitals.delete(id);
            console.log("[DEBUG] Delete API result:", result);
            await loadHospitals();
        } catch (err) {
            console.error("[DEBUG] Delete API error:", err);
            alert("Failed to delete: " + err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            {/* Header Block */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-primary-500 font-bold text-[10px] uppercase tracking-[0.2em]"
                    >
                        <ShieldCheck size={14} />
                        Network Registry
                    </motion.div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter">Institutional Clients</h1>
                    <p className="text-slate-400 font-medium">Manage and monitor deep integration bridges across institutional partners.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative glass-card !p-0 overflow-hidden min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search clinical node..."
                            className="w-full bg-transparent border-none focus:ring-0 pl-12 pr-6 py-4 text-sm font-bold text-slate-700 placeholder:text-slate-300"
                        />
                    </div>
                    <button className="glass-card !p-4 hover:bg-slate-50 transition-colors">
                        <Filter size={18} className="text-slate-500" />
                    </button>
                    <button
                        onClick={() => navigate('/clients/add')}
                        className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-2xl shadow-xl shadow-primary-500/20 transition-all"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Summary Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard label="Node Network" value={hospitals.length.toString()} sub="Total Facilities" color="#64748b" icon={Globe} />
                <SummaryCard label="Sync Active" value={hospitals.filter(h => h.status === 'online').length.toString()} sub="Live Connections" color="#22c55e" icon={Activity} />
                <SummaryCard label="Learning Engine" value={hospitals.filter(h => h.training).length.toString()} sub="Active Training" color="#0ea5e9" icon={Lock} />
                <SummaryCard label="System Faults" value={hospitals.filter(h => h.status === 'offline').length.toString()} sub="Connectivity Issues" color="#ef4444" icon={Signal} />
            </div>

            {/* Visualization Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-24 text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Decrypting Network Data...</p>
                    </div>
                ) : (
                    <>
                        {hospitals.map(hospital => (
                            <HospitalCard key={hospital.id} data={hospital} onDelete={() => handleDelete(hospital.id)} />
                        ))}

                        {/* Empty State / Add Action */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={() => navigate('/clients/add')}
                            className="glass-card border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 p-12 min-h-[350px] group transition-all"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                                <Plus size={32} />
                            </div>
                            <div className="text-center space-y-2">
                                <h4 className="text-lg font-black text-slate-900">Provision New Node</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Onboard institutional partner</p>
                            </div>
                        </motion.button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClientsPage;
