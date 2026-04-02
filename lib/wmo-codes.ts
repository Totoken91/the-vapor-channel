export const WMO_CODES: Record<number, { label: string }> = {
  0:  { label: 'DÉGAGÉ' },
  1:  { label: 'PEU NUAGEUX' },
  2:  { label: 'NUAGEUX' },
  3:  { label: 'COUVERT' },
  45: { label: 'BROUILLARD' },
  48: { label: 'BROUILLARD GIVRANT' },
  51: { label: 'BRUINE LÉGÈRE' },
  53: { label: 'BRUINE MOD.' },
  55: { label: 'BRUINE FORTE' },
  61: { label: 'PLUIE LÉGÈRE' },
  63: { label: 'PLUIE' },
  65: { label: 'PLUIE FORTE' },
  71: { label: 'NEIGE LÉGÈRE' },
  73: { label: 'NEIGE' },
  75: { label: 'NEIGE FORTE' },
  77: { label: 'GRÉSIL' },
  80: { label: 'AVERSES' },
  81: { label: 'AVERSES MOD.' },
  82: { label: 'AVERSES FORTES' },
  85: { label: 'NEIGE AVERSE' },
  86: { label: 'NEIGE AVERSE++' },
  95: { label: 'ORAGE' },
  96: { label: 'ORAGE + GRÊLE' },
  99: { label: 'ORAGE + GRÊLE++' },
};

export function getWeatherInfo(code: number): { label: string } {
  return WMO_CODES[code] ?? { label: 'INCONNU' };
}
