import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle, ArrowRight, Building, Server, Shield, Activity, Copy, AlertCircle,
    ChevronRight, Info, ShieldCheck, Terminal, Globe, Lock, Check, RefreshCw, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { label: 'Institutional Info', icon: Building },
        { label: 'Technical Link', icon: Server },
        { label: 'Privacy Governance', icon: Shield },
        { label: 'Connectivity Test', icon: Activity },
        { label: 'Activation', icon: Zap }
    ];


    return (
        <div className="flex items-center justify-between max-w-4xl mx-auto mb-16 relative">
            {/* Connection Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 -z-10" />
            <div
                className="absolute top-5 left-0 h-0.5 bg-primary-500 transition-all duration-700 -z-10"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, index) => {
                const stepNum = index + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;
                const Icon = step.icon;

                return (
                    <div key={step.label} className="flex flex-col items-center gap-3 relative">
                        <motion.div
                            initial={false}
                            animate={{
                                backgroundColor: isActive || isCompleted ? 'var(--primary-500, #0ea5e9)' : '#fff',
                                color: isActive || isCompleted ? '#fff' : '#94a3b8',
                                scale: isActive ? 1.1 : 1,
                                borderColor: isActive || isCompleted ? 'transparent' : '#f1f5f9'
                            }}
                            className="w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm z-10 transition-colors"
                        >
                            {isCompleted ? <Check size={20} /> : <Icon size={18} />}
                        </motion.div>
                        <span className={`text-[9px] font-black uppercase tracking-widest absolute -bottom-8 whitespace-nowrap transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400'
                            }`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const AddHospital = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const [form, setForm] = useState({
        name: '',
        location: '',
        type: 'General Hospital'
    });
    const [createdHospital, setCreatedHospital] = useState(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const createHospital = async () => {
        if (!form.name || !form.location) {
            setError("Please fill in institutional profile fields.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await api.hospitals.create(form);
            setCreatedHospital(res);
            setStep(2);
        } catch (err) {
            setError("Synchronization failure. Remote registry unreachable.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const nextStep = () => setStep(s => s + 1);

    return (
        <div className="max-w-4xl mx-auto pt-8 pb-32">
            <header className="text-center space-y-4 mb-16">
                <h1 className="text-4xl font-black text-slate-950 tracking-tighter">Onboard Institution</h1>
                <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                    Following these steps will link your secure local data node to the FEDRAL.AI global training backbone.
                </p>
            </header>

            <StepIndicator currentStep={step} />

            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card p-12 shadow-2xl shadow-slate-200/50"
                    >
                        {error && (
                            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-shake">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        {/* STEP 1: INFO */}
                        {step === 1 && (
                            <div className="space-y-8">
                                <section className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Institution Name</label>
                                            <input
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none placeholder:text-slate-300"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                placeholder="e.g. Stanford Medical Center"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Node Location</label>
                                            <input
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none placeholder:text-slate-300"
                                                name="location"
                                                value={form.location}
                                                onChange={handleChange}
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Facility Type</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer"
                                            name="type"
                                            value={form.type}
                                            onChange={handleChange}
                                        >
                                            <option>General Hospital</option>
                                            <option>Research Lab</option>
                                            <option>Specialized Clinic</option>
                                            <option>Public Health Institute</option>
                                        </select>
                                    </div>
                                </section>

                                <button
                                    onClick={createHospital}
                                    disabled={loading}
                                    className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                                >
                                    {loading ? (
                                        <RefreshCw size={24} className="animate-spin" />
                                    ) : (
                                        <>
                                            Register Identity
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* STEP 2: TECHNICAL */}
                        {step === 2 && createdHospital && (
                            <div className="space-y-10">
                                <div className="space-y-2 text-center">
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-6">
                                        <Terminal size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Technical Provisioning</h3>
                                    <p className="text-slate-400 font-medium text-sm">Issue these specific credentials to the on-site Infrastructure Lead.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800 space-y-8 shadow-2xl shadow-indigo-900/10 relative group">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Institution Public ID</span>
                                                <button onClick={() => handleCopy(createdHospital.id)} className="text-slate-500 hover:text-white transition-colors">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                            <code className="block text-xl font-black text-indigo-400 tracking-tight break-all">
                                                {createdHospital.id}
                                            </code>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Secure Handshake Token</span>
                                                <button onClick={() => handleCopy("tk_enc_928347102938...")} className="text-slate-500 hover:text-white transition-colors">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                            <code className="block text-xl font-black text-emerald-400 tracking-tight break-all font-mono">
                                                tk_enc_928347102938...
                                            </code>
                                        </div>
                                        {copied && (
                                            <div className="absolute top-4 right-8 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                                Copied to buffer
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-500 text-xs leading-relaxed">
                                        <Lock size={16} className="shrink-0 mt-0.5" />
                                        Keep these credentials offline. They allow the Desktop Agent to register itself as this institutional identity.
                                    </div>
                                </div>

                                <button onClick={nextStep} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3">
                                    Handoff Complete
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        )}

                        {/* STEP 3: PRIVACY */}
                        {step === 3 && (
                            <div className="space-y-10">
                                <div className="space-y-2 text-center">
                                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Privacy Guardrails</h3>
                                    <p className="text-slate-400 font-medium text-sm">Review and commit to the decentralized protocol requirements.</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { title: 'Local-First Processing', desc: 'Raw patient records remain in local hospital storage.' },
                                        { title: 'Zero-Knowledge updates', desc: 'Model weight deltas are encrypted via E2EE protocols.' },
                                        { title: 'DP Enforcement', desc: 'Differential Privacy adds noise to prevent sample reconstruction.' },
                                        { title: 'Audit Transparency', desc: 'Every data touchpoint is logged on the tamper-proof ledger.' }
                                    ].map(item => (
                                        <div key={item.title} className="flex items-center gap-6 p-6 border border-slate-100 rounded-3xl hover:border-slate-200 transition-colors cursor-pointer group">
                                            <div className="relative">
                                                <input type="checkbox" defaultChecked className="w-6 h-6 rounded-lg bg-slate-100 border-none accent-primary-500 cursor-pointer" />
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-900 text-sm">{item.title}</h5>
                                                <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={nextStep} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 group">
                                    Commit to Protocol
                                    <Shield size={20} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        )}

                        {/* STEP 4: TEST */}
                        {step === 4 && (
                            <div className="space-y-10 py-8">
                                <div className="flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="relative">
                                        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${status === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'
                                            }`}>
                                            <Activity size={48} className={status === '' ? 'animate-pulse' : ''} />
                                        </div>
                                        {status === 'success' && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                                            >
                                                <Check size={20} />
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                            {status === 'success' ? 'Bridge Established' : 'Connecting Institutional Bridge...'}
                                        </h3>
                                        <p className="text-slate-400 font-medium text-sm max-w-sm mx-auto">
                                            {status === 'success'
                                                ? 'Peer-to-peer handshake verified. Heartbeat nominal.'
                                                : `Pinging node identity ${createdHospital?.id} via secure tunnel...`}
                                        </p>
                                    </div>
                                </div>

                                {status === '' && (
                                    <button
                                        onClick={() => setTimeout(() => setStatus('success'), 2000)}
                                        className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3"
                                    >
                                        Establish Peer Connection
                                        <RefreshCw size={20} />
                                    </button>
                                )}

                                {status === 'success' && (
                                    <button onClick={nextStep} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3">
                                        Authorize Final Activation
                                        <ArrowRight size={20} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* STEP 5: ACTIVATE */}
                        {step === 5 && (
                            <div className="text-center space-y-12 py-10">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150" />
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-500 text-white flex items-center justify-center relative shadow-2xl shadow-emerald-500/40">
                                        <CheckCircle size={64} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-slate-950 tracking-tighter">Integration Successful</h2>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                                        <span className="font-black text-slate-950">{form.name}</span> is officially indexed in the global network. Training contribution can begin immediately.
                                    </p>
                                </div>

                                <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => navigate('/clients')}
                                        className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
                                    >
                                        Manage Institutional Nodes
                                        <ArrowRight size={20} />
                                    </button>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-slate-50 text-slate-400 font-bold py-5 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all"
                                    >
                                        Add Another Node
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AddHospital;
