import React from "react";
import AudioVisualizer from "./components/AudioVisualizer";
import SubtitleDisplay from "./components/SubtitleDisplay";
import subtitleService from "./services/subtitleService";
import Subtitles from "./components/Subtitles";

const PODCAST = {
  title: "Gác nhỏ của Tùng.",
  description: "Hành trình đi tìm đam mê vĩ đại của loài người (Phần 2)",
  image: "/tap16.jpg",
  audio: "/tap16.mp3",
  episode: 16,
};

function App() {
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [subtitles, setSubtitles] = React.useState([]);
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] =
    React.useState(false);
  const [subtitleError, setSubtitleError] = React.useState(null);
  const [showSubtitles, setShowSubtitles] = React.useState(true);
  const [subtitleSource, setSubtitleSource] = React.useState(null); // 'cache' | 'api' | null
  const [progress, setProgress] = React.useState(0);
  const [progressText, setProgressText] = React.useState("");
  const timerRef = React.useRef(null);

  const handleStartPodcast = () => {
    handleGenerateSubtitles();
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

  // Handle subtitle generation
  const handleGenerateSubtitles = async (forceRegenerate = false) => {
    setIsGeneratingSubtitles(true);
    setSubtitleError(null);
    setSubtitleSource(null);
    setProgress(0);
    setProgressText("Đang chuẩn bị...");

    try {
      // Fetch the audio file
      setProgress(10);
      setProgressText("Đang tải file âm thanh...");
      const response = await fetch(PODCAST.audio);
      const audioBlob = await response.blob();

      // Set the name property for proper filename generation
      audioBlob.name = PODCAST.audio.split("/").pop(); // Extract filename from URL
      audioBlob.url = PODCAST.audio; // Store URL for reference

      setProgress(20);
      setProgressText("Đang kiểm tra cache...");

      // Generate subtitles using the service with progress updates
      const generatedSubtitles = await subtitleService.generateSubtitles(
        audioBlob,
        "vi",
        forceRegenerate,
        (progressValue, text) => {
          setProgress(progressValue);
          setProgressText(text);
        }
      );
      setSubtitles(generatedSubtitles);

      setProgress(90);
      setProgressText("Đang lưu phụ đề...");

      // Check if loaded from cache or API
      const cachedSubtitles = await subtitleService.loadSubtitlesFromCache(
        audioBlob
      );
      if (cachedSubtitles && cachedSubtitles.length > 0 && !forceRegenerate) {
        setSubtitleSource("cache");
      } else {
        setSubtitleSource("api");
      }

      setProgress(100);
      setProgressText("Hoàn thành!");
    } catch (error) {
      console.error("Error generating subtitles:", error);
      setSubtitleError(error.message);
      setProgress(0);
      setProgressText("Có lỗi xảy ra");
    } finally {
      setIsGeneratingSubtitles(false);
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
        setProgressText("");
      }, 2000);
    }
  };

  // Handle clear cache and regenerate
  const handleClearCacheAndRegenerate = async () => {
    try {
      const response = await fetch(PODCAST.audio);
      const audioBlob = await response.blob();

      // Set the name property for proper filename generation
      audioBlob.name = PODCAST.audio.split("/").pop();
      audioBlob.url = PODCAST.audio;

      const filename = subtitleService.getSubtitleFilename(audioBlob);
      localStorage.removeItem(`subtitles_${filename}`);
      console.log("Cache cleared for:", filename);
      await handleGenerateSubtitles(true);
    } catch (error) {
      console.error("Error clearing cache:", error);
      setSubtitleError("Lỗi khi xóa cache");
    }
  };

  const handleToggleSubtitles = () => {
    setShowSubtitles(!showSubtitles);
  };

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

            <Subtitles
              subtitles={subtitles}
              currentTime={elapsedTime}
              style={{
                position: "absolute",
                top: 130,
                left: 69,
                right: 0,
                maxWidth: "690px",
              }}
            />

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
                  width: "410%",
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
                  zoom: "1.53",
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
                zoom: 1.25,
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
      {/* 
      <SubtitleDisplay
        subtitles={subtitles}
        currentTime={elapsedTime}
        isGenerating={isGeneratingSubtitles}
        error={subtitleError}
        subtitleSource={subtitleSource}
        progress={progress}
        progressText={progressText}
        onGenerateSubtitles={handleGenerateSubtitles}
        onClearCacheAndRegenerate={handleClearCacheAndRegenerate}
        onToggleSubtitles={handleToggleSubtitles}
        showSubtitles={showSubtitles}
      />
      */}
    </div>
  );
}

export default App;
