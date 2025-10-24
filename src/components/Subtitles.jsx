import React, { useState, useEffect } from "react";

const Subtitles = ({ subtitles = [], currentTime = 0, style = {} }) => {
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
      .slice(0, 2);
    setUpcomingSubtitles(upcoming);
  }, [subtitles, currentTime]);

  return (
    <div
      style={{
        width: "100%",
        zIndex: 1000,
        color: "black",
        ...style,
      }}
    >
      <div style={{ zoom: 1.4 }}>
        {/* Current subtitle */}
        {currentSubtitle && (
          <div
            style={{
              fontSize: "18px",
              fontWeight: "800",
              lineHeight: "1.4",
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
              color: "black",
              lineHeight: "1.3",
            }}
          >
            {upcomingSubtitles.map((subtitle, index) => (
              <div
                key={subtitle.index}
                style={{
                  marginBottom: "3px",
                  opacity: 0.8 - index * 0.6,
                }}
              >
                {subtitle.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subtitles;
