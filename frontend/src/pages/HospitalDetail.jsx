import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Activity, Shield, Clock, FileText, PauseCircle, PlayCircle, Trash2,
    ArrowLeft, MapPin, Building, Database, Server, CheckCircle, AlertTriangle,
    Plus, ChevronRight, Zap, RefreshCw, BarChart3, Lock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const StatBox = ({ title, value, sub, icon: Icon, colorClass }) => (
    <div className="glass-card p-6 flex flex-col justify-between hover:border-slate-200 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
                <Icon size={20} />
            </div>
            {sub && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">{sub}</span>}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
        </div>
    </div>
);

const TimelineNode = ({ title, date, status, isLast }) => (
    <div className="flex gap-6 relative group">
        <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${status === 'error' ? 'bg-rose-500 shadow-rose-500/20' :
                status === 'warning' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-primary-500 shadow-primary-500/20'
                }`} />
            {!isLast && <div className="w-[1px] flex-1 bg-slate-100 group-hover:bg-slate-200 transition-colors my-2" />}
        </div>
        <div className="pb-8 -mt-1">
            <h5 className="text-sm font-black text-slate-900 leading-tight">{title}</h5>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{date}</p>
        </div>
    </div>
);

const HospitalDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [hospital, setHospital] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [hospitalData, timelineData] = await Promise.all([
                api.hospitals.get(id),
                api.hospitals.getTimeline(id)
            ]);
            setHospital(hospitalData);
            setTimeline(timelineData);
        } catch (e) {
            console.error("Failed to load hospital details", e);
        } finally {
            setLoading(false);
        }
    };

    const handlePause = async () => {
        try {
            await api.hospitals.update(id, { status: 'offline' });
            loadData();
        } catch (e) {
            alert("Failed to pause hospital");
        }
    };

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to remove ${hospital?.name}?`)) {
            try {
                await api.hospitals.delete(id);
                navigate('/clients');
            } catch (e) {
                alert("Failed to delete hospital");
            }
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
                <RefreshCw size={32} />
            </motion.div>
            <p className="font-black text-[10px] uppercase tracking-[0.2em]">Synchronizing Registry...</p>
        </div>
    );

    if (!hospital) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
            <AlertTriangle size={32} />
            <p className="font-black text-[10px] uppercase tracking-[0.2em]">Institutional Identity Not Found</p>
            <button onClick={() => navigate('/clients')} className="btn bg-slate-100 text-slate-900 mt-4">Return to Registry</button>
        </div>
    );

    const contributionData = [
        { round: 1, val: 12 }, { round: 2, val: 18 }, { round: 3, val: 25 },
        { round: 4, val: 32 }, { round: 5, val: 28 }, { round: 6, val: 35 }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24">
            {/* Nav & Header Area */}
            <div className="flex flex-col gap-8">
                <button
                    onClick={() => navigate('/clients')}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-widest transition-colors w-fit group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Registry
                </button>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter">{hospital.name}</h1>
                            <div className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest ${hospital.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                {hospital.status}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-slate-300" />
                                {hospital.location || 'Distributed Node'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-slate-300" />
                                Connection: {new Date(hospital.connected_since).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Building size={14} className="text-slate-300" />
                                {hospital.type} Facility
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePause}
                            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-black px-6 py-4 rounded-2xl shadow-sm transition-all flex items-center gap-3 text-xs uppercase tracking-widest"
                        >
                            <PauseCircle size={18} />
                            Suspend Link
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-rose-50 border border-rose-100 hover:border-rose-200 text-rose-600 font-black px-6 py-4 rounded-2xl shadow-sm transition-all flex items-center gap-3 text-xs uppercase tracking-widest"
                        >
                            <Trash2 size={18} />
                            Decommission
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatBox title="Link Speed" value={`${hospital.latency_ms}ms`} sub="Network Health" icon={Zap} colorClass="bg-primary-50 text-primary-500" />
                <StatBox title="Data Volume" value={hospital.samples?.toLocaleString() || 0} sub="Samples Processed" icon={Database} colorClass="bg-indigo-50 text-indigo-500" />
                <StatBox title="Security Layer" value="Local Only" sub="Privacy Strategy" icon={Lock} colorClass="bg-emerald-50 text-emerald-500" />
                <StatBox title="Model Drift" value="0.02%" sub="Weight Stability" icon={Activity} colorClass="bg-amber-50 text-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Impact Chart Card */}
                    <div className="glass-card overflow-hidden flex flex-col h-full">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
                                    <BarChart3 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-950 tracking-tight">Institutional Impact</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Weight Contribution Consistency</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                <CheckCircle size={14} />
                                High Utility
                            </div>
                        </div>
                        <div className="p-8 bg-white/50 space-y-8 flex-grow">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={contributionData}>
                                        <defs>
                                            <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="round"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 10 }}
                                            dy={10}
                                        />
                                        <YAxis hide />
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
                                            fill="url(#impactGradient)"
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="p-6 bg-slate-900 rounded-2xl flex items-center justify-between gap-6 shadow-xl shadow-slate-900/10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Accuracy Contribution</p>
                                    <h5 className="text-xl font-black text-white">+1.24% Improvement</h5>
                                </div>
                                <div className="hidden sm:block text-slate-500 font-medium text-xs max-w-[200px] leading-relaxed">
                                    This institution's data provides unique medical edge-cases.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Budget Card */}
                    <div className="glass-card p-8 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-950 tracking-tight">Privacy Budget (ε)</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Differential Privacy Consumption</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Consumed</p>
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tight">2.4 <span className="text-slate-300 text-lg">/ 5.0 ε</span></h4>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full mb-1">
                                    <ShieldCheck size={14} />
                                    Nominal Risk
                                </div>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '48%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Registry Updates */}
                <div className="glass-card flex flex-col h-full bg-slate-50/50">
                    <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-white/50">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-950 tracking-tight">Communication Log</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Immutable Chain</p>
                        </div>
                    </div>
                    <div className="p-8 overflow-y-auto max-h-[600px] flex-grow custom-scrollbar">
                        {timeline.length > 0 ? (
                            <div className="space-y-2">
                                {timeline.map((event, idx) => (
                                    <TimelineNode
                                        key={idx}
                                        title={event.title}
                                        date={new Date(event.timestamp).toLocaleString()}
                                        status={event.type}
                                        isLast={idx === timeline.length - 1}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 grayscale opacity-30">
                                <Server size={48} />
                                <p className="font-black text-[10px] uppercase tracking-widest">No activity recorded</p>
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-white border-t border-slate-100">
                        <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group text-xs uppercase tracking-widest">
                            Audit Identity
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalDetail;
