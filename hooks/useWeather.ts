'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchWeather, reverseGeocode, type WeatherData } from '@/lib/weather';

const PARIS_LAT = 48.8566;
const PARIS_LON = 2.3522;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async (lat: number, lon: number) => {
    try {
      // Reverse geocode to get city name
      const geo = await reverseGeocode(lat, lon);
      const weather = await fetchWeather(lat, lon, geo.name, geo.country);
      setData(weather);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur météo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setInterval>;
    let lat = PARIS_LAT;
    let lon = PARIS_LON;

    async function init() {
      // Try browser geolocation
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 8000,
              maximumAge: 300000,
            });
          });
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        } catch {
          // Geoloc refused or timed out — use Paris
        }
      }

      await loadWeather(lat, lon);

      // Refresh every 5 minutes
      refreshTimer = setInterval(() => loadWeather(lat, lon), REFRESH_INTERVAL);
    }

    init();

    return () => clearInterval(refreshTimer);
  }, [loadWeather]);

  return { data, loading, error };
}
