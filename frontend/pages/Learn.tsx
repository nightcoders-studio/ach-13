import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Check, Lock, ShieldQuestion, Mic, Trophy } from 'lucide-react';
import { LessonModal } from '../components/LessonModal';
import { BonusQuizModal } from '../components/BonusQuizModal';
import { Button } from '../components/Button';
import { UserProgress } from '../types';

interface Topic {
    id: number;
    title: string;
    icon: string;
    isChest?: boolean;
}

interface Unit {
    id: number;
    title: string;
    description: string;
    color: string;
    topics: Topic[];
}

const ALL_UNITS: Unit[] = [
    {
        id: 1,
        title: 'Unit 1',
        description: 'Dasar-dasar Bahasa Aceh',
        color: 'bg-secondary',
        topics: [
            { id: 1, title: 'Sapaan', icon: '👋' },
            { id: 2, title: 'Keluarga', icon: '👨‍👩‍👧‍👦' },
            { id: 3, title: 'Harta', icon: '🎁', isChest: true },
            { id: 4, title: 'Makanan', icon: '🍛' },
            { id: 5, title: 'Minuman', icon: '🥤' },
        ]
    },
    {
        id: 2,
        title: 'Unit 2',
        description: 'Angka, Waktu & Warna',
        color: 'bg-tertiary',
        topics: [
            { id: 6, title: 'Angka', icon: '🔢' },
            { id: 7, title: 'Waktu', icon: '⏰' },
            { id: 8, title: 'Harta', icon: '🎁', isChest: true },
            { id: 9, title: 'Warna', icon: '🎨' },
            { id: 10, title: 'Hari', icon: '📅' },
        ]
    },
    {
        id: 3,
        title: 'Unit 3',
        description: 'Aktivitas Sehari-hari',
        color: 'bg-primary',
        topics: [
            { id: 11, title: 'Rumah', icon: '🏠' },
            { id: 12, title: 'Pasar', icon: '🏪' },
            { id: 13, title: 'Harta', icon: '🎁', isChest: true },
            { id: 14, title: 'Sekolah', icon: '🏫' },
            { id: 15, title: 'Pekerjaan', icon: '💼' },
        ]
    },
    {
        id: 4,
        title: 'Unit 4',
        description: 'Alam & Lingkungan',
        color: 'bg-[#2EB0A1]',
        topics: [
            { id: 16, title: 'Hewan', icon: '🐄' },
            { id: 17, title: 'Tumbuhan', icon: '🌿' },
            { id: 18, title: 'Harta', icon: '🎁', isChest: true },
            { id: 19, title: 'Cuaca', icon: '🌤️' },
            { id: 20, title: 'Laut', icon: '🌊' },
        ]
    },
    {
        id: 5,
        title: 'Unit 5',
        description: 'Percakapan & Budaya',
        color: 'bg-[#E67E22]',
        topics: [
            { id: 21, title: 'Perkenalan', icon: '🤝' },
            { id: 22, title: 'Arah', icon: '🧭' },
            { id: 23, title: 'Harta', icon: '🎁', isChest: true },
            { id: 24, title: 'Perasaan', icon: '😊' },
            { id: 25, title: 'Adat', icon: '🎭' },
        ]
    },
    {
        id: 6,
        title: 'Unit 6',
        description: 'Kalimat & Tata Bahasa',
        color: 'bg-[#8E44AD]',
        topics: [
            { id: 26, title: 'Kata Kerja', icon: '🏃' },
            { id: 27, title: 'Kata Sifat', icon: '✨' },
            { id: 28, title: 'Harta', icon: '🎁', isChest: true },
            { id: 29, title: 'Kalimat', icon: '📝' },
            { id: 30, title: 'Cerita', icon: '📖' },
        ]
    },
];

interface LearnProps {
    onAddXp: (amount: number) => void;
    onLoseHeart: () => void;
    currentUser: UserProgress;
}

/**
 * Determine topic status based on user progress.
 * Logic: 
 * - Each completed lesson unlocks the next topic
 * - Chests unlock after the topic before them is completed
 * - First topic of first unit starts as active
 * - First topic of subsequent units unlocks when previous unit's last non-chest topic is completed
 */
