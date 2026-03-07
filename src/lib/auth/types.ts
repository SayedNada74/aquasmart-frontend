export interface UserProfile {
    uid: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    provider: "password" | "google";
    createdAt: string;
    role: string;
    emailVerified: boolean;
    profileCompleted: boolean;
    farm: {
        name: string;
        location: string;
        pondCount: number;
    }
}

export interface AuthContextType {
    user: any | null; // Firebase User object
    profile: UserProfile | null;
    loading: boolean;
    isVerified: boolean;
    refreshUser: () => Promise<void>;
}
