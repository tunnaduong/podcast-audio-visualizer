import { useRef, useState, useEffect } from "react";

const AudioVisualizer = ({ onStart, audio }) => {
  const [countdown, setCountdown] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  const canvasRef = useRef(null);
  const introRef = useRef(null);

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const introSourceRef = useRef(null);
  const animationIdRef = useRef(null);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Use parent dimensions, maintaining aspect ratio
      const aspectRatio = 6; // 600/100 = 6:1 aspect ratio
      const maxWidth = Math.min(containerWidth, containerHeight * aspectRatio);
      const newWidth = maxWidth;
      const newHeight = newWidth / aspectRatio;

      canvas.style.width = `${newWidth}px`;
      canvas.style.height = `${newHeight}px`;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCountdownStart = () => {
    let counter = 3;
    setCountdown(counter);

    const interval = setInterval(() => {
      counter--;
      if (counter === 0) {
        clearInterval(interval);
        setCountdown(null);
        setHasStarted(true);
        handleStart(); // 🔥 bắt đầu thật sự
        onStart(); // 🔥 gọi hàm onStart từ App.jsx
      } else {
        setCountdown(counter);
      }
    }, 1000);
  };

  const handleStart = async () => {
    const introEl = introRef.current;

    // 🔁 Nếu AudioContext đã có, dùng lại
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    const audioCtx = audioCtxRef.current;

    // 🔁 Reset intro
    introEl.pause();
    introEl.currentTime = 0;

    // ✅ Analyser
    if (!analyserRef.current) {
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;
    }
    const analyser = analyserRef.current;

    // ✅ Intro source
    if (!introSourceRef.current) {
      introSourceRef.current = audioCtx.createMediaElementSource(introEl);
    }
    const introSource = introSourceRef.current;
    introSource.connect(analyser);
    introSource.connect(audioCtx.destination);

    // 🔊 Phát intro
    await introEl.play();

    // 🎨 Vẽ waveform
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Get dimensions from parent container
      const container = canvas.parentElement;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate canvas size maintaining aspect ratio
      const aspectRatio = 6;
      const maxWidth = Math.min(containerWidth, containerHeight * aspectRatio);
      const WIDTH = maxWidth;
      const HEIGHT = maxWidth / aspectRatio;

      // Set canvas internal resolution to match display size với độ phân giải cao hơn
      const dpr = Math.max(window.devicePixelRatio || 1, 2); // Tối thiểu 2x để nét hơn
      canvas.width = WIDTH * dpr;
      canvas.height = HEIGHT * dpr;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Cải thiện chất lượng rendering
      ctx.imageSmoothingEnabled = false; // Tắt smoothing để bars nét hơn
      ctx.lineCap = "square"; // Làm cho bars vuông vức hơn

      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;
      const barCount = dataArray.length;
      const halfCount = Math.floor(barCount / 2);
      const barWidth = WIDTH / barCount;
      const barW = barWidth * 0.3;
      const spacing = barWidth * 0.1;

      ctx.fillStyle = "#333";

      const sensitivity = 1;
      const centerBarHeight =
        ((dataArray[0] * sensitivity) / 255) * (HEIGHT / 2.2);
      ctx.fillRect(
        centerX - barW / 2,
        centerY - centerBarHeight,
        barW,
        centerBarHeight
      );
      ctx.fillRect(centerX - barW / 2, centerY, barW, centerBarHeight);

      for (let i = 1; i < halfCount; i++) {
        const value = dataArray[i];
        const barHeight = ((value * sensitivity) / 255) * (HEIGHT / 2.2);
        const offset = i * (barWidth + spacing);

        ctx.fillRect(
          centerX + offset - 1,
          centerY - barHeight,
          barW,
          barHeight
        );
        ctx.fillRect(centerX + offset - 1, centerY, barW, barHeight);

        ctx.fillRect(
          centerX - offset - barW + 1,
          centerY - barHeight,
          barW,
          barHeight
        );
        ctx.fillRect(centerX - offset - barW + 1, centerY, barW, barHeight);
      }
    };

    draw();
  };

  return (
    <>
      <div style={{ position: "relative", top: -200, right: -100 }}>
        {countdown !== null && (
          <span
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#e74c3c",
              position: "absolute",
              top: 0,
              right: 0,
            }}
          >
            {countdown}
          </span>
        )}
        {!hasStarted && (
          <button
            onClick={handleCountdownStart}
            style={{
              marginRight: 10,
              position: "absolute",
              top: 0,
              width: 180,
            }}
          >
            🎧 Bắt đầu Podcast
          </button>
        )}
      </div>
      <audio
        ref={introRef}
        src={audio}
        preload="auto"
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        width="600"
        height="100"
        style={{
          backgroundColor: "transparent",
          display: "block",
          margin: "50px auto",
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </>
  );
};

export default AudioVisualizer;
