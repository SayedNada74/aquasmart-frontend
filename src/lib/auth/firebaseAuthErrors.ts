export const firebaseAuthErrors: Record<string, string> = {
    "auth/email-already-in-use": "البريد الإلكتروني مستخدم بالفعل بحساب آخر",
    "auth/invalid-email": "صيغة البريد الإلكتروني غير صحيحة",
    "auth/weak-password": "كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل)",
    "auth/user-not-found": "لا يوجد حساب مسجل بهذا البريد الإلكتروني",
    "auth/wrong-password": "كلمة المرور غير صحيحة",
    "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    "auth/too-many-requests": "محاولات تسجيل دخول كثيرة فاشلة. يرجى المحاولة بعد قليل",
    "auth/network-request-failed": "فشل في الاتصال بالإنترنت، يرجى المحاولة مجدداً",
    "auth/popup-closed-by-user": "تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية",
    "auth/operation-not-allowed": "تم إيقاف تسجيل الدخول بهذة الطريقة حالياً",
    "auth/account-exists-with-different-credential": "يوجد حساب بالفعل مربوط بطريقة تسجيل مختلفة",
    "auth/unauthorized-domain": "هذا النطاق غير مصرح له بتسجيل الدخول"
};

export function getArabicAuthError(code: string): string {
    return firebaseAuthErrors[code] || `حدث خطأ غير معروف (${code})`;
}
