'use client';

import { useEffect, useRef, useMemo } from 'react';
import { buildTicker, type TickerSeg } from '@/components/WeatherContent';
import type { FullWeatherData } from '@/lib/weather';

const SPEED = 50; // px/s

export default function TickerOverlay({ data }: { data: FullWeatherData | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<number | null>(null);

  const segments = useMemo(() => (data ? buildTicker(data) : []), [data]);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner || segments.length === 0) return;

    let raf: number;
    let last = performance.now();

    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      const cw = container!.offsetWidth;
      const tw = inner!.scrollWidth;
      if (xRef.current === null) xRef.current = cw;
      xRef.current -= SPEED * dt;
      if (xRef.current < -tw) xRef.current = cw;
      inner!.style.transform = `translateX(${xRef.current}px)`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [segments]);

  if (!data) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '34px',
        overflow: 'hidden',
        background: 'rgba(8, 16, 60, 0.94)',
        zIndex: 20,
      }}
    >
      <div
        ref={innerRef}
        style={{
          display: 'inline-flex',
          whiteSpace: 'nowrap',
          height: '100%',
          alignItems: 'center',
          willChange: 'transform',
        }}
      >
        {segments.map((seg, i) => (
          <span
            key={i}
            style={{
              color: seg.color,
              fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            {seg.text}
          </span>
        ))}
      </div>
    </div>
  );
}
