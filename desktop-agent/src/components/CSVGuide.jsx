import React from 'react';
import { ChevronLeft, ArrowRight, Download, FileSpreadsheet, Info } from 'lucide-react';

const CSVGuide = ({ onNext, onBack }) => {
    const columns = [
        { name: 'age', type: 'Number', desc: 'Patient age in years' },
        { name: 'biomarker1', type: 'Number', desc: 'First blood marker value' },
        { name: 'biomarker2', type: 'Number', desc: 'Second marker (e.g. CRP)' },
        { name: 'biomarker3', type: 'Number', desc: 'Third marker (e.g. D-Dimer)' },
        { name: 'outcome', type: '0 or 1', desc: 'Target (0=Recovered, 1=Critical)' },
    ];

    return (
        <div className="flex-1 flex flex-col animate-slide-up">

            <div className="flex items-start gap-6 mb-10">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet size={32} className="text-orange-500" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Prepare Your Data</h2>
                    <p className="text-slate-600">Ensure your CSV matches the required format for the AI to process it.</p>
                </div>
            </div>

            <div className="flex-1 bg-slate-50 rounded-3xl p-8 border border-slate-100 mb-10 overflow-y-auto">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Required Columns</h3>

                <div className="space-y-4 mb-8">
                    {columns.map((col, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <code className="px-3 py-1 bg-primary-100 text-primary-700 rounded-md font-bold">{col.name}</code>
                                <span className="text-slate-500 text-sm">{col.desc}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded tracking-wide">{col.type}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                        <Info size={18} className="text-blue-500 shrink-0" />
                        <div>
                            <h4 className="font-bold text-blue-900 text-sm mb-1">Non-Technical Setup</h4>
                            <p className="text-blue-700 text-xs">Simply prepare your CSV and upload. No coding or complex configuration required.</p>
                        </div>
                    </div>
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                        <Info size={18} className="text-blue-500 shrink-0" />
                        <div>
                            <h4 className="font-bold text-blue-900 text-sm mb-1">Self-Cleaning</h4>
                            <p className="text-blue-700 text-xs">Don't worry about extra columns. Our AI will automatically select what it needs.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-slate-100">
                <a
                    className="flex-1 px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all no-underline"
                    href="./samples/sample_data.csv"
                    download="FedralAI_SamplePatientData.csv"
                >
                    <Download size={20} />
                    Download Sample CSV
                </a>

                <button
                    onClick={onNext}
                    className="flex-1 group px-10 py-4 bg-primary-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-200 hover:bg-primary-600 active:scale-[0.98]"
                >
                    I'm Ready to Upload
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default CSVGuide;
