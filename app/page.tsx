import SynthwaveBackground from "@/components/SynthwaveBackground";
import VHSEffects from "@/components/VHSEffects";

export default function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <SynthwaveBackground />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-start h-full pt-8">
        {/* Header — THE VAPOR CHANNEL */}
        <header className="text-center">
          <div
            className="text-sm tracking-[0.3em] uppercase"
            style={{
              color: "var(--vw-text-dim)",
              fontFamily: "'Share Tech Mono', 'Courier New', monospace",
            }}
          >
            ━━━ Live Weather Broadcast ━━━
          </div>
          <h1
            className="glitch-text text-6xl md:text-8xl font-bold mt-2 tracking-wider"
            style={{
              fontFamily: "'VT323', 'Courier New', monospace",
              color: "var(--vw-text)",
              lineHeight: 1,
            }}
          >
            THE VAPOR CHANNEL
          </h1>
          <div
            className="mt-2 text-lg tracking-[0.5em] uppercase"
            style={{
              color: "var(--vw-cyan)",
              fontFamily: "'Share Tech Mono', 'Courier New', monospace",
            }}
          >
            Météo en direct
          </div>
        </header>
      </div>

      <VHSEffects />
    </div>
  );
}
