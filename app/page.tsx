'use client';

import VHSPostProcess from '@/components/VHSPostProcess';
import WeatherContent from '@/components/WeatherContent';
import { useWeather } from '@/hooks/useWeather';

export default function Home() {
  const { data, loading } = useWeather();

  return (
    <VHSPostProcess>
      <WeatherContent data={data} loading={loading} />
    </VHSPostProcess>
  );
}
