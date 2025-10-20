import { useRef, useState, useEffect } from "react";

const AudioVisualizer = ({ onStart, audio }) => {
  const [bgVolume, setBgVolume] = useState(35); // 👈 mặc định âm lượng nhạc nền
  const [isBGPlaying, setIsBGPlaying] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const outroRef = useRef(null);
  const outroSourceRef = useRef(null);
  const canvasRef = useRef(null);
  const introRef = useRef(null);
  const bgMusicRef = useRef(null);

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const introSourceRef = useRef(null);
  const bgMusicSourceRef = useRef(null);
  const animationIdRef = useRef(null);

  const handlePlayOutro = () => {
    const audioCtx = audioCtxRef.current;
    const outroEl = outroRef.current;

    if (!audioCtx || !analyserRef.current || !outroEl) {
      alert("🎧 Hãy nhấn 'Bắt đầu Podcast' trước!");
      return;
    }

    if (!outroSourceRef.current) {
      outroSourceRef.current = audioCtx.createMediaElementSource(outroEl);
      outroSourceRef.current.connect(analyserRef.current);
      outroSourceRef.current.connect(audioCtx.destination);
    }

    outroEl.currentTime = 0;
    outroEl.play();
  };

  const handleCountdownStart = () => {
    let counter = 3;
    setCountdown(counter);

    const interval = setInterval(() => {
      counter--;
      if (counter === 0) {
        clearInterval(interval);
        setCountdown(null);
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

    // ✅ Mic
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const micSource = audioCtx.createMediaStreamSource(micStream);

    // ✅ Merger
    const merger = audioCtx.createChannelMerger(3);
    micSource.connect(merger, 0, 0);

    // ✅ Intro source
    if (!introSourceRef.current) {
      introSourceRef.current = audioCtx.createMediaElementSource(introEl);
    }
    const introSource = introSourceRef.current;
    introSource.connect(merger, 0, 0);
    introSource.connect(audioCtx.destination);

    // ✅ Background music source nếu đang tồn tại
    if (bgMusicRef.current && bgMusicSourceRef.current) {
      bgMusicSourceRef.current.connect(merger, 0, 0);
      bgMusicSourceRef.current.connect(audioCtx.destination);
    }

    merger.connect(analyser);

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

  const bgMusicGainRef = useRef(null); // 👈 thêm dòng này

  const handlePlayBackgroundMusic = () => {
    const audioCtx = audioCtxRef.current;
    const bgEl = bgMusicRef.current;

    if (!audioCtx || !analyserRef.current) {
      alert("🎧 Hãy nhấn 'Bắt đầu Podcast' trước!");
      return;
    }

    // Tính lại volume thực tế từ phần trăm
    const realVolume = (bgVolume / 100) * 0.1;

    // Nếu chưa kết nối lần nào
    if (!bgMusicSourceRef.current) {
      bgMusicSourceRef.current = audioCtx.createMediaElementSource(bgEl);

      // 🔉 Tạo gain node cho nhạc nền
      bgMusicGainRef.current = audioCtx.createGain();
      bgMusicGainRef.current.gain.value = realVolume;

      // Kết nối vào analyser + destination
      bgMusicSourceRef.current.connect(bgMusicGainRef.current);
      bgMusicGainRef.current.connect(analyserRef.current);
      bgMusicGainRef.current.connect(audioCtx.destination);
    } else {
      // Nếu đã kết nối → chỉ cập nhật lại volume nếu có thay đổi
      bgMusicGainRef.current.gain.value = realVolume;
    }

    bgEl.play();
    setIsBGPlaying(true);
  };

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value); // 0 → 100
    setBgVolume(value);

    const realVolume = (value / 100) * 0.1; // 🎯 scale lại về 0 → 0.1

    if (bgMusicGainRef.current) {
      bgMusicGainRef.current.gain.value = realVolume;
    }
  };

  const handleTogglePauseBG = () => {
    if (!audioCtxRef.current || !analyserRef.current) {
      alert("🎧 Hãy nhấn 'Bắt đầu Podcast' trước!");
      return;
    }
    const bgEl = bgMusicRef.current;
    if (!bgEl) return;

    if (isBGPlaying) {
      bgEl.pause();
      setIsBGPlaying(false);
    } else {
      bgEl.play();
      setIsBGPlaying(true);
    }
  };

  const handleStopBackgroundMusic = () => {
    const bgEl = bgMusicRef.current;
    if (!bgEl) return;

    bgEl.pause();
    bgEl.currentTime = 0;
    setIsBGPlaying(false); // ✅ cập nhật trạng thái
  };

  return (
    <>
      {countdown !== null && (
        <span
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#e74c3c",
          }}
        >
          {countdown}
        </span>
      )}
      <button onClick={handleCountdownStart} style={{ marginRight: 10 }}>
        🎧 Bắt đầu Podcast
      </button>
      <button onClick={handlePlayOutro}>🎬 Phát outro</button>
      <button onClick={handlePlayBackgroundMusic} style={{ marginRight: 10 }}>
        🎵 Phát nhạc nền
      </button>
      <button onClick={handleTogglePauseBG} style={{ marginRight: 10 }}>
        {isBGPlaying ? "⏸ Tạm dừng nhạc nền" : "▶️ Tiếp tục nhạc nền"}
      </button>
      <button onClick={handleStopBackgroundMusic}>⏹ Dừng nhạc nền</button>
      <div style={{ marginTop: 16 }}>
        <label>
          🎚 Âm lượng nhạc nền:
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={bgVolume}
            onChange={handleVolumeChange}
          />
          <span style={{ marginLeft: 8 }}>{bgVolume}%</span>
        </label>
      </div>
      <audio
        ref={outroRef}
        src="/outro.mp3"
        preload="auto"
        style={{ display: "none" }}
      />
      <audio
        ref={introRef}
        src={audio}
        preload="auto"
        style={{ display: "none" }}
      />
      <audio
        ref={bgMusicRef}
        src="/bg-music.mp3"
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
        }}
      />
    </>
  );
};

export default AudioVisualizer;
