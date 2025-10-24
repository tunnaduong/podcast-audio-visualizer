import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure subtitles directory exists
const subtitlesDir = path.join(__dirname, "public", "subtitles");
if (!fs.existsSync(subtitlesDir)) {
  fs.mkdirSync(subtitlesDir, { recursive: true });
}

// Save subtitles endpoint
app.post("/api/save-subtitles", (req, res) => {
  try {
    const { filename, data } = req.body;

    if (!filename || !data) {
      return res.status(400).json({ error: "Filename and data are required" });
    }

    const filePath = path.join(subtitlesDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`Subtitles saved: ${filename}`);
    res.json({ success: true, message: "Subtitles saved successfully" });
  } catch (error) {
    console.error("Error saving subtitles:", error);
    res.status(500).json({ error: "Failed to save subtitles" });
  }
});

// Load subtitles endpoint
app.get("/api/load-subtitles/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(subtitlesDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Subtitles file not found" });
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json(data);
  } catch (error) {
    console.error("Error loading subtitles:", error);
    res.status(500).json({ error: "Failed to load subtitles" });
  }
});

// Check if subtitles exist
app.get("/api/check-subtitles/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(subtitlesDir, filename);
    const exists = fs.existsSync(filePath);

    res.json({ exists });
  } catch (error) {
    console.error("Error checking subtitles:", error);
    res.status(500).json({ error: "Failed to check subtitles" });
  }
});

// List all subtitle files
app.get("/api/list-subtitles", (req, res) => {
  try {
    const files = fs
      .readdirSync(subtitlesDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => ({
        filename: file,
        path: `/subtitles/${file}`,
        size: fs.statSync(path.join(subtitlesDir, file)).size,
      }));

    res.json({ files });
  } catch (error) {
    console.error("Error listing subtitles:", error);
    res.status(500).json({ error: "Failed to list subtitles" });
  }
});

// Delete subtitles endpoint
app.delete("/api/delete-subtitles/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(subtitlesDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Subtitles deleted: ${filename}`);
      res.json({ success: true, message: "Subtitles deleted successfully" });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    console.error("Error deleting subtitles:", error);
    res.status(500).json({ error: "Failed to delete subtitles" });
  }
});

app.listen(PORT, () => {
  console.log(`Subtitle server running on http://localhost:${PORT}`);
  console.log(`Subtitles directory: ${subtitlesDir}`);
});
