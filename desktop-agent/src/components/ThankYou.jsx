import React from 'react';
import { PartyPopper, Heart, CheckCircle2, ChevronRight, Globe, Download, ArrowRight } from 'lucide-react';

const ThankYou = ({ results, onNext }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in p-8">
            <div className="relative mb-12 box-content p-4">
                <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-20 scale-150"></div>
                <div className="w-28 h-28 bg-white text-primary-500 rounded-[36px] flex items-center justify-center relative shadow-2xl border border-primary-50">
                    <Heart size={56} className="fill-current animate-bounce" />
                </div>
                <div className="absolute -top-1 -right-1 w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10">
                    <CheckCircle2 size={24} />
                </div>
            </div>

            <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
                Handshake Complete!
            </h1>

            <p className="text-xl text-slate-500 mb-12 max-w-xl leading-relaxed font-medium">
                Your anonymous model improvements have been securely merged into the <strong>Global Clinical Intelligence Network</strong>.
                You are helping save lives across the globe.
            </p>

            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                    <Globe size={28} className="text-primary-500 mb-4" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Global Impact</span>
                    <span className="text-2xl font-black text-slate-900">124+ Hospitals</span>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                    <Heart size={28} className="text-rose-500 mb-4" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Patterns Contributed</span>
                    <span className="text-2xl font-black text-slate-900">500,000+</span>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                    <CheckCircle2 size={28} className="text-emerald-500 mb-4" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sync Status</span>
                    <span className="text-xl font-black text-slate-900">Verified Secure</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg">
                <button
                    onClick={onNext}
                    className="flex-[2] px-10 py-5 bg-primary-500 text-white rounded-3xl font-black flex items-center justify-center gap-3 transition-all shadow-2xl shadow-primary-200 hover:bg-primary-600 hover:-translate-y-1 active:scale-[0.98]"
                >
                    Return to Intelligent Dashboard
                    <ArrowRight size={24} />
                </button>
                <button
                    className="flex-1 items-center justify-center gap-2 px-8 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black hover:bg-slate-200 transition-all"
                    onClick={() => alert('Diagnostic Report (PDF) has been archived in your local medical records folder.')}
                >
                    <Download size={20} />
                    Archive
                </button>
            </div>

            <div className="mt-16 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 inline-flex items-center gap-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Digital Fingerprint:</span>
                <code className="text-xs font-bold text-primary-600 bg-white px-3 py-1 rounded-lg shadow-sm border border-primary-100">
                    FED-CONTRIB-2026-0204-S91
                </code>
            </div>
        </div>
    );
};

export default ThankYou;
