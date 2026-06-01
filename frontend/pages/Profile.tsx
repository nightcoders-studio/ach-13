import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Share, Check, Medal, ChevronRight, Bookmark, BarChart2 } from 'lucide-react';
import { UserProgress } from '../types';

interface ProfileProps {
    progress: UserProgress;
    onLogout: () => void;
    onUpdateProfile: (name: string) => void;
    onMarkNotificationsRead: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ progress, onLogout, onMarkNotificationsRead }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (progress.notifications?.some(n => !n.read)) {
            onMarkNotificationsRead();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const days = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
    const currentDayIndex = 2; // Mocking Wednesday

    return (
        <div className="flex-1 overflow-y-auto pb-24 bg-background">
            
            {/* Header */}
            <div className="bg-primary text-white px-6 pt-10 pb-16 rounded-b-[2rem] shadow-sm flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Profil Saya</h1>
                    <p className="text-sm font-medium opacity-90">{progress.leaderboardCategory || 'Aneuk Miet'} • Level {progress.level}</p>
                </div>
                <button 
                    onClick={() => navigate('/admin')}
                    className="p-2 border-2 border-white/30 rounded-xl hover:bg-white/10 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            <div className="px-4 -mt-10 space-y-4 relative z-10">
                
                {/* Main Profile Card */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-3xl mr-4 shadow-inner">
                            🐧
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-800">{progress.name}</h2>
                            <div className="inline-block bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1 mb-1">
                                {progress.leaderboardCategory || 'Aneuk Miet'}
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Bergabung Juni 2025</p>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-primaryLight/30 rounded-full flex items-center justify-center">
                        <Share className="w-5 h-5 text-primary" />
                    </div>
                </div>

                {/* Level Progress */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-end mb-3">
                        <h3 className="font-extrabold text-gray-800 text-sm">Level Progres</h3>
                        <p className="text-xs font-bold text-gray-500">
                            <span className="text-primary">{progress.leaderboardCategory || 'Aneuk Miet'}</span> {progress.xp} / 500 XP
                        </p>
                    </div>
                    <div className="h-3 bg-primaryLight rounded-full overflow-hidden flex mb-2">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(progress.xp / 500) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">160 XP lagi → Teungku Muda</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-tertiaryLight/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-tertiaryLight">
                        <span className="text-2xl font-black text-tertiaryDark mb-1">{progress.masteredWords}</span>
                        <span className="text-[10px] font-bold text-tertiaryDark">Kata Dikuasai 📚</span>
                    </div>
                    <div className="bg-secondaryLight/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-secondaryLight">
                        <span className="text-2xl font-black text-secondaryDark mb-1">{progress.streak}</span>
                        <span className="text-[10px] font-bold text-secondaryDark">Hari Streak 🔥</span>
                    </div>
                    <div className="bg-[#FFF9E5] rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-[#F4C754]/30">
                        <span className="text-2xl font-black text-yellow-700 mb-1">#5</span>
                        <span className="text-[10px] font-bold text-yellow-700">Peringkatmu 🏆</span>
                    </div>
                </div>

                {/* Streak Weekly */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-extrabold text-gray-800 text-sm mb-4">Streak minggu ini</h3>
                    <div className="flex justify-between items-center px-2">
                        {days.map((day, i) => {
                            const isCompleted = i <= currentDayIndex;
                            return (
                                <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${isCompleted ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {isCompleted ? <Check className="w-5 h-5" strokeWidth={3} /> : <span className="text-sm font-extrabold">{day}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Badges (Lencana) */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-extrabold text-gray-800 text-sm mb-4 flex items-center">
                        <Medal className="w-4 h-4 text-orange-500 mr-1.5" /> Lencana
                    </h3>
                    <div className="flex space-x-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
                        <div className="bg-tertiaryLight/30 border border-tertiaryLight rounded-2xl p-3 min-w-[100px] flex flex-col items-center text-center snap-start shrink-0">
                            <span className="text-xs font-extrabold text-tertiaryDark mb-1">Aneuk Miet</span>
                            <span className="text-[10px] text-tertiaryDark/70 font-medium mb-1">10 kata</span>
                            <Check className="w-3 h-3 text-tertiaryDark" />
                        </div>
                        <div className="bg-primaryLight/30 border border-primaryLight rounded-2xl p-3 min-w-[100px] flex flex-col items-center text-center snap-start shrink-0">
                            <span className="text-xs font-extrabold text-primaryDark mb-1">Pejuang</span>
                            <span className="text-[10px] text-primaryDark/70 font-medium mb-1">3hr streak</span>
                            <Check className="w-3 h-3 text-primaryDark" />
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 min-w-[100px] flex flex-col items-center text-center snap-start shrink-0 opacity-60">
                            <span className="text-xs font-extrabold text-gray-400 mb-1">Teungku</span>
                            <span className="text-[10px] text-gray-400 font-medium mb-1">100 kata</span>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 min-w-[100px] flex flex-col items-center text-center snap-start shrink-0 opacity-60">
                            <span className="text-xs font-extrabold text-gray-400 mb-1">Ulama</span>
                            <span className="text-[10px] text-gray-400 font-medium mb-1">500 kata</span>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-3">
                    <button className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                                <Bookmark className="w-5 h-5 text-gray-500 fill-current opacity-20" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-extrabold text-gray-800 text-sm">Kata yang disimpan</h4>
                                <p className="text-xs text-gray-500 font-medium">{progress.savedWords.length} kata</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-primary" />
                    </button>

                    <button className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                                <BarChart2 className="w-5 h-5 text-tertiary" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-extrabold text-gray-800 text-sm">Riwayat belajar</h4>
                                <p className="text-xs text-gray-500 font-medium">7 sesi selesai</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-tertiary" />
                    </button>
                </div>

                {/* Logout Button */}
                <div className="pt-4 pb-6">
                    <button 
                        onClick={onLogout}
                        className="w-full py-4 rounded-2xl border-2 border-danger/30 text-dangerDark font-extrabold text-sm hover:bg-danger/5 transition-colors"
                    >
                        Keluar dari akun
                    </button>
                </div>

            </div>
        </div>
    );
};
