import React, { useState, useEffect } from 'react';
import {
    Activity, Shield, Users, Server, Play, FileText, Plus,
    ArrowUpRight, CheckCircle, Lock, Zap, Heart, TrendingUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

// --- Data Simulation ---
const accuracyData = [
    { round: 1, acc: 55 }, { round: 2, acc: 62 }, { round: 3, acc: 68 },
    { round: 4, acc: 75 }, { round: 5, acc: 82 }, { round: 6, acc: 86 },
    { round: 7, acc: 89 },
];

const fairnessData = [
    { name: 'Group A', score: 0.94 },
    { name: 'Group B', score: 0.91 },
    { name: 'Group C', score: 0.93 },
];

// --- Premium Components ---

const StatCard = ({ title, value, subtext, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay, ease: "easeOut" }}
        className="stat-card"
    >
        <div className="flex justify-between items-start">
            <div className="p-4 rounded-3xl bg-white shadow-premium flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Icon size={28} style={{ color }} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs bg-emerald-100/50 px-3 py-1.5 rounded-xl uppercase tracking-tighter">
                <TrendingUp size={14} />
                +12%
            </div>
        </div>
        <div className="space-y-1">
            <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">{title}</h3>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{value}</div>
            <p className="text-xs text-slate-400 font-bold opacity-70">{subtext}</p>
        </div>
    </motion.div>
);

const ChartCard = ({ title, icon: Icon, children, footer, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        className="stat-card min-h-[400px]"
    >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-500/10 rounded-2xl">
                    <Icon size={22} className="text-primary-500" strokeWidth={2.5} />
                </div>
                <h3 className="font-black text-slate-900 tracking-tight text-xl">{title}</h3>
            </div>
            <div className="flex items-center gap-2.5 bg-primary-50 px-4 py-2 rounded-xl">
                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Live System</span>
            </div>
        </div>
        <div className="flex-1 mt-6">
            {children}
        </div>
        {footer && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between group">
                <p className="text-xs font-bold text-slate-400 leading-relaxed pr-8 italic">{footer}</p>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all">
                    <ArrowUpRight size={18} />
                </div>
            </div>
        )}
    </motion.div>
);

const ActionTile = ({ icon: Icon, label, desc, color, onClick, delay }) => (
    <motion.button
        whileHover={{ scale: 1.02, y: -8 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
        onClick={onClick}
        className="glass-card p-10 flex flex-col gap-6 text-left group overflow-hidden relative"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-slate-50/50 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        <div className="p-5 rounded-[1.5rem] self-start shadow-xl shadow-slate-200/50 group-hover:shadow-primary-500/20 transition-all duration-500" style={{ backgroundColor: `${color}15`, color }}>
            <Icon size={32} strokeWidth={2.5} />
        </div>
        <div>
            <div className="font-black text-xl text-slate-900 mb-2 tracking-tight group-hover:text-primary-600 transition-colors">{label}</div>
            <div className="text-sm text-slate-500 font-bold leading-relaxed">{desc}</div>
        </div>
    </motion.button>
);


const DashboardHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ active: 0, clients: 0, budget: 0, training: false });
    const [globalModel, setGlobalModel] = useState({ total_samples: 0, current_accuracy: 0.0 });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await api.getStats();
            setStats(data);
            const gm = await api.contributions.globalModel();
            setGlobalModel(gm);
        } catch (e) {
            console.error("Failed to load stats", e);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">

            {/* --- LIVE INDICATORS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Active Research Nodes"
                    value={stats.active}
                    subtext={`${stats.clients} institutions total`}
                    icon={Users}
                    color="#0ea5e9"
                    delay={0.1}
                />
                <StatCard
                    title="Global Collective Intelligence"
                    value={globalModel.total_samples.toLocaleString()}
                    subtext={`${(globalModel.current_accuracy * 100).toFixed(1)}% Collective Accuracy`}
                    icon={Zap}
                    color="#eab308"
                    delay={0.2}
                />
                <StatCard
                    title="Security Guarantee"
                    value="100%"
                    subtext="Local Differential Privacy active"
                    icon={Shield}
                    color="#10b981"
                    delay={0.3}
                />
            </div>

            {/* --- PRIMARY DATA SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard
                    title="Model Learning Velocity"
                    icon={Activity}
                    footer="Predictive accuracy has surged by 34% since initial initialization in Round 1."
                    delay={0.4}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={accuracyData}>
                            <defs>
                                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="round" hide />
                            <YAxis hide domain={[50, 100]} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                                itemStyle={{ fontWeight: 'bold', color: '#0ea5e9' }}
                            />
                            <Area type="monotone" dataKey="acc" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorAcc)" strokeWidth={4} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Fairness & Ethics Guardrails"
                    icon={Heart}
                    footer="Ensuring clinical decisions are unbiased across all represented demographic groups."
                    delay={0.5}
                >
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={fairnessData} layout="vertical">
                            <XAxis type="number" hide domain={[0, 1]} />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                {fairnessData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.score > 0.9 ? "#10b981" : "#f43f5e"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-center px-4 border-r border-slate-200">
                            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Privacy Budget</div>
                            <div className="text-lg font-black text-slate-900">ε = 2.4</div>
                        </div>
                        <div className="text-center px-4">
                            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Anonymization</div>
                            <div className="text-lg font-black text-slate-900 uppercase">Active</div>
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* --- ACTION TILES --- */}
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center text-sm">
                        <ArrowUpRight size={18} />
                    </span>
                    Executive Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ActionTile
                        icon={Play}
                        label="Federated Jobs"
                        desc="Monitor real-time model training across nodes"
                        color="#0ea5e9"
                        onClick={() => navigate('/experiments')}
                        delay={0.6}
                    />
                    <ActionTile
                        icon={Plus}
                        label="Deploy New Node"
                        desc="Connect a new hospital or research site"
                        color="#8b5cf6"
                        onClick={() => navigate('/clients')}
                        delay={0.7}
                    />
                    <ActionTile
                        icon={FileText}
                        label="Clinical Insights"
                        desc="Generate comprehensive validation reports"
                        color="#10b981"
                        onClick={() => alert('Compiling global research report...')}
                        delay={0.8}
                    />
                </div>
            </div>

        </div>
    );
};

export default DashboardHome;
