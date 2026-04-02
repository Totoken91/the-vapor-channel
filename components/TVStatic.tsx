'use client';

import { useRef, useEffect, type CSSProperties } from 'react';

interface Props {
  width: number;
  height: number;
  opacity?: number;
  style?: CSSProperties;
}

export default function TVStatic({ width, height, opacity = 1, style }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = ctx.createImageData(width, height);
    const buf = img.data;
    let raf = 0;
    let last = 0;

    function draw(t: number) {
      raf = requestAnimationFrame(draw);
      if (t - last < 83) return; // ~12fps
      last = t;
      for (let i = 0; i < buf.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        buf[i] = v;
        buf[i + 1] = v;
        buf[i + 2] = v;
        buf[i + 3] = 255;
      }
      ctx!.putImageData(img, 0, 0);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return (
    <canvas
      ref={ref}
      style={{
        display: 'block',
        width: `${width}px`,
        height: `${height}px`,
        opacity,
        ...style,
      }}
    />
  );
}
