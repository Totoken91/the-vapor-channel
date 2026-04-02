import WeatherBackground from "@/components/SynthwaveBackground";

/**
 * Pure broadcast content — the "clean signal" before VHS processing.
 * This is rendered hidden and captured as a WebGL texture.
 */
export default function WeatherContent() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: "800px", height: "600px", background: "#000" }}
    >
      <div className="absolute inset-0">
        <WeatherBackground />
      </div>

      {/* Main broadcast layout */}
      <div className="relative z-10 flex flex-col h-full" style={{ padding: "3%" }}>
        {/* Top bar: Logo + title + Date/Time */}
        <header className="flex items-start justify-between" style={{ marginBottom: "2%" }}>
          {/* Logo */}
          <div
            className="flex items-center"
            style={{
              background: "var(--wc-logo-bg)",
              border: "2px solid var(--wc-logo-border)",
              borderRadius: "6px",
              padding: "6px 10px",
            }}
          >
            <div className="flex flex-col items-center" style={{ lineHeight: 1.2 }}>
              <span style={{ fontFamily: "'VT323', monospace", color: "#fff", fontSize: "11px", fontWeight: "bold" }}>THE</span>
              <span style={{ fontFamily: "'VT323', monospace", color: "#fff", fontSize: "14px", fontWeight: "bold" }}>VAPOR</span>
              <span style={{ fontFamily: "'VT323', monospace", color: "#fff", fontSize: "11px", fontWeight: "bold" }}>CHANNEL</span>
            </div>
          </div>

          <div style={{ fontFamily: "'VT323', monospace", color: "#fff", fontSize: "24px", letterSpacing: "0.1em" }}>
            conditions actuelles
          </div>

          <div style={{ fontFamily: "'VT323', monospace", color: "#fff", textAlign: "right" }}>
            <div style={{ fontSize: "14px" }}>MER AVR 02</div>
            <div style={{ fontSize: "22px", letterSpacing: "0.1em" }}>
              12:00:00 <span style={{ fontSize: "13px" }}>PM</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-start" style={{ gap: "12px" }}>
          {/* Main weather panel */}
          <div className="broadcast-panel" style={{ width: "90%" }}>
            <div className="panel-header" style={{ fontSize: "14px" }}>conditions actuelles</div>
            <div style={{ padding: "14px 18px" }}>
              <div style={{ fontFamily: "'VT323', monospace", color: "var(--wc-gold)", fontSize: "20px", letterSpacing: "0.05em", marginBottom: "8px" }}>
                PARIS, FRANCE
              </div>
              <div className="flex items-center" style={{ gap: "20px" }}>
                <div style={{ fontFamily: "'VT323', monospace", color: "var(--wc-yellow)", fontSize: "64px", fontWeight: "bold", lineHeight: 1 }}>
                  18°
                </div>
                <div>
                  <div style={{ fontFamily: "'VT323', monospace", color: "#fff", fontSize: "28px" }}>
                    ☀️ DÉGAGÉ
                  </div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", color: "var(--wc-cyan)", fontSize: "16px" }}>
                    RESSENTI 16°
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details panel */}
          <div className="broadcast-panel" style={{ width: "90%" }}>
            <div className="panel-header" style={{ fontSize: "14px" }}>détails</div>
            <div
              className="grid grid-cols-3"
              style={{ padding: "12px 18px", fontFamily: "'Share Tech Mono', monospace", fontSize: "16px", gap: "8px 24px" }}
            >
              <div><span style={{ color: "var(--wc-blue-text)" }}>HUMIDITÉ</span> <span style={{ color: "var(--wc-yellow)" }}>54%</span></div>
              <div><span style={{ color: "var(--wc-blue-text)" }}>PRESSION</span> <span style={{ color: "var(--wc-yellow)" }}>1013 hPa</span></div>
              <div><span style={{ color: "var(--wc-blue-text)" }}>VENT</span> <span style={{ color: "var(--wc-yellow)" }}>NO 12 km/h</span></div>
              <div><span style={{ color: "var(--wc-blue-text)" }}>RAFALES</span> <span style={{ color: "var(--wc-yellow)" }}>22 km/h</span></div>
              <div><span style={{ color: "var(--wc-blue-text)" }}>PT ROSÉE</span> <span style={{ color: "var(--wc-yellow)" }}>8°</span></div>
              <div><span style={{ color: "var(--wc-blue-text)" }}>VISIBILITÉ</span> <span style={{ color: "var(--wc-yellow)" }}>10 km</span></div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ marginTop: "auto" }}>
          <div style={{ fontFamily: "'VT323', monospace", color: "#fff", fontSize: "14px", letterSpacing: "0.05em", marginBottom: "4px", padding: "0 4px" }}>
            ACTUELLEMENT À <span style={{ color: "var(--wc-yellow)" }}>PARIS</span>
            <span style={{ marginLeft: "24px" }}>HUMIDITÉ <span style={{ color: "var(--wc-yellow)" }}>54%</span></span>
            <span style={{ marginLeft: "24px" }}>PT ROSÉE <span style={{ color: "var(--wc-yellow)" }}>8°</span></span>
          </div>
          <div
            className="overflow-hidden whitespace-nowrap"
            style={{
              background: "rgba(8, 16, 50, 0.92)",
              borderTop: "2px solid var(--wc-yellow)",
              fontFamily: "'Share Tech Mono', monospace",
              color: "var(--wc-yellow)",
              fontSize: "13px",
              letterSpacing: "0.05em",
              padding: "6px 10px",
            }}
          >
            <div className="inline-block animate-marquee">
              BULLETIN MÉTÉO ━ PARIS : 18°C DÉGAGÉ ━ HUMIDITÉ 54% ━ VENT NO 12 KM/H ━
              PROCHAINES HEURES : CIEL DÉGAGÉ ━ THE VAPOR CHANNEL ━ MÉTÉO EN DIRECT ━
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(800px); }
          to { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </div>
  );
}
