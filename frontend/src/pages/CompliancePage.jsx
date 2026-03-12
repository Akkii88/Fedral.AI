import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, FileText, CheckCircle, AlertOctagon, Download, Eye, Database, FlaskConical,
    ShieldCheck, Activity, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const ComplianceCard = ({ title, status, desc, icon: Icon, colorClass }) => (
    <div className="glass-card p-6 flex flex-col justify-between hover:border-slate-200 transition-colors">
        <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                <Icon size={24} className={colorClass} />
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status === 'Compliant' || status === 'Local Only' || status === 'E2E Encrypted' || status === 'Differential Privacy'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}>
                {status}
            </div>
        </div>
        <div className="mt-6">
            <h4 className="font-black text-slate-900 tracking-tight">{title}</h4>
            <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const CompliancePage = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const data = await api.admin.getLogs();
            setLogs(data.slice(0, 10)); // Show latest 10
        } catch (e) {
            console.error("Failed to load audit logs", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto pt-8 pb-32 px-6">
            {/* Header Area */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-950 tracking-tighter">Compliance Architecture</h1>
                    <p className="text-slate-500 font-medium mt-2">Decentralized governance and tamper-proof audit trails.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/test-your-data')}
                        className="bg-primary-500 hover:bg-primary-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2 text-sm"
                    >
                        <FlaskConical size={18} /> Validatory Dataset Test
                    </button>
                    <button className="bg-white border border-slate-100 text-slate-900 font-black px-6 py-3 rounded-2xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 text-sm">
                        <Download size={18} /> Export Governance Report
                    </button>
                </div>
            </header>

            {/* Global Status Bar */}
            <div className="glass-card bg-slate-950 p-8 flex flex-col md:flex-row items-center gap-12 mb-12 text-white overflow-hidden relative group">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />

                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Verification</div>
                        <div className="text-3xl font-black tracking-tighter flex items-center gap-3">
                            Certified
                            <span className="text-emerald-400">Compliant</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block w-px h-12 bg-slate-800" />

                <div className="flex flex-col gap-1">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Infrastructure Audit</div>
                    <div className="text-xl font-bold tracking-tight">Jan 25, 2024 <span className="text-slate-600 text-sm ml-2">14:22 UTC</span></div>
                </div>

                <div className="hidden md:block w-px h-12 bg-slate-800" />

                <div className="flex flex-col gap-1">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Frameworks</div>
                    <div className="flex gap-2 mt-2">
                        {['HIPAA HITECH', 'GDPR Article 89', 'ISO 27001'].map(f => (
                            <span key={f} className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-tight text-slate-400 whitespace-nowrap">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Data Controls */}
                <div className="lg:col-span-1 space-y-8">
                    <section>
                        <h3 className="text-lg font-black text-slate-950 tracking-tight mb-6 px-1 italic border-l-4 border-primary-500 pl-4">Privacy Framework</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <ComplianceCard title="Vault Storage" status="Local Only" desc="Institutional datasets are containerized behind hospital firewalls." icon={Database} colorClass="text-blue-500" />
                            <ComplianceCard title="TLS 1.3 Tunnel" status="E2E Encrypted" desc="Peer-to-peer weight updates use double-ratchet encryption chains." icon={Shield} colorClass="text-emerald-500" />
                            <ComplianceCard title="DP Engine" status="Differential Privacy" desc="Aggregated outputs are dithered (ε=2.4) to preclude re-identification." icon={AlertOctagon} colorClass="text-amber-500" />
                        </div>
                    </section>
                </div>

                {/* Right: Audit & Access */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Audit Logs Table */}
                    <div className="glass-card overflow-hidden flex flex-col h-full border-none shadow-xl shadow-slate-100">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-950 tracking-tight">Federated Ledger</h3>
                                <p className="text-slate-400 text-xs font-medium">Real-time audit of network-wide administrative actions.</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <FileText size={20} />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Operational Event</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Originator</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Resolution</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center"><Activity size={32} className="animate-spin mx-auto text-slate-200" /></td></tr>
                                    ) : logs.length > 0 ? logs.map((log, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <div className="font-bold text-slate-900">{log.action}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">ID: {idx.toString().padStart(6, '0')}</div>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50 font-medium text-slate-500 italic">{log.user_id || 'System Core'}</td>
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${log.result === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                    }`}>
                                                    {log.result}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <div className="text-slate-900 font-bold text-xs">{new Date(log.timestamp).toLocaleDateString()}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center font-bold text-slate-300">No telemetry recorded for this cycle.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-slate-50 bg-slate-50/30 text-center">
                            <button className="text-primary-500 font-black text-[11px] uppercase tracking-widest hover:text-primary-600 transition-colors">Load Extended Historical Records</button>
                        </div>
                    </div>

                    {/* Quick Access Roles */}
                    <div className="glass-card p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-white/50 border-none shadow-lg shadow-slate-100">
                        <div className="flex flex-col gap-1">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Authorization Matrix</div>
                            <h4 className="text-lg font-black text-slate-950">Active ACL Distribution</h4>
                        </div>
                        <div className="md:col-span-2 flex justify-between items-center">
                            {[
                                { label: 'SysAdmins', count: 2, color: 'bg-primary-500' },
                                { label: 'Researchers', count: 6, color: 'bg-emerald-500' },
                                { label: 'NodeOperators', count: 18, color: 'bg-amber-500' }
                            ].map(r => (
                                <div key={r.label} className="text-center group cursor-pointer">
                                    <div className="text-2xl font-black text-slate-950 group-hover:scale-110 transition-transform">{r.count}</div>
                                    <div className="flex items-center gap-1.5 justify-center mt-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${r.color}`} />
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{r.label}</div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => navigate('/permissions')}
                                className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-100 hover:bg-primary-50 transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompliancePage;
