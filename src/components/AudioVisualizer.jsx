import { useRef } from "react";

const AudioVisualizer = () => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioSourceRef = useRef(null);
  const animationIdRef = useRef(null);

  const handleStart = async () => {
    const audioElement = audioRef.current;

    // 💡 Tạo AudioContext tại thời điểm user click
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.85;

    // 1. Mic
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const micSource = audioCtx.createMediaStreamSource(micStream);

    // 2. Audio file (intro)
    if (!audioSourceRef.current) {
      audioSourceRef.current = audioCtx.createMediaElementSource(audioElement);
    }
    const audioSource = audioSourceRef.current;

    // 3. Merger
    const merger = audioCtx.createChannelMerger(2);
    micSource.connect(merger, 0, 0);
    audioSource.connect(merger, 0, 0);
    merger.connect(analyser);

    // 4. Chỉ phát nhạc (mic không ra loa)
    audioSource.connect(audioCtx.destination);

    // 🔊 Phát intro
    await audioElement.play();

    // 5. Visualize
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;
      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;

      const barCount = dataArray.length;
      const halfCount = Math.floor(barCount / 2);
      const barWidth = WIDTH / barCount;
      const barW = barWidth * 0.3;
      const spacing = barWidth * 0.1;

      ctx.fillStyle = "#333";

      const centerBarHeight = (dataArray[0] / 255) * (HEIGHT / 2.2);
      ctx.fillRect(
        centerX - barW / 2,
        centerY - centerBarHeight,
        barW,
        centerBarHeight
      );
      ctx.fillRect(centerX - barW / 2, centerY, barW, centerBarHeight);

      for (let i = 1; i < halfCount; i++) {
        const value = dataArray[i];
        const barHeight = (value / 255) * (HEIGHT / 2.2);
        const offset = i * (barWidth + spacing);

        ctx.fillRect(
          centerX + offset - 3,
          centerY - barHeight,
          barW,
          barHeight
        );
        ctx.fillRect(centerX + offset - 3, centerY, barW, barHeight);

        ctx.fillRect(
          centerX - offset - barW + 3,
          centerY - barHeight,
          barW,
          barHeight
        );
        ctx.fillRect(centerX - offset - barW + 3, centerY, barW, barHeight);
      }
    };

    draw();
  };

  return (
    <>
      <button onClick={handleStart} style={{ marginBottom: 20 }}>
        🎧 Bắt đầu Podcast
      </button>

      {/* Nhạc intro */}
      <audio
        ref={audioRef}
        src="/intro.mp3"
        preload="none" // ❗ QUAN TRỌNG: không preload
        style={{ display: "none" }}
      />

      {/* Waveform */}
      <canvas
        ref={canvasRef}
        width="400"
        height="100"
        style={{
          backgroundColor: "transparent",
          display: "block",
          margin: "0 auto",
        }}
      />
    </>
  );
};

export default AudioVisualizer;
