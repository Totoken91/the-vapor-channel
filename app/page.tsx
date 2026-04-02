import WeatherBackground from "@/components/SynthwaveBackground";
import VHSEffects from "@/components/VHSEffects";

export default function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <WeatherBackground />

      {/* Main broadcast layout */}
      <div className="relative z-10 flex flex-col h-full p-4 md:p-6">
        {/* Top bar: Logo + Date/Time */}
        <header className="flex items-start justify-between mb-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-sm"
            style={{
              background: "var(--wc-logo-bg)",
              border: "2px solid var(--wc-logo-border)",
            }}
          >
            <div className="flex flex-col items-center leading-none">
              <span
                className="text-xl font-bold tracking-tight"
                style={{
                  fontFamily: "'VT323', 'Courier New', monospace",
                  color: "var(--wc-white)",
                }}
              >
                THE
              </span>
              <span
                className="text-xl font-bold tracking-tight"
                style={{
                  fontFamily: "'VT323', 'Courier New', monospace",
                  color: "var(--wc-white)",
                }}
              >
                VAPOR
              </span>
              <span
                className="text-xl font-bold tracking-tight"
                style={{
                  fontFamily: "'VT323', 'Courier New', monospace",
                  color: "var(--wc-white)",
                }}
              >
                CHANNEL
              </span>
            </div>
          </div>

          {/* Date / Time placeholder */}
          <div
            className="text-right"
            style={{
              fontFamily: "'VT323', 'Courier New', monospace",
              color: "var(--wc-white)",
            }}
          >
            <div className="text-lg" style={{ color: "var(--wc-yellow)" }}>
              MER AVR 02
            </div>
            <div className="text-3xl tracking-wider">
              12:00:00 <span className="text-lg">PM</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Main weather panel */}
          <div className="broadcast-panel flex-1">
            <div className="panel-header">conditions actuelles</div>
            <div className="p-5 flex flex-col gap-4">
              {/* City name */}
              <div
                className="text-2xl tracking-wide"
                style={{
                  fontFamily: "'VT323', monospace",
                  color: "var(--wc-gold)",
                }}
              >
                PARIS, FRANCE
              </div>

              {/* Main temp + condition */}
              <div className="flex items-center gap-8">
                <div
                  className="text-7xl md:text-8xl font-bold"
                  style={{
                    fontFamily: "'VT323', monospace",
                    color: "var(--wc-yellow)",
                  }}
                >
                  18°
                </div>
                <div className="flex flex-col gap-1">
                  <div
                    className="text-3xl"
                    style={{
                      fontFamily: "'VT323', monospace",
                      color: "var(--wc-white)",
                    }}
                  >
                    ☀️ DÉGAGÉ
                  </div>
                  <div
                    className="text-lg"
                    style={{ color: "var(--wc-cyan)" }}
                  >
                    RESSENTI 16°
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div
                className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 mt-2 text-lg"
                style={{ fontFamily: "'Share Tech Mono', monospace" }}
              >
                <div>
                  <span style={{ color: "var(--wc-blue-text)" }}>HUMIDITÉ</span>{" "}
                  <span style={{ color: "var(--wc-yellow)" }}>54%</span>
                </div>
                <div>
                  <span style={{ color: "var(--wc-blue-text)" }}>PRESSION</span>{" "}
                  <span style={{ color: "var(--wc-yellow)" }}>1013 hPa</span>
                </div>
                <div>
                  <span style={{ color: "var(--wc-blue-text)" }}>VENT</span>{" "}
                  <span style={{ color: "var(--wc-yellow)" }}>NO 12 km/h</span>
                </div>
                <div>
                  <span style={{ color: "var(--wc-blue-text)" }}>RAFALES</span>{" "}
                  <span style={{ color: "var(--wc-yellow)" }}>22 km/h</span>
                </div>
                <div>
                  <span style={{ color: "var(--wc-blue-text)" }}>PT ROSÉE</span>{" "}
                  <span style={{ color: "var(--wc-yellow)" }}>8°</span>
                </div>
                <div>
                  <span style={{ color: "var(--wc-blue-text)" }}>VISIBILITÉ</span>{" "}
                  <span style={{ color: "var(--wc-yellow)" }}>10 km</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom ticker bar */}
        <div
          className="mt-3 py-2 px-4 text-sm tracking-wide overflow-hidden whitespace-nowrap"
          style={{
            background: "rgba(10, 20, 60, 0.9)",
            borderTop: "2px solid var(--wc-yellow)",
            fontFamily: "'Share Tech Mono', monospace",
            color: "var(--wc-yellow)",
          }}
        >
          <div className="inline-block animate-marquee">
            BULLETIN MÉTÉO ━ PARIS : 18°C DÉGAGÉ ━ HUMIDITÉ 54% ━ VENT NO 12 KM/H ━
            PROCHAINES HEURES : CIEL DÉGAGÉ ━ THE VAPOR CHANNEL ━ MÉTÉO EN DIRECT ━
          </div>
        </div>
      </div>

      <VHSEffects />

      {/* Marquee animation */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
