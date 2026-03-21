export const API_AUTH_HEADER = "x-aquasmart-client-key";

// In production, this would be a secret environment variable
export const getApiClientKey = () => process.env.NEXT_PUBLIC_API_CLIENT_KEY || "aquasmart_default_key_v1";
