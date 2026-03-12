import React, { useState, useCallback } from 'react';
import { ChevronLeft, Upload, FileText, X } from 'lucide-react';

const FileUpload = ({ onNext, onBack }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave' || e.type === 'drop') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.csv')) {
                setFile(droppedFile);
            } else {
                alert('Please upload a CSV file.');
            }
        }
    }, []);

    const handleSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="flex-1 flex flex-col animate-slide-up">

            <div className="flex items-start gap-6 mb-10">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Upload size={32} className="text-primary-500" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Upload Data</h2>
                    <p className="text-slate-600">Drag your patient data CSV file here to begin the private local analysis.</p>
                </div>
            </div>

            <div
                className={`flex-1 flex flex-col items-center justify-center border-3 border-dashed rounded-[32px] transition-all relative ${isDragging
                    ? 'border-primary-500 bg-primary-50/50 scale-[1.01]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                    }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
            >
                {!file ? (
                    <div className="text-center p-12">
                        <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400 group-hover:text-primary-500 transition-colors">
                            <Upload size={32} />
                        </div>
                        <p className="text-lg font-bold text-slate-900 mb-2">Drag & Drop CSV File Here</p>
                        <p className="text-slate-500 mb-8">or click to browse from your computer</p>

                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".csv"
                            onChange={handleSelect}
                        />
                        <label
                            htmlFor="file-upload"
                            className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer hover:border-primary-500 hover:text-primary-500 transition-all shadow-sm active:scale-95"
                        >
                            Browse Files
                        </label>
                    </div>
                ) : (
                    <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm border border-slate-100 animate-fade-in relative">
                        <button
                            onClick={() => setFile(null)}
                            className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary-500">
                                <FileText size={40} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 truncate mb-1">{file.name}</h4>
                                <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(4)} MB • Prepared</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center pt-8 mt-4 border-t border-slate-100">
                <button
                    onClick={() => file && onNext(file)}
                    disabled={!file}
                    className={`group px-16 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${file
                        ? 'bg-primary-500 text-white shadow-primary-200 hover:bg-primary-600 active:scale-[0.98]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                >
                    Check File Format
                    <Upload size={20} className={file ? 'group-hover:-translate-y-1 transition-transform' : ''} />
                </button>
            </div>
        </div>
    );
};

export default FileUpload;
