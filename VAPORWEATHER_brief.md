# 🌊 VaporWeather — Project Brief for Claude Code

## Vision

Créer un site web qui reproduit l'esthétique des bulletins météo des années 80 (style Weather Channel USA) avec des effets VHS/vaporwave, mais qui affiche la **vraie météo en temps réel**. L'ambiance doit évoquer les vidéos YouTube "Weather Channel Vaporwave" mais en interactif, dans le navigateur, avec de la musique chill générative.

---

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **Styling** : Tailwind CSS + CSS Modules pour les effets VHS
- **Déploiement** : Vercel
- **API météo** : Open-Meteo (gratuit, sans clé API) + Open-Meteo Geocoding
- **Audio** : Web Audio API (synthé vaporwave génératif, pas de fichier MP3 à héberger)
- **Fonts** : VT323 + Share Tech Mono (Google Fonts) — look terminal/80s

---

## Fonctionnalités à implémenter

### Core (MVP)

1. **Affichage météo temps réel**
   - Géolocalisation automatique au chargement (`navigator.geolocation`)
   - Recherche manuelle par ville (input + touche Entrée)
   - Données affichées : température, ressenti, humidité, pression, vent (direction + vitesse), rafales, point de rosée, visibilité, condition météo
   - Conversion WMO weather codes → labels FR + emoji

2. **Esthétique VHS/Vaporwave**
   - Fond : ciel dégradé synthwave (violet foncé → rose → orange horizon)
   - Soleil stylisé avec rayures noires (comme les vieux écrans météo)
   - Grille perspective au sol (style Miami Vice / vaporwave)
   - Montagnes silhouettées SVG en arrière-plan
   - Scanlines animées (CSS, overlay semi-transparent)
   - Barre de glitch qui traverse l'écran périodiquement
   - Grain VHS (SVG feTurbulence ou canvas noise)
   - Texte avec effet "double" cyan/magenta (text-shadow décalé)
   - Header style "THE WEATHER CHANNEL" avec logo retro

3. **Ticker de bas d'écran**
   - Défilement horizontal en boucle du bulletin météo
   - Texte généré dynamiquement avec les données de la ville

4. **Horloge en temps réel**
   - Format style broadcast : `VEN AVR 02  22:14:35`
   - Mise à jour chaque seconde

5. **Musique vaporwave générative**
   - Bouton ON/OFF
   - Accords lents (sine wave) sur une grille harmonique
   - Basse triangle douce
   - Reverb synthétique (ConvolverNode avec impulse response généré)
   - Pas de fichier audio externe — 100% Web Audio API

6. **Écran de chargement**
   - Style "signal VHS en cours de synchro"
   - Barre de progression
   - Messages qui changent : "CONNEXION AU SATELLITE..." → "DÉCODAGE VHS..." → "CALIBRAGE IMAGE..."

### Extensions (post-MVP)

7. **Prévisions 5 jours**
   - Tableau horizontal style bulletin hebdo 80s
   - Icônes météo vectorielles retro

8. **Changement d'ambiance selon météo**
   - Soleil : palette chaude orange/rose
   - Pluie : palette froide bleue/verte
   - Nuit : palette sombre violette + étoiles

9. **Mode "Chaîne TV"**
   - Cycle automatique entre plusieurs villes (Paris, Lyon, Marseille...)
   - Transition style "changement de slide" avec effet de scan

---

## Architecture des fichiers

```
vaporweather/
├── app/
│   ├── layout.tsx          # Fonts Google, metadata
│   ├── page.tsx            # Page principale
│   └── globals.css         # Variables CSS, animations VHS globales
├── components/
│   ├── WeatherDisplay.tsx  # Panel principal météo (données + esthétique)
│   ├── VHSEffects.tsx      # Scanlines, glitch bar, grain overlay
│   ├── SynthwaveBackground.tsx  # Ciel, soleil, grille, montagnes SVG
│   ├── AudioEngine.tsx     # Web Audio API, bouton ON/OFF
│   ├── CitySearch.tsx      # Input recherche ville
│   ├── Ticker.tsx          # Défilement bas d'écran
│   ├── LoadingScreen.tsx   # Écran de chargement VHS
│   └── Clock.tsx           # Horloge temps réel
├── lib/
│   ├── weather.ts          # Fetch Open-Meteo + géocodage
│   ├── wmo-codes.ts        # Table WMO → label FR + emoji
│   └── wind-direction.ts   # Degrés → N/NE/E/SE/S/SO/O/NO
├── hooks/
│   ├── useWeather.ts       # Hook météo avec géoloc auto
│   └── useAudio.ts         # Hook Web Audio API
└── public/
    └── (pas d'assets requis pour le MVP)
```

---

## Détails API Open-Meteo

```typescript
// Géocodage
const GEO_URL = `https://geocoding-api.open-meteo.com/v1/search?name={CITY}&count=1&language=fr&format=json`

// Météo actuelle
const WX_URL = `https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&current=temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,weather_code&wind_speed_unit=kmh&timezone=auto`

