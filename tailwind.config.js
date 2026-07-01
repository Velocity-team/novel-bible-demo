/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 중립 그레이 램프(Apple식) — 따뜻함 제거, 대비 상향(가독성).
        // near-black #1d1d1f · Apple separator #d2d2d7 · 순백 캔버스.
        paper: {
          DEFAULT: "#ffffff", // 캔버스 (순백, 중립)
          2: "#f5f5f7", // 카드/오목 영역 (Apple 라이트 그레이)
          // 하위호환: 기존 paper-50~400 유틸이 중립 그레이로 매핑되도록
          50: "#ffffff",
          100: "#f5f5f7",
          200: "#ececee",
          300: "#d2d2d7",
          400: "#c7c7cc",
        },
        line: "#d2d2d7", // 헤어라인 (Apple separator — 이전보다 또렷)
        ink: {
          DEFAULT: "#1d1d1f", // 본문·제목 (Apple near-black, ~17:1)
          mid: "#424245",
          soft: "#6e6e73",
          faint: "#86868b", // 라벨·캡션 (이전 #a8a8a2 2.3:1 → ~3.6:1)
        },
        signal: {
          DEFAULT: "#c8362b", // 진짜 충돌에만 (유일한 색, 표면 <1%)
          bg: "#f7e9e7",
        },
      },
      fontFamily: {
        // 두 목소리: 도구=Pretendard, 작가의 글=Nanum Myeongjo, 숫자/코드=JetBrains Mono
        sans: [
          "Pretendard",
          '"Pretendard Variable"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Apple SD Gothic Neo"',
          '"Segoe UI"',
          "sans-serif",
        ],
        serif: ['"Nanum Myeongjo"', "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        // 거의 직각(2px). 알약(full)만 예외.
        none: "0",
        sm: "2px",
        DEFAULT: "2px",
        md: "2px",
        lg: "2px",
        xl: "2px",
        "2xl": "2px",
        "3xl": "2px",
        full: "9999px",
      },
      boxShadow: {
        // Bauhaus: 그림자 금지. 깊이는 종이 단차 + 헤어라인으로.
        // 유일한 예외 = 떠 있는 팝오버(shadow-pop).
        none: "none",
        DEFAULT: "none",
        sm: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
        card: "none",
        "card-hover": "none",
        pop: "0 8px 28px rgba(24, 24, 27, 0.14)",
      },
    },
  },
  plugins: [],
};
