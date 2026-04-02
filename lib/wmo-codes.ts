export const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: 'DÉGAGÉ',           icon: '☀️' },
  1:  { label: 'PEU NUAGEUX',      icon: '⛅' },
  2:  { label: 'NUAGEUX',          icon: '🌥️' },
  3:  { label: 'COUVERT',          icon: '☁️' },
  45: { label: 'BROUILLARD',       icon: '🌫️' },
  48: { label: 'BROUILLARD GIVRANT', icon: '🌫️' },
  51: { label: 'BRUINE LÉGÈRE',    icon: '🌦️' },
  53: { label: 'BRUINE MOD.',      icon: '🌦️' },
  55: { label: 'BRUINE FORTE',     icon: '🌦️' },
  61: { label: 'PLUIE LÉGÈRE',     icon: '🌧️' },
  63: { label: 'PLUIE',            icon: '🌧️' },
  65: { label: 'PLUIE FORTE',      icon: '🌧️' },
  71: { label: 'NEIGE LÉGÈRE',     icon: '🌨️' },
  73: { label: 'NEIGE',            icon: '❄️' },
  75: { label: 'NEIGE FORTE',      icon: '❄️' },
  77: { label: 'GRÉSIL',           icon: '🌨️' },
  80: { label: 'AVERSES',          icon: '🌧️' },
  81: { label: 'AVERSES MOD.',     icon: '🌧️' },
  82: { label: 'AVERSES FORTES',   icon: '🌧️' },
  85: { label: 'NEIGE AVERSE',     icon: '🌨️' },
  86: { label: 'NEIGE AVERSE++',   icon: '🌨️' },
  95: { label: 'ORAGE',            icon: '⛈️' },
  96: { label: 'ORAGE + GRÊLE',    icon: '⛈️' },
  99: { label: 'ORAGE + GRÊLE++',  icon: '⛈️' },
};

export function getWeatherInfo(code: number): { label: string; icon: string } {
  return WMO_CODES[code] ?? { label: 'INCONNU', icon: '❓' };
}
