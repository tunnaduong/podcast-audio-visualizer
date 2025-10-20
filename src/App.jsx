import React, { useState, useEffect } from "react";
import AudioVisualizer from "./components/AudioVisualizer";

const PODCAST = {
  title: "Gác nhỏ của Tùng.",
  description: "Sức mạnh phi thường của thói quen hằng ngày: Tại sao lại cần?",
  image: "/tap15.jpg",
  audio: "/tap15.mp3",
  episode: 15,
};

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
          padding: "50px",
          backgroundColor: "white",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          width: "calc(100% - 130px)",
          height: "calc(100% - 180px)",
          margin: 40,
        }}
        className="main"
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Left: Time + Username */}
            <div
              style={{
                alignSelf: "flex-start",
                justifyContent: "flex-start",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 20,
                }}
              >
                EPISODE {PODCAST.episode}
              </p>
            </div>

            <div
              style={{
                position: "relative",
                flex: 1,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              {/* Center: Waveform */}
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "flex-end",
                  position: "absolute",
                  width: "436%",
                }}
              >
                <AudioVisualizer
                  audio={PODCAST.audio}
                  onStart={handleStartPodcast}
                />
              </div>
            </div>

            <div>
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
              <p style={{ fontSize: 20, color: "#888", margin: 0 }}>
                @TunnaDuong
              </p>
            </div>
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
              width: "100%",
              height: "100%",
            }}
          >
            <img
              src={PODCAST.image}
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
                {PODCAST.title}
              </h3>
              <p style={{ fontSize: 19, color: "#aaa", margin: 0 }}>
                {PODCAST.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
