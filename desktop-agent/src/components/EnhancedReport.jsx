import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import {
    Download, TrendingUp, Users, Activity, Shield, Database, FileText, ChevronRight
} from 'lucide-react';

// Import all result components
import PatientTable from './results/PatientTable';
import PatientDetailModal from './results/PatientDetailModal';
import FeatureImportance from './results/FeatureImportance';
import ConfusionMatrix from './results/ConfusionMatrix';
import ROCCurve from './results/ROCCurve';
import ClinicalDecisionSupport from './results/ClinicalDecisionSupport';

// Import export services
import { generatePDFReport, exportToCSV, exportToJSON } from '../services/pdfGenerator';

/**
 * Professional Enterprise Report
 * Neat, clean, and highly optimized medical interface.
 */
const MetricCard = memo(({ label, value, icon: Icon, color }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1">{label}</p>
                <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
            </div>
        </div>
    </div>
));

MetricCard.displayName = 'MetricCard';

const RiskSummary = memo(({ category, count, total, color, icon: Icon }) => (
    <div className={`bg-white border-l-4 ${color} rounded-r-xl border-y border-r border-slate-200 p-6 flex items-center gap-6 shadow-sm`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color.replace('border-', 'bg-').replace('-600', '-50')} text-${color.replace('border-', '')}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{category} Risk</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{count}</span>
                <span className="text-sm font-bold text-slate-400">
                    ({total > 0 ? (Number(count / total) * 100).toFixed(1) : '0.0'}%)
                </span>
            </div>
        </div>
    </div>
));

RiskSummary.displayName = 'RiskSummary';

const EnhancedReport = ({ results, hospitalName, onNext }) => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    if (!results) {
        return (
            <div className="flex items-center justify-center h-96 bg-[#fafafa]">
                <p className="text-slate-400 font-medium">No clinical results found</p>
            </div>
        );
    }

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const pdf = await generatePDFReport(results, hospitalName);
            pdf.save(`fedral_report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const metrics = [
        { label: 'Total Cohort', value: (results.totalCount || 0).toLocaleString(), icon: Users, color: 'bg-blue-600' },
        { label: 'Accuracy', value: `${Number(results.accuracy || 0).toFixed(1)}%`, icon: Activity, color: 'bg-slate-800' },
        { label: 'Sensitivity', value: `${Number(results.sensitivity || 0).toFixed(1)}%`, icon: TrendingUp, color: 'bg-emerald-600' },
        { label: 'F1 Score', value: `${Number(results.f1Score || 0).toFixed(1)}%`, icon: Shield, color: 'bg-indigo-600' },
        { label: 'AUC-ROC', value: Number(results.auc || 0).toFixed(3), icon: Activity, color: 'bg-blue-600' }
    ];

    return (
        <div className="absolute inset-0 flex flex-col bg-[#fafafa] overflow-hidden font-sans">
            {/* Header / Nav */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Activity className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">
                            Clinical Intelligence
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">
                            {hospitalName || 'Health System'} • Final Report
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Download size={14} />
                        {isExporting ? 'Generating...' : 'PDF Report'}
                    </button>
                    {onNext && (
                        <button
                            onClick={onNext}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/10 transition-all flex items-center gap-2"
                        >
                            Complete
                            <ChevronRight size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 bg-[#fafafa]/50">

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {metrics.map((m) => (
                        <MetricCard key={m.label} {...m} />
                    ))}
                </div>

                {/* Risk Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RiskSummary
                        category="High"
                        count={results.high_risk || 0}
                        total={results.totalCount}
                        color="border-red-600"
                        icon={AlertCircle}
                    />
                    <RiskSummary
                        category="Medium"
                        count={results.medium_risk || 0}
                        total={results.totalCount}
                        color="border-amber-500"
                        icon={AlertTriangle}
                    />
                    <RiskSummary
                        category="Stable"
                        count={results.low_risk || 0}
                        total={results.totalCount}
                        color="border-emerald-600"
                        icon={CheckCircle2}
                    />
                </div>

                {/* Main Analysis Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                            Model Performance Matrix
                        </h2>
                        <ConfusionMatrix confusionMatrix={results.confusionMatrix} />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                            Discriminative Capacity (ROC)
                        </h2>
                        <ROCCurve
                            rocCurve={results.rocCurve}
                            auc={results.auc}
                            calibration={results.calibration}
                        />
                    </div>
                </div>

                {/* Patient Insights Table */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">
                                Patient Longitudinal Analytics
                            </h2>
                            <p className="text-xs text-slate-400 font-medium tracking-wide">
                                Detailed breakdown of clinical risk vectors and model certainties
                            </p>
                        </div>
                    </div>
                    <PatientTable
                        patients={results.results}
                        onPatientClick={setSelectedPatient}
                    />
                </div>
            </div>

            {/* Modals */}
            {selectedPatient && (
                <PatientDetailModal
                    patient={selectedPatient}
                    featureImportance={results.featureImportance}
                    onClose={() => setSelectedPatient(null)}
                />
            )}
        </div>
    );
};

export default memo(EnhancedReport);

// Helper for consistency
const AlertCircle = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
const AlertTriangle = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const CheckCircle2 = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" />
    </svg>
);
