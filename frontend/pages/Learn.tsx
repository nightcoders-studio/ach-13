import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Check, Lock, BookOpen, ShieldQuestion, Mic } from 'lucide-react';
import { LessonModal } from '../components/LessonModal';
import { Button } from '../components/Button';
import { UserProgress } from '../types';

const UNITS = [
    {
        id: 1,
        title: 'Unit 1',
        description: 'Dasar-dasar Bahasa Aceh',
        color: 'bg-secondary', 
        shadowColor: 'shadow-secondaryDark',
        topics: [
            { id: 1, title: 'Sapaan', icon: '👋', status: 'completed' },
            { id: 2, title: 'Keluarga', icon: '👨‍👩‍👧‍👦', status: 'active' },
            { id: 3, title: 'Harta', icon: '🎁', status: 'locked', isChest: true },
            { id: 4, title: 'Makanan', icon: '🍛', status: 'locked' },
        ]
    },
    {
        id: 2,
        title: 'Unit 2',
        description: 'Angka dan Waktu',
        color: 'bg-tertiary', 
        shadowColor: 'shadow-tertiaryDark',
        topics: [
            { id: 5, title: 'Angka', icon: '🔢', status: 'locked' },
            { id: 6, title: 'Waktu', icon: '⏰', status: 'locked' },
            { id: 7, title: 'Harta', icon: '🎁', status: 'locked', isChest: true },
        ]
    }
];

interface LearnProps {
    onAddXp: (amount: number) => void;
    currentUser: UserProgress;
}

export const Learn: React.FC<LearnProps> = ({ onAddXp, currentUser }) => {
    const navigate = useNavigate();
    const [activeLesson, setActiveLesson] = useState<string | null>(null);

    const handleLessonComplete = (score: number) => {
        setActiveLesson(null);
        if (score > 0) {
            onAddXp(score * 10); // 10 XP per correct answer
        }
    };

    return (
        <div className="flex-1 overflow-y-auto pb-24 bg-background">
            <div className="max-w-md mx-auto">
                
                {/* Pre-test Banner / Card */}
                {!currentUser.pretestCompleted && (
                    <div className="m-4 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="bg-primary p-4 flex items-center justify-between">
                            <div className="text-white">
                                <h2 className="font-extrabold text-xl">Tes Penempatan</h2>
                                <p className="text-primaryLight text-sm font-medium">Ketahui level Bahasa Aceh-mu!</p>
                            </div>
                            <ShieldQuestion className="w-12 h-12 text-primaryLight" />
                        </div>
                        <div className="p-5 bg-white flex flex-col items-center text-center">
                            <p className="text-gray-600 font-medium mb-5 text-sm">
                                Ikuti tes singkat ini untuk membuka Papan Peringkat dan mendapatkan kategori levelmu (Aneuk Mit, Aneuk Muda, atau Ureung Chiek).
                            </p>
                            <Button variant="primary" fullWidth onClick={() => navigate('/pretest')}>
                                Mulai Tes Sekarang
                            </Button>
                        </div>
                    </div>
                )}

                {/* Pronunciation Practice Banner */}
                <div className="mx-4 mt-4 mb-2">
                    <button 
                        onClick={() => navigate('/pengucapan')}
                        className="w-full bg-white rounded-3xl p-4 flex items-center text-left shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-12 h-12 bg-secondaryLight text-secondary rounded-full flex items-center justify-center mr-4 shadow-sm shrink-0">
                            <Mic className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-extrabold text-gray-800 text-lg">Latihan Pengucapan</h4>
                            <p className="text-gray-500 text-sm font-semibold">Cek aksen dengan AI</p>
                        </div>
                    </button>
                </div>

                {UNITS.map((unit, unitIndex) => (
                    <div key={unit.id} className="mb-8">
                        {/* Unit Header */}
                        <div className={`${unit.color} text-white p-5 shadow-sm sticky top-0 z-20`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-extrabold tracking-tight">{unit.title}</h2>
                                    <p className="font-bold opacity-90 text-sm">{unit.description}</p>
                                </div>
                                <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-none py-2 px-3">
                                    <BookOpen className="w-5 h-5 mr-2" /> Panduan
                                </Button>
                            </div>
                        </div>

                        {/* Path Container */}
                        <div className="py-10 px-4 flex flex-col items-center relative">
                            {/* SVG Path Line (Background) */}
                            <div className="absolute top-0 bottom-0 w-full flex justify-center pointer-events-none overflow-hidden z-0">
                                <svg width="100" height="100%" preserveAspectRatio="none">
                                    <path 
                                        d="M 50 0 Q 100 100 50 200 T 50 400 Q 0 500 50 600 T 50 800" 
                                        stroke="#e5e7eb" 
                                        strokeWidth="18" 
                                        fill="none" 
                                        strokeLinecap="round"
                                        strokeDasharray="0 24"
                                    />
                                </svg>
                            </div>

                            {unit.topics.map((topic, index) => {
                                // Calculate winding offset
                                const offset = Math.sin(index * 1.2) * 65; 
                                
                                let btnColor = 'bg-[#e5e5e5] border-[#cecece] text-gray-400';
                                let Icon = Lock;
                                
                                if (topic.status === 'completed') {
                                    btnColor = 'bg-[#ffc800] border-[#e5b400] text-white';
                                    Icon = Check;
                                } else if (topic.status === 'active') {
                                    btnColor = `${unit.color} border-black/20 text-white`;
                                    Icon = Star;
                                }

                                if (topic.isChest) {
                                    btnColor = topic.status === 'locked' ? 'bg-[#e5e5e5] border-[#cecece]' : 'bg-[#ffc800] border-[#e5b400]';
                                }

                                return (
                                    <div 
                                        key={topic.id} 
                                        className="relative my-5 flex flex-col items-center z-10"
                                        style={{ transform: `translateX(${offset}px)` }}
                                    >
                                        {/* "Mulai" Tooltip for active lesson */}
                                        {topic.status === 'active' && (
                                            <div className="absolute -top-14 animate-bounce bg-white border-2 border-gray-200 text-gray-800 font-extrabold py-2 px-4 rounded-xl shadow-sm z-30 whitespace-nowrap">
                                                Mulai
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-gray-200 transform rotate-45"></div>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => topic.status === 'active' && setActiveLesson(topic.title)}
                                            disabled={topic.status === 'locked'}
                                            className={`w-20 h-20 rounded-full border-b-8 flex items-center justify-center text-3xl transition-transform active:scale-95 ${btnColor} ${topic.status === 'active' ? 'ring-4 ring-white/50 shadow-lg' : ''}`}
                                        >
                                            {topic.icon}
                                        </button>
                                        
                                        {!topic.isChest && (
                                            <div className="absolute -bottom-7 font-extrabold text-gray-500 text-sm bg-white/90 px-3 py-1 rounded-lg shadow-sm border border-gray-100 whitespace-nowrap">
                                                {topic.title}
                                            </div>
                                        )}
                                        
                                        {/* Status Icon Badge (Don't show on chests) */}
                                        {!topic.isChest && (
                                            <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white ${topic.status === 'completed' ? 'bg-[#ffc800]' : topic.status === 'active' ? 'bg-white text-secondary' : 'bg-[#e5e5e5]'}`}>
                                                <Icon className={`w-4 h-4 ${topic.status === 'active' ? 'text-secondary' : 'text-white'}`} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {activeLesson && (
                <LessonModal 
                    topic={activeLesson} 
                    onClose={() => setActiveLesson(null)} 
                    onComplete={handleLessonComplete}
                />
            )}
        </div>
    );
};
