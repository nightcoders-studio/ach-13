import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { User as FirebaseUser } from 'firebase/auth';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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
import { SavedWords } from './pages/SavedWords';
import { ForgotPassword } from './pages/ForgotPassword';
import { Subscribe } from './pages/Subscribe';
import { firebaseAuth, isFirebaseConfigured } from './services/firebase';
import { fetchCurrentUserProfile, saveCurrentUserProgress } from './services/api';
import { AuthCredentials, UserProgress } from './types';

const createDefaultProgress = (name = 'Ahmad', overrides: Partial<UserProgress> = {}): UserProgress => ({
    name,
    xp: 340,
    streak: 3,
    hearts: 5,
    level: 1,
    savedWords: [],
    masteredWords: 47,
    subscribed: false,
    pretestCompleted: true,
    leaderboardCategory: 'Aneuk Miet',
    notifications: [],
    ...overrides,
});

const normalizeProgress = (progress: Partial<UserProgress> | null | undefined, fallbackName = 'Ahmad'): UserProgress => ({
    ...createDefaultProgress(fallbackName),
    ...progress,
    name: progress?.name || fallbackName,
    savedWords: Array.isArray(progress?.savedWords) ? progress.savedWords : [],
    notifications: Array.isArray(progress?.notifications) ? progress.notifications : [],
});

