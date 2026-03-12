import React from 'react';
import { Shield, Lock, ArrowRight } from 'lucide-react';

const Welcome = ({ onNext }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-8">
                <Shield size={40} className="text-primary-500" />
            </div>

            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Welcome to <span className="text-primary-500">FEDRAL.AI</span>
            </h1>

            <p className="text-xl text-slate-600 mb-12 max-w-lg leading-relaxed">
                Test our predictive AI on your hospital data with total confidence.
                Your records stay on your computer—100% private.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-3xl">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                        <Lock size={18} className="text-primary-500" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">100% Local</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                        <Shield size={18} className="text-primary-500" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">HIPAA Ready</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                        <ArrowRight size={18} className="text-primary-500" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Instant Reports</span>
                </div>
            </div>

            <button
                onClick={onNext}
                className="group relative px-10 py-4 bg-primary-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-200 hover:bg-primary-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <span className="flex items-center gap-2">
                    Get Started
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
            </button>

            <p className="mt-8 text-slate-400 text-sm">
                Trusted by 40+ medical institutions worldwide.
            </p>
        </div>
    );
};

export default Welcome;
