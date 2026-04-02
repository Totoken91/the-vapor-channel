'use client';

import { useState, useEffect } from 'react';
import WeatherBackground from '@/components/SynthwaveBackground';
import { getWeatherInfo } from '@/lib/wmo-codes';
import { degToCardinal } from '@/lib/wind-direction';
import type { FullWeatherData } from '@/lib/weather';

const TITLE = "'Arial Black', 'Impact', 'Helvetica Neue', sans-serif";
const BODY = "'Arial', 'Helvetica Neue', sans-serif";

const JOURS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const MOIS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];

function formatDate(d: Date) { return `${JOURS[d.getDay()]} ${MOIS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`; }
function formatTime(d: Date) {
  const h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0'), s = String(d.getSeconds()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m}:${s} ${ampm}`;
}

const W = 1200, H = 900;
const PANEL_BG = 'rgba(15, 40, 120, 0.92)';
const PANEL_BORDER = '3px solid #5090d8';
const HEADER_BG = 'linear-gradient(to bottom, #3068b8, #1a3a80)';

// ================================================================
// SLIDE COMPONENTS
// ================================================================

function SlideCurrentConditions({ data }: { data: FullWeatherData }) {
  const w = getWeatherInfo(data.current.weatherCode);
  const wind = degToCardinal(data.current.windDirection);
  return (
    <>
      <div style={{ width: '92%', background: PANEL_BG, border: PANEL_BORDER, borderRadius: '4px', boxShadow: '0 3px 15px rgba(0,0,0,0.4)' }}>
        <div style={{ background: HEADER_BG, borderBottom: PANEL_BORDER, padding: '8px 18px', fontFamily: TITLE, fontSize: '20px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', fontWeight: 900 }}>conditions actuelles</div>
        <div style={{ padding: '20px 28px' }}>
          <div style={{ fontFamily: TITLE, color: '#ffd700', fontSize: '28px', fontWeight: 900, marginBottom: '12px' }}>
            {data.current.city.toUpperCase()}{data.current.country ? `, ${data.current.country.toUpperCase()}` : ''}
          </div>
          <div className="flex items-center" style={{ gap: '28px' }}>
            <div style={{ fontFamily: TITLE, color: '#ffcc00', fontSize: '96px', fontWeight: 900, lineHeight: 1 }}>{data.current.temperature}°</div>
            <div>
              <div style={{ fontFamily: TITLE, color: '#fff', fontSize: '40px', fontWeight: 900 }}>{w.icon} {w.label}</div>
              <div style={{ fontFamily: BODY, color: '#88ddff', fontSize: '22px', fontWeight: 700 }}>RESSENTI {data.current.feelsLike}°</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: '92%', background: PANEL_BG, border: PANEL_BORDER, borderRadius: '4px', boxShadow: '0 3px 15px rgba(0,0,0,0.4)' }}>
        <div style={{ background: HEADER_BG, borderBottom: PANEL_BORDER, padding: '8px 18px', fontFamily: TITLE, fontSize: '20px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', fontWeight: 900 }}>détails</div>
        <div className="grid grid-cols-3" style={{ padding: '16px 28px', fontFamily: BODY, fontSize: '22px', fontWeight: 700, gap: '12px 36px' }}>
          <div><span style={{ color: '#aaccff' }}>HUMIDITÉ</span> <span style={{ color: '#ffcc00' }}>{data.current.humidity}%</span></div>
          <div><span style={{ color: '#aaccff' }}>PRESSION</span> <span style={{ color: '#ffcc00' }}>{data.current.pressure} hPa</span></div>
          <div><span style={{ color: '#aaccff' }}>VENT</span> <span style={{ color: '#ffcc00' }}>{wind} {data.current.windSpeed} km/h</span></div>
          <div><span style={{ color: '#aaccff' }}>RAFALES</span> <span style={{ color: '#ffcc00' }}>{data.current.windGusts} km/h</span></div>
          <div><span style={{ color: '#aaccff' }}>PT ROSÉE</span> <span style={{ color: '#ffcc00' }}>{data.current.dewPoint}°</span></div>
          <div><span style={{ color: '#aaccff' }}>VISIBILITÉ</span> <span style={{ color: '#ffcc00' }}>{data.current.visibility} km</span></div>
        </div>
      </div>
    </>
  );
}

