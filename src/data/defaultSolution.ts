import { MathEdResponse } from '../types/mathed';

export const DEFAULT_SOLUTION: MathEdResponse = {
  topic: 'geometry',
  title: 'Thiết diện hình chóp S.ABCD cắt bởi mặt phẳng (MNP)',
  curriculum: 'Toán 11 - SGK Kết Nối Tri Thức - Bài 11: Hai đường thẳng song song trong không gian',
  consistencyCheck: {
    isValid: true,
    notes: 'Đáy ABCD là hình bình hành lồi. Ba điểm M, N, P không thẳng hàng và lần lượt thuộc các cạnh SA, SB, SC, tạo thành một mặt phẳng cắt duy nhất.',
  },
  section1_analysis: {
    hypotheses: [
      'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình bình hành.',
      '$M$ là trung điểm cạnh $SA$ ($SM = \\frac{1}{2}SA$).',
      '$N$ nằm trên cạnh $SB$ sao cho $SN = \\frac{2}{3}SB$.',
      '$P$ nằm trên cạnh $SC$ sao cho $SP = \\frac{1}{2}SC$.',
      'Mặt phẳng $(\\alpha) = (MNP)$ cắt các cạnh và mặt của hình chóp.',
    ],
    conclusion: 'Xác định giao tuyến của mặt phẳng $(MNP)$ với các mặt của hình chóp và hình tính đa giác thiết diện thu được.',
    summary: 'Dạng toán kinh điển Chương IV SGK Toán 11 Kết Nối Tri Thức: Xác định giao tuyến và thiết diện bằng phương pháp kéo dài tìm điểm chung phụ trợ.',
  },
  section2_pedagogy: {
    thinkingDirection: 'Trong mặt phẳng $(SAB)$, kéo dài $MN$ cắt cạnh đáy $AB$ tại điểm $E$. Trong mặt phẳng $(SBC)$, kéo dài $NP$ cắt cạnh đáy $BC$ tại điểm $F$. Khi đó đường thẳng $EF$ là giao tuyến của mặt phẳng cắt $(MNP)$ với mặt phẳng đáy $(ABCD)$.',
    auxiliaryElements: [
      'Kéo dài $MN$ cắt $AB$ tại điểm phụ trợ $E = MN \\cap AB$.',
      'Kéo dài $NP$ cắt $BC$ tại điểm phụ trợ $F = NP \\cap BC$.',
      'Đường thẳng giao tuyến đáy $EF$ cắt $AD$ tại $Q$ và cắt $CD$ tại $R$.',
      'Đoạn $MQ$ là giao tuyến với mặt $(SAD)$, đoạn $PR$ là giao tuyến với mặt $(SCD)$.',
    ],
    pedagogicalAdvice: 'Giáo viên hướng dẫn học sinh: Hai đường thẳng chỉ có thể cắt nhau khi chúng cùng thuộc một mặt phẳng. Do $MN$ và $AB$ cùng nằm trong $(SAB)$ nên mới kéo dài cắt nhau tại $E$.',
  },
  section3_solution: {
    steps: [
      {
        title: 'Bước 1: Tìm giao tuyến với các mặt bên đã có điểm chung',
        detail: 'Trong mặt phẳng $(SAB)$, đoạn giao tuyến là đoạn thẳng $MN$.\\nTrong mặt phẳng $(SBC)$, đoạn giao tuyến là đoạn thẳng $NP$.',
      },
      {
        title: 'Bước 2: Tìm giao tuyến với mặt phẳng đáy (ABCD)',
        detail: 'Trong mặt phẳng $(SAB)$, gọi $E = MN \\cap AB$ (do $M, N$ không song song với $AB$).\\nTrong mặt phẳng $(SBC)$, gọi $F = NP \\cap BC$.\\nVì $E, F \\in (MNP)$ và $E, F \\in (ABCD)$, nên đường thẳng $EF$ chính là giao tuyến của $(MNP)$ với mặt phẳng đáy $(ABCD)$.',
      },
      {
        title: 'Bước 3: Xác định các đỉnh giao điểm trên các cạnh đáy và mặt còn lại',
        detail: 'Trong mặt đáy $(ABCD)$, nối đường thẳng $EF$:\\n- Gọi $Q = EF \\cap AD \\implies Q \\in (MNP) \\cap (SAD)$.\\n- Gọi $R = EF \\cap CD \\implies R \\in (MNP) \\cap (SCD)$.\\nKhi đó, đoạn giao tuyến của $(MNP)$ với $(SAD)$ là đoạn $MQ$; với $(SCD)$ là đoạn $PR$.',
      },
      {
        title: 'Bước 4: Kết luận hình tính thiết diện',
        detail: 'Thiết diện của hình chóp $S.ABCD$ cắt bởi mặt phẳng $(MNP)$ là đa giác ngũ giác $MNPRQ$ (nằm hoàn toàn trên các mặt của hình chóp).',
      },
    ],
    finalAnswer: 'Thiết diện cần tìm là ngũ giác phẳng $MNPRQ$.',
  },
  section4_visual: {
    visualDescription: 'Hình chóp S.ABCD vẽ theo góc nhìn trực quan chuẩn SGK Kết Nối Tri Thức: Đáy ABCD nghiêng phối cảnh, cạnh sau AD và CD vẽ nét đứt (khuất), các cạnh nhìn thấy vẽ nét liền. Mặt phẳng thiết diện (MNP) được tô màu lam mờ kèm viền cam nổi bật.',
    recommendedViewpoint: 'Góc nhìn SGK Phối cảnh (Góc nâng 25°, xoay 40°), hiển thị rõ đỉnh S, các đường khuất nét đứt và mặt cắt thiết diện.',
    parameterSlider: {
      hasParameter: true,
      paramName: 'h (Vị trí mặt phẳng cắt)',
      range: [0.1, 0.9],
      description: 'Kéo thanh trượt để di chuyển mặt cắt dọc theo chiều cao hình chóp, quan sát sự thay đổi kích thước và hình tính thiết diện.',
    },
    visualData: {
      type: '3d_geometry',
      modelKind: 'pyramid_sabcd',
      vertices: [
        { name: 'S', coord: [0, 3, 0] },
        { name: 'A', coord: [-2, 0, -1.5] },
        { name: 'B', coord: [1.8, 0, -1.5] },
        { name: 'C', coord: [2.2, 0, 1.4] },
        { name: 'D', coord: [-1.6, 0, 1.4] },
        { name: 'H', coord: [0, 0, 0], isAuxiliary: true },
      ],
      cuttingPlane: {
        points: ['M', 'N', 'P', 'Q'],
        polygon: ['M', 'N', 'P', 'Q'],
      },
    },
    tikzCode: `\\begin{tikzpicture}[scale=1.1, line join=round, line cap=round, >=stealth]
  % HỖ TRỢ VẼ HÌNH _ PHẠM HẬU - Chuẩn SGK Toán Kết Nối Tri Thức
  % Tọa độ các đỉnh hình chóp S.ABCD
  \\coordinate (A) at (-2,0);
  \\coordinate (B) at (1.5,-1);
  \\coordinate (C) at (4,0);
  \\coordinate (D) at (0.5,1);
  \\coordinate (S) at (1,4);
  
  % Tọa độ các điểm thiết diện M, N, P
  \\coordinate (M) at ($(S)!0.5!(A)$);
  \\coordinate (N) at ($(S)!0.66!(B)$);
  \\coordinate (P) at ($(S)!0.5!(C)$);
  \\coordinate (Q) at ($(S)!0.45!(D)$);
  
  % Nét đứt (cạnh khuất chuẩn SGK)
  \\draw[dashed, thick] (A) -- (D) -- (C);
  \\draw[dashed, thick] (S) -- (D);
  \\draw[dashed, thick] (M) -- (Q) -- (P);
  
  % Nét liền (cạnh nhìn thấy)
  \\draw[thick] (A) -- (B) -- (C);
  \\draw[thick] (S) -- (A) (S) -- (B) (S) -- (C);
  \\draw[thick, red] (M) -- (N) -- (P);
  
  % Vùng tô màu thiết diện
  \\fill[cyan, opacity=0.25] (M) -- (N) -- (P) -- (Q) -- cycle;
  
  % Nhãn đỉnh font chuẩn Toán học
  \\node[left] at (A) {$A$};
  \\node[below] at (B) {$B$};
  \\node[right] at (C) {$C$};
  \\node[above right] at (D) {$D$};
  \\node[above] at (S) {$S$};
  \\node[left, red] at (M) {$M$};
  \\node[right, red] at (N) {$N$};
  \\node[above right, red] at (P) {$P$};
  \\node[above left, red] at (Q) {$Q$};
\\end{tikzpicture}`,
    asymptoteCode: `import three;
// HỖ TRỢ VẼ HÌNH _ PHẠM HẬU - Chuẩn SGK Toán Kết Nối Tri Thức
size(10cm);
currentprojection=orthographic(5,2,3);

triple S=(0,0,4);
triple A=(-2,-2,0);
triple B=(2,-2,0);
triple C=(2,2,0);
triple D=(-2,2,0);

triple M=interp(S,A,0.5);
triple N=interp(S,B,0.66);
triple P=interp(S,C,0.5);

draw(A--B--C, solid+1bp);
draw(C--D--A, dashed+0.8bp);
draw(S--A^^S--B^^S--C, solid+1bp);
draw(S--D, dashed+0.8bp);

draw(surface(M--N--P--cycle), cyan+opacity(0.35));
draw(M--N--P, red+1.2bp);

dot("S", S, N);
dot("A", A, SW);
dot("B", B, SE);
dot("C", C, NE);
dot("D", D, NW);
dot("M", M, W);
dot("N", N, E);
dot("P", P, NE);`,
  },
  section5_publication: {
    formatNotes: 'Chuẩn mã TikZ và Asymptote tương thích 100% tài liệu TeXLive / Overleaf / MathType. Hỗ trợ tải ảnh PNG độ nét cao chèn Word và PowerPoint.',
    sgkPlacement: 'Toán 11 - SGK Kết Nối Tri Thức Với Cuộc Sống - Chương IV: Quan hệ song song trong không gian.',
    exportSuggestions: 'Thầy/Cô có thể tải trực tiếp ảnh PNG chèn vào đề cương hoặc copy mã TikZ vào file LaTeX để in ấn đề kiểm tra.',
  },
};
