import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, Loader2, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { evaluatePronunciation } from '../services/gemini';

interface PronunciationProps {
    onAddXp: (amount: number) => void;
}

export const Pronunciation: React.FC<PronunciationProps> = ({ onAddXp }) => {
    const navigate = useNavigate();
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<{score: number, feedback: string} | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const targetWord = "Peugah haba";
    const targetIndo = "Berbicara / Bercerita";

    const startRecording = async () => {
        setError(null);
        setResult(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    await analyzeAudio(base64Audio, mediaRecorder.mimeType);
                };
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Tidak dapat mengakses mikrofon. Pastikan izin diberikan.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const analyzeAudio = async (base64Audio: string, mimeType: string) => {
        setIsAnalyzing(true);
        try {
            const evaluation = await evaluatePronunciation(base64Audio, mimeType, targetWord);
            setResult(evaluation);
            if (evaluation.score >= 70) {
                onAddXp(15); // Reward for good pronunciation
            }
        } catch (err) {
            setError("Gagal mengevaluasi audio. Coba lagi.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getScoreFeedback = (score: number) => {
        if (score >= 80) {
            return { 
                title: "Get that! (Luar biasa!)", 
                color: "text-secondary", 
                bg: "bg-green-50 border-green-200", 
                icon: CheckCircle 
            };
        }
        if (score >= 60) {
            return { 
                title: "Kagét, bacut teuk! (Sudah bagus!)", 
                color: "text-yellow-500", 
                bg: "bg-yellow-50 border-yellow-200", 
                icon: AlertCircle 
            };
        }
        return { 
            title: "Beuthat beu meuhase! (Tetap semangat!)", 
            color: "text-orange-500", 
            bg: "bg-orange-50 border-orange-200", 
            icon: XCircle 
        };
    };

    return (
        <div className="flex-1 flex flex-col bg-background p-4 pb-24">
            <div className="flex items-center mb-8">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-extrabold text-gray-800 ml-2">Latihan Pengucapan</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
                
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 w-full text-center mb-8">
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-2">Ucapkan kalimat ini</p>
                    <h2 className="text-4xl font-extrabold text-primary mb-2">"{targetWord}"</h2>
                    <p className="text-gray-600 font-medium">{targetIndo}</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-danger p-4 rounded-2xl mb-8 font-bold text-center w-full">
                        {error}
                    </div>
                )}

                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-16 h-16 text-secondary animate-spin mb-4" />
                        <p className="text-gray-600 font-extrabold text-lg">AI sedang menilai suaramu...</p>
                    </div>
                ) : result ? (
                    <div className={`rounded-3xl p-6 shadow-sm border-2 w-full text-center animate-in fade-in slide-in-from-bottom-4 ${getScoreFeedback(result.score).bg}`}>
                        <div className="flex justify-center mb-4">
                            {React.createElement(getScoreFeedback(result.score).icon, { className: `w-16 h-16 ${getScoreFeedback(result.score).color}` })}
                        </div>
                        <h3 className="text-5xl font-extrabold text-gray-800 mb-2">{result.score}<span className="text-2xl text-gray-400">/100</span></h3>
                        <h4 className={`text-xl font-extrabold mb-3 ${getScoreFeedback(result.score).color}`}>
                            {getScoreFeedback(result.score).title}
                        </h4>
                        <p className="text-gray-700 font-medium mb-6 bg-white/60 p-3 rounded-xl">{result.feedback}</p>
                        <Button fullWidth onClick={() => setResult(null)}>Coba Lagi</Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <button 
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${isRecording ? 'bg-danger animate-pulse' : 'bg-primary hover:bg-primaryDark'}`}
                        >
                            {isRecording ? <Square className="w-10 h-10 text-white fill-current" /> : <Mic className="w-10 h-10 text-white" />}
                        </button>
                        <p className="text-gray-500 font-bold mt-6">
                            {isRecording ? 'Ketuk untuk berhenti' : 'Ketuk untuk merekam'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
