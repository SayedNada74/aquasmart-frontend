import { useState, useEffect, useCallback } from "react";
import { fetchMarketData, FishPrice, MarketSummary, ProfitData, HarvestPond } from "@/lib/market/marketDataService";

export const useMarketData = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        prices: FishPrice[];
        summary: MarketSummary;
        profitHistory: ProfitData[];
        harvestPlan: HarvestPond[];
        timestamp: string;
    } | null>(null);

    const refreshMarketData = useCallback(async () => {
        setLoading(true);
        try {
            const newData = await fetchMarketData();
            setData(newData);
        } catch (error) {
            console.error("Failed to fetch market data:", error);
        } finally {
            // Simulate network delay for better UX feel
            setTimeout(() => setLoading(false), 800);
        }
    }, []);

    useEffect(() => {
        refreshMarketData();
    }, [refreshMarketData]);

    return {
        loading,
        data,
        refreshMarketData,
    };
};
