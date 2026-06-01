export interface UserProgress {
    name: string;
    xp: number;
    streak: number;
    hearts: number;
    level: number;
    savedWords: string[];
    masteredWords: number;
    subscribed: boolean;
    pretestCompleted: boolean;
    leaderboardCategory: 'Aneuk Mit' | 'Aneuk Muda' | 'Ureung Chiek' | null;
    notifications: { id: string; message: string; read: boolean; date: string }[];
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
