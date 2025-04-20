import React from "react";
import AudioVisualizer from "./components/AudioVisualizer";

function App() {
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const timerRef = React.useRef(null);

  const handleStartPodcast = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  // 🧼 Clear timer khi unmount
  React.useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#f9f9f9",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        color: "#222",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "30px",
          backgroundColor: "white",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          width: "90%",
          // maxWidth: "1000px",
        }}
      >
        {/* Left: Time + Username */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              marginBottom: "20px",
              fontSize: 20,
            }}
          >
            EPISODE 1
          </p>
          {/* ⏱️ Hiển thị đồng hồ */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 36,
              fontWeight: "800",
              margin: 0,
            }}
          >
            {String(Math.floor(elapsedTime / 60)).padStart(2, "0")}:
            {String(elapsedTime % 60).padStart(2, "0")}
          </div>
          <p style={{ fontSize: 20, color: "#888", marginTop: 0 }}>
            @TunnaDuong
          </p>
        </div>

        {/* Center: Waveform */}
        <div style={{ flex: 2, textAlign: "center" }}>
          <AudioVisualizer onStart={handleStartPodcast} />
        </div>

        {/* Right: Podcast info + image */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: "20px",
            justifyContent: "flex-end",
            flexDirection: "column",
          }}
        >
          <img
            src="/laptrinh.jpg"
            alt="Podcast"
            style={{
              width: "230px",
              height: "230px",
              objectFit: "cover",
              borderRadius: "10%",
            }}
          />
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 20, color: "#888", margin: 0 }}>
              PODCAST SERIES
            </p>
            <h3 style={{ margin: 0, fontSize: 40, marginTop: -10 }}>
              Gác nhỏ của Tùng.
            </h3>
            <p style={{ fontSize: 19, color: "#aaa", margin: 0 }}>
              Hành trình đi tìm đam mê vĩ đại của loài người (Phần 1)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
