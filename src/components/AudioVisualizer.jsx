import { useRef } from "react";

const AudioVisualizer = () => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioSourceRef = useRef(null);
  const animationIdRef = useRef(null);
  const audioCtxRef = useRef(null);

  const handleStart = async () => {
    const audioElement = audioRef.current;

    // 🔁 Nếu AudioContext đã có, dùng lại
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    const audioCtx = audioCtxRef.current;

    // ✅ Reset audio (tua về đầu & tạm dừng)
    audioElement.pause();
    audioElement.currentTime = 0;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.85;

    // 1. MIC
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const micSource = audioCtx.createMediaStreamSource(micStream);

    // 2. AUDIO
    if (!audioSourceRef.current) {
      audioSourceRef.current = audioCtx.createMediaElementSource(audioElement);
    }
    const audioSource = audioSourceRef.current;

    // 3. MERGE
    const merger = audioCtx.createChannelMerger(2);
    micSource.connect(merger, 0, 0);
    audioSource.connect(merger, 0, 0);
    merger.connect(analyser);

    // 4. Chỉ phát nhạc (mic không ra loa)
    audioSource.connect(audioCtx.destination);

    // ✅ Play lại intro từ đầu
    await audioElement.play();

    // 5. VẼ WAVEFORM
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
      const barW = barWidth * 0.2;
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

      <audio
        ref={audioRef}
        src="/intro.mp3"
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
          margin: "0 auto",
        }}
      />
    </>
  );
};

export default AudioVisualizer;
