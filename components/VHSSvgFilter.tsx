'use client';

/**
 * SVG filter that applies REAL distortion to HTML content underneath.
 * Uses feTurbulence + feDisplacementMap to create VHS tape wobble
 * that actually warps the DOM elements (not just an overlay).
 */
export default function VHSSvgFilter() {
  return (
    <svg
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        {/* Main VHS distortion filter — applied to the content wrapper */}
        <filter id="vhs-warp" x="-5%" y="-2%" width="110%" height="104%">
          {/* Noise source for displacement — primarily horizontal (low X freq, higher Y freq) */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.002 0.15"
            numOctaves="2"
            result="warpNoise"
            seed="0"
          >
            {/* Animate the noise seed rapidly for VHS jitter */}
            <animate
              attributeName="seed"
              from="0"
              to="100"
              dur="0.4s"
              repeatCount="indefinite"
            />
            {/* Slowly vary the frequency for organic wobble */}
            <animate
              attributeName="baseFrequency"
              values="0.002 0.15;0.003 0.12;0.001 0.18;0.002 0.15"
              dur="8s"
              repeatCount="indefinite"
            />
          </feTurbulence>

          {/* Displace the actual content horizontally using the noise */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="warpNoise"
            scale="4"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          >
            {/* Pulse the distortion amount for tracking glitches */}
            <animate
              attributeName="scale"
              values="3;4;2;6;3;3;4;12;3;4"
              dur="10s"
              repeatCount="indefinite"
            />
          </feDisplacementMap>

          {/* Slight horizontal blur to simulate chroma smearing */}
          <feGaussianBlur in="displaced" stdDeviation="0.6 0" result="smeared" />

          {/* Desaturate slightly for VHS color loss */}
          <feColorMatrix
            in="smeared"
            type="matrix"
            values="0.95 0.05 0.00 0 0.01
                    0.02 0.92 0.06 0 0.005
                    0.00 0.05 0.90 0 0.02
                    0    0    0    1 0"
          />
        </filter>

        {/* Chromatic aberration filter — RGB channel splitting */}
        <filter id="vhs-chroma" x="-2%" y="0%" width="104%" height="100%">
          {/* Extract red channel and shift right */}
          <feOffset in="SourceGraphic" dx="1.5" dy="0" result="redShift" />
          <feColorMatrix
            in="redShift"
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="redOnly"
          />

          {/* Extract green channel (no shift) */}
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="greenOnly"
          />

          {/* Extract blue channel and shift left */}
          <feOffset in="SourceGraphic" dx="-1.5" dy="0" result="blueShift" />
          <feColorMatrix
            in="blueShift"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="blueOnly"
          />

          {/* Merge RGB channels back together */}
          <feBlend in="redOnly" in2="greenOnly" mode="screen" result="rg" />
          <feBlend in="rg" in2="blueOnly" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}
