export default function WeatherBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
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

      {/* Clouds layer */}
      <div className="clouds-drift absolute inset-0">
        <svg
          className="absolute w-[120%] -left-[10%]"
          style={{ top: "5%" }}
          viewBox="0 0 1400 400"
          preserveAspectRatio="none"
        >
          {/* Wispy cloud shapes */}
          <ellipse cx="200" cy="100" rx="180" ry="60" fill="rgba(255,255,255,0.18)" />
          <ellipse cx="280" cy="90" rx="120" ry="50" fill="rgba(255,255,255,0.22)" />
          <ellipse cx="150" cy="110" rx="100" ry="40" fill="rgba(255,255,255,0.15)" />

          <ellipse cx="700" cy="150" rx="200" ry="70" fill="rgba(255,255,255,0.15)" />
          <ellipse cx="780" cy="140" rx="140" ry="55" fill="rgba(255,255,255,0.20)" />
          <ellipse cx="650" cy="160" rx="110" ry="45" fill="rgba(255,255,255,0.12)" />

          <ellipse cx="1100" cy="80" rx="170" ry="55" fill="rgba(255,255,255,0.16)" />
          <ellipse cx="1180" cy="70" rx="130" ry="48" fill="rgba(255,255,255,0.20)" />
          <ellipse cx="1050" cy="90" rx="90" ry="35" fill="rgba(255,255,255,0.13)" />

          <ellipse cx="400" cy="280" rx="220" ry="65" fill="rgba(255,255,255,0.12)" />
          <ellipse cx="480" cy="270" rx="150" ry="50" fill="rgba(255,255,255,0.16)" />
          <ellipse cx="350" cy="290" rx="100" ry="40" fill="rgba(255,255,255,0.10)" />

          <ellipse cx="900" cy="320" rx="190" ry="60" fill="rgba(255,255,255,0.10)" />
          <ellipse cx="970" cy="310" rx="130" ry="45" fill="rgba(255,255,255,0.14)" />

          <ellipse cx="1250" cy="250" rx="160" ry="50" fill="rgba(255,255,255,0.11)" />
          <ellipse cx="1300" cy="240" rx="100" ry="38" fill="rgba(255,255,255,0.15)" />
        </svg>
      </div>

      {/* Bottom clouds (more opaque, closer feel) */}
      <div className="absolute bottom-0 left-0 w-full" style={{ height: "30%" }}>
        <svg
          className="w-[120%] -ml-[10%] h-full"
          viewBox="0 0 1400 300"
          preserveAspectRatio="none"
        >
          <ellipse cx="100" cy="200" rx="250" ry="100" fill="rgba(255,255,255,0.25)" />
          <ellipse cx="350" cy="220" rx="300" ry="120" fill="rgba(255,255,255,0.22)" />
          <ellipse cx="650" cy="190" rx="280" ry="110" fill="rgba(255,255,255,0.28)" />
          <ellipse cx="950" cy="210" rx="320" ry="130" fill="rgba(255,255,255,0.24)" />
          <ellipse cx="1200" cy="195" rx="260" ry="105" fill="rgba(255,255,255,0.26)" />
        </svg>
      </div>
    </div>
  );
}
