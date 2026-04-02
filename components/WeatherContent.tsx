'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import WeatherBackground from '@/components/SynthwaveBackground';
import { getWeatherInfo } from '@/lib/wmo-codes';
import { degToCardinal } from '@/lib/wind-direction';
import type { FullWeatherData } from '@/lib/weather';

const T = "'Arial Black', 'Impact', sans-serif";
const B = "'Arial', 'Helvetica Neue', sans-serif";
const JOURS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const MOIS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];

function fmtDate(d: Date) { return `${JOURS[d.getDay()]} ${MOIS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`; }
function fmtTime(d: Date) {
  const h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0'), s = String(d.getSeconds()).padStart(2, '0');
  return `${h % 12 || 12}:${m}:${s} ${h >= 12 ? 'PM' : 'AM'}`;
}

const W = 1200, H = 900;

/**
 * useBuildSteps: old-school "build" effect.
 * Increments a counter every `interval`ms after mount.
 * Elements check `step >= N` to decide if they're visible.
 * Hard snap — no smooth transitions. Like real Weather Channel.
 */
function useBuildSteps(totalSteps: number, interval: number = 350) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    let current = 0;
    const t = setInterval(() => {
      current++;
      setStep(current);
      if (current >= totalSteps) clearInterval(t);
    }, interval);
    return () => clearInterval(t);
  }, [totalSteps, interval]);
  return step;
}

