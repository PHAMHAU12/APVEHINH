# HỖ TRỢ VẼ HÌNH _ PHẠM HẬU

Ứng dụng chuyên biệt hỗ trợ **Giáo viên môn Toán** vẽ **Hình học không gian** và **Đồ thị hàm số** chuẩn Sách giáo khoa **Kết Nối Tri Thức Với Cuộc Sống** (Toán 10, Toán 11 và Toán 12).

---

## 🌟 Tính Năng Nổi Bật

1. **Dán & Tải Ảnh Đề Bài Chụp Từ Sách (Multimodal Vision OCR):**
   - **Phím tắt Ctrl + V**: Giáo viên chụp ảnh bài tập trong SGK hoặc đề thi bằng điện thoại / Zalo, chỉ cần bấm `Ctrl + V` là ảnh lập tức được nạp vào ứng dụng.
   - **Kéo thả & Tải ảnh**: Hỗ trợ kéo thả ảnh đề bài hoặc chọn tệp từ máy tính.
   - **Thị giác AI nhận diện thông minh**: AI tự động trích xuất chữ và công thức toán từ ảnh chụp, nhận diện đúng dạng bài (hình chóp, lăng trụ hay đồ thị hàm số) và tiến hành dựng hình ngay tức thì.
   - **Nút "Trích xuất chữ (OCR)"**: Cho phép chuyển ảnh thành văn bản trong ô nhập để giáo viên kiểm tra và chỉnh sửa nhanh nếu muốn.

2. **Chuyên Biệt 2 Mảng Trọng Tâm SGK Kết Nối Tri Thức:**
   - **Hình học không gian (Toán 11 & 12)**:
     - Hình chóp ($S.ABCD, S.ABC$, chóp đều, chóp có cạnh bên vuông góc đáy).
     - Thiết diện cắt bởi mặt phẳng (xác định giao tuyến, giao điểm, đa giác thiết diện).
     - Hình lăng trụ đứng/xiên, hình lập phương, hình hộp chữ nhật.
     - Quan hệ vuông góc, đường cao, góc giữa đường thẳng và mặt phẳng, khoảng cách.
     - Hệ tọa độ $Oxyz$ và phương trình mặt phẳng trong không gian.
   - **Đồ thị hàm số & Giải tích (Toán 10 & 12)**:
     - Hàm bậc ba $y = ax^3 + bx^2 + cx + d$.
     - Hàm phân thức nhất biến $y = \frac{ax+b}{cx+d}$ (tiệm cận đứng, tiệm cận ngang, tâm đối xứng).
     - Hàm phân thức bậc 2 trên bậc 1 $y = \frac{ax^2+bx+c}{dx+e}$ (tiệm cận đứng, tiệm cận xiên).
     - Bảng biến thiên (BBT) 3 dòng chuẩn mẫu quy ước SGK Kết Nối Tri Thức.
     - Biện luận tương giao số nghiệm phương trình theo tham số $m$.
     - Ứng dụng tích phân tính diện tích hình phẳng (vùng tô màu gạch sọc).

3. **Quy Chuẩn Đồ Họa & Font Sư Phạm:**
   - Chuẩn font Toán học KaTeX / STIX Two Math rõ nét, không răng cưa.
   - Quy chuẩn nét vẽ: **Nét đứt (cạnh khuất)** và **nét liền (cạnh nhìn thấy)** phân định chuẩn mực sư phạm Việt Nam.
   - **Xuất ảnh PNG độ nét cao (HD)**: Giáo viên click 1 chạm để tải ảnh chèn ngay vào Word giáo án hoặc PowerPoint bài giảng.
   - **Xuất mã TikZ & Asymptote**: Tương thích 100% TeXLive, Overleaf và MathType.

4. **Cơ Chế Quản Lý API Key & Mô Hình Dự Phòng:**
   - Hỗ trợ nhập Gemini API Key miễn phí từ [Google AI Studio](https://aistudio.google.com/api-keys), lưu bảo mật trong `localStorage`.
   - Nút **Settings (API Key)** kèm liên kết màu đỏ *"Lấy API key để sử dụng app"* luôn hiển thị trên Header.
   - Cơ chế tự động fallback dự phòng:
     1. `gemini-3-flash-preview` (Mặc định)
     2. `gemini-3-pro-preview`
     3. `gemini-2.5-flash`
   - Bộ dựng hình cục bộ toán học thông minh (Offline Core) đảm bảo giáo viên luôn có hình vẽ chính xác ngay cả khi không có mạng hoặc hết quota.

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Run Locally)

1. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   # hoặc bun install
   ```

2. Cài đặt API Key (Tùy chọn):
   - Đặt trong `.env`:
     ```env
     GEMINI_API_KEY=AIzaSy...
     ```
   - Hoặc nhập trực tiếp trên giao diện web qua nút **Cài đặt API Key**.

3. Khởi chạy ứng dụng:
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại: `http://localhost:3000`

---

## 🌐 Triển Khai Lên Vercel (Deployment)

Dự án đã tích hợp sẵn file cấu hình `vercel.json` phục vụ định tuyến Single Page Application (SPA):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Giáo viên có thể kết nối kho lưu trữ GitHub với Vercel để triển khai tự động chỉ trong 1 phút.
