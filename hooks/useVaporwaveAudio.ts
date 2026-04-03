'use client';

import { useRef, useCallback } from 'react';

// ── Vaporwave audio — streams MP3 from Cloudflare R2 ───────────────
// Exposes a start() function to be called from a user gesture (button).

const MUSIC_URL =
  'https://pub-cce9bd3456b24b61a1077f12412bce57.r2.dev/8%20Hours%20of%20Weather%20Channel%20Vaporwave%20(mp3cut.net).mp3';

export function useVaporwaveAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const start = useCallback(() => {
    if (audioRef.current) return;
    try {
      const audio = new Audio(MUSIC_URL);
      audio.loop = true;
      audio.volume = 0.6;
      audio.crossOrigin = 'anonymous';
      audio.play().catch((err) => {
        console.warn('audio play failed:', err);
      });
      audioRef.current = audio;
    } catch (err) {
      console.warn('audio boot failed:', err);
    }
  }, []);

  return { start };
}
