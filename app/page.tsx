'use client';

import { useState } from 'react';
import VHSPostProcess from '@/components/VHSPostProcess';
import WeatherContent from '@/components/WeatherContent';
import { useWeather } from '@/hooks/useWeather';
import { useVaporwaveAudio } from '@/hooks/useVaporwaveAudio';

export default function Home() {
  const { data, loading } = useWeather();
  const { start: startAudio } = useVaporwaveAudio();
  const [tvOn, setTvOn] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <VHSPostProcess>
        <WeatherContent data={data} loading={loading} tvOn={tvOn} />
      </VHSPostProcess>

      {/* Invisible clickable overlay when TV is off */}
      {!tvOn && (
        <div
          onClick={() => { setTvOn(true); startAudio(); }}
          style={{
            position: 'absolute', inset: 0,
            cursor: 'pointer', zIndex: 50,
          }}
        />
      )}
    </div>
  );
}
