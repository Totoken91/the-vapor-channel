export default function WeatherBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div
        style={{
          position: 'absolute',
          inset: '-10%',
          backgroundImage: 'url(/nuages.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'cloudDrift 60s linear infinite',
        }}
      />
      <style>{`
        @keyframes cloudDrift {
          0%   { transform: scale(1.05) translate(0%, 0%); }
          25%  { transform: scale(1.08) translate(-1.5%, 0.5%); }
          50%  { transform: scale(1.05) translate(-0.5%, -0.5%); }
          75%  { transform: scale(1.08) translate(1%, 0.5%); }
          100% { transform: scale(1.05) translate(0%, 0%); }
        }
      `}</style>
    </div>
  );
}