// ================================================================
// SLIDE 1: CONDITIONS ACTUELLES
// ================================================================
function SlideConditions({ data }: { data: FullWeatherData }) {
  const w = getWeatherInfo(data.current.weatherCode);
  const wind = degToCardinal(data.current.windDirection);
  const step = useBuildSteps(5, 300);

  return (
    <div style={{ width: '92%' }}>
      {/* City header bar */}
      {step >= 0 && (
        <div style={{ background: 'linear-gradient(to right, #1a3a80, #2a5ab0)', padding: '10px 20px', borderRadius: '4px 4px 0 0', border: '2px solid #5090d8', borderBottom: 'none' }}>
          <span style={{ fontFamily: T, color: '#ffd700', fontSize: '26px', fontWeight: 900 }}>
            {data.current.city.toUpperCase()}{data.current.country ? `, ${data.current.country.toUpperCase()}` : ''}
          </span>
        </div>
      )}
      <div style={{ background: 'rgba(15, 40, 120, 0.92)', border: '2px solid #5090d8', borderRadius: '0 0 4px 4px', padding: '24px 28px' }}>
        {/* Main weather row */}
        {step >= 1 && (
          <div className="flex items-center" style={{ gap: '24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '80px' }}>{w.icon}</div>
            <div>
              <div style={{ fontFamily: T, color: '#fff', fontSize: '36px', fontWeight: 900 }}>{w.label}</div>
              <div style={{ fontFamily: B, color: '#88ddff', fontSize: '20px', fontWeight: 700 }}>RESSENTI {data.current.feelsLike}°</div>
            </div>
            <div style={{ marginLeft: 'auto', background: '#fff', borderRadius: '6px', padding: '8px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontFamily: T, color: '#1a1a1a', fontSize: '80px', fontWeight: 900, lineHeight: 1 }}>{data.current.temperature}°</div>
            </div>
          </div>
        )}
        {/* Details */}
        {step >= 2 && <div style={{ borderTop: '2px solid #4080c8', paddingTop: '16px' }}>
          <div className="grid grid-cols-3" style={{ fontFamily: B, fontSize: '20px', fontWeight: 700, gap: '10px 30px' }}>
            {step >= 2 && <div><span style={{ color: '#aaccff' }}>HUMIDITÉ</span> <span style={{ color: '#ffcc00' }}>{data.current.humidity}%</span></div>}
            {step >= 2 && <div><span style={{ color: '#aaccff' }}>PRESSION</span> <span style={{ color: '#ffcc00' }}>{data.current.pressure} hPa</span></div>}
            {step >= 2 && <div><span style={{ color: '#aaccff' }}>VENT</span> <span style={{ color: '#ffcc00' }}>{wind} {data.current.windSpeed} km/h</span></div>}
            {step >= 3 && <div><span style={{ color: '#aaccff' }}>RAFALES</span> <span style={{ color: '#ffcc00' }}>{data.current.windGusts} km/h</span></div>}
            {step >= 3 && <div><span style={{ color: '#aaccff' }}>PT ROSÉE</span> <span style={{ color: '#ffcc00' }}>{data.current.dewPoint}°</span></div>}
            {step >= 3 && <div><span style={{ color: '#aaccff' }}>VISIBILITÉ</span> <span style={{ color: '#ffcc00' }}>{data.current.visibility} km</span></div>}
          </div>
        </div>}
      </div>
    </div>
  );
}

// ================================================================
// SLIDE 2: TOMORROW'S FORECAST
// ================================================================
function SlideHourly({ data }: { data: FullWeatherData }) {
  const step = useBuildSteps(data.hourly.length + 1, 400);
  return (
    <div style={{ width: '92%' }}>
      {step >= 0 && (
        <div style={{ background: 'linear-gradient(to right, #2a5ab0, #1a6a40)', padding: '10px 20px', borderRadius: '4px 4px 0 0', border: '2px solid #50b070', borderBottom: 'none' }}>
          <span style={{ fontFamily: T, color: '#ffd700', fontSize: '22px', fontWeight: 900 }}>{data.current.city.toUpperCase()}</span>
        </div>
      )}
      <div style={{ background: 'rgba(10, 50, 90, 0.92)', border: '2px solid #50b070', borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '20px 16px' }}>
        <div className="grid grid-cols-4" style={{ gap: '14px' }}>
          {data.hourly.map((slot, i) => {
            if (step < i + 1) return <div key={i} />;
            const w = getWeatherInfo(slot.weatherCode);
            const wd = degToCardinal(slot.windDirection);
            return (
              <div key={i} style={{ textAlign: 'center', background: 'rgba(20,60,120,0.6)', border: '2px solid #4090c0', borderRadius: '6px', padding: '14px 6px' }}>
                <div style={{ fontFamily: T, color: '#fff', fontSize: '22px', fontWeight: 900, marginBottom: '10px' }}>{slot.time}</div>
                <div style={{ fontSize: '52px', marginBottom: '6px' }}>{w.icon}</div>
                <div style={{ fontFamily: B, color: '#d0e8ff', fontSize: '14px', fontWeight: 700, marginBottom: '14px', minHeight: '34px' }}>{w.label}</div>
                <div style={{ background: '#fff', borderRadius: '4px', padding: '6px 12px', margin: '0 auto', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  <div style={{ fontFamily: T, color: '#1a1a1a', fontSize: '38px', fontWeight: 900, lineHeight: 1 }}>{slot.temperature}°</div>
                </div>
                <div style={{ fontFamily: B, color: '#aaccff', fontSize: '14px', fontWeight: 700, marginTop: '10px' }}>{wd} {slot.windSpeed}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// SLIDE 3: 5-DAY FORECAST
// ================================================================
function SlideDaily({ data }: { data: FullWeatherData }) {
  const step = useBuildSteps(data.daily.length + 1, 350);
  return (
    <div style={{ width: '92%' }}>
      {step >= 0 && (
        <div style={{ background: 'linear-gradient(to right, #6a3a10, #8a5a20)', padding: '10px 20px', borderRadius: '4px 4px 0 0', border: '2px solid #c08030', borderBottom: 'none' }}>
          <span style={{ fontFamily: T, color: '#fff', fontSize: '22px', fontWeight: 900 }}>PRÉVISIONS 5 JOURS</span>
        </div>
      )}
      <div style={{ background: 'rgba(60, 30, 10, 0.88)', border: '2px solid #c08030', borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '20px 12px' }}>
        <div className="grid grid-cols-5" style={{ gap: '10px' }}>
          {data.daily.map((day, i) => {
            if (step < i + 1) return <div key={i} />;
            const w = getWeatherInfo(day.weatherCode);
            return (
              <div key={i} style={{ textAlign: 'center', background: 'rgba(80,40,15,0.6)', border: '2px solid #a07030', borderRadius: '6px', padding: '14px 6px' }}>
                <div style={{ fontFamily: T, color: '#ffd700', fontSize: '22px', fontWeight: 900 }}>{day.dayName}</div>
                <div style={{ fontFamily: B, color: '#e8c88a', fontSize: '13px', marginBottom: '8px' }}>{day.date}</div>
                <div style={{ fontSize: '44px', marginBottom: '6px' }}>{w.icon}</div>
                <div style={{ fontFamily: B, color: '#e8d0a0', fontSize: '13px', fontWeight: 700, marginBottom: '10px', minHeight: '32px' }}>{w.label}</div>
                <div style={{ fontFamily: T, color: '#ffcc00', fontSize: '34px', fontWeight: 900, lineHeight: 1 }}>{day.tempMax}°</div>
                <div style={{ fontFamily: B, color: '#c0a060', fontSize: '20px', fontWeight: 700 }}>{day.tempMin}°</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// SLIDE 4: ALMANAC
// ================================================================
function SlideAlmanac({ data }: { data: FullWeatherData }) {
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const step = useBuildSteps(5, 400);

  return (
    <div style={{ width: '92%' }}>
      {step >= 0 && (
        <div style={{ background: 'linear-gradient(to right, #8a4a10, #b06a20)', padding: '10px 20px', borderRadius: '4px 4px 0 0', border: '2px solid #d09040', borderBottom: 'none' }}>
          <span style={{ fontFamily: T, color: '#fff', fontSize: '22px', fontWeight: 900 }}>ALMANAC</span>
        </div>
      )}
      <div style={{ background: 'rgba(70, 35, 10, 0.90)', border: '2px solid #d09040', borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '28px 32px' }}>
        {/* Column headers */}
        {step >= 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '8px' }}>
            <div></div>
            <div style={{ fontFamily: T, color: '#ffd700', fontSize: '26px', fontWeight: 900, textAlign: 'center' }}>{JOURS[today.getDay()]}</div>
            <div style={{ fontFamily: T, color: '#ffd700', fontSize: '26px', fontWeight: 900, textAlign: 'center' }}>{JOURS[tomorrow.getDay()]}</div>
          </div>
        )}
        {/* Sunrise */}
        {step >= 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '14px 0', borderBottom: '1px solid #a07030' }}>
            <div style={{ fontFamily: T, color: '#fff', fontSize: '24px', fontWeight: 900 }}>☀️ LEVER</div>
            <div style={{ fontFamily: B, color: '#ffdd66', fontSize: '32px', fontWeight: 700, textAlign: 'center' }}>{data.sun.sunrise}</div>
            <div style={{ fontFamily: B, color: '#ffdd66', fontSize: '32px', fontWeight: 700, textAlign: 'center' }}>{data.sun.sunriseTomorrow}</div>
          </div>
        )}
        {/* Sunset */}
        {step >= 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '14px 0', marginBottom: '20px' }}>
            <div style={{ fontFamily: T, color: '#fff', fontSize: '24px', fontWeight: 900 }}>🌅 COUCHER</div>
            <div style={{ fontFamily: B, color: '#ff9944', fontSize: '32px', fontWeight: 700, textAlign: 'center' }}>{data.sun.sunset}</div>
            <div style={{ fontFamily: B, color: '#ff9944', fontSize: '32px', fontWeight: 700, textAlign: 'center' }}>{data.sun.sunsetTomorrow}</div>
          </div>
        )}
        {/* Bottom conditions */}
        {step >= 4 && (
          <div style={{ borderTop: '2px solid #a07030', paddingTop: '18px' }}>
            <div style={{ fontFamily: B, color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              ACTUELLEMENT À <span style={{ color: '#ffd700' }}>{data.current.city.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-3" style={{ fontFamily: B, fontSize: '20px', fontWeight: 700, gap: '6px' }}>
              <div><span style={{ color: '#e8c88a' }}>HUMIDITÉ</span> <span style={{ color: '#ffcc00' }}>{data.current.humidity}%</span></div>
              <div><span style={{ color: '#e8c88a' }}>PT ROSÉE</span> <span style={{ color: '#ffcc00' }}>{data.current.dewPoint}°</span></div>
              <div><span style={{ color: '#e8c88a' }}>PRESSION</span> <span style={{ color: '#ffcc00' }}>{data.current.pressure} hPa</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================================================
const SLIDE_TITLES = ['conditions actuelles', "tomorrow's forecast", 'extended forecast', 'almanac'];
const SLIDE_COUNT = 4;

// ================================================================
// MAIN
// ================================================================
interface Props { data: FullWeatherData | null; loading: boolean; }

export default function WeatherContent({ data, loading }: Props) {
  const [now, setNow] = useState(new Date());
  const [slideIndex, setSlideIndex] = useState(0);
  const [showSlide, setShowSlide] = useState(true);
  const slideRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Slide cycling: hard cut with brief blank (like real broadcast)
  const cycleSlide = useCallback(() => {
    setShowSlide(false); // blank
    setTimeout(() => {
      slideRef.current = (slideRef.current + 1) % SLIDE_COUNT;
      setSlideIndex(slideRef.current);
      setShowSlide(true);
    }, 250);
  }, []);

  useEffect(() => {
    const t = setInterval(cycleSlide, 8000);
    return () => clearInterval(t);
  }, [cycleSlide]);

  if (loading || !data) {
    return (
      <div className="relative overflow-hidden flex items-center justify-center" style={{ width: `${W}px`, height: `${H}px`, background: '#0a1530' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: T, color: '#88ddff', fontSize: '36px', fontWeight: 900, marginBottom: '24px' }}>THE VAPOR CHANNEL</div>
          <div style={{ fontFamily: B, color: '#ffcc00', fontSize: '24px', fontWeight: 700 }}>CONNEXION AU SATELLITE...</div>
          <div style={{ fontFamily: B, color: '#aaccff', fontSize: '18px', marginTop: '16px' }}>{fmtDate(now)} — {fmtTime(now)}</div>
        </div>
      </div>
    );
  }

  const w = getWeatherInfo(data.current.weatherCode);
  const wind = degToCardinal(data.current.windDirection);
  const ticker = `BULLETIN MÉTÉO ━ ${data.current.city.toUpperCase()} : ${data.current.temperature}°C ${w.label} ━ HUMIDITÉ ${data.current.humidity}% ━ VENT ${wind} ${data.current.windSpeed} KM/H ━ THE VAPOR CHANNEL ━ MÉTÉO EN DIRECT ━`;

  return (
    <div className="relative overflow-hidden" style={{ width: `${W}px`, height: `${H}px`, background: '#000' }}>
      <div className="absolute inset-0"><WeatherBackground /></div>

      <div className="relative z-10 flex flex-col h-full" style={{ padding: '28px 36px' }}>
        {/* Header */}
        <header className="flex items-start justify-between" style={{ marginBottom: '14px' }}>
          <div style={{ background: '#1a4a9a', border: '3px solid #7ab0e8', borderRadius: '8px', padding: '8px 14px' }}>
            <div style={{ textAlign: 'center', lineHeight: 1.15 }}>
              <div style={{ fontFamily: T, color: '#fff', fontSize: '16px', fontWeight: 900 }}>THE</div>
              <div style={{ fontFamily: T, color: '#fff', fontSize: '20px', fontWeight: 900 }}>VAPOR</div>
              <div style={{ fontFamily: T, color: '#fff', fontSize: '16px', fontWeight: 900 }}>CHANNEL</div>
            </div>
          </div>
          <div style={{ fontFamily: B, color: '#fff', fontSize: '34px', fontWeight: 700, letterSpacing: '0.04em', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            {SLIDE_TITLES[slideIndex]}
          </div>
          <div style={{ fontFamily: B, color: '#fff', textAlign: 'right', textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{fmtDate(now)}</div>
            <div style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '0.05em' }}>{fmtTime(now)}</div>
          </div>
        </header>

        {/* Slide area */}
        <div className="flex-1 flex flex-col items-center justify-start" style={{ gap: '14px' }}>
          {showSlide && slideIndex === 0 && <SlideConditions key="s0" data={data} />}
          {showSlide && slideIndex === 1 && <SlideHourly key="s1" data={data} />}
          {showSlide && slideIndex === 2 && <SlideDaily key="s2" data={data} />}
          {showSlide && slideIndex === 3 && <SlideAlmanac key="s3" data={data} />}
        </div>

        {/* Bottom ticker (always visible) */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontFamily: B, color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '4px', padding: '0 6px' }}>
            ACTUELLEMENT À <span style={{ color: '#ffcc00' }}>{data.current.city.toUpperCase()}</span>
            <span style={{ marginLeft: '30px' }}>HUMIDITÉ <span style={{ color: '#ffcc00' }}>{data.current.humidity}%</span></span>
            <span style={{ marginLeft: '30px' }}>PT ROSÉE <span style={{ color: '#ffcc00' }}>{data.current.dewPoint}°</span></span>
          </div>
          <div className="overflow-hidden whitespace-nowrap" style={{ background: 'rgba(8, 16, 60, 0.94)', borderTop: '3px solid #ffcc00', fontFamily: B, color: '#ffcc00', fontSize: '18px', fontWeight: 700, padding: '7px 14px' }}>
            <div style={{ display: 'inline-block', animation: 'marquee 22s linear infinite' }}>{ticker}</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee { from { transform: translateX(${W}px); } to { transform: translateX(-100%); } }
      `}</style>
    </div>
  );
}
