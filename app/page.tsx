'use client';

import { useState } from 'react';
import VHSPostProcess from '@/components/VHSPostProcess';
import WeatherContent from '@/components/WeatherContent';
import { useWeather } from '@/hooks/useWeather';
import { useVaporwaveAudio } from '@/hooks/useVaporwaveAudio';

const T = "'Arial Black', 'Impact', sans-serif";

export default function Home() {
  const { data, loading } = useWeather();
  const { start: startAudio } = useVaporwaveAudio();
  const [tvOn, setTvOn] = useState(false);

  if (!tvOn) {
    return (
      <div
        onClick={() => { setTvOn(true); startAudio(); }}
        style={{
          width: '100vw', height: '100vh', background: '#0a0a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '64px', marginBottom: '20px',
            filter: 'drop-shadow(0 0 20px rgba(255,204,0,0.4))',
          }}>
            &#9211;
          </div>
          <div style={{
            fontFamily: T, color: '#555', fontSize: '16px', fontWeight: 900,
            letterSpacing: '0.2em',
          }}>
            APPUYEZ POUR ALLUMER
          </div>
        </div>
      </div>
    );
  }

  return (
    <VHSPostProcess>
      <WeatherContent data={data} loading={loading} />
    </VHSPostProcess>
  );
}
