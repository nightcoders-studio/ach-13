import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, Loader2, Clock, Check, X } from 'lucide-react';
import { Button } from '../components/Button';
import { firebaseAuth } from '../services/firebase';
import { submitContribution, fetchMyContributions, Contribution } from '../services/api';

export const Community: React.FC = () => {
    const navigate = useNavigate();
    const [word, setWord] = useState('');
    const [translation, setTranslation] = useState('');
    const [example, setExample] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [myContributions, setMyContributions] = useState<Contribution[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const loadMyContributions = async () => {
        if (!firebaseAuth?.currentUser) return;
        setLoadingHistory(true);
        try {
            const contributions = await fetchMyContributions(firebaseAuth.currentUser);
            setMyContributions(contributions);
        } catch (err) {
            console.error('Failed to load contributions:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!firebaseAuth?.currentUser) {
            setError('Anda harus login untuk mengirim kontribusi.');
            return;
        }

        setLoading(true);
        try {
            await submitContribution(firebaseAuth.currentUser, {
                word: word.trim(),
                translation: translation.trim(),
                example: example.trim() || undefined,
            });
            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal mengirim kontribusi.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setWord('');
        setTranslation('');
        setExample('');
        setSubmitted(false);
        setError('');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="flex items-center text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg"><Check className="w-3 h-3 mr-1" />Disetujui</span>;
            case 'rejected':
                return <span className="flex items-center text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-lg"><X className="w-3 h-3 mr-1" />Ditolak</span>;
            default:
                return <span className="flex items-center text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-lg"><Clock className="w-3 h-3 mr-1" />Menunggu</span>;
        }
    };

    if (submitted) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 text-center">
                <CheckCircle className="w-20 h-20 text-secondary mb-6" />
                <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Terima Kasih!</h1>
                <p className="text-gray-600 font-medium mb-8">
                    Kosakata yang kamu usulkan telah dikirim dan menunggu validasi dari admin. Kontribusimu sangat berarti!
                </p>
                <div className="space-y-3 w-full">
                    <Button onClick={resetForm} fullWidth variant="primary">Kirim Lagi</Button>
                    <Button onClick={() => navigate('/kamus')} fullWidth variant="outline">Kembali ke Kamus</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 pb-24 bg-background">
            <div className="max-w-md mx-auto">
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-extrabold text-gray-800 ml-2">Kontribusi Komunitas</h1>
                </div>

                <div className="bg-tertiaryLight rounded-3xl p-6 mb-6 flex items-start">
                    <Users className="w-8 h-8 text-tertiary mr-4 shrink-0" />
                    <p className="text-tertiaryDark font-medium text-sm">
                        Bantu kami memperkaya kamus HabaGet. Usulkan kata, dialek lokal, atau ungkapan baru yang belum ada.
                    </p>
                </div>

                {/* Toggle: Form vs History */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setShowHistory(false)}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${!showHistory ? 'bg-tertiary text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
                    >
                        Kirim Baru
                    </button>
                    <button
                        onClick={() => { setShowHistory(true); loadMyContributions(); }}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${showHistory ? 'bg-tertiary text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
                    >
                        Riwayat Saya
                    </button>
                </div>

                {!showHistory ? (
                    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div>
                            <label className="block text-sm font-extrabold text-gray-700 mb-2">Kata dalam Bahasa Aceh</label>
                            <input 
                                type="text" 
                                required
                                value={word}
                                onChange={(e) => setWord(e.target.value)}
                                placeholder="Contoh: Meutuah"
                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 font-bold focus:outline-none focus:border-tertiary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-extrabold text-gray-700 mb-2">Terjemahan Indonesia</label>
                            <input 
                                type="text" 
                                required
                                value={translation}
                                onChange={(e) => setTranslation(e.target.value)}
                                placeholder="Contoh: Bertuah / Beruntung"
                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 font-bold focus:outline-none focus:border-tertiary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-extrabold text-gray-700 mb-2">Contoh Kalimat (Opsional)</label>
                            <textarea 
                                value={example}
                                onChange={(e) => setExample(e.target.value)}
                                placeholder="Tuliskan contoh penggunaan kata ini..."
                                rows={3}
                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 font-bold focus:outline-none focus:border-tertiary transition-colors resize-none"
                            />
                        </div>
                        {error && (
                            <p className="text-dangerDark font-bold text-sm text-center bg-red-50 rounded-2xl p-3 border border-red-100">
                                {error}
                            </p>
                        )}
                        <div className="pt-4">
                            <Button type="submit" variant="tertiary" fullWidth disabled={loading}>
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Mengirim...</> : 'Kirim Usulan'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        {loadingHistory ? (
                            <div className="p-8 flex justify-center">
                                <Loader2 className="w-8 h-8 text-tertiary animate-spin" />
                            </div>
                        ) : myContributions.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 font-medium">
                                Belum ada kontribusi. Kirim kata pertamamu!
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {myContributions.map(c => (
                                    <div key={c.id} className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-extrabold text-gray-800">{c.word}</p>
                                            {getStatusBadge(c.status)}
                                        </div>
                                        <p className="text-sm text-gray-600">{c.translation}</p>
                                        {c.example && <p className="text-xs text-gray-400 mt-1 italic">"{c.example}"</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
