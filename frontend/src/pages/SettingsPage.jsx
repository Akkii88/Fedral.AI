import React, { useState } from 'react';
import {
    Save, Shield, Activity, FileText, Server,
    AlertTriangle, CheckCircle, HelpCircle, Lock,
    Settings, Globe, Database, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsCard = ({ title, icon: Icon, description, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex flex-col h-full overflow-hidden"
    >
        <div className="p-8 border-b border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500">
                <Icon size={24} />
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{description}</p>
            </div>
        </div>
        <div className="p-8 space-y-6 flex-grow">
            {children}
        </div>
    </motion.div>
);

const Toggle = ({ label, checked, onChange, sub }) => (
    <div className="flex items-center justify-between py-4 group cursor-pointer" onClick={() => onChange({ target: { checked: !checked } })}>
        <div className="space-y-0.5">
            <p className="text-sm font-black text-slate-900 leading-tight">{label}</p>
            {sub && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>}
        </div>
        <div className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${checked ? 'bg-primary-500' : 'bg-slate-200'}`}>
            <motion.div
                animate={{ x: checked ? 24 : 0 }}
                className="w-4 h-4 bg-white rounded-full shadow-sm"
            />
        </div>
    </div>
);

const SettingsPage = () => {
    const [saved, setSaved] = useState(false);
    const [config, setConfig] = useState({
        platformName: 'Fedral Healthcare',
        orgName: 'General Hospital',
        encryptionRest: true,
        encryptionTransit: true,
        dpLevel: 1.0,
        fedStrategy: 'FedAvg',
        rounds: 20,
        autoReport: true,
        compliance: 'HIPAA',
        auditLog: true
    });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32">
            {/* Header Block */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-primary-500 font-bold text-[10px] uppercase tracking-[0.2em]"
                    >
                        <Settings size={14} />
                        Systems Governance
                    </motion.div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter">Platform Core</h1>
                    <p className="text-slate-400 font-medium">Global parameters for institutional synchronization and data security.</p>
                </div>

                <AnimatePresence>
                    {saved && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                        >
                            <CheckCircle size={18} />
                            Registry Updated
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Config Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Identity */}
                <SettingsCard title="Platform Profile" icon={Globe} description="Institutional Branding & Logic">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Alias</label>
                            <input
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 transition-all outline-none"
                                value={config.platformName}
                                onChange={e => setConfig({ ...config, platformName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Organization</label>
                            <input
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 transition-all outline-none"
                                value={config.orgName}
                                onChange={e => setConfig({ ...config, orgName: e.target.value })}
                            />
                        </div>
                    </div>
                </SettingsCard>

                {/* 2. Security */}
                <SettingsCard title="Privacy Shield" icon={ShieldCheck} description="Cryptographic & Privacy Controls">
                    <div className="divide-y divide-slate-100">
                        <Toggle
                            label="AES-256 Storage"
                            sub="Encryption at Rest"
                            checked={config.encryptionRest}
                            onChange={e => setConfig({ ...config, encryptionRest: e.target.checked })}
                        />
                        <Toggle
                            label="TLS 1.3 Communication"
                            sub="Encryption in Transit"
                            checked={config.encryptionTransit}
                            onChange={e => setConfig({ ...config, encryptionTransit: e.target.checked })}
                        />
                    </div>

                    <div className="space-y-6 pt-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Privacy Budget (ε)</label>
                            <span className="text-2xl font-black text-primary-500 tabular-nums">{config.dpLevel.toFixed(1)}</span>
                        </div>
                        <div className="relative pt-2">
                            <input
                                type="range" min="0.1" max="5.0" step="0.1"
                                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary-500"
                                value={config.dpLevel}
                                onChange={e => setConfig({ ...config, dpLevel: parseFloat(e.target.value) })}
                            />
                            <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest mt-4 px-1">
                                <span>Mathematical Privacy</span>
                                <span>Model Utility</span>
                            </div>
                        </div>
                    </div>
                </SettingsCard>

                {/* 3. Logic Engine */}
                <SettingsCard title="Intelligence Core" icon={Server} description="Federated Learning Parameters">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aggregation Logic</label>
                            <select
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 transition-all outline-none appearance-none"
                                value={config.fedStrategy}
                                onChange={e => setConfig({ ...config, fedStrategy: e.target.value })}
                            >
                                <option value="FedAvg">FedAvg (Standard)</option>
                                <option value="Median">Coordinate Median (Robust)</option>
                                <option value="TrimmedMean">Trimmed Mean</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Training Cycles</label>
                            <input
                                type="number"
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 transition-all outline-none"
                                value={config.rounds}
                                onChange={e => setConfig({ ...config, rounds: e.target.value })}
                            />
                        </div>
                    </div>
                </SettingsCard>

                {/* 4. Governance */}
                <SettingsCard title="Audit Protocol" icon={FileText} description="Regulatory & Compliance Tools">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Compliance Framework</label>
                            <select
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 transition-all outline-none appearance-none"
                                value={config.compliance}
                                onChange={e => setConfig({ ...config, compliance: e.target.value })}
                            >
                                <option value="HIPAA">HIPAA (USA)</option>
                                <option value="GDPR">GDPR (Europe)</option>
                                <option value="Research">Research Only</option>
                            </select>
                        </div>
                        <div className="divide-y divide-slate-100">
                            <Toggle label="Continuous Auditing" sub="Infinite Traceability" checked={config.auditLog} onChange={e => setConfig({ ...config, auditLog: e.target.checked })} />
                        </div>
                        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 group">
                            <FileText size={18} className="group-hover:scale-110 transition-transform" />
                            Export Immutable Logs
                        </button>
                    </div>
                </SettingsCard>

            </div>

            {/* Floating Action Bar */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-8 py-4 glass-card bg-white/80 backdrop-blur-xl shadow-2xl shadow-primary-500/10 border border-primary-500/10 rounded-3xl flex items-center gap-8"
            >
                <div className="hidden sm:flex items-center gap-4 border-r border-slate-100 pr-8">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                        <Shield size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global<br />Override</p>
                </div>
                <button
                    onClick={handleSave}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center gap-3 whitespace-nowrap"
                >
                    <Save size={20} />
                    Synchronize Configuration
                </button>
            </motion.div>
        </div>
    );
};

export default SettingsPage;
