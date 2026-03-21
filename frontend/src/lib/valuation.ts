import { FishPrice } from "./market/marketDataService";

export interface PondValuation {
    currentValue: number;
    fishCount: number;
    avgWeight: number;
    species: string;
}

/**
 * Calculates the financial valuation of a pond based on its biomass and current market price.
 * 
 * @param fishCount Number of fish in the pond
 * @param avgWeight Average weight of a single fish in grams
 * @param speciesId ID of the species (e.g., 'tilapia')
 * @param marketPrices Current list of market prices
 * @returns Estimated market value in EGP
 */
export function calculatePondValuation(
    fishCount: number,
    avgWeight: number,
    speciesId: string,
    marketPrices: FishPrice[]
): number {
    const speciesPrice = marketPrices.find(p => p.id === speciesId)?.price || 85;
    
    // Biomass in KG = (Count * AvgWeight) / 1000
    const biomassKg = (fishCount * avgWeight) / 1000;
    
    // Total Value = Biomass * Price per KG
    return Math.round(biomassKg * speciesPrice);
}

/**
 * Utility to format currency in EGP with proper locale
 */
export function formatEGP(amount: number, lang: string): string {
    return new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 0,
    }).format(amount);
}
