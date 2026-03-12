import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, AlertCircle, AlertTriangle, Play, RefreshCcw, FileCheck } from 'lucide-react';
import { validateCSV } from '../services/csvValidator';

const Validation = ({ file, onNext, onBack }) => {
    const [status, setStatus] = useState('validating');
    const [result, setResult] = useState(null);

    useEffect(() => {
        const runValidation = async () => {
            try {
                // Add artificial delay for "professional feel"
                await new Promise(r => setTimeout(r, 1500));
                const res = await validateCSV(file);
                setResult(res);
                setStatus(res.isValid ? 'success' : 'error');
            } catch (err) {
                setStatus('error');
                setResult({ errors: ['Failed to read CSV file. Is it corrupted?'], warnings: [] });
            }
        };
        runValidation();
    }, [file]);

    return (
        <div className="flex-1 flex flex-col animate-slide-up">

            {status === 'validating' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-primary-500">
                            <FileCheck size={32} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Validating Data Format</h2>
                    <p className="text-slate-500">Checking columns, data types, and file integrity...</p>
                </div>
            ) : (
                <>
                    <div className="flex items-start gap-6 mb-10">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${status === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
                            }`}>
                            {status === 'success' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">
                                {status === 'success' ? 'File Ready for Testing' : 'Action Required'}
                            </h2>
                            <p className="text-slate-600">
                                {status === 'success'
                                    ? 'Your data passed all validation checks and is ready for local AI testing.'
                                    : 'We found some issues that need to be fixed before we can proceed.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-10 space-y-6">
                        {/* File Info Card */}
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                    <FileCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected File</p>
                                    <p className="font-bold text-slate-900">{result.fileName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Records Found</p>
                                <p className="font-bold text-primary-600">{result.rowCount} Patients</p>
                            </div>
                        </div>

                        {/* Error List */}
                        {result.errors.length > 0 && (
                            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    Critical Errors ({result.errors.length})
                                </h3>
                                <ul className="space-y-3">
                                    {result.errors.map((err, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-red-700 bg-white/50 p-3 rounded-lg border border-red-100">
                                            <span className="font-bold shrink-0">•</span>
                                            {err}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Warning List */}
                        {result.warnings.length > 0 && (
                            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    Recommendations ({result.warnings.length})
                                </h3>
                                <ul className="space-y-3">
                                    {result.warnings.map((warn, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-orange-700 bg-white/50 p-3 rounded-lg border border-orange-100">
                                            <span className="font-bold shrink-0">•</span>
                                            {warn}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6 pt-6 border-t border-slate-100">
                        <button
                            className="flex-1 px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all font-bold"
                            onClick={onBack}
                        >
                            <RefreshCcw size={20} />
                            Try Different File
                        </button>

                        {status === 'success' && (
                            <button
                                onClick={() => onNext(result)}
                                className="flex-1 group px-10 py-4 bg-primary-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-200 hover:bg-primary-600 active:scale-[0.98]"
                            >
                                Run AI Predictions
                                <Play size={20} className="fill-current" />
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Validation;
