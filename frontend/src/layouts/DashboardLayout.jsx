import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FlaskConical, Settings, Activity, ShieldCheck, Database, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Snowfall from '../components/Snowfall';
import { api } from '../services/api';

const DashboardLayout = () => {
    const location = useLocation();
    const [pendingCount, setPendingCount] = React.useState(0);

    React.useEffect(() => {
        const fetchCount = async () => {
            try {
                const data = await api.contributions.list('pending');
                setPendingCount(data.length);
            } catch (e) {
                console.error("Failed to fetch inbox count", e);
            }
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans premium-gradient relative">
            <Snowfall />

            {/* Premium Sidebar */}
            <aside className="w-80 bg-white/60 backdrop-blur-2xl border-r border-white/40 p-10 flex flex-col shadow-2xl shadow-slate-200/50 z-10">
                <div className="flex items-center gap-4 mb-12 group cursor-pointer">
                    <div className="w-14 h-14 bg-primary-500 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-primary-500/40 group-hover:rotate-6 transition-all duration-500">
                        <Activity size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tight">Fedral.ai</h1>
                        <p className="text-[11px] font-black text-primary-500 uppercase tracking-[0.2em] mt-1.5 opacity-80">Intelligence</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-item-new ${isActive ? 'nav-item-active text-primary-600' : ''}`}>
                        <LayoutDashboard size={22} strokeWidth={2} />
                        Overview
                    </NavLink>
                    <NavLink to="/clients" className={({ isActive }) => `nav-item-new ${isActive ? 'nav-item-active text-primary-600' : ''}`}>
                        <Users size={22} strokeWidth={2} />
                        Clients
                    </NavLink>
                    <NavLink to="/experiments" className={({ isActive }) => `nav-item-new ${isActive ? 'nav-item-active text-primary-600' : ''}`}>
                        <FlaskConical size={22} strokeWidth={2} />
                        Experiments
                    </NavLink>
                    <NavLink to="/test-your-data" className={({ isActive }) => `nav-item-new ${isActive ? 'nav-item-active text-primary-600' : ''}`}>
                        <Database size={22} strokeWidth={2} />
                        Hospital Agent
                    </NavLink>
                    <NavLink to="/inbox" className={({ isActive }) => `nav-item-new ${isActive ? 'nav-item-active text-primary-600' : ''}`}>
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                <Inbox size={22} strokeWidth={2} />
                                Inbox
                            </div>
                            {pendingCount > 0 && (
                                <span className="bg-primary-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-primary-500/30">
                                    {pendingCount}
                                </span>
                            )}
                        </div>
                    </NavLink>
                    <div className="pt-10 pb-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-5 opacity-60">System</div>
                    <NavLink to="/compliance" className={({ isActive }) => `nav-item-new ${isActive ? 'nav-item-active text-primary-600' : ''}`}>
                        <ShieldCheck size={22} strokeWidth={2} />
                        Compliance
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => `nav-item-new ${isActive ? 'nav-item-active text-primary-600' : ''}`}>
                        <Settings size={22} strokeWidth={2} />
                        Settings
                    </NavLink>
                </nav>

                <div className="mt-auto p-5 bg-slate-50/50 rounded-[1.5rem] border border-slate-100/50 italic text-[11px] text-slate-400 text-center font-medium">
                    Research Environment v2.0.4
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-16 z-10 relative custom-scrollbar">
                <header className="flex justify-between items-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <p className="text-xs font-black text-primary-500 uppercase tracking-[0.25em] mb-2 opacity-80">Operational Center</p>
                        <h1 className="text-5xl font-black text-slate-950 tracking-tight">Command Center</h1>
                    </motion.div>
                    <div className="flex items-center gap-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-4 bg-emerald-50/50 backdrop-blur-xl px-6 py-3 rounded-2xl border border-emerald-100/50 shadow-sm"
                        >
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Network Online</span>
                        </motion.div>
                        <NavLink to="/inbox" className="w-14 h-14 rounded-2xl bg-white border-2 border-white shadow-xl overflow-hidden flex items-center justify-center text-slate-400 bg-gradient-to-br from-white to-slate-50 hover:shadow-2xl transition-all duration-500 cursor-pointer group relative">
                            <Inbox size={24} className="group-hover:text-primary-500 transition-colors" />
                            {pendingCount > 0 && (
                                <div className="absolute top-2 right-2 w-3 h-3 bg-primary-500 rounded-full border-2 border-white shadow-sm ring-2 ring-primary-500/20"></div>
                            )}
                        </NavLink>
                        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-white shadow-xl overflow-hidden flex items-center justify-center text-slate-400 bg-gradient-to-br from-white to-slate-50 hover:shadow-2xl transition-all duration-500 cursor-pointer group">
                            <Users size={24} className="group-hover:text-primary-500 transition-colors" />
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
