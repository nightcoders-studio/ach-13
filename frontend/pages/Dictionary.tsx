import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookA, Loader2, Sparkles, BookmarkPlus, BookmarkCheck, Volume2, Camera, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { translateWord } from '../services/gemini';
import { DictionaryResult } from '../types';

interface DictionaryProps {
    savedWords: string[];
    onSaveWord: (word: string) => void;
}

export const Dictionary: React.FC<DictionaryProps> = ({ savedWords, onSaveWord }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<DictionaryResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await translateWord(query);
            if (data) {
                setResult(data);
            } else {
                setError('Tidak dapat menemukan terjemahan.');
            }
        } catch (err) {
            setError('Terjadi kesalahan saat mencari.');
        } finally {
            setLoading(false);
        }
    };

    const playAudio = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID'; 
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Browser Anda tidak mendukung fitur audio.");
        }
    };

    const isSaved = result ? savedWords.includes(result.word.toLowerCase()) : false;

    return (
        <div className="flex-1 overflow-y-auto p-4 pb-24 bg-background">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-primary">
                        <BookA className="w-8 h-8 mr-2" />
                        <h1 className="text-2xl font-extrabold">Kamus HabaGet</h1>
                    </div>
                    <button 
                        onClick={() => navigate('/scan')}
                        className="bg-primaryLight text-primary p-2.5 rounded-xl hover:bg-[#dedaf4] transition-colors flex items-center shadow-sm"
                        title="Scan Teks Foto"
                    >
                        <Camera className="w-5 h-5" />
                    </button>
                </div>
                
                <p className="text-gray-600 mb-6 text-sm font-medium">
                    Cari kata dalam bahasa Indonesia atau Aceh. AI akan memberikan terjemahan, konteks, dan contoh kalimat.
                </p>

                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ketik kata di sini..."
                            className="w-full bg-white border-2 border-gray-200 rounded-2xl py-4 pl-4 pr-14 text-lg font-bold focus:outline-none focus:border-primary shadow-sm transition-colors"
                        />
                        <button 
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute right-2 p-2 bg-primary text-white rounded-xl hover:bg-primaryDark disabled:opacity-50 transition-colors"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="p-4 bg-red-50 text-danger rounded-xl border border-red-100 mb-6 font-bold">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-primaryLight border-2 border-primary/20 rounded-3xl p-6 relative shadow-sm">
                            <div className="absolute top-4 right-4 flex space-x-2">
                                <button 
                                    onClick={() => playAudio(result.translation)}
                                    className="p-2 rounded-full hover:bg-white/50 transition-colors text-primary"
                                    title="Dengarkan"
                                >
                                    <Volume2 className="w-7 h-7" />
                                </button>
                                <button 
                                    onClick={() => onSaveWord(result.word.toLowerCase())}
                                    className="p-2 rounded-full hover:bg-white/50 transition-colors"
                                    title={isSaved ? "Tersimpan" : "Simpan Kata"}
                                >
                                    {isSaved ? (
                                        <BookmarkCheck className="w-7 h-7 text-primary fill-current" />
                                    ) : (
                                        <BookmarkPlus className="w-7 h-7 text-primary" />
                                    )}
                                </button>
                            </div>
                            <h2 className="text-sm font-extrabold text-primary uppercase tracking-wider mb-1">Terjemahan dari "{result.word}"</h2>
                            <p className="text-3xl font-extrabold text-primaryDark pr-20">{result.translation}</p>
                        </div>

                        <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center mb-2">
                                <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                                <h2 className="text-sm font-extrabold text-gray-600 uppercase tracking-wider">Nuansa & Konteks</h2>
                            </div>
                            <p className="text-gray-700 font-medium leading-relaxed">{result.nuances}</p>
                        </div>

                        <div>
                            <h2 className="text-sm font-extrabold text-gray-600 uppercase tracking-wider mb-4 ml-2">Contoh Kalimat</h2>
                            <div className="space-y-4">
                                {result.examples.map((ex, idx) => (
                                    <div key={idx} className="bg-white border-2 border-gray-100 rounded-3xl p-5 shadow-sm relative">
                                        <button 
                                            onClick={() => playAudio(ex.aceh)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-primary transition-colors"
                                        >
                                            <Volume2 className="w-5 h-5" />
                                        </button>
                                        <p className="font-extrabold text-lg text-gray-800 mb-1 pr-8">{ex.aceh}</p>
                                        <p className="text-gray-500 font-medium">{ex.indo}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Community Contribution Banner */}
                <div className="mt-10 bg-tertiaryLight rounded-3xl p-6 border border-tertiary/20 shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="font-extrabold text-tertiaryDark text-lg mb-1">Tidak nemu kata?</h3>
                        <p className="text-tertiary text-sm font-semibold">Bantu tambah kosakata baru.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/kontribusi')}
                        className="bg-tertiary text-white p-3 rounded-2xl shadow-md hover:bg-tertiaryDark transition-colors"
                    >
                        <Users className="w-6 h-6" />
                    </button>
                </div>

            </div>
        </div>
    );
};
