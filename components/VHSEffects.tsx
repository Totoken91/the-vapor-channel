export default function VHSEffects() {
  return (
    <>
      {/* Scanlines overlay */}
      <div className="scanlines" />

      {/* Glitch bar */}
      <div className="glitch-bar" />

      {/* VHS grain (SVG noise filter) */}
      <div className="vhs-grain">
        <svg width="100%" height="100%">
          <filter id="vhs-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#vhs-noise)" />
        </svg>
      </div>
    </>
  );
}
