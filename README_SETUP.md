# Hướng dẫn Setup cho Local Development

## Cài đặt dependencies

```bash
npm install
```

## Chạy ứng dụng

### Cách 1: Chạy riêng lẻ (khuyến nghị)

**Terminal 1 - Chạy backend server:**

```bash
npm run server
```

**Terminal 2 - Chạy frontend:**

```bash
npm run dev
```

### Cách 2: Chạy cùng lúc

```bash
npm run dev:full
```

## Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Subtitles folder**: `public/subtitles/`

## Cấu trúc file sau khi tạo phụ đề

```
public/
└── subtitles/
    ├── .gitkeep
    ├── example_structure.json
    └── tap16_subtitles.json  # File được tạo tự động
```

## API Endpoints

- `POST /api/save-subtitles` - Lưu phụ đề
- `GET /api/load-subtitles/:filename` - Load phụ đề
- `GET /api/check-subtitles/:filename` - Kiểm tra file tồn tại
- `GET /api/list-subtitles` - Liệt kê tất cả file
- `DELETE /api/delete-subtitles/:filename` - Xóa file

## Troubleshooting

### Lỗi "Server not available"

- Đảm bảo backend server đang chạy trên port 3001
- Kiểm tra console để xem lỗi chi tiết

### Lỗi CORS

- Backend đã được cấu hình CORS cho localhost
- Nếu vẫn lỗi, kiểm tra firewall/antivirus

### File không được lưu

- Kiểm tra quyền ghi vào folder `public/subtitles/`
- Đảm bảo backend server có quyền tạo file

## Development Tips

1. **Hot Reload**: Frontend sẽ tự động reload khi code thay đổi
2. **Server Logs**: Backend sẽ log mọi request và file operations
3. **Fallback**: Nếu server không chạy, app sẽ dùng localStorage
4. **File Management**: Có thể xóa file thủ công trong folder `public/subtitles/`
