import React, { useState } from 'react';
import { Download, Shield, Lock, CheckCircle, FlaskConical, Upload, BarChart3, FileText, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const TestYourDataPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDownload = async (platform) => {
        try {
            let anonymousId = localStorage.getItem('anonymous_id');
            if (!anonymousId) {
                anonymousId = 'user_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('anonymous_id', anonymousId);
            }

            const response = await fetch('http://localhost:8000/api/public/downloads/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    platform: platform,
                    version: '2.0.0',
                    anonymous_id: anonymousId
                })
            });

            if (response.ok) {
                const downloadPath = platform === 'Windows'
                    ? '/downloads/FEDRAL AI Agent Setup 2.0.0.exe'
                    : '/downloads/FEDRAL AI Agent-2.0.0-arm64.dmg';

                const actualPath = platform === 'Windows/macOS'
                    ? '/downloads/FEDRAL AI Agent Setup 2.0.0.exe'
                    : downloadPath;

                const link = document.createElement('a');
                link.href = actualPath;
                link.download = actualPath.split('/').pop();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                alert('Thank you! Your ' + platform + ' installer download has started.\n\nOnce downloaded, simply run the file to start your private AI analysis.');
            } else {
                throw new Error('Failed to track download');
            }
        } catch (error) {
            console.error('Error tracking download:', error);
            alert('Download starting...');
            const link = document.createElement('a');
            link.href = platform === 'Windows' ? '/downloads/FEDRAL AI Agent Setup 2.0.0.exe' : '/downloads/FEDRAL AI Agent-2.0.0-arm64.dmg';
            link.click();
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-24 space-y-24">

            {/* --- HERO SECTION --- */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-12 lg:p-24 text-center"
            >
                {/* Decorative mesh background */}
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full text-white font-bold text-sm tracking-widest uppercase"
                    >
                        <ShieldCheck size={16} className="text-emerald-400" />
                        Clinical-Grade Privacy
                    </motion.div>

                    <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1]">
                        Analyze Patient Data <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">Without Sharing It.</span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Fedral.ai lets you test local disease risk models instantly on your computer.
                        No data uploads. No cloud leaks. 100% HIPAA-ready.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <button
                            className="bg-primary-500 hover:bg-primary-600 text-white font-black px-10 py-5 rounded-[2rem] text-lg transition-all shadow-xl shadow-primary-500/30 flex items-center justify-center gap-3"
                            onClick={() => document.getElementById('download-section').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Download Local Agent
                            <ArrowRight size={20} />
                        </button>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] text-white">
                            <Zap size={20} className="text-yellow-400" />
                            <span className="font-bold">Instant Setup</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- WORKFLOW SECTION --- */}
            <div className="space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Hospital Journey</h2>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">From download to discovery in four simple, secure steps.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { step: '01', icon: Download, title: 'Get Agent', desc: 'Secure local application.' },
                        { step: '02', icon: Upload, title: 'Import Data', desc: 'Connect your hospital CSV.' },
                        { step: '03', icon: FlaskConical, title: 'Local AI', desc: 'Analysis on your hardware.' },
                        { step: '04', icon: BarChart3, title: 'Discover', desc: 'Export clinical reports.' }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            className="glass-card p-10 text-center flex flex-col items-center gap-6 relative"
                        >
                            <span className="absolute top-4 right-6 text-4xl font-black text-slate-100 italic">{item.step}</span>
                            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-500 shadow-inner">
                                <item.icon size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- DOWNLOAD SECTION --- */}
            <section id="download-section" className="space-y-12 py-12">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Secure Deployment</h2>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">Select your clinical workstation platform for immediate deployment.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    {/* Windows Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="glass-card p-12 border-2 border-slate-100 hover:border-primary-500/30 transition-all flex flex-col items-center gap-8"
                    >
                        <div className="w-24 h-24 flex items-center justify-center bg-slate-50 rounded-3xl group">
                            <img src="/windows-logo.png" alt="Windows" className="w-16 h-16 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-slate-950">Workstation for Windows</h3>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Version 2.0.0 • Win 10/11 x64</p>
                        </div>
                        <button
                            onClick={() => handleDownload('Windows')}
                            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl"
                        >
                            <Download size={20} />
                            Deploy Windows Setup
                        </button>
                    </motion.div>

                    {/* Mac Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="glass-card p-12 border-2 border-slate-100 hover:border-primary-500/30 transition-all flex flex-col items-center gap-8"
                    >
                        <div className="w-24 h-24 flex items-center justify-center bg-slate-50 rounded-3xl group">
                            <img src="/apple-logo.jpg" alt="macOS" className="w-16 h-16 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-slate-950">Workstation for macOS</h3>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Version 2.0.0 • Apple Silicon</p>
                        </div>
                        <button
                            onClick={() => handleDownload('macOS')}
                            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl"
                        >
                            <Download size={20} />
                            Deploy macOS Agent
                        </button>
                    </motion.div>
                </div>

                <div className="max-w-3xl mx-auto glass-card p-10 bg-slate-50/50 border-dashed flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 leading-tight">Need Sample Data?</h4>
                            <p className="text-sm text-slate-500 font-medium">Test our AI performance with a validated dataset.</p>
                        </div>
                    </div>
                    <a
                        href="/downloads/sample_patient_data.csv"
                        download
                        className="flex items-center gap-2 font-bold text-primary-500 bg-white px-6 py-3 rounded-xl border border-primary-100 shadow-sm hover:bg-primary-50 transition-all shrink-0"
                    >
                        <Download size={18} />
                        Download CSV
                    </a>
                </div>
            </section>

            {/* --- PRIVACY GUARANTEE --- */}
            <div className="relative p-12 lg:p-24 rounded-[3rem] bg-gradient-to-br from-primary-500 to-indigo-700 overflow-hidden shadow-2xl shadow-primary-500/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">Clinical Data Sovereignty</h2>
                        <ul className="space-y-6">
                            {[
                                { icon: Shield, title: 'Local Execution', desc: 'No patient data is ever transmitted to Fedral.ai cloud.' },
                                { icon: Lock, title: 'Encrypted Persistence', desc: 'Agent storage is protected via AES-256 local encryption.' },
                                { icon: CheckCircle, title: 'Full Transparency', desc: 'Audit every model update with our open-trace protocol.' }
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                        <item.icon className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                        <p className="text-sm text-white/70 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white/10 backdrop-blur-3xl p-10 rounded-[2rem] border border-white/20 shadow-2xl transition-transform hover:scale-[1.02] cursor-default">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-400/30">
                                <CheckCircle size={24} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black text-white italic tracking-tight">HIPAA & GDPR Ready</h3>
                        </div>
                        <p className="text-white/80 font-medium leading-loose">
                            Federated Learning enables hospitals to build world-class AI collective models
                            without exchanging sensitive information. By design, PII (Personally Identifiable Information)
                            is functionally isolated from our servers.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- FAQ SECTION --- */}
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Inquiries</h2>
                </div>
                <div className="space-y-4">
                    {[
                        { q: 'Is my patient data really private?', a: 'Yes! Your patient data never leaves your computer. The agent runs entirely locally. Only anonymous model weights (mathematical numbers) can be shared if you explicitly consent.' },
                        { q: 'What file format do I need?', a: 'A CSV file with columns: age, biomarker1, biomarker2, outcome. We\'ll validate the format when you upload.' },
                        { q: 'Do I need internet access?', a: 'Only for downloading and contributing anonymous model updates. Local analysis works completely offline.' }
                    ].map((faq, idx) => (
                        <details key={idx} className="group glass-card overflow-hidden transition-all">
                            <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                                <span className="font-black text-slate-900 tracking-tight">{faq.q}</span>
                                <span className="transition-transform group-open:rotate-180 text-primary-500">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </span>
                            </summary>
                            <div className="px-8 pb-8 text-slate-500 font-medium leading-relaxed">
                                {faq.a}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestYourDataPage;
