'use client';

import { useRef, useEffect } from 'react';

// ── Vaporwave audio — streams MP3 from Cloudflare R2 ───────────────
// Auto-starts on first user interaction (browser autoplay policy).
// Falls back to silence if the file can't be loaded.

const MUSIC_URL =
  'https://pub-cce9bd3456b24b61a1077f12412bce57.r2.dev/8%20Hours%20of%20Weather%20Channel%20Vaporwave%20(mp3cut.net).mp3';

export function useVaporwaveAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    function boot() {
      if (audioRef.current) return;
      try {
        const audio = new Audio(MUSIC_URL);
        audio.loop = true;
        audio.volume = 0.6;
        audio.crossOrigin = 'anonymous';
        audio.play().catch(() => {
          // Autoplay blocked — will retry on next interaction
          audioRef.current = null;
          return;
        });
        audioRef.current = audio;
      } catch (err) {
        console.warn('audio boot failed:', err);
        return;
      }
      window.removeEventListener('click', boot);
      window.removeEventListener('touchstart', boot);
      window.removeEventListener('keydown', boot);
    }

    window.addEventListener('click', boot, { once: false });
    window.addEventListener('touchstart', boot, { once: false });
    window.addEventListener('keydown', boot, { once: false });

    return () => {
      window.removeEventListener('click', boot);
      window.removeEventListener('touchstart', boot);
      window.removeEventListener('keydown', boot);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);
}
