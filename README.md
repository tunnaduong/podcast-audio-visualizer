# Podcast Audio Visualizer

Một ứng dụng React hiện đại để phát podcast với visualizer âm thanh và tính năng phụ đề tự động.

## Tính năng chính

- 🎵 **Audio Visualizer**: Hiển thị waveform trực tiếp từ âm thanh podcast
- 📝 **Phụ đề tự động**: Tạo phụ đề tự động bằng OpenAI Whisper API
- ⏱️ **Đồng bộ thời gian**: Phụ đề hiển thị chính xác theo thời gian phát
- 🎨 **Giao diện hiện đại**: UI/UX đẹp mắt với backdrop blur và animations
- 📱 **Responsive**: Hoạt động tốt trên mọi thiết bị

## Cài đặt

```bash
npm install
```

## Cấu hình phụ đề tự động

1. Tạo file `.env` từ template:

```bash
cp .env.example .env
```

2. Thêm OpenAI API key vào file `.env`:

```
VITE_OPENAI_API_KEY=your_api_key_here
```

3. Lấy API key từ: https://platform.openai.com/api-keys

## Chạy ứng dụng

### Cách 1: Chạy đầy đủ (khuyến nghị)

```bash
# Terminal 1: Backend server
npm run server

# Terminal 2: Frontend
npm run dev
```

### Cách 2: Chạy cùng lúc

```bash
npm run dev:full
```

Xem [README_SETUP.md](./README_SETUP.md) để biết chi tiết setup.

## Sử dụng

1. **Phát podcast**: Nhấn "🎧 Bắt đầu Podcast" để bắt đầu
2. **Tạo phụ đề**: Nhấn "Tạo phụ đề tự động" ở thanh phụ đề phía dưới
3. **Điều khiển**: Sử dụng các nút để ẩn/hiện phụ đề

## Cấu trúc dự án

```
src/
├── components/
│   ├── AudioVisualizer.jsx    # Component visualizer âm thanh
│   └── SubtitleDisplay.jsx    # Component hiển thị phụ đề
├── services/
│   └── subtitleService.js     # Service xử lý API phụ đề
└── App.jsx                     # Component chính
```

## Chi tiết về phụ đề

Xem [README_SUBTITLES.md](./README_SUBTITLES.md) để biết thêm chi tiết về tính năng phụ đề tự động.

## Công nghệ sử dụng

- **React 19**: Framework UI
- **Vite**: Build tool
- **OpenAI Whisper API**: Nhận dạng giọng nói
- **Web Audio API**: Xử lý âm thanh
- **Canvas API**: Vẽ visualizer
