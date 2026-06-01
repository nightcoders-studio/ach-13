import type { User } from 'firebase/auth';
import { UserProgress, DictionaryResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function getAuthHeaders(user: User) {
    const token = await user.getIdToken();
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

export async function fetchCurrentUserProfile(user: User): Promise<UserProgress> {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: await getAuthHeaders(user),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    const data = await response.json();
    return {
        ...(data.progress as UserProgress),
        uid: data.user?.uid,
        email: data.user?.email,
        role: data.user?.role,
    };
}

export async function saveCurrentUserProgress(user: User, progress: UserProgress): Promise<UserProgress> {
    const response = await fetch(`${API_BASE_URL}/api/users/me/progress`, {
        method: 'PATCH',
        headers: await getAuthHeaders(user),
        body: JSON.stringify({ progress }),
    });

    if (!response.ok) {
        throw new Error(`Failed to save user progress: ${response.status}`);
    }

    const data = await response.json();
    return {
        ...(data.progress as UserProgress),
        uid: data.user?.uid,
        email: data.user?.email,
        role: data.user?.role,
    };
}

// --- Leaderboard API ---
export interface LeaderboardEntry {
    uid: string;
    name: string;
    xp: number;
    level: number;
    streak: number;
    category: string | null;
    rank: number;
}

export interface LeaderboardResponse {
    leaderboard: LeaderboardEntry[];
    currentUser: LeaderboardEntry;
}

export async function fetchLeaderboard(user: User, type: 'weekly' | 'alltime'): Promise<LeaderboardResponse> {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard/${type}`, {
        headers: await getAuthHeaders(user),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.status}`);
    }

    return response.json();
}

// --- Community Contributions API ---
export interface Contribution {
    id: string;
    uid: string;
    authorName: string;
    word: string;
    translation: string;
    example: string | null;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: unknown;
}

export async function submitContribution(user: User, data: { word: string; translation: string; example?: string }): Promise<Contribution> {
    const response = await fetch(`${API_BASE_URL}/api/contributions`, {
        method: 'POST',
        headers: await getAuthHeaders(user),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to submit contribution: ${response.status}`);
    }

    const result = await response.json();
    return result.contribution;
}

export async function fetchMyContributions(user: User): Promise<Contribution[]> {
    const response = await fetch(`${API_BASE_URL}/api/contributions/mine`, {
        headers: await getAuthHeaders(user),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch contributions: ${response.status}`);
    }

    const result = await response.json();
    return result.contributions;
}

// --- Dictionary Cache API ---
export async function fetchCachedTranslation(user: User, word: string): Promise<DictionaryResult | null> {
    const response = await fetch(`${API_BASE_URL}/api/dictionary/cache?word=${encodeURIComponent(word)}`, {
        headers: await getAuthHeaders(user),
    });

    if (response.status === 404) return null;
    if (!response.ok) return null;

    const data = await response.json();
    return data.cached ? data.result : null;
}

export async function saveCachedTranslation(user: User, word: string, result: DictionaryResult): Promise<void> {
    await fetch(`${API_BASE_URL}/api/dictionary/cache`, {
        method: 'POST',
        headers: await getAuthHeaders(user),
        body: JSON.stringify({ word, result }),
    }).catch(() => { /* silently fail cache write */ });
}
