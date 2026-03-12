import React from 'react';
import { ChevronLeft, ArrowRight, Activity, Heart, Droplets } from 'lucide-react';

const DiseaseSupport = ({ onNext, onBack }) => {
    const diseases = [
        {
            name: "Breast Cancer",
            icon: <Activity size={32} className="text-pink-500" />,
            description: "Oncology data including tumor size, node status, and molecular markers.",
            color: "bg-pink-50",
            borderColor: "border-pink-100"
        },
        {
            name: "Diabetes",
            icon: <Droplets size={32} className="text-blue-500" />,
            description: "Metabolic data covering glucose levels, insulin, BMI, and patient history.",
            color: "bg-blue-50",
            borderColor: "border-blue-100"
        },
        {
            name: "Heart Disease",
            icon: <Heart size={32} className="text-red-500" />,
            description: "Cardiovascular metrics like blood pressure, cholesterol, and ECG results.",
            color: "bg-red-50",
            borderColor: "border-red-100"
        }
    ];

    return (
        <div className="flex-1 flex flex-col animate-slide-up">
            <div className="flex items-start gap-6 mb-8">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Activity size={32} className="text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Supported Diseases</h2>
                    <p className="text-slate-600">The FEDRAL AI is currently trained and optimized for these specific medical conditions.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 gap-4 mb-6">
                    {diseases.map((disease, i) => (
                        <div key={i} className={`flex items-center gap-6 p-6 rounded-2xl border ${disease.borderColor} ${disease.color} transition-all hover:shadow-md cursor-default`}>
                            <div className="flex-shrink-0 bg-white p-3 rounded-xl shadow-sm">
                                {disease.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{disease.name}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{disease.description}</p>
                            </div>
                        </div>
                    ))}

                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-6">
                        <div className="flex-shrink-0 bg-white p-3 rounded-xl shadow-sm text-slate-400">
                            <Activity size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-500 mb-1">Coming Soon</h3>
                            <p className="text-slate-400 text-sm">Support for Pneumonia and Liver Disease is currently in development.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end pt-6 border-t border-slate-100 mt-4">
                <button
                    onClick={onNext}
                    className="group px-10 py-4 bg-primary-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-200 hover:bg-primary-600 active:scale-[0.98]"
                >
                    Prepare Data
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default DiseaseSupport;
