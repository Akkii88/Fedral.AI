import React, { useState } from 'react';
import { ShieldCheck, ChevronLeft, ArrowRight } from 'lucide-react';

const PrivacyAgreement = ({ onNext, onBack }) => {
    const [agreed, setAgreed] = useState(false);
    const [hospitalName, setHospitalName] = useState('');

    const handleNext = () => {
        if (!agreed || !hospitalName.trim()) return;
        onNext(hospitalName);
    };

    return (
        <div className="flex-1 flex flex-col animate-slide-up">

            <div className="flex items-start gap-6 mb-10">
                <div className="w-16 h-16 bg-primary-100/50 rounded-2xl flex items-center justify-center flex-shrink-0 relative">
                    <ShieldCheck size={32} className="text-primary-500" />
                    <div className="absolute inset-0 bg-primary-500/10 animate-pulse rounded-2xl"></div>
                </div>
                <div>
                    <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Institutional Registration</h2>
                    <p className="text-slate-500 font-medium">Verify your hospital profile and privacy settings.</p>
                </div>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar pr-4">
                {/* Hospital Profile Section */}
                <div className="p-8 bg-white rounded-[32px] border-2 border-slate-100 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center text-sm">
                            <ArrowRight size={16} />
                        </span>
                        Hospital Profile
                    </h3>
                    <div className="space-y-4">
                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">
                            Institution Name
                        </label>
                        <input
                            type="text"
                            value={hospitalName}
                            onChange={(e) => setHospitalName(e.target.value)}
                            placeholder="e.g. St. Mary's General Hospital"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                        />
                        <p className="text-xs text-slate-400 font-medium ml-1">
                            This name will be used to identify your "Merge Requests" in the Fedral AI cloud.
                        </p>
                    </div>
                </div>

                {/* Privacy Terms Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <section className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-2">1. Local-First</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Patient data NEVER leaves your computer. All diagnostics happen on-premise.
                        </p>
                    </section>

                    <section className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-2">2. Secure Merge</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Contributions are encrypted. Pull requests bridge the gap between privacy and AI progress.
                        </p>
                    </section>
                </div>
            </div>

            <div className="flex flex-col gap-8 mt-10 p-2">
                <label className="flex items-center gap-4 cursor-pointer group p-2 rounded-2xl bg-primary-50/50 border border-primary-100/50">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="peer sr-only"
                        />
                        <div className="w-7 h-7 border-2 border-slate-300 rounded-lg group-hover:border-primary-500 peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all flex items-center justify-center shadow-sm">
                            <svg className={`w-4 h-4 text-white fill-current ${agreed ? 'block' : 'hidden'}`} viewBox="0 0 20 20">
                                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                            </svg>
                        </div>
                    </div>
                    <span className="text-slate-700 font-bold group-hover:text-primary-600 transition-colors">
                        I agree to the Institutional Data Processing Policy
                    </span>
                </label>

                <div className="flex gap-6 items-center">
                    <button
                        onClick={() => {
                            if (confirm("If you disagree, the agent will close. Your data remains safe on your computer. Are you sure?")) {
                                window.close();
                            }
                        }}
                        className="px-10 py-5 bg-slate-100 text-slate-600 rounded-[24px] font-black hover:bg-slate-200 transition-all"
                    >
                        Decline
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!agreed || !hospitalName.trim()}
                        className={`flex-1 px-12 py-5 rounded-[24px] font-black flex items-center justify-center gap-3 transition-all shadow-2xl ${agreed && hospitalName.trim()
                            ? 'bg-primary-500 text-white shadow-primary-200 hover:bg-primary-600 hover:-translate-y-1 active:scale-[0.98]'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        Register Institutional Node
                        <ArrowRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyAgreement;
