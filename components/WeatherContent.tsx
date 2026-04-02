import WeatherBackground from "@/components/SynthwaveBackground";

/**
 * Pure broadcast content — the "clean signal" before VHS processing.
 * Rendered at 1200x900 for high-quality capture, then processed by WebGL shader.
 * Uses smooth sans-serif bold fonts like real 80s TV broadcast graphics.
 */

const TITLE_FONT = "'Arial Black', 'Impact', 'Helvetica Neue', sans-serif";
const BODY_FONT = "'Arial', 'Helvetica Neue', sans-serif";

export default function WeatherContent() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: "1200px", height: "900px", background: "#000" }}
    >
      <div className="absolute inset-0">
        <WeatherBackground />
      </div>

      {/* Main broadcast layout */}
      <div className="relative z-10 flex flex-col h-full" style={{ padding: "28px 36px" }}>
        {/* Top bar: Logo + title + Date/Time */}
        <header className="flex items-start justify-between" style={{ marginBottom: "18px" }}>
          {/* Logo */}
          <div
            style={{
              background: "#1a4a9a",
              border: "3px solid #7ab0e8",
              borderRadius: "8px",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ textAlign: "center", lineHeight: 1.15 }}>
              <div style={{ fontFamily: TITLE_FONT, color: "#fff", fontSize: "16px", fontWeight: 900 }}>THE</div>
              <div style={{ fontFamily: TITLE_FONT, color: "#fff", fontSize: "20px", fontWeight: 900 }}>VAPOR</div>
              <div style={{ fontFamily: TITLE_FONT, color: "#fff", fontSize: "16px", fontWeight: 900 }}>CHANNEL</div>
            </div>
          </div>

          <div style={{ fontFamily: BODY_FONT, color: "#fff", fontSize: "36px", fontWeight: 700, letterSpacing: "0.05em", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
            almanac
          </div>

          <div style={{ fontFamily: BODY_FONT, color: "#fff", textAlign: "right", textShadow: "1px 1px 3px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: "20px", fontWeight: 700 }}>MER AVR 02</div>
            <div style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "0.05em" }}>
              12:00:00 <span style={{ fontSize: "20px" }}>PM</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-start" style={{ gap: "16px" }}>
          {/* Main weather panel */}
          <div style={{ width: "92%", background: "rgba(15, 40, 120, 0.92)", border: "3px solid #5090d8", borderRadius: "4px", boxShadow: "0 3px 15px rgba(0,0,0,0.4)" }}>
            <div style={{
              background: "linear-gradient(to bottom, #3068b8, #1a3a80)",
              borderBottom: "3px solid #5090d8",
              padding: "8px 18px",
              fontFamily: TITLE_FONT,
              fontSize: "20px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#fff",
              fontWeight: 900,
            }}>
              conditions actuelles
            </div>
            <div style={{ padding: "20px 28px" }}>
              <div style={{ fontFamily: TITLE_FONT, color: "#ffd700", fontSize: "28px", fontWeight: 900, letterSpacing: "0.03em", marginBottom: "12px" }}>
                PARIS, FRANCE
              </div>
              <div className="flex items-center" style={{ gap: "28px" }}>
                <div style={{ fontFamily: TITLE_FONT, color: "#ffcc00", fontSize: "96px", fontWeight: 900, lineHeight: 1 }}>
                  18°
                </div>
                <div>
                  <div style={{ fontFamily: TITLE_FONT, color: "#fff", fontSize: "40px", fontWeight: 900 }}>
                    ☀️ DÉGAGÉ
                  </div>
                  <div style={{ fontFamily: BODY_FONT, color: "#88ddff", fontSize: "22px", fontWeight: 700 }}>
                    RESSENTI 16°
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details panel */}
          <div style={{ width: "92%", background: "rgba(15, 40, 120, 0.92)", border: "3px solid #5090d8", borderRadius: "4px", boxShadow: "0 3px 15px rgba(0,0,0,0.4)" }}>
            <div style={{
              background: "linear-gradient(to bottom, #3068b8, #1a3a80)",
              borderBottom: "3px solid #5090d8",
              padding: "8px 18px",
              fontFamily: TITLE_FONT,
              fontSize: "20px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#fff",
              fontWeight: 900,
            }}>
              détails
            </div>
            <div
              className="grid grid-cols-3"
              style={{ padding: "16px 28px", fontFamily: BODY_FONT, fontSize: "22px", fontWeight: 700, gap: "12px 36px" }}
            >
              <div><span style={{ color: "#aaccff" }}>HUMIDITÉ</span> <span style={{ color: "#ffcc00" }}>54%</span></div>
              <div><span style={{ color: "#aaccff" }}>PRESSION</span> <span style={{ color: "#ffcc00" }}>1013 hPa</span></div>
              <div><span style={{ color: "#aaccff" }}>VENT</span> <span style={{ color: "#ffcc00" }}>NO 12 km/h</span></div>
              <div><span style={{ color: "#aaccff" }}>RAFALES</span> <span style={{ color: "#ffcc00" }}>22 km/h</span></div>
              <div><span style={{ color: "#aaccff" }}>PT ROSÉE</span> <span style={{ color: "#ffcc00" }}>8°</span></div>
              <div><span style={{ color: "#aaccff" }}>VISIBILITÉ</span> <span style={{ color: "#ffcc00" }}>10 km</span></div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ marginTop: "auto" }}>
          <div style={{ fontFamily: BODY_FONT, color: "#fff", fontSize: "20px", fontWeight: 700, letterSpacing: "0.03em", marginBottom: "6px", padding: "0 6px" }}>
            ACTUELLEMENT À <span style={{ color: "#ffcc00" }}>PARIS</span>
            <span style={{ marginLeft: "36px" }}>HUMIDITÉ <span style={{ color: "#ffcc00" }}>54%</span></span>
            <span style={{ marginLeft: "36px" }}>PT ROSÉE <span style={{ color: "#ffcc00" }}>8°</span></span>
          </div>
          <div
            className="overflow-hidden whitespace-nowrap"
            style={{
              background: "rgba(8, 16, 60, 0.94)",
              borderTop: "3px solid #ffcc00",
              fontFamily: BODY_FONT,
              color: "#ffcc00",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.03em",
              padding: "8px 14px",
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
          from { transform: translateX(1200px); }
          to { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 22s linear infinite;
        }
      `}</style>
    </div>
  );
}
