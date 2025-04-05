import AudioVisualizer from "./components/AudioVisualizer";

function App() {
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
          alignItems: "center",
          padding: "30px",
          backgroundColor: "white",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          width: "90%",
          maxWidth: "1000px",
        }}
      >
        {/* Left: Time + Username */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              marginBottom: "20px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            LOREM IPSUM
          </p>
          <h2 style={{ fontSize: "24px", margin: 0 }}>00:06</h2>
          <p style={{ fontSize: "14px", color: "#888" }}>@username</p>
        </div>

        {/* Center: Waveform */}
        <div style={{ flex: 2, textAlign: "center" }}>
          <AudioVisualizer />
        </div>

        {/* Right: Podcast info + image */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "20px",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
              YOUR NAME HERE
            </p>
            <h3 style={{ margin: "5px 0", fontSize: "20px" }}>
              PODCAST SUBJECT
            </h3>
            <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>
              description subject
            </p>
          </div>
          <img
            src="/logo.png"
            alt="Podcast"
            style={{
              width: "80px",
              height: "80px",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
