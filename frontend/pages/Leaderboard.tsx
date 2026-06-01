import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Flame, Lock, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { UserProgress } from '../types';
import { firebaseAuth } from '../services/firebase';
import { fetchLeaderboard, LeaderboardEntry } from '../services/api';

interface LeaderboardProps {
    currentUser: UserProgress;
}

const AVATARS = ['🦁', '🐯', '🦊', '🐺', '🐧', '🐻', '🐼', '🐨', '🐸', '🦉', '🐙', '🦋', '🐬', '🦄', '🐝'];

function getAvatar(index: number): string {
    return AVATARS[index % AVATARS.length];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'minggu' | 'semua'>('minggu');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const loadLeaderboard = async () => {
        if (!firebaseAuth?.currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const type = activeTab === 'minggu' ? 'weekly' : 'alltime';
            const data = await fetchLeaderboard(firebaseAuth.currentUser, type);
            setLeaderboard(data.leaderboard);
            setUserRank(data.currentUser);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            // Fallback to showing current user only
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser.pretestCompleted) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-12 h-12 text-gray-400" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-800 mb-4">Papan Peringkat Terkunci</h1>
                <p className="text-gray-600 mb-8 font-medium">
                    Selesaikan Tes Penempatan di halaman Belajar untuk membuka fitur ini dan melihat peringkatmu.
                </p>
                <Button size="lg" onClick={() => navigate('/belajar')} fullWidth>
                    Ke Halaman Belajar
                </Button>
            </div>
        );
    }

    // Build display list: merge real data with current user
    const displayUsers = leaderboard.length > 0 ? leaderboard.map((user, idx) => ({
        ...user,
        avatar: getAvatar(idx),
        isCurrentUser: user.uid === currentUser.uid,
    })) : [
        { uid: currentUser.uid || 'me', name: currentUser.name, xp: currentUser.xp, level: currentUser.level, streak: currentUser.streak, category: currentUser.leaderboardCategory, rank: 1, avatar: '🐧', isCurrentUser: true },
    ];

    const top3 = displayUsers.length >= 3
        ? [displayUsers[1], displayUsers[0], displayUsers[2]]
        : displayUsers.slice(0, 3);

    const getRankStyle = (rank: number, isCurrentUser: boolean = false) => {
        if (rank === 1) return { text: 'text-yellow-600', border: 'border-[#F4C754]', bg: 'bg-[#FFF9E5]' };
        if (rank === 2) return { text: 'text-gray-500', border: 'border-[#CBD5E1]', bg: 'bg-[#F0F3F5]' };
        if (rank === 3) return { text: 'text-orange-600', border: 'border-[#FDBA74]', bg: 'bg-[#FFF0E5]' };
        if (isCurrentUser) return { text: 'text-white', border: 'border-primary', bg: 'bg-primary' };
        return { text: 'text-primary', border: 'border-transparent', bg: 'bg-primaryLight' };
    };

    const currentUserRank = userRank?.rank || displayUsers.find(u => u.isCurrentUser)?.rank || displayUsers.length;

    return (
        <div className="flex-1 overflow-y-auto pb-24 bg-background">
            
            {/* Gradient Header & Podium */}
            <div className="bg-gradient-to-b from-[#534AB7] via-[#7A73C9] to-background pt-12 px-4 pb-2">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div className="text-white">
                        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Papan Peringkat</h1>
                        <p className="text-sm font-medium opacity-90">
                            {activeTab === 'minggu' ? 'Minggu ini • reset tiap Senin 00:00' : 'Sepanjang waktu'}
                        </p>
                    </div>
                    <div className="bg-white/20 border border-white/30 rounded-xl px-3 py-1.5 flex items-center text-white text-xs font-bold backdrop-blur-sm">
                        <Trophy className="w-3.5 h-3.5 mr-1.5" /> {displayUsers.length} pemain
                    </div>
                </div>

                {/* Podium */}
                {!loading && top3.length >= 3 && (
                    <div className="flex justify-center items-end h-52 gap-2 px-2">
                        {/* 2nd Place */}
                        <div className="flex-1 flex flex-col items-center relative">
                            <div className="w-14 h-14 bg-white rounded-full border-4 border-[#CBD5E1] flex items-center justify-center text-2xl mb-2 z-10 shadow-sm">
                                {top3[0].avatar}
                            </div>
                            <p className="text-white font-bold text-sm mb-3 truncate w-full text-center px-1">{top3[0].name.split(' ')[0]}</p>
                            <div className="w-full h-24 bg-[#F0F3F5] border-2 border-b-0 border-[#CBD5E1] rounded-t-2xl relative flex justify-center shadow-inner">
                                <div className="absolute -top-3 bg-white border-2 border-[#CBD5E1] text-gray-500 text-[10px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                                    {top3[0].xp} XP
                                </div>
                                <span className="mt-6 text-4xl font-black text-[#CBD5E1]/60">2</span>
                            </div>
                        </div>
                        
                        {/* 1st Place */}
                        <div className="flex-1 flex flex-col items-center relative z-10">
                            <div className="w-16 h-16 bg-white rounded-full border-4 border-[#F4C754] flex items-center justify-center text-3xl mb-2 relative shadow-md">
                                {top3[1].avatar}
                            </div>
                            <p className="text-white font-bold text-sm mb-3 truncate w-full text-center px-1">{top3[1].name.split(' ')[0]}</p>
                            <div className="w-full h-36 bg-[#FFF9E5] border-2 border-b-0 border-[#F4C754] rounded-t-2xl relative flex justify-center shadow-inner">
                                <div className="absolute -top-3 bg-white border-2 border-[#F4C754] text-yellow-600 text-[10px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                                    {top3[1].xp.toLocaleString('id-ID')} XP
                                </div>
                                <span className="mt-8 text-3xl">👑</span>
                            </div>
                        </div>
                        
                        {/* 3rd Place */}
                        <div className="flex-1 flex flex-col items-center relative">
                            <div className="w-14 h-14 bg-white rounded-full border-4 border-[#FDBA74] flex items-center justify-center text-2xl mb-2 z-10 shadow-sm">
                                {top3[2].avatar}
                            </div>
                            <p className="text-white font-bold text-sm mb-3 truncate w-full text-center px-1">{top3[2].name.split(' ')[0]}</p>
                            <div className="w-full h-20 bg-[#FFF0E5] border-2 border-b-0 border-[#FDBA74] rounded-t-2xl relative flex justify-center shadow-inner">
                                <div className="absolute -top-3 bg-white border-2 border-[#FDBA74] text-orange-500 text-[10px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                                    {top3[2].xp} XP
                                </div>
                                <span className="mt-4 text-4xl font-black text-[#FDBA74]/60">3</span>
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center items-center h-52">
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="px-4 mt-2 relative z-20">
                <div className="bg-white rounded-2xl p-1.5 flex shadow-sm border border-gray-100">
                    <button 
                        onClick={() => setActiveTab('minggu')}
                        className={`flex-1 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center transition-colors ${activeTab === 'minggu' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Calendar className="w-4 h-4 mr-2" /> Minggu Ini
                    </button>
                    <button 
                        onClick={() => setActiveTab('semua')}
                        className={`flex-1 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center transition-colors ${activeTab === 'semua' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Trophy className="w-4 h-4 mr-2" /> Semua Waktu
                    </button>
                </div>
            </div>

            {/* Current User Highlight */}
            <div className="px-4 mt-4">
                <div className="bg-primaryLight border-2 border-primary rounded-2xl p-4 flex items-center shadow-sm">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-2xl mr-3 border-2 border-white shadow-sm shrink-0">
                        🐧
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-primaryDark text-base truncate">#{currentUserRank} dari {displayUsers.length}</h3>
                        <p className="text-primary text-xs font-bold flex items-center mt-0.5">
                            {currentUser.xp} XP • {currentUser.streak} hari streak <Flame className="w-3.5 h-3.5 ml-1 text-orange-500 fill-current" />
                        </p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="px-4 mt-6">
                <div className="flex justify-between text-[10px] font-extrabold text-gray-400 mb-3 px-4 tracking-widest">
                    <span>PEMAIN</span>
                    <span>XP</span>
                </div>
                
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    {displayUsers.map((user, index) => {
                        const style = getRankStyle(user.rank, user.isCurrentUser);
                        const isTop3 = user.rank <= 3;
                        
                        return (
                            <div key={user.uid} className={`flex items-center p-4 ${user.isCurrentUser ? 'bg-primaryLight/50' : ''} ${index !== displayUsers.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                <div className={`w-8 font-extrabold text-lg flex justify-center ${isTop3 ? style.text : 'text-primaryDark'}`}>
                                    {user.rank}
                                </div>
                                
                                <div className="w-12 h-12 bg-gray-100 rounded-full mx-3 flex items-center justify-center text-2xl shrink-0 shadow-sm border border-gray-200">
                                    {user.avatar}
                                </div>
                                
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className={`font-extrabold text-base truncate ${user.isCurrentUser ? 'text-primaryDark' : 'text-gray-800'}`}>
                                        {user.isCurrentUser ? 'Kamu' : user.name} {user.isCurrentUser && '👉'}
                                    </p>
                                    <p className="text-xs font-bold text-gray-400 flex items-center mt-0.5 truncate">
                                        {user.category || 'Aneuk Miet'} • <Flame className="w-3 h-3 mx-0.5 text-orange-400 fill-current" /> {user.streak}h
                                    </p>
                                </div>
                                
                                <div className={`px-3 py-1.5 rounded-full text-xs font-extrabold border-2 ${style.bg} ${style.border} ${style.text} shrink-0`}>
                                    {user.xp.toLocaleString('id-ID')} XP
                                </div>
                            </div>
                        );
                    })}

                    {displayUsers.length === 0 && !loading && (
                        <div className="p-8 text-center text-gray-500 font-medium">
                            Belum ada data peringkat. Mulai belajar untuk muncul di sini!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
