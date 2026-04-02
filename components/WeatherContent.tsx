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
const PBG = 'rgba(20, 40, 120, 0.88)';
const PBD = '2px solid #6090d0';

const PAUSE = 4000; // ms to hold after animation finishes

function useBuild(total: number, ms = 400, onDone?: () => void) {
  const [s, set] = useState(0);
  const doneRef = useRef(false);
  useEffect(() => {
    set(0); doneRef.current = false; let c = 0;
    const t = setInterval(() => {
      c++; set(c);
      if (c >= total) { clearInterval(t); if (!doneRef.current) { doneRef.current = true; onDone?.(); } }
    }, ms);
    return () => clearInterval(t);
  }, [total, ms, onDone]);
  return s;
}

// ================================================================
// SLIDE 1: CONDITIONS ACTUELLES
// Panel structure always visible, data fills in progressively
// ================================================================
function S1({ d, onDone }: { d: FullWeatherData; onDone?: () => void }) {
  const w = getWeatherInfo(d.current.weatherCode);
  const wd = degToCardinal(d.current.windDirection);
  const s = useBuild(3, 500, onDone);

  return (
    <div style={{ width: '88%' }}>
      <div style={{ background: PBG, border: PBD, padding: '20px 28px' }}>
        {/* City name — always visible as part of panel structure */}
        <div style={{ fontFamily: T, color: '#ffd700', fontSize: '28px', fontWeight: 900, marginBottom: '16px' }}>
          {d.current.city.toUpperCase()}{d.current.country ? `, ${d.current.country.toUpperCase()}` : ''}
        </div>

        {/* Main weather: temp + condition — step 1 */}
        <div className="flex items-center" style={{ gap: '20px', marginBottom: '16px', minHeight: '100px' }}>
          {s >= 1 && (
            <>
              <div style={{ fontFamily: T, color: '#ffcc00', fontSize: '100px', fontWeight: 900, lineHeight: 0.9 }}>
                {d.current.temperature}°
              </div>
              <div>
                <div style={{ fontFamily: T, color: '#fff', fontSize: '34px', fontWeight: 900 }}>{w.label}</div>
                <div style={{ fontFamily: B, color: '#88ddff', fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>RESSENTI {d.current.feelsLike}°</div>
              </div>
            </>
          )}
        </div>

        {/* Separator + details — step 2 */}
        <div style={{ borderTop: '1px solid #5080c0', paddingTop: '14px', minHeight: '60px' }}>
          {s >= 2 && (
            <div className="grid grid-cols-3" style={{ fontFamily: B, fontSize: '21px', fontWeight: 700, gap: '8px 24px' }}>
              <div><span style={{ color: '#aaccff' }}>HUMIDITÉ</span> <span style={{ color: '#ffcc00' }}>{d.current.humidity}%</span></div>
              <div><span style={{ color: '#aaccff' }}>PRESSION</span> <span style={{ color: '#ffcc00' }}>{d.current.pressure} hPa</span></div>
              <div><span style={{ color: '#aaccff' }}>VENT</span> <span style={{ color: '#ffcc00' }}>{wd} {d.current.windSpeed} km/h</span></div>
              {s >= 3 && <div><span style={{ color: '#aaccff' }}>RAFALES</span> <span style={{ color: '#ffcc00' }}>{d.current.windGusts} km/h</span></div>}
              {s >= 3 && <div><span style={{ color: '#aaccff' }}>PT ROSÉE</span> <span style={{ color: '#ffcc00' }}>{d.current.dewPoint}°</span></div>}
              {s >= 3 && <div><span style={{ color: '#aaccff' }}>VISIBILITÉ</span> <span style={{ color: '#ffcc00' }}>{d.current.visibility} km</span></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// SLIDE 2: TOMORROW'S FORECAST
// Panel + column headers visible immediately, data fills column by column
// ================================================================
function S2({ d, onDone }: { d: FullWeatherData; onDone?: () => void }) {
  const s = useBuild(d.hourly.length, 500, onDone);
  return (
    <div style={{ width: '88%' }}>
      {/* City name above panel */}
      <div style={{ fontFamily: T, color: '#ffd700', fontSize: '24px', fontWeight: 900, marginBottom: '8px', padding: '0 4px' }}>
        {d.current.city.toUpperCase()}
      </div>
      <div style={{ background: PBG, border: PBD }}>
        <div className="grid grid-cols-4" style={{ gap: '0' }}>
          {d.hourly.map((slot, i) => {
            const w = getWeatherInfo(slot.weatherCode);
            const wd = degToCardinal(slot.windDirection);
            return (
              <div key={i} style={{
                textAlign: 'center', padding: '16px 8px',
                borderRight: i < d.hourly.length - 1 ? '1px solid #5080c0' : 'none',
              }}>
                {/* Time header — always visible */}
                <div style={{ fontFamily: T, color: '#fff', fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>{slot.time}</div>
                {/* Data fills in per column */}
                {s >= i + 1 ? (
                  <>
                    <div style={{ fontFamily: B, color: '#d0e0ff', fontSize: '16px', fontWeight: 700, marginBottom: '14px', minHeight: '38px' }}>{w.label}</div>
                    <div style={{ fontFamily: T, color: '#ffcc00', fontSize: '52px', fontWeight: 900, lineHeight: 1, marginBottom: '8px' }}>{slot.temperature}°</div>
                    <div style={{ fontFamily: B, color: '#aaccff', fontSize: '15px', fontWeight: 700 }}>{wd} {slot.windSpeed}</div>
                  </>
                ) : (
                  <div style={{ minHeight: '130px' }} />
                )}
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
// Panel + day headers visible immediately, data fills day by day
// ================================================================
function S3({ d, onDone }: { d: FullWeatherData; onDone?: () => void }) {
  const s = useBuild(d.daily.length, 400, onDone);
  return (
    <div style={{ width: '88%' }}>
      <div style={{ background: PBG, border: PBD }}>
        <div className="grid grid-cols-5" style={{ gap: '0' }}>
          {d.daily.map((day, i) => {
            const w = getWeatherInfo(day.weatherCode);
            return (
              <div key={i} style={{
                textAlign: 'center', padding: '14px 6px',
                borderRight: i < d.daily.length - 1 ? '1px solid #5080c0' : 'none',
              }}>
                {/* Day headers — always visible */}
                <div style={{ fontFamily: T, color: '#ffd700', fontSize: '22px', fontWeight: 900 }}>{day.dayName}</div>
                <div style={{ fontFamily: B, color: '#aaccff', fontSize: '14px', marginBottom: '12px' }}>{day.date}</div>
                {/* Data fills in per day */}
                {s >= i + 1 ? (
                  <>
                    <div style={{ fontFamily: B, color: '#d0e0ff', fontSize: '14px', fontWeight: 700, marginBottom: '12px', minHeight: '34px' }}>{w.label}</div>
                    <div style={{ fontFamily: T, color: '#ffcc00', fontSize: '36px', fontWeight: 900, lineHeight: 1 }}>{day.tempMax}°</div>
                    <div style={{ fontFamily: B, color: '#88bbdd', fontSize: '22px', fontWeight: 700 }}>{day.tempMin}°</div>
                  </>
                ) : (
                  <div style={{ minHeight: '100px' }} />
                )}
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
// Table structure visible immediately, rows fill in progressively
// ================================================================
function S4({ d, onDone }: { d: FullWeatherData; onDone?: () => void }) {
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const s = useBuild(3, 500, onDone);

  return (
    <div style={{ width: '88%' }}>
      <div style={{ background: PBG, border: PBD, padding: '24px 28px' }}>
        {/* Table headers — always visible */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', marginBottom: '4px' }}>
          <div></div>
          <div style={{ fontFamily: T, color: '#ffd700', fontSize: '26px', fontWeight: 900, textAlign: 'center' }}>{JOURS[today.getDay()]}</div>
          <div style={{ fontFamily: T, color: '#ffd700', fontSize: '26px', fontWeight: 900, textAlign: 'center' }}>{JOURS[tomorrow.getDay()]}</div>
        </div>

        {/* Sunrise row — step 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', padding: '16px 0', borderTop: '1px solid #5080c0' }}>
          <div style={{ fontFamily: T, color: '#fff', fontSize: '24px', fontWeight: 900 }}>LEVER</div>
          {s >= 1 ? (
            <>
              <div style={{ fontFamily: B, color: '#ffdd66', fontSize: '34px', fontWeight: 700, textAlign: 'center' }}>{d.sun.sunrise}</div>
              <div style={{ fontFamily: B, color: '#ffdd66', fontSize: '34px', fontWeight: 700, textAlign: 'center' }}>{d.sun.sunriseTomorrow}</div>
            </>
          ) : (<><div /><div /></>)}
        </div>

        {/* Sunset row — step 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', padding: '16px 0', borderTop: '1px solid #5080c0' }}>
          <div style={{ fontFamily: T, color: '#fff', fontSize: '24px', fontWeight: 900 }}>COUCHER</div>
          {s >= 2 ? (
            <>
              <div style={{ fontFamily: B, color: '#ff9944', fontSize: '34px', fontWeight: 700, textAlign: 'center' }}>{d.sun.sunset}</div>
              <div style={{ fontFamily: B, color: '#ff9944', fontSize: '34px', fontWeight: 700, textAlign: 'center' }}>{d.sun.sunsetTomorrow}</div>
            </>
          ) : (<><div /><div /></>)}
        </div>

        {/* Bottom conditions — step 3 */}
        <div style={{ borderTop: '1px solid #5080c0', paddingTop: '16px', marginTop: '8px', minHeight: '50px' }}>
          {s >= 3 && (
            <div className="grid grid-cols-3" style={{ fontFamily: B, fontSize: '21px', fontWeight: 700, gap: '6px' }}>
              <div><span style={{ color: '#aaccff' }}>HUMIDITÉ</span> <span style={{ color: '#ffcc00' }}>{d.current.humidity}%</span></div>
              <div><span style={{ color: '#aaccff' }}>PT ROSÉE</span> <span style={{ color: '#ffcc00' }}>{d.current.dewPoint}°</span></div>
              <div><span style={{ color: '#aaccff' }}>PRESSION</span> <span style={{ color: '#ffcc00' }}>{d.current.pressure} hPa</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================================================
const TITLES = ['conditions actuelles', "tomorrow's forecast", 'extended forecast', 'almanac'];
const N = 4;

interface Props { data: FullWeatherData | null; loading: boolean; }

export default function WeatherContent({ data, loading }: Props) {
  const [now, setNow] = useState(new Date());
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  // Called by each slide when its build animation finishes
  const onSlideDone = useCallback(() => {
    // Wait PAUSE ms after animation ends, then transition
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % N;
        setIdx(idxRef.current);
        setShow(true);
      }, 250);
    }, PAUSE);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center" style={{ width: `${W}px`, height: `${H}px`, background: '#0a1530' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: T, color: '#88ddff', fontSize: '36px', fontWeight: 900, marginBottom: '24px' }}>THE VAPOR CHANNEL</div>
          <div style={{ fontFamily: B, color: '#ffcc00', fontSize: '24px', fontWeight: 700 }}>CONNEXION AU SATELLITE...</div>
          <div style={{ fontFamily: B, color: '#aaccff', fontSize: '18px', marginTop: '16px' }}>{fmtDate(now)} — {fmtTime(now)}</div>
        </div>
      </div>
    );
  }

  const w = getWeatherInfo(data.current.weatherCode);
  const wd = degToCardinal(data.current.windDirection);
  const ticker = `BULLETIN MÉTÉO ━ ${data.current.city.toUpperCase()} : ${data.current.temperature}°C ${w.label} ━ HUMIDITÉ ${data.current.humidity}% ━ VENT ${wd} ${data.current.windSpeed} KM/H ━ THE VAPOR CHANNEL ━ MÉTÉO EN DIRECT ━`;

  return (
    <div className="relative overflow-hidden" style={{ width: `${W}px`, height: `${H}px`, background: '#000' }}>
      <div className="absolute inset-0"><WeatherBackground /></div>

      <div className="relative z-10 flex flex-col h-full" style={{ padding: '24px 32px' }}>
        {/* Header */}
        <header className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
          <div style={{ background: '#1a4a9a', border: '3px solid #7ab0e8', borderRadius: '6px', padding: '6px 12px' }}>
            <div style={{ textAlign: 'center', lineHeight: 1.15 }}>
              <div style={{ fontFamily: T, color: '#fff', fontSize: '14px', fontWeight: 900 }}>THE</div>
              <div style={{ fontFamily: T, color: '#fff', fontSize: '18px', fontWeight: 900 }}>VAPOR</div>
              <div style={{ fontFamily: T, color: '#fff', fontSize: '14px', fontWeight: 900 }}>CHANNEL</div>
            </div>
          </div>
          <div style={{ fontFamily: B, color: '#fff', fontSize: '32px', fontWeight: 700, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            {TITLES[idx]}
          </div>
          <div style={{ fontFamily: B, color: '#fff', textAlign: 'right', textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: '17px', fontWeight: 700 }}>{fmtDate(now)}</div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>{fmtTime(now)}</div>
          </div>
        </header>

        {/* Slide */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {show && idx === 0 && <S1 key="s0" d={data} onDone={onSlideDone} />}
          {show && idx === 1 && <S2 key="s1" d={data} onDone={onSlideDone} />}
          {show && idx === 2 && <S3 key="s2" d={data} onDone={onSlideDone} />}
          {show && idx === 3 && <S4 key="s3" d={data} onDone={onSlideDone} />}
        </div>

        {/* Bottom */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontFamily: B, color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
            ACTUELLEMENT À <span style={{ color: '#ffcc00' }}>{data.current.city.toUpperCase()}</span>
            <span style={{ marginLeft: '28px' }}>HUMIDITÉ <span style={{ color: '#ffcc00' }}>{data.current.humidity}%</span></span>
            <span style={{ marginLeft: '28px' }}>PT ROSÉE <span style={{ color: '#ffcc00' }}>{data.current.dewPoint}°</span></span>
          </div>
          <div className="overflow-hidden whitespace-nowrap" style={{ background: 'rgba(8, 16, 60, 0.94)', borderTop: '3px solid #ffcc00', fontFamily: B, color: '#ffcc00', fontSize: '18px', fontWeight: 700, padding: '7px 14px' }}>
            <div style={{ display: 'inline-block', animation: 'marquee 22s linear infinite' }}>{ticker}</div>
          </div>
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(${W}px); } to { transform: translateX(-100%); } }`}</style>
    </div>
  );
}