function getTopicStatuses(units: Unit[], completedLessons: string[]): Map<number, 'completed' | 'active' | 'locked'> {
    const statuses = new Map<number, 'completed' | 'active' | 'locked'>();
    let foundActive = false;

    for (const unit of units) {
        for (let i = 0; i < unit.topics.length; i++) {
            const topic = unit.topics[i];

            if (topic.isChest) {
                // Chest is completed if the topic before it is completed
                const prevTopic = unit.topics[i - 1];
                if (prevTopic && completedLessons.includes(prevTopic.title.toLowerCase())) {
                    statuses.set(topic.id, 'completed');
                } else if (!foundActive && prevTopic && statuses.get(prevTopic.id) === 'active') {
                    statuses.set(topic.id, 'locked');
                } else {
                    statuses.set(topic.id, 'locked');
                }
                continue;
            }

            if (completedLessons.includes(topic.title.toLowerCase())) {
                statuses.set(topic.id, 'completed');
            } else if (!foundActive) {
                statuses.set(topic.id, 'active');
                foundActive = true;
            } else {
                statuses.set(topic.id, 'locked');
            }
        }
    }

    // If nothing is active (all completed or empty), make first locked one active
    if (!foundActive) {
        for (const unit of units) {
            for (const topic of unit.topics) {
                if (!topic.isChest && statuses.get(topic.id) === 'locked') {
                    statuses.set(topic.id, 'active');
                    return statuses;
                }
            }
        }
    }

    return statuses;
}

