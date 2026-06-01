import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RotateCcw, Check, ChevronRight, BookOpen, RefreshCw } from 'lucide-react';
import { UserProgress } from '../types';

interface DashboardProps {
    progress: UserProgress;
}

const motivationalWords = [
    {
        aceh: "Beuthat beu meuhase",
        indo: "Berusaha keras agar berhasil",
        example: "Beuthat beu meuhase, bek putoh asa.",
        exampleIndo: "Berusahalah dengan keras agar berhasil, jangan putus asa."
    },
    {
        aceh: "Bek putoh asa",
        indo: "Jangan putus asa",
        example: "Walau kureung, bek putoh asa.",
        exampleIndo: "Walaupun kurang, jangan putus asa."
    },
    {
        aceh: "Sabe teuga",
        indo: "Selalu kuat / semangat",
        example: "Uroenyoe tanyoe harus sabe teuga.",
        exampleIndo: "Hari ini kita harus selalu semangat."
    },
    {
        aceh: "Jak beu trok",
        indo: "Lakukan sampai tuntas",
        example: "Jak beu trok, kalon beu deuh.",
        exampleIndo: "Pergi sampai tujuan, lihat sampai jelas (Lakukan sesuatu dengan tuntas)."
    },
    {
        aceh: "Meutuah",
        indo: "Bertuah / Beruntung",
        example: "Aneuk meutuah, beu jroh akai.",
        exampleIndo: "Anak yang bertuah, baiklah budi pekertinya."
    }
];

