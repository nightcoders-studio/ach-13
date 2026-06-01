export type UserRole = 'user' | 'admin';

export interface AuthCredentials {
    type: 'login' | 'register';
    name: string;
    email: string;
    password: string;
}

export interface UserProgress {
    uid?: string;
    email?: string | null;
    role?: UserRole;
    name: string;
    xp: number;
    streak: number;
    hearts: number;
    level: number;
    savedWords: string[];
    masteredWords: number;
    subscribed: boolean;
    pretestCompleted: boolean;
    leaderboardCategory: 'Aneuk Miet' | 'Ureung Muda' | 'Ureung Chiek' | 'Petuah' | null;
    notifications: { id: string; message: string; read: boolean; date: string }[];
    lastActiveDate?: string; // ISO date string 'YYYY-MM-DD' for streak tracking
}

export interface Question {
    question: string;
    options: string[];
    answer: string;
    type: 'translate' | 'multiple-choice';
}

export interface DictionaryResult {
    word: string;
    translation: string;
    nuances: string;
    examples: { aceh: string; indo: string }[];
}

export interface Story {
    title: string;
    sentences: { aceh: string; indo: string }[];
}
