import WeatherBackground from "@/components/SynthwaveBackground";
import VHSEffects from "@/components/VHSEffects";

export default function Home() {
  return (
    <div className="crt-frame">
      <WeatherBackground />

      {/* Main broadcast layout */}
      <div className="relative z-10 flex flex-col h-full p-[3%]">
        {/* Top bar: Logo + Date/Time */}
        <header className="flex items-start justify-between mb-[2%]">
          {/* Logo */}
          <div
            className="flex items-center px-3 py-2 rounded-sm"
            style={{
              background: "var(--wc-logo-bg)",
              border: "2px solid var(--wc-logo-border)",
              borderRadius: "6px",
            }}
          >
            <div className="flex flex-col items-center leading-tight">
              <span
                className="text-[1.4vmin] font-bold tracking-tight"
                style={{
                  fontFamily: "'VT323', 'Courier New', monospace",
                  color: "var(--wc-white)",
                }}
              >
                THE
              </span>
              <span
                className="text-[1.8vmin] font-bold tracking-tight"
                style={{
                  fontFamily: "'VT323', 'Courier New', monospace",
                  color: "var(--wc-white)",
                }}
              >
                VAPOR
              </span>
              <span
                className="text-[1.4vmin] font-bold tracking-tight"
                style={{
                  fontFamily: "'VT323', 'Courier New', monospace",
                  color: "var(--wc-white)",
                }}
              >
                CHANNEL
              </span>
            </div>
          </div>

          {/* Page title */}
          <div
            className="text-[3vmin] tracking-wider"
            style={{
              fontFamily: "'VT323', 'Courier New', monospace",
              color: "var(--wc-white)",
            }}
          >
            conditions actuelles
          </div>

          {/* Date / Time */}
          <div
            className="text-right"
            style={{
              fontFamily: "'VT323', 'Courier New', monospace",
              color: "var(--wc-white)",
            }}
          >
            <div className="text-[1.8vmin]" style={{ color: "var(--wc-white)" }}>
              MER AVR 02
            </div>
            <div className="text-[2.8vmin] tracking-wider">
              12:00:00 <span className="text-[1.6vmin]">PM</span>
            </div>
          </div>
        </header>

        {/* Content area - centered panels */}
        <div className="flex-1 flex flex-col items-center justify-start gap-[2%]">
          {/* Main weather panel */}
          <div className="broadcast-panel w-[90%]">
            <div className="panel-header text-[1.8vmin]">
              conditions actuelles
            </div>
            <div className="p-[3%] flex flex-col gap-[1.5vmin]">
              {/* City name */}
              <div
                className="text-[2.5vmin] tracking-wide"
                style={{
                  fontFamily: "'VT323', monospace",
                  color: "var(--wc-gold)",
                }}
              >
                PARIS, FRANCE
              </div>

              {/* Main temp + condition */}
              <div className="flex items-center gap-[3vmin]">
                <div
                  className="text-[8vmin] font-bold leading-none"
                  style={{
                    fontFamily: "'VT323', monospace",
                    color: "var(--wc-yellow)",
                  }}
                >
                  18°
                </div>
                <div className="flex flex-col gap-[0.5vmin]">
                  <div
                    className="text-[3.5vmin]"
                    style={{
                      fontFamily: "'VT323', monospace",
                      color: "var(--wc-white)",
                    }}
                  >
                    ☀️ DÉGAGÉ
                  </div>
                  <div
                    className="text-[2vmin]"
                    style={{ color: "var(--wc-cyan)" }}
                  >
                    RESSENTI 16°
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details panel */}
          <div className="broadcast-panel w-[90%]">
            <div className="panel-header text-[1.8vmin]">
              détails
            </div>
            <div
              className="p-[3%] grid grid-cols-3 gap-x-[4vmin] gap-y-[1.5vmin] text-[2vmin]"
              style={{ fontFamily: "'Share Tech Mono', 'Courier New', monospace" }}
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

        {/* Bottom area - city + ticker */}
        <div className="mt-auto">
          {/* Bottom info line */}
          <div
            className="text-[1.8vmin] tracking-wide mb-[0.5vmin] px-[1vmin]"
            style={{
              fontFamily: "'VT323', 'Courier New', monospace",
              color: "var(--wc-white)",
            }}
          >
            ACTUELLEMENT À <span style={{ color: "var(--wc-yellow)" }}>PARIS</span>
            <span className="ml-[4vmin]">
              HUMIDITÉ <span style={{ color: "var(--wc-yellow)" }}>54%</span>
            </span>
            <span className="ml-[4vmin]">
              PT ROSÉE <span style={{ color: "var(--wc-yellow)" }}>8°</span>
            </span>
          </div>

          {/* Ticker bar */}
          <div
            className="py-[0.8vmin] px-[1.5vmin] text-[1.6vmin] tracking-wide overflow-hidden whitespace-nowrap"
            style={{
              background: "rgba(8, 16, 50, 0.92)",
              borderTop: "2px solid var(--wc-yellow)",
              fontFamily: "'Share Tech Mono', 'Courier New', monospace",
              color: "var(--wc-yellow)",
            }}
          >
            <div className="inline-block animate-marquee">
              BULLETIN MÉTÉO ━ PARIS : 18°C DÉGAGÉ ━ HUMIDITÉ 54% ━ VENT NO 12 KM/H ━
              PROCHAINES HEURES : CIEL DÉGAGÉ ━ THE VAPOR CHANNEL ━ MÉTÉO EN DIRECT ━
            </div>
          </div>
        </div>
      </div>

      <VHSEffects />

      {/* Marquee animation */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