const loadLocalProgress = (): UserProgress => {
    const saved = localStorage.getItem('habaget_progress');
    if (!saved) return createDefaultProgress();

    try {
        return normalizeProgress(JSON.parse(saved));
    } catch {
        return createDefaultProgress();
    }
};

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
    handleLoseHeart: () => void;
}> = ({ progress, setProgress, handleLogout, handleUpdateProfile, handleMarkNotificationsRead, handleSubscribe, handlePretestComplete, handleSaveWord, handleAddXp, handleLoseHeart }) => {
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
                    <Route path="/belajar" element={<Learn onAddXp={handleAddXp} onLoseHeart={handleLoseHeart} currentUser={progress} />} />
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
                    <Route path="/admin" element={progress.role === 'admin' ? <Admin /> : <Navigate to="/profil" replace />} />
                    <Route path="/cerita" element={<Stories />} />
                    <Route path="/scan" element={<Scan />} />
                    <Route path="/pengucapan" element={<Pronunciation onAddXp={handleAddXp} />} />
                    <Route path="/kontribusi" element={<Community />} />
                    <Route path="/kata-tersimpan" element={<SavedWords savedWords={progress.savedWords} onRemoveWord={handleSaveWord} />} />
                    <Route path="/langganan" element={<Subscribe isSubscribed={progress.subscribed} onSubscribe={() => handleSubscribe('Premium')} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            <BottomNav />
        </div>
    );
};

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        if (isFirebaseConfigured) return false;
        return localStorage.getItem('habaget_auth') === 'true';
    });
    const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
    const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
    const [progress, setProgress] = useState<UserProgress>(loadLocalProgress);
    const hasLoadedRemoteProfile = useRef(false);

    useEffect(() => {
        if (!isFirebaseConfigured || !firebaseAuth) return;

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            setAuthReady(false);
            hasLoadedRemoteProfile.current = false;
            setAuthUser(user);
            setIsAuthenticated(Boolean(user));

            if (!user) {
                setProgress(loadLocalProgress());
                setAuthReady(true);
                return;
            }

            try {
                const remoteProgress = await fetchCurrentUserProfile(user);
                setProgress(normalizeProgress(remoteProgress, user.displayName || user.email?.split('@')[0] || 'Pengguna'));
                hasLoadedRemoteProfile.current = true;
            } catch (error) {
                console.error('Failed to load remote profile:', error);
                setProgress(prev => normalizeProgress({
                    ...prev,
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || prev.name || user.email?.split('@')[0] || 'Pengguna',
                }));
                hasLoadedRemoteProfile.current = true;
            } finally {
                setAuthReady(true);
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        localStorage.setItem('habaget_progress', JSON.stringify(progress));

        if (!isFirebaseConfigured || !authUser || !hasLoadedRemoteProfile.current) return;

        const timeoutId = window.setTimeout(() => {
            saveCurrentUserProgress(authUser, progress).catch(error => {
                console.error('Failed to save progress:', error);
            });
        }, 500);

        return () => window.clearTimeout(timeoutId);
    }, [authUser, progress]);

    useEffect(() => {
        if (isFirebaseConfigured) return;
        localStorage.setItem('habaget_auth', String(isAuthenticated));
    }, [isAuthenticated]);

    const handleAddXp = (amount: number) => {
        setProgress(prev => {
            const newXp = prev.xp + amount;
            const newLevel = Math.floor(newXp / 100) + 1;
            
            // Real streak tracking based on date
            const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
            const lastActive = prev.lastActiveDate;
            let newStreak = prev.streak;

            if (!lastActive || lastActive !== today) {
                if (lastActive) {
                    const lastDate = new Date(lastActive);
                    const todayDate = new Date(today);
                    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 1) {
                        // Consecutive day — increment streak
                        newStreak = prev.streak + 1;
                    } else if (diffDays > 1) {
                        // Missed a day — reset streak
                        newStreak = 1;
                    }
                } else {
                    // First activity ever
                    newStreak = 1;
                }
            }

            return { ...prev, xp: newXp, level: newLevel, streak: newStreak, lastActiveDate: today };
        });
    };

    const handleLoseHeart = () => {
        setProgress(prev => ({
            ...prev,
            hearts: Math.max(0, prev.hearts - 1),
        }));
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

    const handleAuthSuccess = async (credentials: AuthCredentials) => {
        if (isFirebaseConfigured && firebaseAuth) {
            if (credentials.type === 'login') {
                await signInWithEmailAndPassword(firebaseAuth, credentials.email, credentials.password);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, credentials.email, credentials.password);
            await updateProfile(userCredential.user, { displayName: credentials.name });
            const remoteProgress = await fetchCurrentUserProfile(userCredential.user);
            setProgress(normalizeProgress({ ...remoteProgress, name: credentials.name }, credentials.name));
            return;
        }

        setProgress(prev => ({ ...prev, name: credentials.type === 'login' ? credentials.email.split('@')[0] || 'Pengguna' : credentials.name }));
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        if (isFirebaseConfigured && firebaseAuth) {
            void signOut(firebaseAuth);
            return;
        }
        setIsAuthenticated(false);
    };

    const handleGoogleSignIn = async () => {
        if (!isFirebaseConfigured || !firebaseAuth) return;
        const provider = new GoogleAuthProvider();
        await signInWithPopup(firebaseAuth, provider);
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
        let category: 'Aneuk Miet' | 'Ureung Muda' | 'Ureung Chiek' | 'Petuah' = 'Aneuk Miet';
        if (score >= 90) category = 'Petuah';
        else if (score >= 70) category = 'Ureung Chiek';
        else if (score >= 40) category = 'Ureung Muda';

        setProgress(prev => ({
            ...prev,
            pretestCompleted: true,
            leaderboardCategory: category,
            xp: prev.xp + 50
        }));
    };

    return (
        <Router>
            {!authReady ? (
                <div className="flex flex-col h-full max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden items-center justify-center">
                    <p className="text-gray-500 font-extrabold">Memuat...</p>
                </div>
            ) : isAuthenticated ? (
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
                    handleLoseHeart={handleLoseHeart}
                />
            ) : (
                <div className="flex flex-col h-full max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden">
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Auth type="login" onSuccess={handleAuthSuccess} onGoogleSignIn={handleGoogleSignIn} />} />
                        <Route path="/register" element={<Auth type="register" onSuccess={handleAuthSuccess} onGoogleSignIn={handleGoogleSignIn} />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            )}
        </Router>
    );
};

export default App;
