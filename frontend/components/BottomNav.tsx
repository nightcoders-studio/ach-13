import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Dumbbell, BarChart2, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/kamus', icon: BookOpen, label: 'Kamus' },
        { path: '/belajar', icon: Dumbbell, label: 'Latihan' },
        { path: '/papan', icon: BarChart2, label: 'Peringkat' },
        { path: '/profil', icon: User, label: 'Profil' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FBF7F0] border-t border-gray-200 pb-safe z-50">
            <div className="flex justify-around items-center h-20 max-w-md mx-auto px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    if (isActive) {
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                className="flex flex-col items-center justify-center bg-primary text-white px-5 py-2 rounded-full shadow-md transition-all"
                            >
                                <Icon className="w-6 h-6 mb-1" strokeWidth={2.5} />
                                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
                            </Link>
                        );
                    }

                    return (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className="flex flex-col items-center justify-center text-gray-400 hover:text-primary transition-all px-2"
                        >
                            <Icon className="w-6 h-6 mb-1" strokeWidth={2} />
                            <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
