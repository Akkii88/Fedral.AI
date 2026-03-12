import React, { useState } from 'react';
import { ChevronLeft, ArrowRight, Upload, Search, Cpu, BarChart3 } from 'lucide-react';

const Tutorial = ({ onNext, onBack }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            icon: <Upload size={48} className="text-blue-500" />,
            title: "1. Upload Your Data",
            description: "Select your hospital's data in CSV format. We provide clear guides on exactly what columns and data types are required for the AI to work.",
            color: "bg-blue-50"
        },
        {
            icon: <Search size={48} className="text-emerald-500" />,
            title: "2. Automatic Validation",
            description: "Our agent instantly checks your file for errors, missing values, or format issues. This ensures the AI gets high-quality data for testing.",
            color: "bg-emerald-50"
        },
        {
            icon: <Cpu size={48} className="text-purple-500" />,
            title: "3. Private Local Testing",
            description: "The AI runs directly on your computer. It analyzes patterns and generates predictions without ever sending your records to the cloud.",
            color: "bg-purple-50"
        },
        {
            icon: <BarChart3 size={48} className="text-orange-500" />,
            title: "4. Insightful Reports",
            description: "Get a beautiful, professional report showing the AI's accuracy and performance on your specific patient population.",
            color: "bg-orange-50"
        }
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onNext();
        }
    };

    return (
        <div className="flex-1 flex flex-col animate-slide-up">

            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                <div key={currentSlide} className="animate-fade-in flex flex-col items-center">
                    <div className={`w-24 h-24 ${slides[currentSlide].color} rounded-3xl flex items-center justify-center mb-8 shadow-sm`}>
                        {slides[currentSlide].icon}
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-6">{slides[currentSlide].title}</h2>

                    <p className="text-lg text-slate-600 mb-12 leading-relaxed h-24">
                        {slides[currentSlide].description}
                    </p>
                </div>

                {/* Progress Dots */}
                <div className="flex gap-3 mb-12">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-primary-500' : 'w-2 bg-slate-200'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                    onClick={onNext}
                    className="text-slate-400 hover:text-slate-600 transition-colors font-semibold"
                >
                    Skip Tutorial
                </button>

                <button
                    onClick={handleNext}
                    className="group px-10 py-4 bg-primary-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-200 hover:bg-primary-600 active:scale-[0.98]"
                >
                    {currentSlide === slides.length - 1 ? 'Next Step' : 'Next Step'}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default Tutorial;
