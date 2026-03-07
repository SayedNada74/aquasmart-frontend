import { database } from "@/lib/firebase";
import { ref, set, get } from "firebase/database";
import { User } from "firebase/auth";
import { UserProfile } from "./types";

/**
 * Creates or retrieves a user profile in the Realtime Database.
 * Assumes default farm values for new users, which can be edited later in Settings.
 */
export async function createOrUpdateUserProfile(
    user: User,
    provider: "password" | "google",
    displayNameInput?: string,
    phoneInput?: string
): Promise<void> {
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
        const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            name: displayNameInput || user.displayName || "مستخدم جديد",
            phone: phoneInput || user.phoneNumber || "",
            farmName: "AquaSmart Delta",
            location: "مصر",
            pondCount: "3",
            provider: provider,
            createdAt: new Date().toISOString(),
            role: "user"
        };
        await set(userRef, newProfile);

        // Trigger welcome email non-blocking
        try {
            fetch("/api/email/welcome", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newProfile.email, name: newProfile.name }),
            }).catch(err => console.error("Error triggering welcome email fire-and-forget:", err));
        } catch (err) {
            console.error("Failed to trigger welcome email process:", err);
        }
    }
}
