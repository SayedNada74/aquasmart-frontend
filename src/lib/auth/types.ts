export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    phone?: string;
    farmName?: string;
    location?: string;
    pondCount?: string;
    provider: "password" | "google";
    createdAt: string;
    role: string;
}

export interface AuthContextType {
    user: any | null; // Firebase User object
    profile: UserProfile | null;
    loading: boolean;
    isVerified: boolean;
    refreshUser: () => Promise<void>;
}
