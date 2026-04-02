'use client';

import { useState, useEffect } from 'react';
import WeatherBackground from '@/components/SynthwaveBackground';
import { getWeatherInfo } from '@/lib/wmo-codes';
import { degToCardinal } from '@/lib/wind-direction';
import type { WeatherData } from '@/lib/weather';

const TITLE_FONT = "'Arial Black', 'Impact', 'Helvetica Neue', sans-serif";
const BODY_FONT = "'Arial', 'Helvetica Neue', sans-serif";

const JOURS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const MOIS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];

function formatDate(d: Date): string {
  return `${JOURS[d.getDay()]} ${MOIS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(d: Date): string {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m}:${s} ${ampm}`;
}

interface Props {
  data: WeatherData | null;
  loading: boolean;
}

export default function WeatherContent({ data, loading }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weather = data ? getWeatherInfo(data.weatherCode) : null;
  const windDir = data ? degToCardinal(data.windDirection) : '';

  // Loading screen
  if (loading || !data) {
    return (
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={{ width: '1200px', height: '900px', background: '#0a1530' }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: TITLE_FONT, color: '#88ddff', fontSize: '36px', fontWeight: 900, marginBottom: '24px' }}>
            THE VAPOR CHANNEL
          </div>
          <div style={{ fontFamily: BODY_FONT, color: '#ffcc00', fontSize: '24px', fontWeight: 700, animation: 'pulse 1.5s ease-in-out infinite' }}>
            CONNEXION AU SATELLITE...
          </div>
          <div style={{ fontFamily: BODY_FONT, color: '#aaccff', fontSize: '18px', marginTop: '16px' }}>
            {formatDate(now)} — {formatTime(now)}
          </div>
        </div>
        <style>{`
          @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        `}</style>
      </div>
    );
  }

  const ticker = `BULLETIN MÉTÉO ━ ${data.city.toUpperCase()} : ${data.temperature}°C ${weather!.label} ━ HUMIDITÉ ${data.humidity}% ━ VENT ${windDir} ${data.windSpeed} KM/H ━ RESSENTI ${data.feelsLike}°C ━ THE VAPOR CHANNEL ━ MÉTÉO EN DIRECT ━`;

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: '1200px', height: '900px', background: '#000' }}
    >
      <div className="absolute inset-0">
        <WeatherBackground />
      </div>

      <div className="relative z-10 flex flex-col h-full" style={{ padding: '28px 36px' }}>
        {/* Header */}
        <header className="flex items-start justify-between" style={{ marginBottom: '18px' }}>
          <div
            style={{
              background: '#1a4a9a',
              border: '3px solid #7ab0e8',
              borderRadius: '8px',
              padding: '8px 14px',
            }}
          >
            <div style={{ textAlign: 'center', lineHeight: 1.15 }}>
              <div style={{ fontFamily: TITLE_FONT, color: '#fff', fontSize: '16px', fontWeight: 900 }}>THE</div>
              <div style={{ fontFamily: TITLE_FONT, color: '#fff', fontSize: '20px', fontWeight: 900 }}>VAPOR</div>
              <div style={{ fontFamily: TITLE_FONT, color: '#fff', fontSize: '16px', fontWeight: 900 }}>CHANNEL</div>
            </div>
          </div>

          <div style={{ fontFamily: BODY_FONT, color: '#fff', fontSize: '36px', fontWeight: 700, letterSpacing: '0.05em', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            conditions actuelles
          </div>

          <div style={{ fontFamily: BODY_FONT, color: '#fff', textAlign: 'right', textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{formatDate(now)}</div>
            <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '0.05em' }}>
              {formatTime(now)}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-start" style={{ gap: '16px' }}>
          {/* Main panel */}
          <div style={{ width: '92%', background: 'rgba(15, 40, 120, 0.92)', border: '3px solid #5090d8', borderRadius: '4px', boxShadow: '0 3px 15px rgba(0,0,0,0.4)' }}>
            <div style={{
              background: 'linear-gradient(to bottom, #3068b8, #1a3a80)',
              borderBottom: '3px solid #5090d8',
              padding: '8px 18px',
              fontFamily: TITLE_FONT,
              fontSize: '20px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#fff',
              fontWeight: 900,
            }}>
              conditions actuelles
            </div>
            <div style={{ padding: '20px 28px' }}>
              <div style={{ fontFamily: TITLE_FONT, color: '#ffd700', fontSize: '28px', fontWeight: 900, letterSpacing: '0.03em', marginBottom: '12px' }}>
                {data.city.toUpperCase()}{data.country ? `, ${data.country.toUpperCase()}` : ''}
              </div>
              <div className="flex items-center" style={{ gap: '28px' }}>
                <div style={{ fontFamily: TITLE_FONT, color: '#ffcc00', fontSize: '96px', fontWeight: 900, lineHeight: 1 }}>
                  {data.temperature}°
                </div>
                <div>
                  <div style={{ fontFamily: TITLE_FONT, color: '#fff', fontSize: '40px', fontWeight: 900 }}>
                    {weather!.icon} {weather!.label}
                  </div>
                  <div style={{ fontFamily: BODY_FONT, color: '#88ddff', fontSize: '22px', fontWeight: 700 }}>
                    RESSENTI {data.feelsLike}°
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details panel */}
          <div style={{ width: '92%', background: 'rgba(15, 40, 120, 0.92)', border: '3px solid #5090d8', borderRadius: '4px', boxShadow: '0 3px 15px rgba(0,0,0,0.4)' }}>
            <div style={{
              background: 'linear-gradient(to bottom, #3068b8, #1a3a80)',
              borderBottom: '3px solid #5090d8',
              padding: '8px 18px',
              fontFamily: TITLE_FONT,
              fontSize: '20px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#fff',
              fontWeight: 900,
            }}>
              détails
            </div>
            <div
              className="grid grid-cols-3"
              style={{ padding: '16px 28px', fontFamily: BODY_FONT, fontSize: '22px', fontWeight: 700, gap: '12px 36px' }}
            >
              <div><span style={{ color: '#aaccff' }}>HUMIDITÉ</span> <span style={{ color: '#ffcc00' }}>{data.humidity}%</span></div>
              <div><span style={{ color: '#aaccff' }}>PRESSION</span> <span style={{ color: '#ffcc00' }}>{data.pressure} hPa</span></div>
              <div><span style={{ color: '#aaccff' }}>VENT</span> <span style={{ color: '#ffcc00' }}>{windDir} {data.windSpeed} km/h</span></div>
              <div><span style={{ color: '#aaccff' }}>RAFALES</span> <span style={{ color: '#ffcc00' }}>{data.windGusts} km/h</span></div>
              <div><span style={{ color: '#aaccff' }}>PT ROSÉE</span> <span style={{ color: '#ffcc00' }}>{data.dewPoint}°</span></div>
              <div><span style={{ color: '#aaccff' }}>VISIBILITÉ</span> <span style={{ color: '#ffcc00' }}>{data.visibility} km</span></div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontFamily: BODY_FONT, color: '#fff', fontSize: '20px', fontWeight: 700, letterSpacing: '0.03em', marginBottom: '6px', padding: '0 6px' }}>
            ACTUELLEMENT À <span style={{ color: '#ffcc00' }}>{data.city.toUpperCase()}</span>
            <span style={{ marginLeft: '36px' }}>HUMIDITÉ <span style={{ color: '#ffcc00' }}>{data.humidity}%</span></span>
            <span style={{ marginLeft: '36px' }}>PT ROSÉE <span style={{ color: '#ffcc00' }}>{data.dewPoint}°</span></span>
          </div>
          <div
            className="overflow-hidden whitespace-nowrap"
            style={{
              background: 'rgba(8, 16, 60, 0.94)',
              borderTop: '3px solid #ffcc00',
              fontFamily: BODY_FONT,
              color: '#ffcc00',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '0.03em',
              padding: '8px 14px',
            }}
          >
            <div className="inline-block animate-marquee">
              {ticker}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(1200px); }
          to { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 22s linear infinite;
        }
      `}</style>
    </div>
  );
}
