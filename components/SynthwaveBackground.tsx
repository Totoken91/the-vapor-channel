export default function SynthwaveBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            var(--vw-sky-top) 0%,
            var(--vw-sky-mid) 30%,
            var(--vw-sky-low) 50%,
            #6a0dad 60%,
            var(--vw-horizon) 72%,
            #ff8c00 78%,
            #ff4500 85%,
            var(--vw-bg-deep) 100%
          )`,
        }}
      />

      {/* Sun */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "18%" }}>
        <div
          className="relative rounded-full"
          style={{
            width: "180px",
            height: "180px",
            background: `linear-gradient(
              to bottom,
              var(--vw-sun-top) 0%,
              #ffaa00 40%,
              var(--vw-sun-bot) 100%
            )`,
            boxShadow: "0 0 80px 20px rgba(255,100,50,0.4), 0 0 160px 60px rgba(255,50,100,0.2)",
          }}
        >
          {/* Sun stripes (VHS retro look) */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 w-full bg-[var(--vw-bg-deep)]"
              style={{
                height: `${3 + i * 1.2}px`,
                bottom: `${8 + i * 14}px`,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
      </div>

      {/* Mountains silhouette */}
      <svg
        className="absolute w-full"
        style={{ bottom: "22%", height: "20%" }}
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
      >
        {/* Back mountain range */}
        <polygon
          points="0,200 0,120 100,60 200,100 300,40 450,90 550,30 650,80 750,50 850,90 950,35 1050,70 1150,55 1200,80 1200,200"
          fill="#0a0020"
          opacity="0.7"
        />
        {/* Front mountain range */}
        <polygon
          points="0,200 0,150 80,100 180,140 280,80 400,130 500,70 600,120 720,85 820,130 920,75 1020,110 1120,90 1200,120 1200,200"
          fill="#05000f"
          opacity="0.9"
        />
      </svg>

      {/* Perspective grid */}
      <div
        className="absolute left-0 w-full overflow-hidden"
        style={{
          bottom: 0,
          height: "28%",
          perspective: "400px",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformOrigin: "center top",
            transform: "rotateX(55deg)",
            background: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 58px,
                var(--vw-grid) 58px,
                var(--vw-grid) 60px
              ),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 38px,
                var(--vw-grid) 38px,
                var(--vw-grid) 40px
              )
            `,
            opacity: 0.25,
            animation: "gridScroll 2s linear infinite",
          }}
        />
      </div>

      {/* Grid scroll animation */}
      <style>{`
        @keyframes gridScroll {
          from { background-position: 0 0; }
          to { background-position: 0 40px; }
        }
      `}</style>
    </div>
  );
}