export const Learn: React.FC<LearnProps> = ({ onAddXp, onLoseHeart, currentUser }) => {
    const navigate = useNavigate();
    const [activeLesson, setActiveLesson] = useState<string | null>(null);
    const [activeBonusUnit, setActiveBonusUnit] = useState<string | null>(null);
    const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
        const saved = localStorage.getItem('habaget_completed_lessons');
        return saved ? JSON.parse(saved) : ['sapaan']; // First lesson pre-completed for demo
    });

    const topicStatuses = useMemo(() => getTopicStatuses(ALL_UNITS, completedLessons), [completedLessons]);

    const handleBonusComplete = (xpEarned: number) => {
        setActiveBonusUnit(null);
        if (xpEarned > 0) {
            onAddXp(xpEarned);
        }
    };

    const handleLessonComplete = (score: number) => {
        if (activeLesson && score > 0) {
            const lessonKey = activeLesson.toLowerCase();
            if (!completedLessons.includes(lessonKey)) {
                const updated = [...completedLessons, lessonKey];
                setCompletedLessons(updated);
                localStorage.setItem('habaget_completed_lessons', JSON.stringify(updated));
            }
            onAddXp(score * 10);
        }
        setActiveLesson(null);
    };

    // Calculate overall progress
    const totalTopics = ALL_UNITS.reduce((sum, u) => sum + u.topics.filter(t => !t.isChest).length, 0);
    const completedCount = completedLessons.length;
    const progressPercent = Math.min(100, Math.round((completedCount / totalTopics) * 100));

    return (
        <div className="flex-1 overflow-y-auto pb-24 bg-background">
            <div className="max-w-md mx-auto">
                
                {/* Pre-test Banner */}
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
                                Ikuti tes singkat ini untuk membuka Papan Peringkat dan mendapatkan kategori levelmu.
                            </p>
                            <Button variant="primary" fullWidth onClick={() => navigate('/pretest')}>
                                Mulai Tes Sekarang
                            </Button>
                        </div>
                    </div>
                )}

                {/* Overall Progress */}
                <div className="mx-4 mt-4 mb-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                            <Trophy className="w-5 h-5 text-primary mr-2" />
                            <span className="font-extrabold text-gray-800 text-sm">Progress Keseluruhan</span>
                        </div>
                        <span className="text-primary font-extrabold text-sm">{progressPercent}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 font-medium mt-2">{completedCount} dari {totalTopics} topik selesai</p>
                </div>

                {/* Pronunciation Practice Banner */}
                <div className="mx-4 mt-3 mb-2">
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

                {ALL_UNITS.map((unit) => {
                    // Calculate unit completion
                    const unitNonChestTopics = unit.topics.filter(t => !t.isChest);
                    const unitCompleted = unitNonChestTopics.filter(t => completedLessons.includes(t.title.toLowerCase())).length;
                    const unitTotal = unitNonChestTopics.length;

                    return (
                    <div key={unit.id} className="mb-8">
                        {/* Unit Header */}
                        <div className={`${unit.color} text-white p-5 shadow-sm sticky top-0 z-20`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-extrabold tracking-tight">{unit.title}</h2>
                                    <p className="font-bold opacity-90 text-sm">{unit.description}</p>
                                </div>
                                <div className="bg-white/20 rounded-xl py-2 px-3 text-center">
                                    <p className="text-white font-extrabold text-lg leading-tight">{unitCompleted}/{unitTotal}</p>
                                    <p className="text-white/80 text-[10px] font-bold">Selesai</p>
                                </div>
                            </div>
                            {/* Unit progress bar */}
                            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${unitTotal > 0 ? (unitCompleted / unitTotal) * 100 : 0}%` }}></div>
                            </div>
                        </div>

                        {/* Path Container */}
                        <div className="py-10 px-4 flex flex-col items-center relative">
                            {/* SVG Path Line */}
                            <div className="absolute top-0 bottom-0 w-full flex justify-center pointer-events-none overflow-hidden z-0">
                                <svg width="100" height="100%" preserveAspectRatio="none">
                                    <path 
                                        d="M 50 0 Q 100 100 50 200 T 50 400 Q 0 500 50 600 T 50 800 Q 100 900 50 1000" 
                                        stroke="#e5e7eb" 
                                        strokeWidth="18" 
                                        fill="none" 
                                        strokeLinecap="round"
                                        strokeDasharray="0 24"
                                    />
                                </svg>
                            </div>

                            {unit.topics.map((topic, index) => {
                                const offset = Math.sin(index * 1.2) * 65;
                                const status = topicStatuses.get(topic.id) || 'locked';
                                
                                let btnColor = 'bg-[#e5e5e5] border-[#cecece] text-gray-400';
                                let Icon = Lock;
                                
                                if (status === 'completed') {
                                    btnColor = 'bg-[#ffc800] border-[#e5b400] text-white';
                                    Icon = Check;
                                } else if (status === 'active') {
                                    btnColor = `${unit.color} border-black/20 text-white`;
                                    Icon = Star;
                                }

                                if (topic.isChest) {
                                    btnColor = status === 'locked' ? 'bg-[#e5e5e5] border-[#cecece]' : 'bg-[#ffc800] border-[#e5b400]';
                                }

                                return (
                                    <div 
                                        key={topic.id} 
                                        className="relative my-5 flex flex-col items-center z-10"
                                        style={{ transform: `translateX(${offset}px)` }}
                                    >
                                        {/* "Mulai" Tooltip for active lesson */}
                                        {status === 'active' && !topic.isChest && (
                                            <div className="absolute -top-14 animate-bounce bg-white border-2 border-gray-200 text-gray-800 font-extrabold py-2 px-4 rounded-xl shadow-sm z-30 whitespace-nowrap">
                                                Mulai
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-gray-200 transform rotate-45"></div>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => {
                                                if (status === 'active' && !topic.isChest) {
                                                    setActiveLesson(topic.title);
                                                } else if (topic.isChest && status === 'completed') {
                                                    setActiveBonusUnit(unit.description);
                                                }
                                            }}
                                            disabled={status === 'locked' || (topic.isChest && status !== 'completed')}
                                            className={`w-20 h-20 rounded-full border-b-8 flex items-center justify-center text-3xl transition-transform active:scale-95 ${btnColor} ${status === 'active' && !topic.isChest ? 'ring-4 ring-white/50 shadow-lg' : ''} ${topic.isChest && status === 'completed' ? 'ring-4 ring-[#ffc800]/50 shadow-lg animate-pulse' : ''}`}
                                        >
                                            {topic.icon}
                                        </button>
                                        
                                        {!topic.isChest && (
                                            <div className="absolute -bottom-7 font-extrabold text-gray-500 text-sm bg-white/90 px-3 py-1 rounded-lg shadow-sm border border-gray-100 whitespace-nowrap">
                                                {topic.title}
                                            </div>
                                        )}
                                        
                                        {/* Status Icon Badge */}
                                        {!topic.isChest && (
                                            <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white ${status === 'completed' ? 'bg-[#ffc800]' : status === 'active' ? 'bg-white text-secondary' : 'bg-[#e5e5e5]'}`}>
                                                <Icon className={`w-4 h-4 ${status === 'active' ? 'text-secondary' : 'text-white'}`} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    );
                })}
            </div>

            {activeLesson && (
                <LessonModal 
                    topic={activeLesson} 
                    onClose={() => setActiveLesson(null)} 
                    onComplete={handleLessonComplete}
                    onWrongAnswer={onLoseHeart}
                />
            )}

            {activeBonusUnit && (
                <BonusQuizModal
                    unitTitle={activeBonusUnit}
                    onClose={() => setActiveBonusUnit(null)}
                    onComplete={handleBonusComplete}
                />
            )}
        </div>
    );
};
