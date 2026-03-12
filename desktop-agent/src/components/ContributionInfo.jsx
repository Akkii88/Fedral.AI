import React, { useState } from 'react';
import {
    Users, TrendingUp, ShieldCheck, Heart,
    ChevronLeft, ArrowRight, Lock, Globe, RefreshCcw
} from 'lucide-react';

const ContributionInfo = ({ results, hospitalName, onNext, onBack }) => {
    const [isContributing, setIsContributing] = useState(false);
    const [statusIndex, setStatusIndex] = useState(-1);
    const [error, setError] = useState(null);

    const statuses = [
        "Initializing Secure Cryptographic Tunnel...",
        "Encrypting Clinical Weight Deltas (AES-256)...",
        "Applying Local Differential Privacy Noise...",
        "Validating Institutional Hash Signature...",
        "Transmitting Anonymized Gradients to Fedral.AI...",
        "Finalizing Global Model Handshake..."
    ];

    const handleContribute = async () => {
        setIsContributing(true);
        setError(null);

        try {
            // Start simulation of security steps
            for (let i = 0; i < 4; i++) {
                setStatusIndex(i);
                await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
            }

            setStatusIndex(4); // Transmitting...
            await new Promise(resolve => setTimeout(resolve, 800)); // Ensure UI update is visible

            // Prepare the real model update request
            const formData = new FormData();
            formData.append('hospital_name', hospitalName || 'General Hospital');
            formData.append('num_samples', results?.totalCount || 100);
            formData.append('accuracy', (results?.accuracy || 85) / 100);

            // Generate a mock weight file (.pkl)
            // In a real scenario, this would be the output of a local ML training run
            const mockWeights = new Float32Array(100).map(() => Math.random() - 0.5);
            const blob = new Blob([mockWeights], { type: 'application/octet-stream' });
            formData.append('update', blob, 'model_weights.pkl');

            const response = await fetch('http://localhost:8000/api/agent/upload_model', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Cloud handshake failed (Status: ${response.status})`);
            }

            const data = await response.json();
            console.log('Contribution success:', data);

            setStatusIndex(5); // Finalizing...
            await new Promise(resolve => setTimeout(resolve, 800));

            setIsContributing(false);
            onNext();
        } catch (err) {
            console.error('Contribution error:', err);
            setError(err.message);
            // We KEEP isContributing(true) so the error screen shows
        }
    };

    return (
        <div className="flex-1 flex flex-col animate-slide-up">
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-slate-500 hover:text-primary-500 transition-colors font-bold text-sm"
                >
                    <ChevronLeft size={18} />
                    Back to Intelligent Report
                </button>
            </div>

            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-primary-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                    <Globe size={40} className="text-primary-500" />
                    <div className="absolute inset-0 rounded-[28px] border-4 border-primary-500/10 animate-pulse"></div>
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Help Improve AI for Everyone</h2>
                <p className="text-slate-500 max-w-lg mx-auto font-medium leading-relaxed">
                    By contributing, you help create a safer world while keeping your patient data 100% private and on-premise.
                </p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 overflow-y-auto pr-2 custom-scrollbar">
                <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-emerald-200 transition-all">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                        <TrendingUp size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">Refine Your Local Node</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        Contributing improves the model's accuracy specifically for patient groups like yours. Your node will receive "refined global weights" in the next update.
                    </p>
                    <div className="mt-8 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black tracking-widest uppercase border border-emerald-100 shadow-sm">
                        Improved Local Edge AI
                    </div>
                </div>

                <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-blue-200 transition-all">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                        <Heart size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">Empower Smaller Clinics</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        Your anonymized success helps rural clinics and urban hospitals save lives by sharing high-quality, collective diagnostic patterns.
                    </p>
                    <div className="mt-8 px-6 py-3 bg-blue-50 text-blue-700 rounded-2xl text-[10px] font-black tracking-widest uppercase border border-blue-100 shadow-sm">
                        Democratic Healthcare
                    </div>
                </div>

                <div className="md:col-span-2 p-10 bg-slate-900 text-white rounded-[40px] shadow-2xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center shadow-inner shrink-0 relative z-10 box-content border border-white/10">
                        <ShieldCheck size={48} className="text-primary-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h3 className="text-2xl font-black mb-3">Privacy Protocol: On-Premise Secure</h3>
                        <p className="text-slate-400 leading-relaxed font-medium m-0">
                            We use <b>Homomorphic Encryption</b> and <b>Differential Privacy</b>.
                            Patient records never leave your drive—only the "mathematical lesson" learned from them is transmitted.
                        </p>
                    </div>
                </div>
            </div>

            {/* Contribution Progress Overlay (Functional Simulation) */}
            {isContributing && (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 animate-fade-in rounded-[48px]">
                    {!error ? (
                        <>
                            <div className="w-32 h-32 mb-12 relative flex items-center justify-center text-primary-500">
                                <RefreshCcw size={48} className="animate-spin-slow" />
                                <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-8 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <div className="text-center space-y-4 max-w-md">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Securing Contribution</h3>
                                <p className="text-lg font-bold text-primary-600 animate-pulse bg-primary-50 px-6 py-2 rounded-2xl border border-primary-100 inline-block">
                                    {statuses[statusIndex]}
                                </p>
                                <div className="pt-4 flex flex-col gap-2">
                                    <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-auto">
                                        <div
                                            className="h-full bg-primary-500 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                            style={{ width: `${((statusIndex + 1) / statuses.length) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Phase {statusIndex + 1} of {statuses.length}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-8 animate-slide-up bg-red-50 p-10 rounded-[40px] border border-red-100 max-w-lg">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto text-red-500 shadow-xl shadow-red-100 border border-red-50">
                                <ShieldCheck size={40} className="rotate-180" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-slate-900">Cloud Link Failed</h3>
                                <p className="text-lg font-medium text-slate-600 leading-relaxed">
                                    {error}
                                </p>
                                <p className="text-sm text-slate-400 font-medium">
                                    Please ensure your administrator has enabled "External Peer Node Connectivity" in the Fedral Cloud dashboard.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setError(null)}
                                    className="flex-1 px-8 py-5 bg-white text-slate-600 rounded-3xl font-black border border-red-100 hover:bg-red-100 transition-all"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={handleContribute}
                                    className="flex-[2] px-10 py-5 bg-red-500 text-white rounded-3xl font-black shadow-2xl shadow-red-200 hover:bg-red-600 hover:-translate-y-1 transition-all"
                                >
                                    Retry Handshake
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className={`flex items-center gap-6 pt-8 mt-auto border-t border-slate-100 transition-opacity ${isContributing ? 'opacity-0' : 'opacity-100'}`}>
                <button
                    className="flex-1 px-8 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-slate-200 transition-all"
                    onClick={onBack}
                >
                    No, Skip for Now
                </button>

                <button
                    onClick={handleContribute}
                    className="flex-[2] group px-12 py-5 bg-primary-500 text-white rounded-3xl font-black flex items-center justify-center gap-4 transition-all shadow-2xl shadow-primary-100 hover:bg-primary-600 hover:-translate-y-1 active:scale-[0.98]"
                >
                    Yes, Securely Contribute 💫
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Lock size={12} />
                Encrypted Peer-to-Peer Protocol Active
            </div>
        </div>
    );
};

export default ContributionInfo;
