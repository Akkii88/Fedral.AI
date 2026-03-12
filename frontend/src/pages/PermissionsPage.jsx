import React, { useState } from 'react';
import {
    Users, Shield, Save, CheckCircle, Lock, UserCheck, ShieldAlert,
    Activity, Eye, Layout, Database, Terminal, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

const RoleCard = ({ role, users, desc, active, onClick, icon: Icon }) => (
    <motion.div
        whileHover={{ y: -4 }}
        onClick={onClick}
        className={`glass-card p-6 cursor-pointer border-2 transition-all relative overflow-hidden group ${active
                ? 'border-primary-500 bg-primary-50/10 shadow-xl shadow-primary-500/5'
                : 'border-transparent hover:border-slate-100'
            }`}
    >
        {active && (
            <div className="absolute top-0 right-0 p-2 text-primary-500">
                <CheckCircle size={16} />
            </div>
        )}
        <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-50 text-slate-400'
                }`}>
                <Icon size={24} />
            </div>
            <div>
                <h4 className="font-black text-slate-900 tracking-tight">{role}</h4>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-primary-600' : 'text-slate-400'}`}>
                    {users} Verified Entities
                </p>
            </div>
        </div>
        <p className="text-xs text-slate-400 font-medium leading-relaxed italic">{desc}</p>

        {active && (
            <motion.div
                layoutId="activeBar"
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500"
            />
        )}
    </motion.div>
);

const PermissionRow = ({ label, allowed, icon: Icon }) => (
    <div className="flex items-center justify-between p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors group">
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:text-primary-400 transition-colors">
                <Icon size={16} />
            </div>
            <span className="font-bold text-slate-700 tracking-tight">{label}</span>
        </div>
        <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked={allowed} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </div>
    </div>
);

const PermissionsPage = () => {
    const [activeRole, setActiveRole] = useState('System Admin');

    const roleData = [
        { id: 'System Admin', role: 'Federation Overseer', users: 2, icon: ShieldAlert, desc: 'Root-level authority over node topologies and privacy epsilon constants.' },
        { id: 'Hospital Admin', role: 'Local Data Custodian', users: 12, icon: UserCheck, desc: 'Authorized to manage internal node pipelines and local dataset snapshots.' },
        { id: 'Researcher', role: 'Insight Analyst', users: 24, icon: Eye, desc: 'Read-only access to aggregated statistical metrics and experiment telemetry.' }
    ];

    return (
        <div className="max-w-6xl mx-auto pt-8 pb-32 px-6">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-slate-950 tracking-tighter">Access Control Matrix</h1>
                <p className="text-slate-500 font-medium mt-2">Manage administrative hierarchies and fine-grained operational permissions.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {roleData.map((role) => (
                    <RoleCard
                        key={role.id}
                        role={role.role}
                        users={role.users}
                        desc={role.desc}
                        icon={role.icon}
                        active={activeRole === role.id}
                        onClick={() => setActiveRole(role.id)}
                    />
                ))}
            </div>

            <div className="glass-card overflow-hidden border-none shadow-2xl shadow-slate-200/50">
                <header className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/40">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/20">
                            <Settings size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-950 tracking-tight italic uppercase">Operational Capabilities</h3>
                            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-1">Defined for: <span className="text-primary-500">{activeRole}</span></p>
                        </div>
                    </div>

                    <button className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2 text-sm group">
                        <Save size={18} className="group-hover:scale-110 transition-transform" /> Commit Schema Changes
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-50">
                    <div className="flex flex-col">
                        <PermissionRow label="View Global Telemetry" allowed={true} icon={Activity} />
                        <PermissionRow label="Initiate Training Cycle" allowed={activeRole !== 'Researcher'} icon={Terminal} />
                        <PermissionRow label="Node Inventory Write" allowed={activeRole === 'System Admin'} icon={Database} />
                    </div>
                    <div className="flex flex-col">
                        <PermissionRow label="Privacy Epsilon Override" allowed={activeRole === 'System Admin'} icon={Lock} />
                        <PermissionRow label="Export Metadata Blobs" allowed={activeRole !== 'Researcher'} icon={Layout} />
                        <PermissionRow label="Account Provisioning" allowed={activeRole === 'System Admin'} icon={Users} />
                    </div>
                </div>

                <footer className="p-6 bg-slate-50/50 flex items-center gap-3 italic">
                    <Shield size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        All permission mutations are cryptographically logged to the compliance ledger.
                    </span>
                </footer>
            </div>
        </div>
    );
};

export default PermissionsPage;
