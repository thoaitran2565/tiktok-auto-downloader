# TikTok Auto Downloader 🚀

Tiện ích mở rộng trình duyệt (Chrome Extension) giúp tự động hóa quá trình tải video TikTok, hỗ trợ lưu lịch sử để tránh tải trùng lặp và tự động chuyển sang video tiếp theo.

## ✨ Tính năng nổi bật

- **Tự động hóa hoàn toàn**: Tự động giả lập thao tác chuột phải, click nút tải video và chuyển sang video kế tiếp.
- **Xử lý thông minh khi mạng lag**: Sử dụng cơ chế chờ linh hoạt (`waitForElement`), giúp tool hoạt động mượt mà ngay cả khi đường truyền internet chậm hoặc giao diện phản hồi chậm.
- **Quản lý lịch sử (JSON)**: Tự động lưu tiêu đề video đã tải vào bộ nhớ JSON của extension (`chrome.storage.local`).
- **Chống tải trùng lặp**: Tự động kiểm tra tiêu đề video hiện tại với lịch sử đã lưu; nếu video đã tồn tại, tiện ích sẽ tự động dừng lại để tiết kiệm thời gian.
- **Giao diện trực quan**: Bảng điều khiển nhỏ gọn (Popup) dễ dàng bật/tắt trực tiếp trên trang TikTok.

---

## 📂 Cấu trúc thư mục dự án

Dự án bao gồm các tệp mã nguồn chính sau:
```text
tiktok-auto-downloader/
├── manifest.json       # Tệp cấu hình cốt lõi của Chrome Extension
├── popup.html          # Giao diện cửa sổ bật lên (Popup UI)
├── popup.js            # Logic điều khiển bật/tắt từ Popup
├── content.js          # Logic tự động hóa chạy trực tiếp trên trang TikTok
└── README.md           # Tệp hướng dẫn sử dụng dự án
```

---

## 🛠️ Hướng dẫn cài đặt và sử dụng

### Bước 1: Tải mã nguồn
Tải toàn bộ các tệp của dự án vào chung một thư mục trên máy tính của bạn.

### Bước 2: Cài đặt Extension vào trình duyệt (Chrome/Edge)
1. Mở trình duyệt và truy cập vào đường dẫn quản lý tiện ích:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
2. Bật **Chế độ nhà phát triển** (Developer mode) ở góc trên bên phải màn hình.
3. Nhấn vào nút **Tải tiện ích đã giải nén** (Load unpacked) ở góc trên bên trái.
4. Chọn thư mục chứa mã nguồn của dự án.

### Bước 3: Chạy tiện ích trên TikTok
1. Truy cập vào trang web [TikTok](https://www.tiktok.com).
2. Nhấp vào biểu tượng của Extension trên thanh công cụ trình duyệt để mở bảng điều khiển.
3. Nhấn nút **"Bắt đầu"** để tiện ích bắt đầu chạy tự động.
4. Nhấn **"Dừng lại"** bất cứ lúc nào nếu bạn muốn ngắt quá trình.

---

## ⚙️ Cấu hình quyền trong `manifest.json`
Extension yêu cầu các quyền cơ bản sau để hoạt động ổn định:
- `activeTab`: Tương tác với tab trình duyệt hiện tại đang mở TikTok.
- `scripting`: Chèn và thực thi mã tự động hóa trên trang.
- `storage`: Lưu trữ danh sách lịch sử video đã tải dưới định dạng JSON an toàn.