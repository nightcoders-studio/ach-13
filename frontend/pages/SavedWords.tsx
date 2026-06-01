import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Trash2, Volume2, BookOpen } from 'lucide-react';
import { Button } from '../components/Button';

interface SavedWordsProps {
    savedWords: string[];
    onRemoveWord: (word: string) => void;
}

export const SavedWords: React.FC<SavedWordsProps> = ({ savedWords, onRemoveWord }) => {
    const navigate = useNavigate();

    const playAudio = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 pb-24 bg-background">
            <div className="max-w-md mx-auto">
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <Bookmark className="w-6 h-6 text-primary ml-2 mr-2 fill-current" />
                    <h1 className="text-xl font-extrabold text-gray-800">Kata Tersimpan</h1>
                </div>

                <p className="text-gray-600 mb-6 text-sm bg-white p-4 rounded-2xl shadow-sm border border-gray-100 font-medium">
                    Daftar kata yang sudah kamu simpan dari Kamus. Ketuk untuk mendengarkan pengucapannya.
                </p>

                {savedWords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <BookOpen className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-lg font-extrabold text-gray-600 mb-2">Belum ada kata tersimpan</h2>
                        <p className="text-gray-400 font-medium text-sm mb-6">
                            Cari kata di Kamus dan tekan ikon bookmark untuk menyimpannya.
                        </p>
                        <Button onClick={() => navigate('/kamus')} variant="primary">
                            Buka Kamus
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {savedWords.map((word, idx) => (
                            <div 
                                key={idx} 
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between group"
                            >
                                <div className="flex items-center flex-1 min-w-0">
                                    <div className="w-10 h-10 bg-primaryLight rounded-xl flex items-center justify-center mr-3 shrink-0">
                                        <span className="text-primary font-extrabold text-sm">
                                            {(idx + 1).toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                    <p className="font-extrabold text-gray-800 truncate">{word}</p>
                                </div>
                                <div className="flex items-center space-x-1 shrink-0">
                                    <button
                                        onClick={() => playAudio(word)}
                                        className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-primaryLight transition-colors"
                                        title="Dengarkan"
                                    >
                                        <Volume2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => onRemoveWord(word)}
                                        className="p-2 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50 transition-colors"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="pt-4 text-center">
                            <p className="text-sm text-gray-400 font-medium">
                                {savedWords.length} kata tersimpan
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
