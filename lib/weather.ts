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

export interface HourlySlot {
  time: string; // "6 AM", "NOON", "3 PM", etc.
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
}

export interface DailyForecast {
  dayName: string; // "LUN", "MAR", etc.
  date: string; // "AVR 03"
  tempMax: number;
  tempMin: number;
  weatherCode: number;
}

export interface SunData {
  sunrise: string; // "7:17"
  sunset: string; // "19:42"
  sunriseTomorrow: string;
  sunsetTomorrow: string;
}

export interface FullWeatherData {
  current: WeatherData;
  hourly: HourlySlot[];
  daily: DailyForecast[];
  sun: SunData;
}

const CURRENT_PARAMS = [
  'temperature_2m', 'apparent_temperature', 'relative_humidity_2m',
  'dew_point_2m', 'surface_pressure', 'wind_speed_10m',
  'wind_direction_10m', 'wind_gusts_10m', 'visibility', 'weather_code',
].join(',');

const HOURLY_PARAMS = 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m';
const DAILY_PARAMS = 'temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset';

const JOURS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const MOIS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];

function formatHour(iso: string): string {
  const h = new Date(iso).getHours();
  if (h === 0) return '12 AM';
  if (h === 12) return 'MIDI';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

function formatSunTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; country: string }> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(2)},${lon.toFixed(2)}&count=1&language=fr&format=json`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results?.[0]) {
      return { name: data.results[0].name, country: data.results[0].country ?? '' };
    }
  } catch { /* fallback */ }
  return { name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`, country: '' };
}

export async function fetchFullWeather(lat: number, lon: number, cityName?: string, countryName?: string): Promise<FullWeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${CURRENT_PARAMS}&hourly=${HOURLY_PARAMS}&daily=${DAILY_PARAMS}&wind_speed_unit=kmh&timezone=auto&forecast_days=6`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json();
  const c = data.current;

  const current: WeatherData = {
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
    visibility: Math.round(c.visibility / 1000),
  };

  // Hourly: pick 4 representative hours for tomorrow
  // Find tomorrow's date start index
  const nowHour = new Date().getHours();
  const tomorrowStart = 24 - nowHour; // hours from now to midnight
  const slotHours = [6, 12, 15, 18]; // 6AM, NOON, 3PM, 6PM
  const hourly: HourlySlot[] = slotHours.map(h => {
    const idx = tomorrowStart + h;
    if (idx >= data.hourly.time.length) return null;
    return {
      time: formatHour(data.hourly.time[idx]),
      temperature: Math.round(data.hourly.temperature_2m[idx]),
      weatherCode: data.hourly.weather_code[idx],
      windSpeed: Math.round(data.hourly.wind_speed_10m[idx]),
      windDirection: Math.round(data.hourly.wind_direction_10m[idx]),
    };
  }).filter((s): s is HourlySlot => s !== null);

  // Daily: 5 days starting from tomorrow
  const daily: DailyForecast[] = data.daily.time.slice(1, 6).map((t: string, i: number) => {
    const d = new Date(t);
    return {
      dayName: JOURS[d.getDay()],
      date: `${MOIS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`,
      tempMax: Math.round(data.daily.temperature_2m_max[i + 1]),
      tempMin: Math.round(data.daily.temperature_2m_min[i + 1]),
      weatherCode: data.daily.weather_code[i + 1],
    };
  });

  // Sun data: today + tomorrow
  const sun: SunData = {
    sunrise: formatSunTime(data.daily.sunrise[0]),
    sunset: formatSunTime(data.daily.sunset[0]),
    sunriseTomorrow: formatSunTime(data.daily.sunrise[1]),
    sunsetTomorrow: formatSunTime(data.daily.sunset[1]),
  };

  return { current, hourly, daily, sun };
}
