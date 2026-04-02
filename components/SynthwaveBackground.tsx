export default function WeatherBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Blue sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            var(--wc-sky-top) 0%,
            var(--wc-sky-mid) 40%,
            var(--wc-sky-bot) 100%
          )`,
        }}
      />

      {/* Upper clouds layer */}
      <div className="clouds-drift absolute inset-0">
        <svg
          className="absolute w-[130%] -left-[15%]"
          style={{ top: "0%" }}
          viewBox="0 0 1600 500"
          preserveAspectRatio="none"
        >
          {/* Cloud cluster 1 - top left */}
          <ellipse cx="180" cy="80" rx="200" ry="75" fill="rgba(255,255,255,0.45)" />
          <ellipse cx="280" cy="65" rx="150" ry="65" fill="rgba(255,255,255,0.55)" />
          <ellipse cx="120" cy="95" rx="130" ry="55" fill="rgba(255,255,255,0.40)" />
          <ellipse cx="220" cy="50" rx="100" ry="50" fill="rgba(255,255,255,0.50)" />

          {/* Cloud cluster 2 - top center */}
          <ellipse cx="650" cy="110" rx="220" ry="80" fill="rgba(255,255,255,0.40)" />
          <ellipse cx="750" cy="95" rx="170" ry="70" fill="rgba(255,255,255,0.50)" />
          <ellipse cx="580" cy="125" rx="140" ry="60" fill="rgba(255,255,255,0.35)" />
          <ellipse cx="700" cy="80" rx="120" ry="55" fill="rgba(255,255,255,0.48)" />

          {/* Cloud cluster 3 - top right */}
          <ellipse cx="1150" cy="70" rx="190" ry="70" fill="rgba(255,255,255,0.42)" />
          <ellipse cx="1260" cy="55" rx="150" ry="62" fill="rgba(255,255,255,0.52)" />
          <ellipse cx="1080" cy="85" rx="120" ry="50" fill="rgba(255,255,255,0.38)" />

          {/* Mid clouds - scattered */}
          <ellipse cx="350" cy="220" rx="240" ry="80" fill="rgba(255,255,255,0.30)" />
          <ellipse cx="450" cy="205" rx="180" ry="65" fill="rgba(255,255,255,0.38)" />

          <ellipse cx="900" cy="260" rx="200" ry="75" fill="rgba(255,255,255,0.28)" />
          <ellipse cx="1000" cy="245" rx="160" ry="60" fill="rgba(255,255,255,0.36)" />

          <ellipse cx="1350" cy="200" rx="180" ry="70" fill="rgba(255,255,255,0.32)" />
          <ellipse cx="1430" cy="185" rx="130" ry="55" fill="rgba(255,255,255,0.40)" />
        </svg>
      </div>

      {/* Dense bottom clouds (heavier, more opaque) */}
      <div className="absolute bottom-0 left-0 w-full" style={{ height: "45%" }}>
        <svg
          className="w-[140%] -ml-[20%] h-full clouds-drift"
          viewBox="0 0 1800 400"
          preserveAspectRatio="none"
        >
          {/* Dense cloud bank */}
          <ellipse cx="100" cy="220" rx="300" ry="150" fill="rgba(255,255,255,0.50)" />
          <ellipse cx="350" cy="240" rx="350" ry="160" fill="rgba(255,255,255,0.55)" />
          <ellipse cx="700" cy="210" rx="320" ry="150" fill="rgba(255,255,255,0.52)" />
          <ellipse cx="1000" cy="230" rx="380" ry="170" fill="rgba(255,255,255,0.48)" />
          <ellipse cx="1350" cy="215" rx="300" ry="145" fill="rgba(255,255,255,0.54)" />
          <ellipse cx="1600" cy="240" rx="280" ry="155" fill="rgba(255,255,255,0.50)" />

          {/* Upper wisps of bottom bank */}
          <ellipse cx="200" cy="140" rx="220" ry="90" fill="rgba(255,255,255,0.35)" />
          <ellipse cx="500" cy="150" rx="260" ry="100" fill="rgba(255,255,255,0.32)" />
          <ellipse cx="850" cy="130" rx="240" ry="95" fill="rgba(255,255,255,0.30)" />
          <ellipse cx="1150" cy="145" rx="270" ry="100" fill="rgba(255,255,255,0.33)" />
          <ellipse cx="1500" cy="140" rx="230" ry="90" fill="rgba(255,255,255,0.35)" />

          {/* Very bottom dense fill */}
          <ellipse cx="400" cy="340" rx="500" ry="120" fill="rgba(255,255,255,0.60)" />
          <ellipse cx="900" cy="350" rx="550" ry="130" fill="rgba(255,255,255,0.58)" />
          <ellipse cx="1400" cy="340" rx="480" ry="120" fill="rgba(255,255,255,0.62)" />
        </svg>
      </div>
    </div>
  );
}
