'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchFullWeather, reverseGeocode, type FullWeatherData } from '@/lib/weather';

const PARIS_LAT = 48.8566;
const PARIS_LON = 2.3522;
const REFRESH_INTERVAL = 5 * 60 * 1000;

export function useWeather() {
  const [data, setData] = useState<FullWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const geo = await reverseGeocode(lat, lon);
      const weather = await fetchFullWeather(lat, lon, geo.name, geo.country);
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
        } catch { /* fallback Paris */ }
      }

      await loadWeather(lat, lon);
      refreshTimer = setInterval(() => loadWeather(lat, lon), REFRESH_INTERVAL);
    }

    init();
    return () => clearInterval(refreshTimer);
  }, [loadWeather]);

  return { data, loading, error };
}
