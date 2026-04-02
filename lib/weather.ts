export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  dewPoint: number;
  visibility: number;
}

const WEATHER_PARAMS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'dew_point_2m',
  'surface_pressure',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'visibility',
  'weather_code',
].join(',');

export async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; country: string }> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(2)},${lon.toFixed(2)}&count=1&language=fr&format=json`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results?.[0]) {
      return { name: data.results[0].name, country: data.results[0].country ?? '' };
    }
  } catch {
    // Fallback below
  }
  return { name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`, country: '' };
}

export async function fetchWeather(lat: number, lon: number, cityName?: string, countryName?: string): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${WEATHER_PARAMS}&wind_speed_unit=kmh&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json();
  const c = data.current;

  return {
    city: cityName ?? 'UNKNOWN',
    country: countryName ?? '',
    temperature: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    weatherCode: c.weather_code,
    humidity: Math.round(c.relative_humidity_2m),
    pressure: Math.round(c.surface_pressure),
    windSpeed: Math.round(c.wind_speed_10m),
    windDirection: Math.round(c.wind_direction_10m),
    windGusts: Math.round(c.wind_gusts_10m),
    dewPoint: Math.round(c.dew_point_2m),
    visibility: Math.round(c.visibility / 1000), // m → km
  };
}
