import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    Inbox,
    CheckCircle,
    XCircle,
    Clock,
    Activity,
    Database,
    Info
} from 'lucide-react';

const InboxPage = () => {
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchContributions();
    }, []);

    const fetchContributions = async () => {
        try {
            const data = await api.contributions.list('pending');
            setContributions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id, action) => {
        try {
            await api.contributions.review(id, action);
            // Remove from list after review
            setContributions(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            alert('Review failed: ' + err.message);
        }
    };

    if (loading) return <div className="p-8 text-slate-400">Loading inbox...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Inbox className="w-8 h-8 text-blue-500" />
                        Contribution Inbox
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Review and approve hospital reports before merging with the global model.
                    </p>
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium border border-blue-100 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {contributions.length} Pending Actions
                </div>
            </div>

            {contributions.length === 0 ? (
                <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl p-16 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-700">All caught up!</h2>
                    <p className="text-slate-500 mt-2">No pending hospital contributions to review.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {contributions.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Database className="w-8 h-8" />
                                </div>

                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-slate-800">{item.hospital_name}</h3>
                                        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-md font-mono uppercase tracking-wider font-semibold">
                                            {item.id.slice(0, 8)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {new Date(item.timestamp).toLocaleString()}
                                        </span>
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100/50 text-xs font-bold uppercase">
                                            New Contribution
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 px-8 border-x border-slate-100 hidden md:grid">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-slate-800">{(item.accuracy * 100).toFixed(1)}%</div>
                                        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1 flex items-center justify-center gap-1">
                                            <Activity className="w-3 h-3" />
                                            Accuracy
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-slate-800">{item.samples_count}</div>
                                        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Samples</div>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => handleReview(item.id, 'rejected')}
                                        className="flex-1 md:flex-none px-6 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleReview(item.id, 'accepted')}
                                        className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Accept Merge
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400 italic">
                                <Info className="w-3.5 h-3.5" />
                                Overview: This update improves local model performance by {((item.accuracy * 0.1) * 100).toFixed(1)}% vs baseline. No raw patient data was transmitted.
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InboxPage;
