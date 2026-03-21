export interface FishPrice {
    id: string;
    nameEn: string;
    nameAr: string;
    price: number;
    change: number;
    image: string;
}

export interface MarketSummary {
    totalFarmValue: number;
    totalFarmValueChange: number;
    expectedROI: number;
    roiImprovement: number;
    profitMargin: number;
    profitMarginReduction: number;
}

export interface ProfitData {
    monthEn: string;
    monthAr: string;
    revenue: number;
    cost: number;
}

export interface HarvestPond {
    id: string;
    pondNameEn: string;
    pondNameAr: string;
    fishTypeEn: string;
    fishTypeAr: string;
    currentWeight: string;
    expectedPrice: string;
    statusEn: string;
    statusAr: string;
    statusColor: string;
}

export interface SimulationReport {
    pondId: string;
    pondNameEn: string;
    pondNameAr: string;
    expectedHarvestValue: number;
    expectedProfit: number;
    roi: number;
    bestSellingTimingEn: string;
    bestSellingTimingAr: string;
    riskNotesEn: string;
    riskNotesAr: string;
    recommendationEn: string;
    recommendationAr: string;
}

const BASELINE_PRICES: Record<string, number> = {
    tilapia: 85,
    mullet: 140,
    seabream: 320,
    seabass: 350,
};

export const fetchMarketData = async () => {
    // Simulation layer with realistic fluctuations
    const prices: FishPrice[] = [
        {
            id: "tilapia",
            nameEn: "Tilapia (Grade A)",
            nameAr: "بلطي (درجة أولى)",
            price: BASELINE_PRICES.tilapia + (Math.random() * 10 - 5),
            change: 23.3 + (Math.random() * 4 - 2),
            image: "🐟",
        },
        {
            id: "mullet",
            nameEn: "Mullet (Large)",
            nameAr: "بوري (كبير)",
            price: BASELINE_PRICES.mullet + (Math.random() * 15 - 7.5),
            change: 1.5 + (Math.random() * 2 - 1),
            image: "🐠",
        },
        {
            id: "seabream",
            nameEn: "Sea Bream (Farm)",
            nameAr: "دنيس مزارع",
            price: BASELINE_PRICES.seabream + (Math.random() * 30 - 15),
            change: 20.8 + (Math.random() * 5 - 2.5),
            image: "🐡",
        },
        {
            id: "seabass",
            nameEn: "Sea Bass (Medium)",
            nameAr: "قاروص (وسط)",
            price: BASELINE_PRICES.seabass + (Math.random() * 40 - 20),
            change: 24.1 + (Math.random() * 6 - 3),
            image: "🎣",
        },
    ];

    const summary: MarketSummary = {
        totalFarmValue: 450000 + (Math.random() * 50000 - 25000),
        totalFarmValueChange: 70.53 + (Math.random() * 5 - 2.5),
        expectedROI: 24 + (Math.random() * 4 - 2),
        roiImprovement: 1.5 + (Math.random() * 1 - 0.5),
        profitMargin: 18.5 + (Math.random() * 3 - 1.5),
        profitMarginReduction: 0.8 + (Math.random() * 0.4 - 0.2),
    };

    const profitHistory: ProfitData[] = [
        { monthEn: "Jan", monthAr: "يناير", revenue: 45 + Math.random() * 5, cost: 30 + Math.random() * 3 },
        { monthEn: "Feb", monthAr: "فبراير", revenue: 52 + Math.random() * 5, cost: 28 + Math.random() * 3 },
        { monthEn: "Mar", monthAr: "مارس", revenue: 48 + Math.random() * 5, cost: 35 + Math.random() * 3 },
        { monthEn: "Apr", monthAr: "أبريل", revenue: 60 + Math.random() * 5, cost: 32 + Math.random() * 3 },
        { monthEn: "May", monthAr: "مايو", revenue: 55 + Math.random() * 5, cost: 30 + Math.random() * 3 },
    ];

    const harvestPlan: HarvestPond[] = [
        {
            id: "pond_4",
            pondNameEn: "Pond #4",
            pondNameAr: "حوض رقم ٤",
            fishTypeEn: "Tilapia",
            fishTypeAr: "بلطي",
            currentWeight: "500g",
            expectedPrice: `${Math.round(prices[0].price * 1.1)} EGP`,
            statusEn: "Ideal for Harvest",
            statusAr: "مثالي للحصاد",
            statusColor: "bg-[#10b981]",
        },
        {
            id: "pond_7",
            pondNameEn: "Pond #7",
            pondNameAr: "حوض رقم ٧",
            fishTypeEn: "Mullet",
            fishTypeAr: "بوري",
            currentWeight: "320g",
            expectedPrice: "Sept 2024",
            statusEn: "Growing",
            statusAr: "قيد النمو",
            statusColor: "bg-[#f59e0b]",
        },
    ];

    return {
        prices,
        summary,
        profitHistory,
        harvestPlan,
        timestamp: new Date().toISOString(),
    };
};

export const generateSimulationReport = (pond: HarvestPond, currentMarketPrice: number): SimulationReport => {
    const weightVal = parseInt(pond.currentWeight);
    const totalWeight = weightVal * 2000; // Assuming 2000 fish for simulation
    const harvestValue = (totalWeight / 1000) * currentMarketPrice;
    const costValue = harvestValue * 0.75; // Assuming 75% cost
    const profit = harvestValue - costValue;

    return {
        pondId: pond.id,
        pondNameEn: pond.pondNameEn,
        pondNameAr: pond.pondNameAr,
        expectedHarvestValue: Math.round(harvestValue),
        expectedProfit: Math.round(profit),
        roi: 25 + Math.random() * 5,
        bestSellingTimingEn: "Next 10-14 days for peak price",
        bestSellingTimingAr: "الـ ١٠-١٤ يوماً القادمة لأعلى سعر",
        riskNotesEn: "Market demand high, oxygen stability critical",
        riskNotesAr: "الطلب مرتفع، استقرار الأكسجين أمر حيوي",
        recommendationEn: "Proceed with partial harvest or aeration boost",
        recommendationAr: "باشر بالحصاد الجزئي أو تعزيز التهوية",
    };
};
