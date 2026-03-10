export interface WeatherData {
  temp: number;
  condition: "sunny" | "cloudy" | "rainy" | "windy";
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  description_ar: string;
  description_en: string;
  source: "api" | "derived";
}

interface WeatherFetchResponse extends WeatherData {
  ok: boolean;
}

export async function fetchWeather(location: string, averageTemp?: number): Promise<WeatherData> {
  const params = new URLSearchParams();
  params.set("location", location || "Default");
  if (typeof averageTemp === "number") params.set("avgTemp", String(averageTemp));

  try {
    const response = await fetch(`/api/weather?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Weather request failed");

    const data = (await response.json()) as WeatherFetchResponse;
    if (!data.ok) throw new Error("Weather payload invalid");

    return data;
  } catch {
    return deriveWeatherFromContext(location, averageTemp);
  }
}

export function deriveWeatherFromContext(location: string, averageTemp?: number): WeatherData {
  const normalizedLocation = location.toLowerCase().trim();
  const temp = typeof averageTemp === "number" ? Number(averageTemp.toFixed(1)) : inferBaseTemperature(normalizedLocation);
  const hour = new Date().getHours();

  let condition: WeatherData["condition"] = "cloudy";
  if (normalizedLocation.includes("rosetta") || normalizedLocation.includes("رشيد")) condition = "windy";
  else if (temp >= 30) condition = "sunny";
  else if (temp <= 18) condition = "rainy";
  else if (hour >= 12 && hour <= 16 && temp >= 26) condition = "sunny";

  return {
    temp,
    condition,
    humidity: condition === "rainy" ? 76 : condition === "windy" ? 58 : 52,
    windSpeed: condition === "windy" ? 24 : condition === "rainy" ? 16 : 11,
    uvIndex: condition === "sunny" ? 7 : condition === "cloudy" ? 4 : 2,
    description_ar: buildArabicDescription(condition, normalizedLocation),
    description_en: buildEnglishDescription(condition, normalizedLocation),
    source: "derived",
  };
}

function inferBaseTemperature(location: string) {
  if (location.includes("kafr")) return 23;
  if (location.includes("rosetta")) return 21;
  return 25;
}

function buildArabicDescription(condition: WeatherData["condition"], location: string) {
  const locationHint = location && location !== "default" ? " حسب موقع المزرعة" : " حول المزرعة";
  if (condition === "sunny") return `مشمس ودافئ${locationHint}`;
  if (condition === "windy") return `رياح نشطة${locationHint} - راقب التهوية`;
  if (condition === "rainy") return `أجواء باردة ورطبة${locationHint}`;
  return `طقس معتدل ومتغير${locationHint}`;
}

function buildEnglishDescription(condition: WeatherData["condition"], location: string) {
  const locationHint = location && location !== "default" ? " around the farm location" : " around the farm";
  if (condition === "sunny") return `Sunny and warm${locationHint}`;
  if (condition === "windy") return `Active wind${locationHint} - monitor aeration`;
  if (condition === "rainy") return `Cool and humid conditions${locationHint}`;
  return `Mild and variable weather${locationHint}`;
}
