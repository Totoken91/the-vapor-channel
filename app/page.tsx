'use client';

import VHSPostProcess from '@/components/VHSPostProcess';
import WeatherContent from '@/components/WeatherContent';
import TickerOverlay from '@/components/TickerOverlay';
import { useWeather } from '@/hooks/useWeather';

export default function Home() {
  const { data, loading } = useWeather();

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <VHSPostProcess>
        <WeatherContent data={data} loading={loading} />
      </VHSPostProcess>
      <TickerOverlay data={data} />
    </div>
  );
}