// Prévisions 5 jours (extension)
// Ajouter &daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum
```

Aucune clé API requise. Gratuit. Limites généreuses (10 000 req/jour).

---

## Palette de couleurs (CSS variables à définir dans globals.css)

```css
:root {
  --vw-bg-deep:    #0a0015;   /* fond noir violet profond */
  --vw-sky-top:    #0d0030;   /* ciel haut */
  --vw-sky-mid:    #1a0050;   /* ciel milieu */
  --vw-sky-low:    #2a0080;   /* ciel bas */
  --vw-horizon:    #ff69b4;   /* rose horizon */
  --vw-sun-top:    #ffee00;   /* jaune soleil haut */
  --vw-sun-bot:    #ff1493;   /* rose soleil bas */
  --vw-grid:       #00ffff;   /* cyan grille */
  --vw-pink:       #ff69b4;   /* rose principal */
  --vw-cyan:       #00eeff;   /* cyan principal */
  --vw-yellow:     #ffee00;   /* jaune température */
  --vw-panel-bg:   rgba(10,0,50,0.82);  /* fond panneaux */
  --vw-text:       #ffffff;
  --vw-text-dim:   #aaeeff;
}
```

---

## Effets VHS — implémentation CSS clés

```css
/* Scanlines */
.scanlines {
  background: repeating-linear-gradient(
    0deg,
    transparent, transparent 2px,
    rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px
  );
  animation: scanroll 8s linear infinite;
  pointer-events: none;
}
@keyframes scanroll {
  from { background-position: 0 0; }
  to   { background-position: 0 200px; }
}

/* Glitch text */
.glitch-text {
  text-shadow: 2px 0 #ff69b4, -2px 0 #00ffff;
}

/* Barre de glitch */
.glitch-bar {
  animation: glitchbar 5s ease-in-out infinite;
}
@keyframes glitchbar {
  0%,100% { top: -10px; opacity: 0; }
  20%     { top: 30%; opacity: 1; }
  21%     { top: 32%; opacity: 0; }
  50%     { top: 70%; opacity: 1; }
  51%     { top: 72%; opacity: 0; }
}
```

---

## Synthé vaporwave — Web Audio API

```typescript
// Structure : Oscillateurs → GainNode → ConvolverNode (reverb) → destination
// Accords toutes les 4 secondes sur cette grille harmonique :
const CHORD_GRID = [
  [220, 261.63, 329.63, 392],     // La min
  [196, 246.94, 293.66, 369.99],  // Sol maj
  [174.61, 220, 261.63, 329.63],  // Fa maj
  [207.65, 261.63, 311.13, 392],  // La bémol maj
]
// Type : 'sine' pour les accords, 'triangle' pour la basse
// Reverb : ConvolverNode avec buffer de bruit décroissant (3s)
// Gain master : 0.18 (discret, pas agressif)
```

---

## Données WMO → FR (table complète)

```typescript
export const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: 'DÉGAGÉ',           icon: '☀️' },
  1:  { label: 'PEU NUAGEUX',      icon: '🌤' },
  2:  { label: 'NUAGEUX',          icon: '⛅' },
  3:  { label: 'COUVERT',          icon: '☁️' },
  45: { label: 'BROUILLARD',       icon: '🌫' },
  48: { label: 'BROUILLARD GIVRANT', icon: '🌫' },
  51: { label: 'BRUINE LÉGÈRE',    icon: '🌦' },
  53: { label: 'BRUINE MOD.',      icon: '🌦' },
  55: { label: 'BRUINE FORTE',     icon: '🌧' },
  61: { label: 'PLUIE LÉGÈRE',     icon: '🌦' },
  63: { label: 'PLUIE',            icon: '🌧' },
  65: { label: 'PLUIE FORTE',      icon: '🌧' },
  71: { label: 'NEIGE LÉGÈRE',     icon: '🌨' },
  73: { label: 'NEIGE',            icon: '❄️' },
  75: { label: 'NEIGE FORTE',      icon: '❄️' },
  77: { label: 'GRÉSIL',           icon: '🌨' },
  80: { label: 'AVERSES',          icon: '🌦' },
  81: { label: 'AVERSES MOD.',     icon: '🌧' },
  82: { label: 'AVERSES FORTES',   icon: '⛈' },
  85: { label: 'NEIGE AVERSE',     icon: '🌨' },
  86: { label: 'NEIGE AVERSE++',   icon: '❄️' },
  95: { label: 'ORAGE',            icon: '⛈' },
  96: { label: 'ORAGE + GRÊLE',    icon: '⛈' },
  99: { label: 'ORAGE + GRÊLE++',  icon: '⛈' },
}
```

---

## Commande de démarrage

```bash
npx create-next-app@latest vaporweather --typescript --tailwind --app --no-src-dir
cd vaporweather
# Coller les composants selon l'arborescence ci-dessus
npm run dev
```

---

## Priorités d'exécution pour Claude Code

1. Setup Next.js + globals.css (variables CSS, fonts, animations de base)
2. `SynthwaveBackground.tsx` — le fond visuel complet (ciel, soleil, grille, montagnes)
3. `VHSEffects.tsx` — scanlines, glitch bar, grain
4. `lib/weather.ts` + `lib/wmo-codes.ts` — fetch API
5. `hooks/useWeather.ts` — géoloc auto + recherche manuelle
6. `WeatherDisplay.tsx` — panel principal avec toutes les données
7. `Ticker.tsx` + `Clock.tsx`
8. `LoadingScreen.tsx`
9. `AudioEngine.tsx` + `hooks/useAudio.ts`
10. Assembly final dans `page.tsx`

---

## Nom de domaine suggéré

`vaporweather.fm` / `weather.vhs` / `meteo.wave` / `vapormeteo.fr`

---

## Prompt de lancement pour Claude Code

> "Je veux créer un site web appelé VaporWeather. C'est un bulletin météo interactif avec l'esthétique des années 80 / vaporwave / VHS, qui affiche la vraie météo en temps réel via l'API Open-Meteo (gratuite, sans clé). Lis le fichier VAPORWEATHER_brief.md pour tous les détails techniques, la palette, l'architecture, et les priorités d'implémentation. Commence par le setup Next.js et le fond visuel synthwave."
