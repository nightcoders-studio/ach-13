import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, ChevronRight, ArrowLeft, Play, Square, Volume2 } from 'lucide-react';
import { generateStory } from '../services/gemini';
import { Story } from '../types';
import { Button } from '../components/Button';
import { firebaseAuth } from '../services/firebase';

export const Stories: React.FC = () => {
    const navigate = useNavigate();
    const [story, setStory] = useState<Story | null>(null);
    const [loading, setLoading] = useState(false);
    const [revealedSentences, setRevealedSentences] = useState<Set<number>>(new Set());
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const loadNewStory = async () => {
        setLoading(true);
        setStory(null);
        setRevealedSentences(new Set());
        setIsPlaying(false);
        window.speechSynthesis.cancel();
        
        try {
            const newStory = await generateStory('beginner');
            setStory(newStory);
        } catch (error) {
            console.error("Failed to load story");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNewStory();
        return () => {
            window.speechSynthesis.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleReveal = (index: number) => {
        setRevealedSentences(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const playStoryAudio = async () => {
        if (!story) return;
        
        // Prevent multiple clicks while loading
        if (isLoadingAudio) return;

        if (isPlaying) {
            // Stop current audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.remove();
                audioRef.current = null;
            }
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        setIsLoadingAudio(true);
        setIsPlaying(true);

        const fullText = story.sentences.map(s => s.aceh).join('. ');
        
        try {
            // Get auth token for TTS endpoint
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (firebaseAuth?.currentUser) {
                const token = await firebaseAuth.currentUser.getIdToken();
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/tts', {
                method: 'POST',
                headers,
                body: JSON.stringify({ text: fullText, voiceName: 'Kore' }),
            });

            if (!response.ok) {
                throw new Error(`TTS API returned ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.setAttribute('data-story-audio', 'true');
            audioRef.current = audio;

            audio.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
                audioRef.current = null;
            };
            audio.onerror = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
                audioRef.current = null;
            };

            await audio.play();
        } catch (error) {
            console.warn('Gemini TTS failed, falling back to browser speech:', error);
            // Fallback to browser speechSynthesis
            if ('speechSynthesis' in window) {
                const fullText = story.sentences.map(s => s.aceh).join('. ');
                const utterance = new SpeechSynthesisUtterance(fullText);
                utterance.lang = 'id-ID';
                utterance.rate = 0.85;
                utterance.onend = () => setIsPlaying(false);
                utterance.onerror = () => setIsPlaying(false);
                window.speechSynthesis.speak(utterance);
            } else {
                setIsPlaying(false);
                alert("Gagal memutar audio.");
            }
        } finally {
            setIsLoadingAudio(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 pb-24 bg-background">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-secondary">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-gray-400 hover:text-gray-600">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <BookOpen className="w-8 h-8 mr-2" />
                        <h1 className="text-2xl font-extrabold text-gray-800">Hikayat</h1>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadNewStory} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hikayat Baru'}
                    </Button>
                </div>

                <p className="text-gray-600 mb-6 text-sm bg-white p-4 rounded-2xl shadow-sm border border-gray-100 font-medium">
                    Baca dan dengarkan legenda Aceh. <strong>Ketuk kalimat</strong> untuk melihat terjemahannya.
                </p>

                {loading && !story && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-secondary animate-spin mb-4" />
                        <p className="text-gray-500 font-extrabold">AI sedang menyusun hikayat...</p>
                    </div>
                )}

                {story && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
                        {/* Image & Audio Player Header */}
                        <div className="h-56 bg-gray-200 relative">
                            <img 
                                src={`https://picsum.photos/seed/${story.title}/400/300`} 
                                alt="Story illustration" 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                                <h2 className="text-2xl font-extrabold text-white leading-tight mb-4">{story.title}</h2>
                                
                                {/* Audio Control */}
                                <button 
                                    onClick={playStoryAudio}
                                    disabled={isLoadingAudio && !isPlaying}
                                    className={`flex items-center justify-center py-3 px-4 rounded-2xl font-extrabold transition-all disabled:opacity-70 ${isPlaying ? 'bg-danger text-white shadow-lg shadow-danger/30' : 'bg-white text-primary shadow-lg'}`}
                                >
                                    {isLoadingAudio && !isPlaying ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memuat Audio...
                                        </>
                                    ) : isPlaying ? (
                                        <>
                                            <Square className="w-5 h-5 mr-2 fill-current" /> Hentikan Audio
                                        </>
                                    ) : (
                                        <>
                                            <Volume2 className="w-5 h-5 mr-2" /> Dengarkan Hikayat
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {story.sentences.map((s, idx) => {
                                const isRevealed = revealedSentences.has(idx);
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => toggleReveal(idx)}
                                        className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${isRevealed ? 'bg-secondaryLight border-secondary/30' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                                    >
                                        <p className="text-lg font-extrabold text-gray-800 leading-relaxed">
                                            {s.aceh}
                                        </p>
                                        {isRevealed && (
                                            <div className="mt-3 pt-3 border-t border-secondary/20 animate-in slide-in-from-top-2 fade-in duration-200">
                                                <p className="text-gray-600 font-medium flex items-start">
                                                    <ChevronRight className="w-5 h-5 text-secondary mr-1 shrink-0 mt-0.5" />
                                                    {s.indo}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
