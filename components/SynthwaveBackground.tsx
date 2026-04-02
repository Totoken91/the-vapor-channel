export default function WeatherBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <img
        src="/nuages.jpg"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
