import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';

interface PretestProps {
    onComplete: (score: number) => void;
}

export const Pretest: React.FC<PretestProps> = ({ onComplete }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    // Hardcoded pretest questions for MVP
    const questions = [
        {
            q: "Apa bahasa Aceh dari 'Makan'?",
            options: ["Pajoh", "Jak", "Eh", "Duk"],
            a: "Pajoh"
        },
        {
            q: "Terjemahkan: 'Lon jak u keude'",
            options: ["Saya pergi ke pasar", "Saya tidur di rumah", "Dia makan nasi", "Kami bermain bola"],
            a: "Saya pergi ke pasar"
        },
        {
            q: "Pilih kalimat yang benar untuk 'Siapa namamu?'",
            options: ["Soe nan droeneuh?", "Peu haba?", "Pajan trok?", "Pat neuduek?"],
            a: "Soe nan droeneuh?"
        }
    ];

    const handleOptionClick = (opt: string) => {
        if (isChecking) return; // Prevent multiple clicks
        
        setSelectedAnswer(opt);
        setIsChecking(true);
        
        if (opt === questions[currentIndex].a) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setSelectedAnswer(null);
            setIsChecking(false);
        } else {
            // Calculate percentage score
            const finalScore = (score / questions.length) * 100;
            onComplete(finalScore);
            navigate('/papan');
        }
    };

    const currentQ = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;

    return (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col">
            {/* Header */}
            <div className="flex items-center p-4 border-b border-gray-100">
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-tertiary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col max-w-2xl mx-auto w-full">
                <div className="mb-8 text-center">
                    <h1 className="text-xl font-bold text-gray-500 uppercase tracking-wider mb-2">Pre-test Penempatan</h1>
                    <h2 className="text-2xl font-extrabold text-gray-800">
                        {currentQ.q}
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-auto mb-8">
                    {currentQ.options.map((opt, idx) => {
                        let btnClass = "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50";
                        if (selectedAnswer === opt) {
                            btnClass = "bg-primaryLight border-2 border-primary text-primary";
                        }
                        if (isChecking) {
                            if (opt === currentQ.a) {
                                btnClass = "bg-tertiaryLight border-2 border-tertiary text-tertiaryDark";
                            } else if (selectedAnswer === opt && opt !== currentQ.a) {
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
            <div className={`p-6 border-t-2 ${isChecking ? (selectedAnswer === currentQ.a ? 'bg-tertiaryLight border-tertiary' : 'bg-secondaryLight border-secondary') : 'bg-white border-gray-100'}`}>
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    {isChecking ? (
                        <div className="flex items-center">
                            {selectedAnswer === currentQ.a ? (
                                <div className="flex items-center text-tertiaryDark font-bold text-xl">
                                    <CheckCircle className="w-8 h-8 mr-2 fill-current text-white" />
                                    Benar!
                                </div>
                            ) : (
                                <div className="flex flex-col text-secondaryDark">
                                    <div className="flex items-center font-bold text-xl mb-1">
                                        <XCircle className="w-8 h-8 mr-2 fill-current text-white" />
                                        Salah
                                    </div>
                                    <span className="text-sm font-semibold">Jawaban: {currentQ.a}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-400 font-bold">Pilih salah satu jawaban</div>
                    )}

                    <Button 
                        variant={isChecking ? (selectedAnswer === currentQ.a ? 'tertiary' : 'secondary') : 'primary'}
                        disabled={!isChecking}
                        onClick={handleNext}
                        className="min-w-[150px]"
                    >
                        {isChecking ? (currentIndex === questions.length - 1 ? 'Selesai' : 'Lanjut') : 'Lanjut'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
