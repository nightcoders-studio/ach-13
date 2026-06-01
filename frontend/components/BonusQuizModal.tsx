import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';
import { Button } from './Button';
import { GoogleGenAI, Type } from '@google/genai';

interface BonusQuizModalProps {
    unitTitle: string;
    onClose: () => void;
    onComplete: (xpEarned: number) => void;
}

interface BonusQuestion {
    question: string;
    answer: string;
    hint: string;
    type: 'fill-in' | 'translate';
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

async function generateBonusQuestions(unitTitle: string): Promise<BonusQuestion[]> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Buat 3 soal bonus Bahasa Aceh untuk unit "${unitTitle}". Soal harus berupa isian (bukan pilihan ganda). Tipe soal: "fill-in" (isi kata yang hilang) atau "translate" (terjemahkan kalimat pendek). Berikan hint untuk membantu.`,
            config: {
                systemInstruction: `Kamu adalah ahli Bahasa Aceh. Buat soal dalam Bahasa Indonesia. Jawaban harus singkat (1-3 kata dalam Bahasa Aceh). Selalu jawab dalam Bahasa Indonesia.`,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING, description: "Pertanyaan dalam Bahasa Indonesia" },
                            answer: { type: Type.STRING, description: "Jawaban singkat dalam Bahasa Aceh (1-3 kata)" },
                            hint: { type: Type.STRING, description: "Petunjuk singkat dalam Bahasa Indonesia" },
                            type: { type: Type.STRING, description: "fill-in atau translate" }
                        },
                        required: ["question", "answer", "hint", "type"]
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as BonusQuestion[];
        }
        return [];
    } catch (error) {
        console.error("Error generating bonus questions:", error);
        return [];
    }
}

export const BonusQuizModal: React.FC<BonusQuizModalProps> = ({ unitTitle, onClose, onComplete }) => {
    const [questions, setQuestions] = useState<BonusQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await generateBonusQuestions(unitTitle);
                if (data && data.length > 0) {
                    setQuestions(data);
                } else {
                    setError("Gagal memuat soal bonus. Coba lagi.");
                }
            } catch {
                setError("Terjadi kesalahan jaringan.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [unitTitle]);

    const handleCheck = () => {
        if (!userAnswer.trim()) return;
        setIsChecking(true);

        const correctAnswer = questions[currentIndex].answer.toLowerCase().trim();
        const userInput = userAnswer.toLowerCase().trim();

        // Flexible matching: exact or contains the key word
        const correct = userInput === correctAnswer || 
                       correctAnswer.includes(userInput) || 
                       userInput.includes(correctAnswer);

        setIsCorrect(correct);
        if (correct) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setUserAnswer('');
            setIsChecking(false);
            setIsCorrect(null);
            setShowHint(false);
        } else {
            // Calculate bonus XP: 2x for each correct, 3x if all correct
            const baseXp = 20;
            let totalXp = score * baseXp;
            if (score === questions.length) {
                totalXp = score * baseXp * 3; // Triple XP for perfect!
            } else if (score > 0) {
                totalXp = score * baseXp * 2; // Double XP
            }
            onComplete(totalXp);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#ffc800] animate-spin mb-4" />
                <p className="text-lg font-bold text-gray-600">Menyiapkan soal bonus...</p>
            </div>
        );
    }

    if (error || questions.length === 0) {
        return (
            <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 text-center">
                <XCircle className="w-16 h-16 text-danger mb-4" />
                <h2 className="text-xl font-bold mb-2">Oops!</h2>
                <p className="text-gray-600 mb-6">{error || "Tidak ada soal."}</p>
                <Button onClick={onClose} variant="primary">Kembali</Button>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;

    return (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col">
            {/* Header */}
            <div className="flex items-center p-4 border-b border-gray-100">
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
                <div className="flex-1 mx-4 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#ffc800] transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex items-center bg-[#FFF9E5] px-3 py-1 rounded-full border border-[#ffc800]">
                    <Zap className="w-4 h-4 text-[#ffc800] mr-1" />
                    <span className="text-sm font-extrabold text-yellow-700">Bonus</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col max-w-2xl mx-auto w-full">
                <div className="bg-[#FFF9E5] border-2 border-[#ffc800]/30 rounded-2xl p-4 mb-6">
                    <p className="text-yellow-700 font-bold text-sm text-center">
                        🎁 Soal Bonus — Jawab benar untuk Double/Triple XP!
                    </p>
                </div>

                <div className="mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {currentQ.type === 'fill-in' ? 'Isi Jawaban' : 'Terjemahkan'}
                    </span>
                </div>

                <h2 className="text-2xl font-extrabold mb-6 text-gray-800">
                    {currentQ.question}
                </h2>

                {/* Answer Input */}
                <div className="mb-4">
                    <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isChecking && handleCheck()}
                        disabled={isChecking}
                        placeholder="Ketik jawaban dalam Bahasa Aceh..."
                        className={`w-full border-2 rounded-2xl p-4 text-lg font-bold focus:outline-none transition-colors ${
                            isChecking 
                                ? (isCorrect ? 'border-tertiary bg-tertiaryLight' : 'border-secondary bg-secondaryLight')
                                : 'border-gray-200 bg-gray-50 focus:border-[#ffc800] focus:bg-white'
                        }`}
                        autoFocus
                    />
                </div>

                {/* Hint */}
                {!isChecking && (
                    <button 
                        onClick={() => setShowHint(true)}
                        className="text-sm font-bold text-gray-400 hover:text-primary mb-4"
                    >
                        {showHint ? `💡 ${currentQ.hint}` : '💡 Tampilkan petunjuk'}
                    </button>
                )}

                {/* Result feedback */}
                {isChecking && (
                    <div className={`rounded-2xl p-4 mb-4 ${isCorrect ? 'bg-tertiaryLight border border-tertiary' : 'bg-secondaryLight border border-secondary'}`}>
                        {isCorrect ? (
                            <p className="font-extrabold text-tertiaryDark flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2" /> Benar! 🎉
                            </p>
                        ) : (
                            <div>
                                <p className="font-extrabold text-secondaryDark flex items-center mb-1">
                                    <XCircle className="w-5 h-5 mr-2" /> Kurang tepat
                                </p>
                                <p className="text-sm font-bold text-secondaryDark">
                                    Jawaban yang benar: <span className="text-gray-800">{currentQ.answer}</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t-2 ${isChecking ? (isCorrect ? 'bg-tertiaryLight border-tertiary' : 'bg-secondaryLight border-secondary') : 'bg-white border-gray-100'}`}>
                <div className="max-w-2xl mx-auto">
                    {!isChecking ? (
                        <Button 
                            variant="primary"
                            fullWidth
                            disabled={!userAnswer.trim()}
                            onClick={handleCheck}
                        >
                            Periksa
                        </Button>
                    ) : (
                        <Button 
                            variant={isCorrect ? 'tertiary' : 'secondary'}
                            fullWidth
                            onClick={handleNext}
                        >
                            {currentIndex === questions.length - 1 ? 'Lihat Hasil' : 'Lanjut'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
