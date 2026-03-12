import React, { useState } from 'react';
import Welcome from './components/Welcome';
import PrivacyAgreement from './components/PrivacyAgreement';
import Tutorial from './components/Tutorial';
import CSVGuide from './components/CSVGuide';
import FileUpload from './components/FileUpload';
import Validation from './components/Validation';
import Testing from './components/Testing';
import EnhancedReport from './components/EnhancedReport';
import ContributionInfo from './components/ContributionInfo';
import ThankYou from './components/ThankYou';
import DiseaseSupport from './components/DiseaseSupport';
import { ChevronLeft } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error("UI Crash:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">A UI Error Occurred</h1>
                    <pre className="p-4 bg-red-50 text-red-800 rounded-xl text-xs mb-6 max-w-full overflow-auto">
                        {this.state.error?.toString()}
                    </pre>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-900 text-white rounded-xl">Restart Application</button>
                </div>
            );
        }
        return this.props.children;
    }
}



function App() {
    const [step, setStep] = useState('welcome');
    const [data, setData] = useState(null);
    const [results, setResults] = useState(null);
    const [contributed, setContributed] = useState(false);
    const [hospitalName, setHospitalName] = useState('');

    const nextStep = (next) => {
        console.log(`Transitioning: ${step} -> ${next}`);
        setStep(next);
    };

    const handleBack = () => {
        const backMap = {
            'privacy': 'welcome',
            'tutorial': 'privacy',
            'disease-support': 'tutorial',
            'guide': 'disease-support',
            'upload': 'guide',
            'validation': 'upload',
            'testing': 'validation',
            'report': 'upload', // Go back to start of analysis if on report
            'contribution-info': 'report',
            'thank-you': 'report'
        };

        const target = backMap[step];
        if (!target) return;

        const confirmMsg = step === 'testing'
            ? "Analysis is in progress. Are you sure you want to go back? This will stop the current process."
            : "Are you sure you want to go back to the previous step?";

        if (window.confirm(confirmMsg)) {
            if (step === 'testing') {
                window.electronAPI.removeAnalysisListeners();
            }

            // Clear data if going back to upload or earlier to prevent stale state
            if (target === 'upload' || target === 'guide' || target === 'disease-support') {
                setData(null);
                setResults(null);
            }
            // Clear results if going back from report (restart analysis)
            if (step === 'report') {
                setResults(null);
            }

            setStep(target);
        }
    };

    return (
        <div className="min-h-screen mesh-gradient flex flex-col items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-5xl min-h-[720px] flex flex-col glass-card rounded-[48px] overflow-hidden relative">
                {/* Global Back Button */}
                {step !== 'welcome' && (
                    <button
                        onClick={handleBack}
                        className="absolute top-8 left-8 z-50 p-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 text-slate-600 hover:text-primary-500 hover:bg-white transition-all shadow-sm group"
                        title="Go Back"
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                )}

                <main className={`flex-1 flex flex-col relative ${step === 'report' ? 'p-0' : 'p-10 md:p-16'}`}>
                    <ErrorBoundary>
                        {step === 'welcome' && <Welcome onNext={() => nextStep('privacy')} />}
                        {step === 'privacy' && <PrivacyAgreement onNext={(name) => { setHospitalName(name); nextStep('tutorial'); }} onBack={() => nextStep('welcome')} />}
                        {step === 'tutorial' && <Tutorial onNext={() => nextStep('disease-support')} onBack={() => nextStep('privacy')} />}
                        {step === 'disease-support' && <DiseaseSupport onNext={() => nextStep('guide')} onBack={() => nextStep('tutorial')} />}
                        {step === 'guide' && <CSVGuide onNext={() => nextStep('upload')} onBack={() => nextStep('disease-support')} />}
                        {step === 'upload' && <FileUpload onNext={(file) => { setData(file); nextStep('validation'); }} onBack={() => nextStep('guide')} />}
                        {step === 'validation' && <Validation file={data} onNext={(processedData) => {
                            setData(processedData);
                            nextStep('testing');
                        }} onBack={() => nextStep('upload')} />}
                        {step === 'testing' && <Testing data={data} onNext={(res) => {
                            setResults(res);
                            nextStep('report');
                        }} />}
                        {step === 'report' && <EnhancedReport results={results} hospitalName={hospitalName} onNext={() => nextStep('contribution-info')} />}
                        {step === 'contribution-info' && <ContributionInfo results={results} hospitalName={hospitalName} onNext={() => { setContributed(true); nextStep('thank-you'); }} onBack={() => nextStep('report')} />}
                        {step === 'thank-you' && <ThankYou results={results} onNext={() => nextStep('report')} />}
                    </ErrorBoundary>
                </main>
            </div>

            {/* App Footer/Branding */}
            <div className="mt-8 flex items-center gap-4 text-slate-400 text-sm font-medium">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span>Secure Edge Node</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                <span>FEDRAL.AI v2.0.4</span>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                <span>Hospital Agent</span>
            </div>
        </div>
    );
}

export default App;