function SlideHourlyForecast({ data }: { data: FullWeatherData }) {
  return (
    <div style={{ width: '92%', background: PANEL_BG, border: PANEL_BORDER, borderRadius: '4px', boxShadow: '0 3px 15px rgba(0,0,0,0.4)' }}>
      <div style={{ background: HEADER_BG, borderBottom: PANEL_BORDER, padding: '8px 18px', fontFamily: TITLE, fontSize: '20px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', fontWeight: 900 }}>
        prévisions de demain — {data.current.city.toUpperCase()}
      </div>
      <div className="grid grid-cols-4" style={{ padding: '20px 16px', gap: '12px' }}>
        {data.hourly.map((slot, i) => {
          const w = getWeatherInfo(slot.weatherCode);
          const wind = degToCardinal(slot.windDirection);
          return (
            <div key={i} style={{ textAlign: 'center', background: 'rgba(20,50,140,0.5)', border: '2px solid #4080c8', borderRadius: '4px', padding: '16px 8px' }}>
              <div style={{ fontFamily: TITLE, color: '#fff', fontSize: '22px', fontWeight: 900, marginBottom: '12px' }}>{slot.time}</div>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>{w.icon}</div>
              <div style={{ fontFamily: BODY, color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>{w.label}</div>
              <div style={{ fontFamily: TITLE, color: '#ffcc00', fontSize: '48px', fontWeight: 900, lineHeight: 1, marginBottom: '8px' }}>{slot.temperature}°</div>
              <div style={{ fontFamily: BODY, color: '#aaccff', fontSize: '14px', fontWeight: 700 }}>{wind} {slot.windSpeed}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlideDailyForecast({ data }: { data: FullWeatherData }) {
  return (
    <div style={{ width: '92%', background: PANEL_BG, border: PANEL_BORDER, borderRadius: '4px', boxShadow: '0 3px 15px rgba(0,0,0,0.4)' }}>
      <div style={{ background: HEADER_BG, borderBottom: PANEL_BORDER, padding: '8px 18px', fontFamily: TITLE, fontSize: '20px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', fontWeight: 900 }}>
        prévisions 5 jours — {data.current.city.toUpperCase()}
      </div>
      <div className="grid grid-cols-5" style={{ padding: '20px 16px', gap: '10px' }}>
        {data.daily.map((day, i) => {
          const w = getWeatherInfo(day.weatherCode);
          return (
            <div key={i} style={{ textAlign: 'center', background: 'rgba(20,50,140,0.5)', border: '2px solid #4080c8', borderRadius: '4px', padding: '16px 8px' }}>
              <div style={{ fontFamily: TITLE, color: '#fff', fontSize: '20px', fontWeight: 900 }}>{day.dayName}</div>
              <div style={{ fontFamily: BODY, color: '#aaccff', fontSize: '14px', marginBottom: '10px' }}>{day.date}</div>
              <div style={{ fontSize: '44px', marginBottom: '8px' }}>{w.icon}</div>
              <div style={{ fontFamily: BODY, color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>{w.label}</div>
              <div style={{ fontFamily: TITLE, color: '#ffcc00', fontSize: '36px', fontWeight: 900, lineHeight: 1 }}>{day.tempMax}°</div>
              <div style={{ fontFamily: BODY, color: '#88bbdd', fontSize: '22px', fontWeight: 700 }}>{day.tempMin}°</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlideAlmanac({ data }: { data: FullWeatherData }) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayName = JOURS[today.getDay()];
  const tomorrowName = JOURS[tomorrow.getDay()];

  return (
    <div style={{ width: '92%', background: PANEL_BG, border: PANEL_BORDER, borderRadius: '4px', boxShadow: '0 3px 15px rgba(0,0,0,0.4)' }}>
      <div style={{ background: HEADER_BG, borderBottom: PANEL_BORDER, padding: '8px 18px', fontFamily: TITLE, fontSize: '20px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', fontWeight: 900 }}>
        almanac
      </div>
      <div style={{ padding: '28px 36px' }}>
        {/* Sunrise / Sunset table */}
        <div className="grid grid-cols-3" style={{ gap: '0', marginBottom: '32px' }}>
          {/* Header row */}
          <div></div>
          <div style={{ fontFamily: TITLE, color: '#ffcc00', fontSize: '24px', fontWeight: 900, textAlign: 'center' }}>{todayName}</div>
          <div style={{ fontFamily: TITLE, color: '#ffcc00', fontSize: '24px', fontWeight: 900, textAlign: 'center' }}>{tomorrowName}</div>
          {/* Sunrise */}
          <div style={{ fontFamily: TITLE, color: '#fff', fontSize: '24px', fontWeight: 900, padding: '12px 0' }}>☀️ LEVER</div>
          <div style={{ fontFamily: BODY, color: '#fff', fontSize: '28px', fontWeight: 700, textAlign: 'center', padding: '12px 0' }}>{data.sun.sunrise}</div>
          <div style={{ fontFamily: BODY, color: '#fff', fontSize: '28px', fontWeight: 700, textAlign: 'center', padding: '12px 0' }}>{data.sun.sunriseTomorrow}</div>
          {/* Sunset */}
          <div style={{ fontFamily: TITLE, color: '#fff', fontSize: '24px', fontWeight: 900, padding: '12px 0' }}>🌅 COUCHER</div>
          <div style={{ fontFamily: BODY, color: '#fff', fontSize: '28px', fontWeight: 700, textAlign: 'center', padding: '12px 0' }}>{data.sun.sunset}</div>
          <div style={{ fontFamily: BODY, color: '#fff', fontSize: '28px', fontWeight: 700, textAlign: 'center', padding: '12px 0' }}>{data.sun.sunsetTomorrow}</div>
        </div>

        {/* Current conditions summary */}
        <div style={{ borderTop: '2px solid #4080c8', paddingTop: '20px' }}>
          <div style={{ fontFamily: BODY, color: '#fff', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
            ACTUELLEMENT À <span style={{ color: '#ffcc00' }}>{data.current.city.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-3" style={{ fontFamily: BODY, fontSize: '22px', fontWeight: 700, gap: '8px' }}>
            <div><span style={{ color: '#aaccff' }}>HUMIDITÉ</span> <span style={{ color: '#ffcc00' }}>{data.current.humidity}%</span></div>
            <div><span style={{ color: '#aaccff' }}>PT ROSÉE</span> <span style={{ color: '#ffcc00' }}>{data.current.dewPoint}°</span></div>
            <div><span style={{ color: '#aaccff' }}>PRESSION</span> <span style={{ color: '#ffcc00' }}>{data.current.pressure} hPa</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// SLIDE TITLES (shown next to logo)
// ================================================================
const SLIDE_TITLES = [
  'conditions actuelles',
  "prévisions de demain",
  'prévisions 5 jours',
  'almanac',
];

// ================================================================
// MAIN COMPONENT
// ================================================================

interface Props {
  data: FullWeatherData | null;
  loading: boolean;
}

export default function WeatherContent({ data, loading }: Props) {
  const [now, setNow] = useState(new Date());
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle slides every 8 seconds
  useEffect(() => {
    if (!data) return;
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % 4);
    }, 8000);
    return () => clearInterval(timer);
  }, [data]);

  // Loading screen
  if (loading || !data) {
    return (
      <div className="relative overflow-hidden flex items-center justify-center" style={{ width: `${W}px`, height: `${H}px`, background: '#0a1530' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: TITLE, color: '#88ddff', fontSize: '36px', fontWeight: 900, marginBottom: '24px' }}>THE VAPOR CHANNEL</div>
          <div style={{ fontFamily: BODY, color: '#ffcc00', fontSize: '24px', fontWeight: 700, animation: 'pulse 1.5s ease-in-out infinite' }}>CONNEXION AU SATELLITE...</div>
          <div style={{ fontFamily: BODY, color: '#aaccff', fontSize: '18px', marginTop: '16px' }}>{formatDate(now)} — {formatTime(now)}</div>
        </div>
        <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    );
  }

  const w = getWeatherInfo(data.current.weatherCode);
  const wind = degToCardinal(data.current.windDirection);
  const ticker = `BULLETIN MÉTÉO ━ ${data.current.city.toUpperCase()} : ${data.current.temperature}°C ${w.label} ━ HUMIDITÉ ${data.current.humidity}% ━ VENT ${wind} ${data.current.windSpeed} KM/H ━ RESSENTI ${data.current.feelsLike}°C ━ THE VAPOR CHANNEL ━ MÉTÉO EN DIRECT ━`;

  return (
    <div className="relative overflow-hidden" style={{ width: `${W}px`, height: `${H}px`, background: '#000' }}>
      <div className="absolute inset-0"><WeatherBackground /></div>

      <div className="relative z-10 flex flex-col h-full" style={{ padding: '28px 36px' }}>
        {/* Header */}
        <header className="flex items-start justify-between" style={{ marginBottom: '18px' }}>
          <div style={{ background: '#1a4a9a', border: '3px solid #7ab0e8', borderRadius: '8px', padding: '8px 14px' }}>
            <div style={{ textAlign: 'center', lineHeight: 1.15 }}>
              <div style={{ fontFamily: TITLE, color: '#fff', fontSize: '16px', fontWeight: 900 }}>THE</div>
              <div style={{ fontFamily: TITLE, color: '#fff', fontSize: '20px', fontWeight: 900 }}>VAPOR</div>
              <div style={{ fontFamily: TITLE, color: '#fff', fontSize: '16px', fontWeight: 900 }}>CHANNEL</div>
            </div>
          </div>
          <div style={{ fontFamily: BODY, color: '#fff', fontSize: '36px', fontWeight: 700, letterSpacing: '0.05em', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            {SLIDE_TITLES[slideIndex]}
          </div>
          <div style={{ fontFamily: BODY, color: '#fff', textAlign: 'right', textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{formatDate(now)}</div>
            <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '0.05em' }}>{formatTime(now)}</div>
          </div>
        </header>

        {/* Slide content */}
        <div className="flex-1 flex flex-col items-center justify-start" style={{ gap: '16px' }}>
          {slideIndex === 0 && <SlideCurrentConditions data={data} />}
          {slideIndex === 1 && <SlideHourlyForecast data={data} />}
          {slideIndex === 2 && <SlideDailyForecast data={data} />}
          {slideIndex === 3 && <SlideAlmanac data={data} />}
        </div>

        {/* Bottom ticker */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontFamily: BODY, color: '#fff', fontSize: '20px', fontWeight: 700, letterSpacing: '0.03em', marginBottom: '6px', padding: '0 6px' }}>
            ACTUELLEMENT À <span style={{ color: '#ffcc00' }}>{data.current.city.toUpperCase()}</span>
            <span style={{ marginLeft: '36px' }}>HUMIDITÉ <span style={{ color: '#ffcc00' }}>{data.current.humidity}%</span></span>
            <span style={{ marginLeft: '36px' }}>PT ROSÉE <span style={{ color: '#ffcc00' }}>{data.current.dewPoint}°</span></span>
          </div>
          <div className="overflow-hidden whitespace-nowrap" style={{ background: 'rgba(8, 16, 60, 0.94)', borderTop: '3px solid #ffcc00', fontFamily: BODY, color: '#ffcc00', fontSize: '18px', fontWeight: 700, letterSpacing: '0.03em', padding: '8px 14px' }}>
            <div className="inline-block animate-marquee">{ticker}</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee { from { transform: translateX(${W}px); } to { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 22s linear infinite; }
      `}</style>
    </div>
  );
}
