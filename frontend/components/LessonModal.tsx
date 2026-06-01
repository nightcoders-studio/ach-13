import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { generateLesson } from '../services/gemini';
import { Question } from '../types';

interface LessonModalProps {
    topic: string;
    onClose: () => void;
    onComplete: (score: number) => void;
    onWrongAnswer?: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({ topic, onClose, onComplete, onWrongAnswer }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const scoreRef = useRef(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const data = await generateLesson(topic);
                if (data && data.length > 0) {
                    setQuestions(data);
                } else {
                    setError("Gagal memuat pelajaran. Coba lagi.");
                }
            } catch (err) {
                setError("Terjadi kesalahan jaringan.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic]);

    const handleOptionClick = (opt: string) => {
        if (isChecking) return; // Prevent clicking multiple times
        
        setSelectedAnswer(opt);
        setIsChecking(true);
        
        const correct = opt === questions[currentIndex].answer;
        setIsCorrect(correct);
        if (correct) {
            const nextScore = scoreRef.current + 1;
            scoreRef.current = nextScore;
            setScore(nextScore);
        } else {
            // Lose a heart on wrong answer
            onWrongAnswer?.();
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setSelectedAnswer(null);
            setIsChecking(false);
            setIsCorrect(null);
        } else {
            onComplete(scoreRef.current);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-lg font-bold text-gray-600">Menyiapkan pelajaran AI...</p>
            </div>
        );
    }

    if (error || questions.length === 0) {
        return (
            <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 text-center">
                <XCircle className="w-16 h-16 text-danger mb-4" />
                <h2 className="text-xl font-bold mb-2">Oops!</h2>
                <p className="text-gray-600 mb-6">{error || "Tidak ada pertanyaan."}</p>
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
                        className="h-full bg-tertiary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col max-w-2xl mx-auto w-full">
                <h2 className="text-2xl font-extrabold mb-8 text-gray-800">
                    {currentQ.question}
                </h2>

                <div className="grid grid-cols-1 gap-4 mt-auto mb-8">
                    {currentQ.options.map((opt, idx) => {
                        let btnClass = "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50";
                        if (selectedAnswer === opt) {
                            btnClass = "bg-primaryLight border-2 border-primary text-primary";
                        }
                        if (isChecking) {
                            if (opt === currentQ.answer) {
                                btnClass = "bg-tertiaryLight border-2 border-tertiary text-tertiaryDark";
                            } else if (selectedAnswer === opt && !isCorrect) {
                                btnClass = "bg-secondaryLight border-2 border-secondary text-secondaryDark";
                            }
                        }

                        return (
                            <button
                                key={idx}
                                disabled={isChecking}
                                onClick={() => handleOptionClick(opt)}
                                className={`p-4 rounded-xl text-lg font-bold text-left transition-all ${btnClass} ${!isChecking ? 'active:scale-[0.98]' : ''}`}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer Action Area */}
            <div className={`p-6 border-t-2 ${isChecking ? (isCorrect ? 'bg-tertiaryLight border-tertiary' : 'bg-secondaryLight border-secondary') : 'bg-white border-gray-100'}`}>
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    {isChecking ? (
                        <div className="flex items-center">
                            {isCorrect ? (
                                <div className="flex items-center text-tertiaryDark font-bold text-xl">
                                    <CheckCircle className="w-8 h-8 mr-2 fill-current text-white" />
                                    Luar Biasa!
                                </div>
                            ) : (
                                <div className="flex flex-col text-secondaryDark">
                                    <div className="flex items-center font-bold text-xl mb-1">
                                        <XCircle className="w-8 h-8 mr-2 fill-current text-white" />
                                        Kurang tepat
                                    </div>
                                    <span className="text-sm font-semibold">Jawaban benar: {currentQ.answer}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-400 font-bold">Pilih salah satu jawaban</div>
                    )}

                    <Button 
                        variant={isChecking ? (isCorrect ? 'tertiary' : 'secondary') : 'primary'}
                        disabled={!isChecking}
                        onClick={handleNext}
                        className="min-w-[150px]"
                    >
                        Lanjut
                    </Button>
                </div>
            </div>
        </div>
    );
};
