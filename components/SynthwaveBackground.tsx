export default function WeatherBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          backgroundImage: 'url(/nuages.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'cloudDrift 30s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes cloudDrift {
          0%   { transform: scale(1.08) translate(0%, 0%); }
          20%  { transform: scale(1.14) translate(-3%, 1.5%); }
          40%  { transform: scale(1.10) translate(2%, -1%); }
          60%  { transform: scale(1.15) translate(-1%, -2%); }
          80%  { transform: scale(1.10) translate(2.5%, 1%); }
          100% { transform: scale(1.08) translate(0%, 0%); }
        }
      `}</style>
    </div>
  );
}
