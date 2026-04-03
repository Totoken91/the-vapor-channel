'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import WeatherBackground from '@/components/SynthwaveBackground';
import TVStatic from '@/components/TVStatic';
import { getWeatherInfo } from '@/lib/wmo-codes';
import { useVaporwaveAudio } from '@/hooks/useVaporwaveAudio';
import { degToCardinal } from '@/lib/wind-direction';
import type { FullWeatherData } from '@/lib/weather';

const T = "'Arial Black', 'Impact', sans-serif";
const B = "'Arial', 'Helvetica Neue', sans-serif";
const JOURS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const MOIS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];

function fmtDate(d: Date) { return `${JOURS[d.getDay()]} ${MOIS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`; }
function fmtHM(d: Date) {
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function fmtSec(d: Date) { return String(d.getSeconds()).padStart(2, '0'); }
function fmtAMPM(d: Date) { return d.getHours() >= 12 ? 'PM' : 'AM'; }

const W = 1200, H = 900;
const PAD_X = 32; // horizontal padding of main container
const SLIDE_W = W - PAD_X * 2; // actual slide area width
const PBG = 'rgba(20, 40, 120, 0.88)';
const PBD = '2px solid #6090d0';
const PAUSE = 4000;
const WIPE_MS = 500;

// SMPTE color bars
const SMPTE = ['#ffffff', '#ffcc00', '#00cccc', '#00cc00', '#cc00cc', '#cc0000', '#0000cc'];

// ================================================================
// useBuild — progressive reveal hook with onDone callback
// ================================================================
function useBuild(total: number, ms = 400, onDone?: () => void, frozen = false) {
  const [s, set] = useState(frozen ? total : 0);
  const doneRef = useRef(false);
  useEffect(() => {
    // Frozen = outgoing slide during wipe — show everything, no animation
    if (frozen) { set(total); return; }
    // No onDone = incoming slide during wipe — show nothing (structure only)
    if (!onDone) { set(0); return; }
    // Normal mode: progressive reveal
    set(0); doneRef.current = false; let c = 0;
    const t = setInterval(() => {
      c++; set(c);
      if (c >= total) { clearInterval(t); if (!doneRef.current) { doneRef.current = true; onDone(); } }
    }, ms);
    return () => clearInterval(t);
  }, [total, ms, onDone, frozen]);
  return s;
}

// Opacity-based reveal: element always in DOM (stable layout), fades in
const reveal = (visible: boolean): React.CSSProperties => ({
  opacity: visible ? 1 : 0,
  transition: 'opacity 0.4s ease-out',
});

// ================================================================
// LOADING SCREEN — multi-phase TV startup
// ================================================================
type LoadPhase = 'static' | 'colorbars' | 'tuning' | 'satellite' | 'done';

function LoadingScreen({ now, dataReady, onReady }: {
  now: Date;
  dataReady: boolean;
  onReady: () => void;
}) {
  const [phase, setPhase] = useState<LoadPhase>('static');
  const [dots, setDots] = useState('');
  const [signalAcquired, setSignalAcquired] = useState(false);
  const [showProduction, setShowProduction] = useState(false);

  // Phase transitions
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('colorbars'), 1500),
      setTimeout(() => setPhase('tuning'), 4500),
      setTimeout(() => setPhase('satellite'), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Show production credit mid-way through colorbars
  useEffect(() => {
    if (phase !== 'colorbars') return;
    const t = setTimeout(() => setShowProduction(true), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // Animated dots for satellite text
  useEffect(() => {
    if (phase !== 'satellite') return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, [phase]);

  // Handle data arrival in satellite phase
  useEffect(() => {
    if (phase === 'satellite' && dataReady && !signalAcquired) {
      setSignalAcquired(true);
      setTimeout(onReady, 1200);
    }
  }, [phase, dataReady, signalAcquired, onReady]);

  // If data arrived before satellite phase, trigger once we reach it
  useEffect(() => {
    if (phase === 'done') return;
    if (phase !== 'satellite' && dataReady) return; // wait for satellite phase
  }, [phase, dataReady]);

  return (
    <div className="relative" style={{ width: `${W}px`, height: `${H}px`, background: '#000', overflow: 'hidden' }}>
      {/* Phase 1: Pure TV static */}
      {phase === 'static' && (
        <TVStatic width={W} height={H} />
      )}

      {/* Phase 2: SMPTE Color bars */}
      {phase === 'colorbars' && (
        <div className="relative" style={{ width: '100%', height: '100%' }}>
          <div style={{ display: 'flex', height: '100%' }}>
            {SMPTE.map((c, i) => (
              <div key={i} style={{ flex: 1, background: c }} />
            ))}
          </div>
          {/* Channel ID overlay */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.7)', padding: '16px 32px', borderRadius: '4px',
          }}>
            {showProduction ? (
              <div key="prod" style={{ fontFamily: B, color: '#ccc', fontSize: '22px', fontWeight: 400, textAlign: 'center', fontStyle: 'italic', animation: 'fadeIn 0.4s ease-out' }}>
                a totoken&apos;s production
              </div>
            ) : (
              <div key="title" style={{ fontFamily: T, color: '#fff', fontSize: '28px', fontWeight: 900, textAlign: 'center' }}>
                THE VAPOR CHANNEL
              </div>
            )}
          </div>
          {/* Static overlay for texture */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <TVStatic width={W} height={H} opacity={0.15} />
          </div>
        </div>
      )}

      {/* Phase 3: Tuning flash (intense static) */}
      {phase === 'tuning' && (
        <TVStatic width={W} height={H} />
      )}

      {/* Phase 4: Satellite connection */}
      {phase === 'satellite' && (
        <div className="flex items-center justify-center" style={{ width: '100%', height: '100%', background: '#0a1530' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: T, color: '#88ddff', fontSize: '36px', fontWeight: 900, marginBottom: '24px' }}>
              THE VAPOR CHANNEL
            </div>
            {signalAcquired ? (
              <div style={{ fontFamily: B, color: '#44ff88', fontSize: '24px', fontWeight: 700 }}>
                SIGNAL ACQUIS
              </div>
            ) : (
              <div style={{ fontFamily: B, color: '#ffcc00', fontSize: '24px', fontWeight: 700, animation: 'pulse 1.5s ease-in-out infinite' }}>
                CONNEXION AU SATELLITE{dots}
              </div>
            )}
            <div style={{ fontFamily: B, color: '#aaccff', fontSize: '18px', marginTop: '16px' }}>
              {fmtDate(now)} — {fmtHM(now)}:{fmtSec(now)} {fmtAMPM(now)}
            </div>
            {/* Progress bar */}
            <div style={{ marginTop: '24px', width: '300px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '24px auto 0' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                background: signalAcquired ? '#44ff88' : 'linear-gradient(to right, #1a4a9a, #ffcc00)',
                width: signalAcquired ? '100%' : '70%',
                transition: 'width 0.5s ease, background 0.3s ease',
              }} />
            </div>
          </div>
          {/* Faint static overlay */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <TVStatic width={W} height={H} opacity={0.05} />
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// SLIDE 1: CONDITIONS ACTUELLES
// ================================================================
function S1({ d, onDone, frozen }: { d: FullWeatherData; onDone?: () => void; frozen?: boolean }) {
  const w = getWeatherInfo(d.current.weatherCode);
  const wd = degToCardinal(d.current.windDirection);
  const s = useBuild(3, 500, onDone, frozen);

  return (
    <div style={{ width: '88%' }}>
      <div style={{ background: PBG, border: PBD, padding: '20px 28px' }}>
        <div style={{ fontFamily: T, color: '#ffd700', fontSize: '28px', fontWeight: 900, marginBottom: '16px' }}>
          {d.current.city.toUpperCase()}{d.current.country ? `, ${d.current.country.toUpperCase()}` : ''}
        </div>
        <div className="flex items-center" style={{ gap: '20px', marginBottom: '16px', ...reveal(s >= 1) }}>
          <div style={{ fontFamily: T, color: '#ffcc00', fontSize: '100px', fontWeight: 900, lineHeight: 0.9 }}>
            {d.current.temperature}°
          </div>
          <div>
            <div style={{ fontFamily: T, color: '#fff', fontSize: '34px', fontWeight: 900 }}>{w.icon} {w.label}</div>
            <div style={{ fontFamily: B, color: '#88ddff', fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>RESSENTI {d.current.feelsLike}°</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #5080c0', paddingTop: '14px' }}>
          <div className="grid grid-cols-3" style={{ fontFamily: B, fontSize: '21px', fontWeight: 700, gap: '8px 24px' }}>
            <div style={reveal(s >= 2)}><span style={{ color: '#aaccff' }}>HUMIDITÉ</span> <span style={{ color: '#ffcc00' }}>{d.current.humidity}%</span></div>
            <div style={reveal(s >= 2)}><span style={{ color: '#aaccff' }}>PRESSION</span> <span style={{ color: '#ffcc00' }}>{d.current.pressure} hPa</span></div>
            <div style={reveal(s >= 2)}><span style={{ color: '#aaccff' }}>VENT</span> <span style={{ color: '#ffcc00' }}>{wd} {d.current.windSpeed} km/h</span></div>
            <div style={reveal(s >= 3)}><span style={{ color: '#aaccff' }}>RAFALES</span> <span style={{ color: '#ffcc00' }}>{d.current.windGusts} km/h</span></div>
            <div style={reveal(s >= 3)}><span style={{ color: '#aaccff' }}>PT ROSÉE</span> <span style={{ color: '#ffcc00' }}>{d.current.dewPoint}°</span></div>
            <div style={reveal(s >= 3)}><span style={{ color: '#aaccff' }}>VISIBILITÉ</span> <span style={{ color: '#ffcc00' }}>{d.current.visibility} km</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// SLIDE 2: TOMORROW'S FORECAST
// ================================================================
function S2({ d, onDone, frozen }: { d: FullWeatherData; onDone?: () => void; frozen?: boolean }) {
  const s = useBuild(d.hourly.length, 500, onDone, frozen);
  return (
    <div style={{ width: '88%' }}>
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
                <div style={{ fontFamily: T, color: '#fff', fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>{slot.time}</div>
                <div style={reveal(s >= i + 1)}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>{w.icon}</div>
                  <div style={{ fontFamily: B, color: '#d0e0ff', fontSize: '16px', fontWeight: 700, marginBottom: '14px', minHeight: '38px' }}>{w.label}</div>
                  <div style={{ fontFamily: T, color: '#ffcc00', fontSize: '52px', fontWeight: 900, lineHeight: 1, marginBottom: '8px' }}>{slot.temperature}°</div>
                  <div style={{ fontFamily: B, color: '#aaccff', fontSize: '15px', fontWeight: 700 }}>{wd} {slot.windSpeed}</div>
                </div>
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
function S3({ d, onDone, frozen }: { d: FullWeatherData; onDone?: () => void; frozen?: boolean }) {
  const s = useBuild(d.daily.length, 400, onDone, frozen);
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
                <div style={{ fontFamily: T, color: '#ffd700', fontSize: '22px', fontWeight: 900 }}>{day.dayName}</div>
                <div style={{ fontFamily: B, color: '#aaccff', fontSize: '14px', marginBottom: '12px' }}>{day.date}</div>
                <div style={reveal(s >= i + 1)}>
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>{w.icon}</div>
                  <div style={{ fontFamily: B, color: '#d0e0ff', fontSize: '14px', fontWeight: 700, marginBottom: '12px', minHeight: '34px' }}>{w.label}</div>
                  <div style={{ fontFamily: T, color: '#ffcc00', fontSize: '36px', fontWeight: 900, lineHeight: 1 }}>{day.tempMax}°</div>
                  <div style={{ fontFamily: B, color: '#88bbdd', fontSize: '22px', fontWeight: 700 }}>{day.tempMin}°</div>
                </div>
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
function S4({ d, onDone, frozen }: { d: FullWeatherData; onDone?: () => void; frozen?: boolean }) {
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const s = useBuild(3, 500, onDone, frozen);

  return (
    <div style={{ width: '88%' }}>
      <div style={{ background: PBG, border: PBD, padding: '24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', marginBottom: '4px' }}>
          <div></div>
          <div style={{ fontFamily: T, color: '#ffd700', fontSize: '26px', fontWeight: 900, textAlign: 'center' }}>{JOURS[today.getDay()]}</div>
          <div style={{ fontFamily: T, color: '#ffd700', fontSize: '26px', fontWeight: 900, textAlign: 'center' }}>{JOURS[tomorrow.getDay()]}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', padding: '16px 0', borderTop: '1px solid #5080c0' }}>
          <div style={{ fontFamily: T, color: '#fff', fontSize: '24px', fontWeight: 900 }}>LEVER</div>
          <div style={{ fontFamily: B, color: '#ffdd66', fontSize: '34px', fontWeight: 700, textAlign: 'center', ...reveal(s >= 1) }}>{d.sun.sunrise}</div>
          <div style={{ fontFamily: B, color: '#ffdd66', fontSize: '34px', fontWeight: 700, textAlign: 'center', ...reveal(s >= 1) }}>{d.sun.sunriseTomorrow}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', padding: '16px 0', borderTop: '1px solid #5080c0' }}>
          <div style={{ fontFamily: T, color: '#fff', fontSize: '24px', fontWeight: 900 }}>COUCHER</div>
          <div style={{ fontFamily: B, color: '#ff9944', fontSize: '34px', fontWeight: 700, textAlign: 'center', ...reveal(s >= 2) }}>{d.sun.sunset}</div>
          <div style={{ fontFamily: B, color: '#ff9944', fontSize: '34px', fontWeight: 700, textAlign: 'center', ...reveal(s >= 2) }}>{d.sun.sunsetTomorrow}</div>
        </div>
        <div style={{ borderTop: '1px solid #5080c0', paddingTop: '16px', marginTop: '8px' }}>
          <div className="grid grid-cols-3" style={{ fontFamily: B, fontSize: '21px', fontWeight: 700, gap: '6px', ...reveal(s >= 3) }}>
            <div><span style={{ color: '#aaccff' }}>HUMIDITÉ</span> <span style={{ color: '#ffcc00' }}>{d.current.humidity}%</span></div>
            <div><span style={{ color: '#aaccff' }}>PT ROSÉE</span> <span style={{ color: '#ffcc00' }}>{d.current.dewPoint}°</span></div>
            <div><span style={{ color: '#aaccff' }}>PRESSION</span> <span style={{ color: '#ffcc00' }}>{d.current.pressure} hPa</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// TICKER — multiple messages + badge
// ================================================================
// Ticker segment: text + color
export interface TickerSeg { text: string; color: string }

const YELLOW = '#ffcc00';
const GREEN = '#44ff88';
const RED = '#ff5555';
const WHITE = '#ddeeff';
const SP = '               ';

// Simulated stock indices — seeded from the date
function stockSegments(): TickerSeg[] {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  function seededRand(s: number) { const x = Math.sin(s) * 43758.5453; return x - Math.floor(x); }
  function idx(name: string, base: number, s: number): TickerSeg[] {
    const pct = (seededRand(s) - 0.45) * 2.5; // -1.25% to +1.375%
    const up = pct >= 0;
    return [
      { text: `${name}  `, color: WHITE },
      { text: `${up ? '▲' : '▼'} ${up ? '+' : ''}${pct.toFixed(2)}%`, color: up ? GREEN : RED },
      { text: SP, color: YELLOW },
    ];
  }
  return [
    ...idx('CAC 40', 7850, seed),
    ...idx('S&P 500', 5420, seed + 1),
    ...idx('NASDAQ', 17200, seed + 2),
    ...idx('DAX', 18500, seed + 3),
    ...idx('NIKKEI', 39800, seed + 4),
  ];
}

// Pool of encouraging/poetic messages — shuffled at each build
const ALL_POEMS = [
  'TU ES EXACTEMENT LÀ OÙ TU DOIS ÊTRE EN CE MOMENT',
  'CHAQUE JOUR EST UNE PAGE BLANCHE QUE TU PEUX REMPLIR DE LUMIÈRE',
  'LE MEILLEUR RESTE À VENIR, LAISSE-TOI PORTER',
  'RESPIRE, TOUT VA BIEN, LE CIEL VEILLE SUR TOI',
  'MÊME LES JOURS GRIS PRÉPARENT LES PLUS BEAUX LEVERS DE SOLEIL',
  'TA PRÉSENCE ILLUMINE LE MONDE PLUS QUE TU NE LE CROIS',
  'IL Y A QUELQUE CHOSE DE BEAU QUI T\'ATTEND AU PROCHAIN TOURNANT',
  'TU PORTES EN TOI TOUTE LA LUMIÈRE DONT TU AS BESOIN',
  'LE MONDE EST PLUS DOUX PARCE QUE TU Y ES',
  'CHAQUE ORAGE FINIT PAR LAISSER PLACE À UN CIEL LAVÉ DE BLEU',
  'TU N\'AS PAS BESOIN D\'ÊTRE PARFAIT POUR ÊTRE EXTRAORDINAIRE',
  'QUELQU\'UN QUELQUE PART SOURIT EN PENSANT À TOI',
  'LA VIE T\'A CHOISI POUR VIVRE CE JOUR PRÉCIS',
  'LAISSE LE VENT EMPORTER CE QUI TE PÈSE',
  'TU ES PLUS FORT QUE TOUT CE QUI TE FAIT DOUTER',
  'DEMAIN LE SOLEIL SE LÈVERA AUSSI POUR TOI',
  'DANS LE SILENCE DU SOIR, TON CŒUR SAIT DÉJÀ LE CHEMIN',
  'CHAQUE BATTEMENT EST UNE PROMESSE QUE LA VIE TE FAIT',
  'TU MÉRITES TOUTE LA DOUCEUR QUE CE MONDE PEUT OFFRIR',
  'LES ÉTOILES BRILLENT MÊME QUAND TU NE LES VOIS PAS',
];

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildTicker(d: FullWeatherData): TickerSeg[] {
  const w = getWeatherInfo(d.current.weatherCode);
  const wd = degToCardinal(d.current.windDirection);
  const sep: TickerSeg = { text: SP, color: YELLOW };

  // Pick 6 random poems from the pool, different every time
  const poems = shuffle(ALL_POEMS).slice(0, 6);

  return [
    { text: `${d.current.city.toUpperCase()} : ${d.current.temperature}°C ${w.label}   HUMIDITÉ ${d.current.humidity}%   VENT ${wd} ${d.current.windSpeed} KM/H`, color: YELLOW },
    sep,
    { text: poems[0], color: WHITE },
    sep,
    ...stockSegments(),
    { text: poems[1], color: WHITE },
    sep,
    { text: `PRÉVISIONS   ${d.daily.map(day => `${day.dayName}: ${day.tempMax}°/${day.tempMin}°`).join('   ')}`, color: YELLOW },
    sep,
    { text: poems[2], color: WHITE },
    sep,
    { text: `LEVER ${d.sun.sunrise}   COUCHER ${d.sun.sunset}   PRESSION ${d.current.pressure} HPA`, color: YELLOW },
    sep,
    { text: poems[3], color: WHITE },
    sep,
    { text: poems[4], color: WHITE },
    sep,
    { text: poems[5], color: WHITE },
  ];
}

const TITLES = ['conditions actuelles', "tomorrow's forecast", 'extended forecast', 'almanac'];
const N = 4;

// ================================================================
// TICKER CANVAS — draws colored segments on a 2D canvas at 60fps.
// html2canvas copies canvas pixels instantly (no DOM re-render).
// ================================================================
function TickerCanvas({ segments, speed = 50 }: { segments: TickerSeg[]; speed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const xRef = useRef<number | null>(null);
  const totalWidthRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.offsetWidth;
    const h = parent.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const FONT = 'bold 18px Arial, Helvetica Neue, sans-serif';
    ctx.font = FONT;

    const measured = segments.map(s => ({ ...s, w: ctx.measureText(s.text).width }));
    totalWidthRef.current = measured.reduce((sum, s) => sum + s.w, 0);
    if (xRef.current === null) xRef.current = w;

    let raf: number;
    let last = performance.now();

    function draw(now: number) {
      const dt = (now - last) / 1000;
      last = now;

      xRef.current! -= speed * dt;
      if (xRef.current! < -totalWidthRef.current) xRef.current = w;

      ctx!.clearRect(0, 0, w, h);
      ctx!.font = FONT;
      ctx!.textBaseline = 'middle';

      let x = xRef.current!;
      for (const seg of measured) {
        if (x + seg.w > 0 && x < w) {
          ctx!.fillStyle = seg.color;
          ctx!.fillText(seg.text, x, h / 2);
        }
        x += seg.w;
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [segments, speed]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}

// ================================================================
// MAIN COMPONENT
// ================================================================
interface Props { data: FullWeatherData | null; loading: boolean; }

export default function WeatherContent({ data, loading }: Props) {
  const [now, setNow] = useState(new Date());
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Wipe transition state — CSS-driven, no rAF
  const [wiping, setWiping] = useState(false);
  const [outIdx, setOutIdx] = useState(0);
  const [inIdx, setInIdx] = useState(0);
  useVaporwaveAudio();

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const onLoadingDone = useCallback(() => setStarted(true), []);

  const wipeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start wipe: set states + setTimeout to end it (no onAnimationEnd)
  const startWipe = useCallback(() => {
    const nextIdx = (idxRef.current + 1) % N;
    setOutIdx(idxRef.current);
    setInIdx(nextIdx);
    setWiping(true);
    wipeTimerRef.current = setTimeout(() => {
      idxRef.current = nextIdx;
      setIdx(nextIdx);
      setWiping(false);
    }, WIPE_MS);
  }, []);

  // Called by each slide when its build animation finishes
  const onSlideDone = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(startWipe, PAUSE);
  }, [startWipe]);

  // Cleanup
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (wipeTimerRef.current) clearTimeout(wipeTimerRef.current);
  }, []);

  // ---- LOADING SCREEN ----
  if (!started) {
    return (
      <LoadingScreen
        now={now}
        dataReady={!loading && data !== null}
        onReady={onLoadingDone}
      />
    );
  }

  // Should not happen but guard
  if (!data) return null;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ticker = useMemo(() => buildTicker(data), [data]);
  const titleIdx = wiping ? inIdx : idx;

  return (
    <div className="relative overflow-hidden" style={{ width: `${W}px`, height: `${H}px`, background: '#000' }}>
      <div className="absolute inset-0"><WeatherBackground /></div>

      <div className="relative z-10 flex flex-col h-full" style={{ padding: '24px 32px' }}>
        {/* ===== HEADER ===== */}
        <header className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
          {/* Logo + mascot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#1a4a9a', border: '3px solid #7ab0e8', borderRadius: '6px', padding: '6px 12px' }}>
              <div style={{ textAlign: 'center', lineHeight: 1.15 }}>
                <div style={{ fontFamily: T, color: '#fff', fontSize: '14px', fontWeight: 900 }}>THE</div>
                <div style={{ fontFamily: T, color: '#fff', fontSize: '18px', fontWeight: 900 }}>VAPOR</div>
                <div style={{ fontFamily: T, color: '#fff', fontSize: '14px', fontWeight: 900 }}>CHANNEL</div>
              </div>
            </div>
            <img src="/hampopo.png" alt="" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
          </div>

          {/* Slide title */}
          <div style={{
            fontFamily: B, color: '#ffd700', fontSize: '32px', fontWeight: 700,
            textShadow: '0 0 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7), 2px 2px 4px rgba(0,0,0,0.8)',
          }}>
            {TITLES[titleIdx]}
          </div>

          {/* ===== BROADCAST CLOCK PANEL ===== */}
          <div style={{
            background: 'rgba(10, 20, 80, 0.92)',
            border: '2px solid #6090d0',
            borderRadius: '4px',
            padding: '8px 16px',
            textAlign: 'center',
            minWidth: '200px',
          }}>
            <div style={{
              fontFamily: T, color: '#aaccff', fontSize: '16px', fontWeight: 900,
              letterSpacing: '0.12em', borderBottom: '1px solid #4070b0',
              paddingBottom: '4px', marginBottom: '6px',
            }}>
              {fmtDate(now)}
            </div>
            <div style={{ fontFamily: T, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
              <span style={{ color: '#fff', fontSize: '36px', fontWeight: 900 }}>
                {fmtHM(now)}
              </span>
              <span style={{ color: '#ffcc00', fontSize: '28px', fontWeight: 900 }}>
                :{fmtSec(now)}
              </span>
              <span style={{ color: '#aaccff', fontSize: '16px', fontWeight: 700, marginLeft: '4px' }}>
                {fmtAMPM(now)}
              </span>
            </div>
          </div>
        </header>

        {/* ===== SLIDE AREA WITH WIPE ===== */}
        <div className="flex-1 flex flex-col items-center justify-center" style={{ position: 'relative', overflow: 'hidden' }}>
          {wiping ? (
            <>
              {/* Outgoing slide — shrinks from right, clipped from left */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0, right: 0,
                overflow: 'hidden',
                animation: `wipeHide ${WIPE_MS}ms ease-in-out forwards`,
              }}>
                <div style={{
                  width: `${SLIDE_W}px`, height: '100%',
                  position: 'absolute', top: 0, right: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  {renderSlide(outIdx, data, undefined, true)}
                </div>
              </div>
              {/* Incoming slide — revealed from left via width-growing wrapper */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0,
                overflow: 'hidden',
                animation: `wipeReveal ${WIPE_MS}ms ease-in-out forwards`,
              }}>
                <div style={{
                  width: `${SLIDE_W}px`, height: '100%',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  {renderSlide(inIdx, data, undefined, false)}
                </div>
              </div>
              {/* Wipe line */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                width: '3px',
                background: '#ffcc00',
                boxShadow: '0 0 8px rgba(255, 204, 0, 0.6)',
                zIndex: 10,
                animation: `wipeLine ${WIPE_MS}ms ease-in-out forwards`,
              }} />
            </>
          ) : (
            renderSlide(idx, data, onSlideDone)
          )}
        </div>

        {/* ===== BOTTOM: INFO BAR + TICKER ===== */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontFamily: B, color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
            ACTUELLEMENT À <span style={{ color: '#ffcc00' }}>{data.current.city.toUpperCase()}</span>
            <span style={{ marginLeft: '28px' }}>HUMIDITÉ <span style={{ color: '#ffcc00' }}>{data.current.humidity}%</span></span>
            <span style={{ marginLeft: '28px' }}>PT ROSÉE <span style={{ color: '#ffcc00' }}>{data.current.dewPoint}°</span></span>
          </div>

          {/* Ticker bar with badge */}
          <div style={{ display: 'flex', borderTop: '3px solid #ffcc00' }}>
            <div style={{
              background: 'linear-gradient(to bottom, #cc2200, #990000)',
              color: '#fff', fontFamily: T, fontSize: '14px', fontWeight: 900,
              padding: '7px 14px', whiteSpace: 'nowrap',
              borderRight: '2px solid #ffcc00',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center',
            }}>
              MÉTÉO EN DIRECT
            </div>
            <div style={{
              flex: 1, background: 'rgba(8, 16, 60, 0.94)',
              height: '34px', overflow: 'hidden',
            }}>
              <TickerCanvas segments={ticker} speed={50} />
            </div>
          </div>
        </div>
      </div>
      <style>{`
@keyframes wipeReveal { from { width: 0%; } to { width: 100%; } }
        @keyframes wipeHide { from { width: 100%; } to { width: 0%; } }
        @keyframes wipeLine { from { left: 0%; } to { left: 100%; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

// Helper to render a slide by index
// frozen=true → outgoing wipe (fully built), frozen=false → incoming wipe (empty)
function renderSlide(i: number, data: FullWeatherData, onDone?: () => void, frozen?: boolean) {
  const k = `s${i}-${frozen === true ? 'fo' : frozen === false ? 'fi' : 'a'}`;
  switch (i) {
    case 0: return <S1 key={k} d={data} onDone={onDone} frozen={frozen === true} />;
    case 1: return <S2 key={k} d={data} onDone={onDone} frozen={frozen === true} />;
    case 2: return <S3 key={k} d={data} onDone={onDone} frozen={frozen === true} />;
    case 3: return <S4 key={k} d={data} onDone={onDone} frozen={frozen === true} />;
    default: return null;
  }
}
