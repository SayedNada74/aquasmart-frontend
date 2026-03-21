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
    };
    settings?: {
        notifications?: {
            system: boolean;
            daily: boolean;
            marketing: boolean;
        };
        farm?: {
            fishTypes: string[];
        };
        security?: {
            twoFactorEnabled: boolean;
        };
        performance?: {
            lowPowerMode: boolean;
        };
    };
}

export interface AuthContextType {
    user: any | null; // Firebase User object
    profile: UserProfile | null;
    loading: boolean;
    isVerified: boolean;
    refreshUser: () => Promise<void>;
}
