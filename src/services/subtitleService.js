// Subtitle generation service using OpenAI Whisper API
class SubtitleService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.baseUrl = "https://api.openai.com/v1";
    this.subtitlesPath = "/subtitles";
    this.serverUrl = "http://localhost:3001/api";
  }

  // Generate filename based on audio file
  getSubtitleFilename(audioFile) {
    let audioName = audioFile.name || "podcast";

    // If it's a blob from fetch, try to get name from URL or use a default
    if (!audioName || audioName === "blob") {
      // Try to extract from URL if available
      if (audioFile.url) {
        const urlParts = audioFile.url.split("/");
        audioName = urlParts[urlParts.length - 1] || "podcast";
      } else {
        audioName = "podcast";
      }
    }

    const baseName = audioName.replace(/\.[^/.]+$/, ""); // Remove extension
    return `${baseName}_subtitles.json`;
  }

  // Check if subtitles exist locally
  async checkSubtitlesExist(audioFile) {
    const filename = this.getSubtitleFilename(audioFile);
    try {
      const response = await fetch(
        `${this.serverUrl}/check-subtitles/${filename}`
      );
      const data = await response.json();
      return data.exists;
    } catch {
      return false;
    }
  }

  // Load subtitles from local JSON file
  async loadSubtitles(audioFile) {
    const filename = this.getSubtitleFilename(audioFile);
    try {
      const response = await fetch(
        `${this.serverUrl}/load-subtitles/${filename}`
      );
      if (!response.ok) {
        throw new Error("Subtitles file not found");
      }
      const data = await response.json();
      return data.subtitles || [];
    } catch (error) {
      console.error("Error loading subtitles:", error);
      throw error;
    }
  }

  // Save subtitles to local JSON file
  async saveSubtitles(audioFile, subtitles) {
    const filename = this.getSubtitleFilename(audioFile);
    const data = {
      audioFile: audioFile.name || "podcast",
      generatedAt: new Date().toISOString(),
      language: "vi",
      subtitles: subtitles,
    };

    try {
      // Save to server
      const response = await fetch(`${this.serverUrl}/save-subtitles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: filename,
          data: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subtitles to server");
      }

      console.log("Subtitles saved to server:", filename);

      // Also save to localStorage as backup
      localStorage.setItem(`subtitles_${filename}`, JSON.stringify(data));
      console.log("Subtitles also saved to localStorage as backup");

      return true;
    } catch (error) {
      console.error("Error saving subtitles:", error);
      // Fallback to localStorage if server fails
      try {
        localStorage.setItem(`subtitles_${filename}`, JSON.stringify(data));
        console.log("Fallback: Subtitles saved to localStorage only");
        return true;
      } catch (localError) {
        console.error("Error saving to localStorage:", localError);
        return false;
      }
    }
  }

  // Load subtitles from cache (server first, then localStorage fallback)
  async loadSubtitlesFromCache(audioFile) {
    const filename = this.getSubtitleFilename(audioFile);

    try {
      // Try to load from server first
      const response = await fetch(
        `${this.serverUrl}/load-subtitles/${filename}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Loaded subtitles from server:", filename);
        return data.subtitles || [];
      } else if (response.status === 404) {
        console.log("Subtitles file not found on server:", filename);
        // Don't throw error, just continue to localStorage check
      }
    } catch (error) {
      console.log("Server not available, trying localStorage...");
    }

    // Fallback to localStorage
    try {
      const cached = localStorage.getItem(`subtitles_${filename}`);
      if (cached) {
        const data = JSON.parse(cached);
        console.log("Loaded subtitles from localStorage:", filename);
        return data.subtitles || [];
      }
      return null;
    } catch (error) {
      console.error("Error loading cached subtitles:", error);
      return null;
    }
  }

  async generateSubtitles(
    audioFile,
    language = "vi",
    forceRegenerate = false,
    progressCallback = null
  ) {
    try {
      // Check if subtitles already exist and not forcing regenerate
      if (!forceRegenerate) {
        const cachedSubtitles = await this.loadSubtitlesFromCache(audioFile);
        if (cachedSubtitles && cachedSubtitles.length > 0) {
          console.log("Loading subtitles from cache");
          return cachedSubtitles;
        } else {
          console.log("No cached subtitles found, will generate from API");
        }
      }

      if (!this.apiKey) {
        throw new Error(
          "OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables."
        );
      }

      console.log("Generating subtitles from API...");

      // Update progress
      if (progressCallback) {
        progressCallback(30, "Đang gửi yêu cầu đến OpenAI...");
      }

      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("model", "whisper-1");
      formData.append("language", language);
      formData.append("response_format", "srt");

      // Update progress
      if (progressCallback) {
        progressCallback(40, "Đang xử lý âm thanh...");
      }

      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API Error: ${errorData.error?.message || "Unknown error"}`
        );
      }

      // Update progress
      if (progressCallback) {
        progressCallback(60, "Đang nhận kết quả từ API...");
      }

      const srtContent = await response.text();

      // Update progress
      if (progressCallback) {
        progressCallback(70, "Đang phân tích phụ đề...");
      }

      const subtitles = this.parseSRT(srtContent);

      // Update progress
      if (progressCallback) {
        progressCallback(80, "Đang lưu vào cache...");
      }

      // Save to cache
      await this.saveSubtitles(audioFile, subtitles);

      return subtitles;
    } catch (error) {
      console.error("Error generating subtitles:", error);
      throw error;
    }
  }

  parseSRT(srtContent) {
    const subtitles = [];
    const blocks = srtContent.trim().split("\n\n");

    blocks.forEach((block) => {
      const lines = block.split("\n");
      if (lines.length >= 3) {
        const index = parseInt(lines[0]);
        const timeMatch = lines[1].match(
          /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/
        );

        if (timeMatch) {
          const startTime = this.parseTimeToSeconds(timeMatch[1]);
          const endTime = this.parseTimeToSeconds(timeMatch[2]);
          const text = lines.slice(2).join(" ");

          subtitles.push({
            index,
            startTime,
            endTime,
            text: text.trim(),
          });
        }
      }
    });

    return subtitles;
  }

  parseTimeToSeconds(timeString) {
    const [time, milliseconds] = timeString.split(",");
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms
      .toString()
      .padStart(3, "0")}`;
  }

  // Get current subtitle based on elapsed time
  getCurrentSubtitle(subtitles, currentTime) {
    return subtitles.find(
      (subtitle) =>
        currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    );
  }

  // Get upcoming subtitles for preview
  getUpcomingSubtitles(subtitles, currentTime, count = 3) {
    return subtitles
      .filter((subtitle) => subtitle.startTime > currentTime)
      .slice(0, count);
  }
}

export default new SubtitleService();
