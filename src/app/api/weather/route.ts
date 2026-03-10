import { NextResponse } from "next/server";
import { deriveWeatherFromContext } from "@/lib/weather/weatherService";

const WEATHER_CODE_MAP: Record<number, "sunny" | "cloudy" | "rainy" | "windy"> = {
  0: "sunny",
  1: "sunny",
  2: "cloudy",
  3: "cloudy",
  45: "cloudy",
  48: "cloudy",
  51: "rainy",
  53: "rainy",
  55: "rainy",
  56: "rainy",
  57: "rainy",
  61: "rainy",
  63: "rainy",
  65: "rainy",
  66: "rainy",
  67: "rainy",
  71: "cloudy",
  80: "rainy",
  81: "rainy",
  82: "rainy",
  95: "windy",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") || "Default";
  const avgTempParam = searchParams.get("avgTemp");
  const avgTemp = avgTempParam ? Number(avgTempParam) : undefined;

  try {
    const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geocodeUrl.searchParams.set("name", location);
    geocodeUrl.searchParams.set("count", "1");
    geocodeUrl.searchParams.set("language", "en");
    geocodeUrl.searchParams.set("format", "json");

    const geocodeResponse = await fetch(geocodeUrl.toString(), { cache: "no-store" });
    if (!geocodeResponse.ok) throw new Error("Geocoding request failed");

    const geocodeData = (await geocodeResponse.json()) as {
      results?: Array<{ latitude: number; longitude: number; name: string }>;
    };
    const match = geocodeData.results?.[0];
    if (!match) throw new Error("No location match");

    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.searchParams.set("latitude", String(match.latitude));
    weatherUrl.searchParams.set("longitude", String(match.longitude));
    weatherUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m");
    weatherUrl.searchParams.set("timezone", "auto");

    const weatherResponse = await fetch(weatherUrl.toString(), { cache: "no-store" });
    if (!weatherResponse.ok) throw new Error("Weather request failed");

    const weatherData = (await weatherResponse.json()) as {
      current?: {
        temperature_2m: number;
        relative_humidity_2m: number;
        weather_code: number;
        wind_speed_10m: number;
      };
    };

    const current = weatherData.current;
    if (!current) throw new Error("Missing current weather payload");

    const condition = WEATHER_CODE_MAP[current.weather_code] || (current.wind_speed_10m >= 20 ? "windy" : "cloudy");
    const description_ar =
      condition === "sunny"
        ? "طقس مشمس فعليًا حسب موقع المزرعة"
        : condition === "windy"
          ? "رياح ملحوظة فعليًا - راقب التهوية"
          : condition === "rainy"
            ? "طقس ممطر أو رطب في موقع المزرعة"
            : "طقس غائم أو معتدل في موقع المزرعة";
    const description_en =
      condition === "sunny"
        ? "Sunny weather detected at the farm location"
        : condition === "windy"
          ? "Windy conditions detected - monitor aeration"
          : condition === "rainy"
            ? "Rainy or humid conditions at the farm location"
            : "Cloudy or mild conditions at the farm location";

    return NextResponse.json({
      ok: true,
      temp: current.temperature_2m,
      condition,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      uvIndex: condition === "sunny" ? 7 : condition === "cloudy" ? 4 : 2,
      description_ar,
      description_en,
      source: "api",
    });
  } catch {
    const fallback = deriveWeatherFromContext(location, avgTemp);
    return NextResponse.json({
      ok: true,
      ...fallback,
    });
  }
}
