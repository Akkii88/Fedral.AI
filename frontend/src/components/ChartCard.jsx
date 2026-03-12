import React from 'react';
import { Info, BarChart3 } from 'lucide-react';

const ChartCard = ({ title, subtitle, footerText, children, color = "#0ea5e9" }) => {
    return (
        <div className="glass-card flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 rounded-full" style={{ background: color }}></div>
                    <h3 className="text-xl font-black text-slate-950 tracking-tight">{title}</h3>
                </div>
                {subtitle && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4.5 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Graph Area */}
            <div className="p-8 bg-white/30 flex-grow" style={{ height: '400px' }}>
                {children}
            </div>

            {/* Educational Footer */}
            {footerText && (
                <div className="p-8 bg-slate-900 border-t border-slate-800">
                    <div className="flex gap-4">
                        <div className="mt-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                <Info size={16} style={{ color }} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clinical Insight</p>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                {footerText}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartCard;
