import React, { useState, useEffect } from "react";

const SubtitleDisplay = ({
  subtitles = [],
  currentTime = 0,
  isGenerating = false,
  error = null,
  subtitleSource = null,
  progress = 0,
  progressText = "",
  onGenerateSubtitles,
  onClearCacheAndRegenerate,
  onToggleSubtitles,
  showSubtitles = true,
}) => {
  const [currentSubtitle, setCurrentSubtitle] = useState(null);
  const [upcomingSubtitles, setUpcomingSubtitles] = useState([]);

  useEffect(() => {
    if (subtitles.length === 0) return;

    // Find current subtitle
    const current = subtitles.find(
      (subtitle) =>
        currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    );
    setCurrentSubtitle(current);

    // Find upcoming subtitles
    const upcoming = subtitles
      .filter((subtitle) => subtitle.startTime > currentTime)
      .slice(0, 3);
    setUpcomingSubtitles(upcoming);
  }, [subtitles, currentTime]);

  if (!showSubtitles) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        maxWidth: "800px",
        zIndex: 1000,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "20px",
        borderRadius: "10px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={onToggleSubtitles}
            style={{
              padding: "8px 16px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "5px",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {showSubtitles ? "Ẩn phụ đề" : "Hiện phụ đề"}
          </button>

          {subtitles.length === 0 && (
            <button
              onClick={() => onGenerateSubtitles(false)}
              disabled={isGenerating}
              style={{
                padding: "8px 16px",
                backgroundColor: isGenerating
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(74, 144, 226, 0.8)",
                border: "1px solid rgba(74, 144, 226, 0.5)",
                borderRadius: "5px",
                color: "white",
                cursor: isGenerating ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              {isGenerating ? "Đang tạo phụ đề..." : "Tạo phụ đề tự động"}
            </button>
          )}

          {subtitles.length > 0 && (
            <button
              onClick={onClearCacheAndRegenerate}
              disabled={isGenerating}
              style={{
                padding: "8px 16px",
                backgroundColor: isGenerating
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(220, 38, 38, 0.8)",
                border: "1px solid rgba(220, 38, 38, 0.5)",
                borderRadius: "5px",
                color: "white",
                cursor: isGenerating ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              {isGenerating ? "Đang tạo lại..." : "Tạo lại phụ đề"}
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {subtitleSource && (
            <div
              style={{
                color: subtitleSource === "cache" ? "#10b981" : "#3b82f6",
                fontSize: "12px",
                textAlign: "right",
                fontWeight: "500",
              }}
            >
              {subtitleSource === "cache"
                ? "📁 Đã tải từ cache"
                : "🌐 Đã tạo từ API"}
            </div>
          )}

          {error && (
            <div
              style={{
                color: "#ff6b6b",
                fontSize: "12px",
                textAlign: "right",
              }}
            >
              Lỗi: {error}
            </div>
          )}
        </div>
      </div>

      {/* Current subtitle */}
      {currentSubtitle && (
        <div
          style={{
            fontSize: "18px",
            fontWeight: "500",
            lineHeight: "1.4",
            textAlign: "center",
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "5px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {currentSubtitle.text}
        </div>
      )}

      {/* Upcoming subtitles preview */}
      {upcomingSubtitles.length > 0 && (
        <div
          style={{
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.7)",
            lineHeight: "1.3",
          }}
        >
          <div style={{ marginBottom: "5px", fontWeight: "500" }}>
            Tiếp theo:
          </div>
          {upcomingSubtitles.map((subtitle, index) => (
            <div
              key={subtitle.index}
              style={{
                marginBottom: "3px",
                opacity: 0.8 - index * 0.2,
              }}
            >
              {subtitle.text}
            </div>
          ))}
        </div>
      )}

      {/* Loading state with progress bar */}
      {isGenerating && (
        <div
          style={{
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "14px",
            marginBottom: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            {progressText || "Đang xử lý âm thanh và tạo phụ đề..."}
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "3px",
              overflow: "hidden",
              marginBottom: "5px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#4ade80",
                borderRadius: "3px",
                transition: "width 0.3s ease",
                boxShadow: "0 0 10px rgba(74, 222, 128, 0.5)",
              }}
            />
          </div>

          {/* Progress percentage */}
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            {progress}%
          </div>
        </div>
      )}

      {/* No subtitles state */}
      {!isGenerating && subtitles.length === 0 && !error && (
        <div
          style={{
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "14px",
            fontStyle: "italic",
          }}
        >
          Nhấn "Tạo phụ đề tự động" để bắt đầu
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SubtitleDisplay;
