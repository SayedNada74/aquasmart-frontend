"use client";

export interface WeatherData {
    temp: number;
    condition: "sunny" | "cloudy" | "rainy" | "windy";
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    description_ar: string;
    description_en: string;
}

const WEATHER_MOCK_DATA: Record<string, WeatherData> = {
    "default": {
        temp: 24,
        condition: "sunny",
        humidity: 45,
        windSpeed: 12,
        uvIndex: 6,
        description_ar: "مشمس جزئياً - جو مثالي للمزرعة",
        description_en: "Partly Sunny - Ideal for the farm"
    },
    "kafr el-sheikh": {
        temp: 22,
        condition: "cloudy",
        humidity: 60,
        windSpeed: 15,
        uvIndex: 4,
        description_ar: "غائم جزئياً في كفر الشيخ",
        description_en: "Partly Cloudy in Kafr El-Sheikh"
    },
    "rosetta": {
        temp: 19,
        condition: "windy",
        humidity: 70,
        windSpeed: 25,
        uvIndex: 3,
        description_ar: "رياح متوسطة في رشيد - انتبه للبدالات",
        description_en: "Moderate wind in Rosetta - Check Aerators"
    }
};

export async function fetchWeather(location: string): Promise<WeatherData> {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));

    const normalized = location.toLowerCase().trim();
    if (normalized.includes("كفر الشيخ") || normalized.includes("kafr")) return WEATHER_MOCK_DATA["kafr el-sheikh"];
    if (normalized.includes("رشيد") || normalized.includes("rosetta")) return WEATHER_MOCK_DATA["rosetta"];

    // Add some random variation
    const base = WEATHER_MOCK_DATA["default"];
    return {
        ...base,
        temp: base.temp + (Math.random() * 4 - 2),
        humidity: base.humidity + (Math.random() * 10 - 5)
    };
}
