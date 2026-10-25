export interface MathPreset {
  id: string;
  category: 'geometry' | 'calculus';
  badge: string;
  curriculum: string;
  title: string;
  prompt: string;
}

export const MATH_PRESETS: MathPreset[] = [
  // HÌNH HỌC KHÔNG GIAN (TOÁN 11 & TOÁN 12 KẾT NỐI TRI THỨC)
  {
    id: 'kntt-hh11-sabcd-thiet-dien',
    category: 'geometry',
    badge: 'HHKG 11 - Thiết diện chóp S.ABCD',
    curriculum: 'Toán 11 - SGK Kết Nối Tri Thức - Bài 11: Hai đường thẳng song song',
    title: 'Thiết diện chóp S.ABCD cắt bởi mặt phẳng (MNP)',
    prompt: 'Cho hình chóp S.ABCD có đáy ABCD là hình bình hành. Gọi M là trung điểm SA, N nằm trên cạnh SB (SN/SB = 2/3), P nằm trên cạnh SC (SP/SC = 1/2). Hãy phân tích và vẽ thiết diện của hình chóp cắt bởi mặt phẳng (MNP), xác định giao tuyến và hình tính của thiết diện.',
  },
  {
    id: 'kntt-hh11-lang-tru-dung',
    category: 'geometry',
    badge: 'HHKG 11 - Lăng trụ ABC.A\'B\'C\'',
    curriculum: 'Toán 11 - SGK Kết Nối Tri Thức - Bài 23: Đường thẳng vuông góc với mặt phẳng',
    title: 'Lăng trụ đứng tam giác ABC.A\'B\'C\' & Góc giữa đường thẳng và mặt phẳng',
    prompt: 'Cho hình lăng trụ đứng ABC.A\'B\'C\' có đáy ABC là tam giác vuông tại B, AB = a, BC = a√3, chiều cao AA\' = 2a. Hãy vẽ hình chuẩn SGK Kết Nối Tri Thức với nét đứt nét liền, xác định góc giữa đường thẳng A\'C và mặt phẳng đáy (ABC) và tính số đo góc.',
  },
  {
    id: 'kntt-hh11-khoang-cach-chop-vuong',
    category: 'geometry',
    badge: 'HHKG 11 - Đường cao & Khoảng cách',
    curriculum: 'Toán 11 - SGK Kết Nối Tri Thức - Bài 24: Khoảng cách trong không gian',
    title: 'Khoảng cách từ điểm A đến mặt phẳng (SBD) trong chóp S.ABCD đáy hình vuông',
    prompt: 'Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, SA vuông góc với đáy (ABCD) và SA = a√2. Hãy vẽ hình chuẩn SGK, dựng đoạn vuông góc AH từ A đến mặt phẳng (SBD) và tính khoảng cách từ A đến (SBD).',
  },
  {
    id: 'kntt-hh12-oxyz-mat-phang',
    category: 'geometry',
    badge: 'HHKG 12 - Hệ tọa độ Oxyz & Khối chóp',
    curriculum: 'Toán 12 - SGK Kết Nối Tri Thức - Bài 6: Phương trình mặt phẳng trong không gian Oxyz',
    title: 'Hệ tọa độ Oxyz và mặt phẳng cắt các trục tọa độ A(2,0,0), B(0,3,0), C(0,0,4)',
    prompt: 'Trong không gian Oxyz, cho các điểm A(2, 0, 0), B(0, 3, 0), C(0, 0, 4) và đỉnh S(2, 3, 4). Hãy dựng hệ trục tọa độ Oxyz và khối đa diện S.ABC chuẩn SGK Kết Nối Tri Thức, xác định phương trình mặt phẳng theo đoạn chắn (ABC).',
  },

  // ĐỒ THỊ HÀM SỐ (TOÁN 10 & TOÁN 12 KẾT NỐI TRI THỨC)
  {
    id: 'kntt-dt12-bac-ba-bien-luan',
    category: 'calculus',
    badge: 'Đồ thị 12 - Hàm bậc ba y = x³ - 3x',
    curriculum: 'Toán 12 - SGK Kết Nối Tri Thức - Bài 3: Khảo sát sự biến thiên và vẽ đồ thị hàm số',
    title: 'Khảo sát hàm số bậc ba y = x³ - 3x & Biện luận tương giao tham số m',
    prompt: 'Khảo sát sự biến thiên và vẽ đồ thị hàm số y = x^3 - 3x. Lập bảng biến thiên chuẩn SGK Kết Nối Tri Thức, xác định tọa độ cực trị và dùng thanh trượt m để biện luận số nghiệm của phương trình x^3 - 3x + m = 0.',
  },
  {
    id: 'kntt-dt12-nhat-bien',
    category: 'calculus',
    badge: 'Đồ thị 12 - Nhất biến y = (2x - 1)/(x + 1)',
    curriculum: 'Toán 12 - SGK Kết Nối Tri Thức - Bài 3: Khảo sát sự biến thiên và vẽ đồ thị hàm số',
    title: 'Khảo sát hàm phân thức nhất biến y = (2x - 1)/(x + 1) có tiệm cận đứng và ngang',
    prompt: 'Khảo sát sự biến thiên và vẽ đồ thị hàm số y = (2x - 1)/(x + 1). Tìm tiệm cận đứng x = -1, tiệm cận ngang y = 2, tâm đối xứng I(-1; 2), bảng biến thiên và đồ thị Hyperbol chuẩn SGK Kết Nối Tri Thức.',
  },
  {
    id: 'kntt-dt12-tiem-can-xien',
    category: 'calculus',
    badge: 'Đồ thị 12 - Tiệm cận xiên (x² - x + 1)/(x - 1)',
    curriculum: 'Toán 12 - SGK Kết Nối Tri Thức - Bài 3: Khảo sát hàm số hữu tỉ (SGK KNTT mới)',
    title: 'Khảo sát hàm phân thức bậc 2 trên bậc 1 y = (x² - x + 1)/(x - 1) có tiệm cận xiên',
    prompt: 'Khảo sát sự biến thiên và vẽ đồ thị hàm số y = (x^2 - x + 1)/(x - 1). Xác định tiệm cận đứng x = 1, tiệm cận xiên y = x, tọa độ cực đại, cực tiểu và bảng biến thiên chuẩn SGK Kết Nối Tri Thức.',
  },
  {
    id: 'kntt-dt12-tich-phan-dien-tich',
    category: 'calculus',
    badge: 'Đồ thị 12 - Ứng dụng tích phân tính diện tích',
    curriculum: 'Toán 12 - SGK Kết Nối Tri Thức - Chương IV: Ứng dụng tích phân trong hình học',
    title: 'Tính diện tích hình phẳng giới hạn bởi Parabol y = -x² + 2x và trục Ox',
    prompt: 'Tính diện tích hình phẳng giới hạn bởi đồ thị hàm số y = -x^2 + 2x và trục hoành Ox. Vẽ đồ thị chuẩn SGK, tô màu gạch sọc miền tích phân và sinh mã TikZ để giáo viên in đề thi.',
  },
];