export const Dashboard: React.FC<DashboardProps> = ({ progress }) => {
    const navigate = useNavigate();
    const [wordRevealed, setWordRevealed] = useState(false);
    const [wordOfTheDay, setWordOfTheDay] = useState(motivationalWords[0]);

    const generateNewWord = () => {
        let randomIndex = Math.floor(Math.random() * motivationalWords.length);
        // Ensure we get a different word if possible
        while (motivationalWords[randomIndex].aceh === wordOfTheDay.aceh && motivationalWords.length > 1) {
            randomIndex = Math.floor(Math.random() * motivationalWords.length);
        }
        setWordOfTheDay(motivationalWords[randomIndex]);
        setWordRevealed(false);
    };

    useEffect(() => {
        // Generate a random motivational word on component mount
        generateNewWord();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const days = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
    const currentDayIndex = 2; // Mocking Wednesday as current day for the streak UI

    return (
        <div className="flex-1 overflow-y-auto pb-24 bg-background">
            
            {/* Header */}
            <div className="bg-primary text-white px-6 pt-8 pb-12 rounded-b-[2.5rem] shadow-sm">
                <p className="text-sm font-semibold opacity-90 mb-1">Assalamualaikum 👋</p>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold tracking-tight">{progress.name}</h1>
                    <div className="w-12 h-12 bg-white rounded-full p-1 shadow-md flex items-center justify-center overflow-hidden">
                        {/* Mock Avatar */}
                        <span className="text-2xl">🐧</span>
                    </div>
                </div>
            </div>

            {/* Level Progress Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm mx-5 -mt-8 relative z-10 border border-gray-100">
                <div className="flex justify-between items-end mb-3">
                    <div>
                        <h2 className="text-primary font-extrabold text-base">Level Progres</h2>
                        <p className="text-gray-600 text-sm font-semibold">{progress.leaderboardCategory || 'Aneuk Miet'}</p>
                    </div>
                    <p className="text-primary font-extrabold text-sm">{progress.xp}/500 XP</p>
                </div>
                <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(progress.xp / 500) * 100}%` }}></div>
                </div>
            </div>

            {/* Streak Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm mx-5 mt-5 border border-gray-100">
                <h3 className="text-gray-500 font-extrabold text-xs tracking-widest mb-4 uppercase">Streak Belajar</h3>
                <div className="flex justify-between items-center">
                    {days.map((day, i) => {
                        const isCompleted = i <= currentDayIndex;
                        return (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${isCompleted ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {isCompleted ? <Check className="w-5 h-5" strokeWidth={3} /> : <span className="text-sm font-extrabold">{day}</span>}
                                </div>
                                <span className="text-[11px] font-extrabold text-gray-800">{day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats Pills */}
            <div className="flex gap-3 mx-5 mt-5">
                <div className="flex-1 bg-secondaryLight text-secondaryDark rounded-2xl py-3 px-2 flex items-center justify-center font-extrabold text-sm shadow-sm border border-secondaryLight">
                    <span className="text-lg mr-1">{progress.streak}</span> Hari Streak 🔥
                </div>
                <div className="flex-1 bg-tertiaryLight text-tertiaryDark rounded-2xl py-3 px-2 flex items-center justify-center font-extrabold text-sm shadow-sm border border-tertiaryLight">
                    <span className="text-lg mr-1">{progress.masteredWords}</span> Kata Dikuasai 📚
                </div>
            </div>

            {/* Word of the Day */}
            <div className="bg-primaryLight rounded-3xl p-6 mx-5 mt-5 shadow-sm border border-primaryLight">
                <div className="flex justify-between items-center mb-3">
                    <p className="text-primary font-extrabold text-xs tracking-widest uppercase">Motivasi Hari Ini</p>
                    <button 
                        onClick={generateNewWord}
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors"
                        title="Ganti Kata"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex-1 pr-4">
                        <h3 className="text-2xl font-extrabold text-primaryDark tracking-tight mb-1">
                            {wordRevealed ? wordOfTheDay.aceh : '*******'}
                        </h3>
                        {wordRevealed && (
                            <p className="text-sm font-bold text-primary">{wordOfTheDay.indo}</p>
                        )}
                    </div>
                    {!wordRevealed && (
                        <button 
                            onClick={() => setWordRevealed(true)} 
                            className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-primaryDark transition-colors shrink-0"
                        >
                            Tap to reveal
                        </button>
                    )}
                </div>
            </div>
            
            {wordRevealed && (
                <div className="mx-5 mt-2 bg-white/60 rounded-2xl p-4 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <p className="font-bold text-gray-800 italic">"{wordOfTheDay.example}"</p>
                    <p className="text-sm text-gray-600 mt-1">{wordOfTheDay.exampleIndo}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="mx-5 mt-5 space-y-4">
                <button 
                    onClick={() => navigate('/belajar')}
                    className="w-full bg-primaryLight rounded-3xl p-4 flex items-center text-left shadow-sm border border-primaryLight hover:bg-[#dedaf4] transition-colors"
                >
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mr-4 shadow-sm shrink-0">
                        <Play className="w-5 h-5 fill-current ml-1" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-extrabold text-primaryDark text-lg">Lanjutkan sesi harian</h4>
                        <p className="text-primary text-sm font-semibold">Selesaikan misi "Dapur"</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-primary shrink-0" />
                </button>

                <button 
                    onClick={() => navigate('/cerita')}
                    className="w-full bg-orange-100 rounded-3xl p-4 flex items-center text-left shadow-sm border border-orange-200 hover:bg-orange-200 transition-colors"
                >
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mr-4 shadow-sm shrink-0">
                        <BookOpen className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-extrabold text-orange-700 text-lg">Hikayat & Cerita</h4>
                        <p className="text-orange-600 text-sm font-semibold">Baca & dengar legenda Aceh</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-orange-500 shrink-0" />
                </button>

                <button 
                    onClick={() => navigate('/kamus')}
                    className="w-full bg-tertiaryLight rounded-3xl p-4 flex items-center text-left shadow-sm border border-tertiaryLight hover:bg-[#c4e8e4] transition-colors"
                >
                    <div className="w-12 h-12 bg-tertiary text-white rounded-full flex items-center justify-center mr-4 shadow-sm shrink-0">
                        <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-extrabold text-tertiaryDark text-lg">Ulang kata kemarin</h4>
                        <p className="text-tertiary text-sm font-semibold">Perkuat ingatanmu</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-tertiary shrink-0" />
                </button>
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-white rounded-3xl p-5 shadow-sm mx-5 mt-5 mb-8 border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-extrabold text-gray-800 text-lg">Liga Atjeh</h3>
                    <button onClick={() => navigate('/papan')} className="text-primary font-extrabold text-sm hover:underline">Lihat Semua</button>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center">
                        <span className="w-6 font-extrabold text-secondary text-lg text-center">1</span>
                        <div className="w-10 h-10 bg-orange-100 rounded-full mx-3 flex items-center justify-center text-xl">🦊</div>
                        <span className="flex-1 font-extrabold text-gray-800">Cut Meutia</span>
                        <span className="font-extrabold text-gray-600">1,240 XP</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-6 font-extrabold text-gray-400 text-lg text-center">2</span>
                        <div className="w-10 h-10 bg-yellow-100 rounded-full mx-3 flex items-center justify-center text-xl">🐯</div>
                        <span className="flex-1 font-extrabold text-gray-800">Teuku Umar</span>
                        <span className="font-extrabold text-gray-600">1,105 XP</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-6 font-extrabold text-orange-400 text-lg text-center">3</span>
                        <div className="w-10 h-10 bg-red-100 rounded-full mx-3 flex items-center justify-center text-xl">🦁</div>
                        <span className="flex-1 font-extrabold text-gray-800 leading-tight">Laksamana<br/>Malahayati</span>
                        <span className="font-extrabold text-gray-600">980 XP</span>
                    </div>
                </div>

                <div className="mt-5 bg-primary text-white rounded-2xl p-4 flex items-center shadow-md">
                    <span className="w-6 font-extrabold text-lg text-center">5</span>
                    <div className="w-10 h-10 bg-white/20 rounded-full mx-3 flex items-center justify-center text-xl">🐧</div>
                    <span className="flex-1 font-extrabold">Kamu ({progress.leaderboardCategory || 'Aneuk Miet'})</span>
                    <span className="font-extrabold">{progress.xp} XP</span>
                </div>
            </div>

        </div>
    );
};
