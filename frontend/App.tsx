import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Learn } from './pages/Learn';
import { Dictionary } from './pages/Dictionary';
import { Profile } from './pages/Profile';
import { PaketLes } from './pages/PaketLes';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Leaderboard } from './pages/Leaderboard';
import { Admin } from './pages/Admin';
import { Pretest } from './pages/Pretest';
import { Stories } from './pages/Stories';
import { Scan } from './pages/Scan';
import { Pronunciation } from './pages/Pronunciation';
import { Community } from './pages/Community';
import { UserProgress } from './types';

const AppContent: React.FC<{
    progress: UserProgress;
    setProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
    handleLogout: () => void;
    handleUpdateProfile: (name: string) => void;
    handleMarkNotificationsRead: () => void;
    handleSubscribe: (paketName: string) => void;
    handlePretestComplete: (score: number) => void;
    handleSaveWord: (word: string) => void;
    handleAddXp: (amount: number) => void;
}> = ({ progress, setProgress, handleLogout, handleUpdateProfile, handleMarkNotificationsRead, handleSubscribe, handlePretestComplete, handleSaveWord, handleAddXp }) => {
    const location = useLocation();
    // Hide TopBar on Dashboard, Leaderboard (Papan), and Profil
    const showTopBar = !['/', '/papan', '/profil'].includes(location.pathname);

    return (
        <div className="flex flex-col h-full max-w-md mx-auto bg-background shadow-2xl relative">
            {showTopBar && <TopBar progress={progress} />}
            
            <main className="flex-1 overflow-hidden flex flex-col relative">
                <Routes>
                    <Route path="/" element={<Dashboard progress={progress} />} />
                    <Route path="/kamus" element={<Dictionary savedWords={progress.savedWords} onSaveWord={handleSaveWord} />} />
                    <Route path="/belajar" element={<Learn onAddXp={handleAddXp} currentUser={progress} />} />
                    <Route path="/papan" element={<Leaderboard currentUser={progress} />} />
                    <Route path="/pretest" element={<Pretest onComplete={handlePretestComplete} />} />
                    <Route path="/profil" element={
                        <Profile 
                            progress={progress} 
                            onLogout={handleLogout} 
                            onUpdateProfile={handleUpdateProfile}
                            onMarkNotificationsRead={handleMarkNotificationsRead}
                        />
                    } />
                    <Route path="/les" element={<PaketLes onSubscribe={handleSubscribe} />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/cerita" element={<Stories />} />
                    <Route path="/scan" element={<Scan />} />
                    <Route path="/pengucapan" element={<Pronunciation onAddXp={handleAddXp} />} />
                    <Route path="/kontribusi" element={<Community />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            <BottomNav />
        </div>
    );
};

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('habaget_auth') === 'true';
    });

    const [progress, setProgress] = useState<UserProgress>(() => {
        const saved = localStorage.getItem('habaget_progress');
        return saved ? JSON.parse(saved) : { 
            name: 'Ahmad',
            xp: 340, 
            streak: 3, 
            hearts: 5,
            level: 1,
            savedWords: [],
            masteredWords: 47,
            subscribed: false,
            pretestCompleted: true,
            leaderboardCategory: 'Aneuk Miet',
            notifications: []
        };
    });

    useEffect(() => {
        localStorage.setItem('habaget_progress', JSON.stringify(progress));
    }, [progress]);

    useEffect(() => {
        localStorage.setItem('habaget_auth', String(isAuthenticated));
    }, [isAuthenticated]);

    const handleAddXp = (amount: number) => {
        setProgress(prev => {
            const newXp = prev.xp + amount;
            const newLevel = Math.floor(newXp / 100) + 1;
            return { ...prev, xp: newXp, level: newLevel };
        });
    };

    const handleSaveWord = (word: string) => {
        setProgress(prev => {
            const words = prev.savedWords || [];
            if (words.includes(word)) {
                return { ...prev, savedWords: words.filter(w => w !== word) };
            } else {
                return { ...prev, savedWords: [...words, word] };
            }
        });
    };

    const handleLoginSuccess = (name: string) => {
        setProgress(prev => ({ ...prev, name }));
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    const handleUpdateProfile = (newName: string) => {
        setProgress(prev => ({ ...prev, name: newName }));
    };

    const handleSubscribe = (paketName: string) => {
        setProgress(prev => {
            if (prev.subscribed) return prev;
            const newNotification = {
                id: Date.now().toString(),
                message: `Selamat! Anda telah berhasil mendaftar ${paketName}. Admin akan segera menghubungi Anda.`,
                read: false,
                date: new Date().toISOString()
            };
            return { 
                ...prev, 
                subscribed: true,
                notifications: [newNotification, ...prev.notifications]
            };
        });
    };

    const handleMarkNotificationsRead = () => {
        setProgress(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => ({ ...n, read: true }))
        }));
    };

    const handlePretestComplete = (score: number) => {
        let category: 'Aneuk Mit' | 'Aneuk Muda' | 'Ureung Chiek' = 'Aneuk Mit';
        if (score >= 80) category = 'Ureung Chiek';
        else if (score >= 40) category = 'Aneuk Muda';

        setProgress(prev => ({
            ...prev,
            pretestCompleted: true,
            leaderboardCategory: category,
            xp: prev.xp + 50
        }));
    };

    return (
        <Router>
            {isAuthenticated ? (
                <AppContent 
                    progress={progress}
                    setProgress={setProgress}
                    handleLogout={handleLogout}
                    handleUpdateProfile={handleUpdateProfile}
                    handleMarkNotificationsRead={handleMarkNotificationsRead}
                    handleSubscribe={handleSubscribe}
                    handlePretestComplete={handlePretestComplete}
                    handleSaveWord={handleSaveWord}
                    handleAddXp={handleAddXp}
                />
            ) : (
                <div className="flex flex-col h-full max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden">
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Auth type="login" onSuccess={handleLoginSuccess} />} />
                        <Route path="/register" element={<Auth type="register" onSuccess={handleLoginSuccess} />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            )}
        </Router>
    );
};

export default App;
