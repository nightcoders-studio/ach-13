import React from 'react';
import { Flame, Heart, Zap, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProgress } from '../types';

interface TopBarProps {
    progress: UserProgress;
}

export const TopBar: React.FC<TopBarProps> = ({ progress }) => {
    const navigate = useNavigate();
    const unreadCount = progress.notifications?.filter(n => !n.read).length || 0;

    return (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <div className="font-extrabold text-2xl text-secondary tracking-tight cursor-pointer" onClick={() => navigate('/')}>
                HabaGet
            </div>
            <div className="flex items-center space-x-4 font-bold text-sm">
                <div className="flex items-center text-orange-500">
                    <Flame className="w-5 h-5 mr-1 fill-current" />
                    <span>{progress.streak}</span>
                </div>
                <div className="flex items-center text-primary">
                    <Zap className="w-5 h-5 mr-1 fill-current" />
                    <span>{progress.xp}</span>
                </div>
                <div className="flex items-center text-danger">
                    <Heart className="w-5 h-5 mr-1 fill-current" />
                    <span>{progress.hearts}</span>
                </div>
                <div className="relative cursor-pointer" onClick={() => navigate('/profil')}>
                    <Bell className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full border-2 border-white"></div>
                    )}
                </div>
            </div>
        </div>
    );
};
