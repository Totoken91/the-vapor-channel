export default function WeatherBackground() {
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      style={{
        backgroundImage: 'url(/nuages.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
