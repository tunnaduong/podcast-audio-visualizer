# Tính năng Phụ đề Tự động cho Podcast

## Tổng quan

Ứng dụng Podcast Audio Visualizer đã được nâng cấp với tính năng tự động tạo phụ đề sử dụng OpenAI Whisper API. Tính năng này cho phép:

- Tự động chuyển đổi âm thanh podcast thành văn bản
- Hiển thị phụ đề đồng bộ với thời gian phát
- Xem trước các câu phụ đề sắp tới
- Tắt/bật hiển thị phụ đề

## Cài đặt

### 1. Cấu hình API Key

1. Tạo file `.env` trong thư mục gốc của dự án
2. Copy nội dung từ `.env.example` và thay thế `your_openai_api_key_here` bằng API key thực của bạn
3. Lấy API key từ: https://platform.openai.com/api-keys

```bash
cp .env.example .env
```

Sau đó chỉnh sửa file `.env`:

```
VITE_OPENAI_API_KEY=your_actual_api_key_here
```

### 2. Cài đặt dependencies

Không cần cài đặt thêm dependencies vì sử dụng fetch API có sẵn trong trình duyệt.

## Sử dụng

### Tạo phụ đề tự động

1. Khởi động ứng dụng
2. Nhấn nút "Tạo phụ đề tự động" ở thanh phụ đề phía dưới
3. Chờ quá trình xử lý hoàn tất (có thể mất vài phút tùy thuộc vào độ dài podcast)
4. Phụ đề sẽ tự động hiển thị và đồng bộ với âm thanh

### Điều khiển phụ đề

- **Ẩn/Hiện phụ đề**: Nhấn nút "Ẩn phụ đề" hoặc "Hiện phụ đề"
- **Xem trước**: Các câu phụ đề sắp tới sẽ hiển thị ở phần "Tiếp theo"
- **Đồng bộ thời gian**: Phụ đề sẽ tự động cập nhật theo thời gian phát

## Tính năng kỹ thuật

### API Integration

- Sử dụng OpenAI Whisper API cho nhận dạng giọng nói tiếng Việt
- Hỗ trợ định dạng SRT cho phụ đề
- Xử lý lỗi và loading states

### Caching System

- **LocalStorage Cache**: Lưu trữ phụ đề trong localStorage để tránh gọi API nhiều lần
- **JSON Format**: Lưu trữ dưới dạng JSON với metadata đầy đủ
- **Auto-detect**: Tự động phát hiện và load từ cache nếu có
- **Manual Refresh**: Nút "Tạo lại phụ đề" để force regenerate từ API

### UI/UX

- Giao diện phụ đề hiện đại với backdrop blur
- Hiển thị trạng thái loading và lỗi
- **Source Indicator**: Hiển thị phụ đề được tải từ cache (📁) hay API (🌐)
- Responsive design cho các kích thước màn hình khác nhau

### Performance

- **Smart Caching**: Ưu tiên load từ cache, chỉ gọi API khi cần
- **Lazy Loading**: Chỉ load phụ đề khi người dùng yêu cầu
- **Memory Efficient**: Sử dụng localStorage thay vì server storage
- Tối ưu hóa re-rendering

## Xử lý lỗi

### Lỗi thường gặp

1. **API Key không hợp lệ**: Kiểm tra lại API key trong file `.env` (phải có prefix `VITE_`)
2. **Lỗi mạng**: Kiểm tra kết nối internet
3. **File âm thanh không tồn tại**: Đảm bảo file audio tồn tại trong thư mục `public/`

### Debug

- Mở Developer Tools (F12) để xem console logs
- Kiểm tra Network tab để debug API calls
- Xem lỗi chi tiết trong component SubtitleDisplay

## Chi phí API

- OpenAI Whisper API tính phí theo thời lượng âm thanh
- Giá: $0.006/phút (khoảng 150 VND/phút)
- Ví dụ: Podcast 30 phút ≈ 4,500 VND

## Bảo mật

- API key được lưu trong biến môi trường với prefix `VITE_`
- Không commit file `.env` vào git
- Sử dụng HTTPS cho tất cả API calls
- Vite chỉ expose các biến có prefix `VITE_` ra client-side
