import type { MeetingTurn } from "../types";

const P = 4;

function splitBubbleLines(text: string, maxChars = 17): string[] {
  if (text.length <= maxChars) return [text];
  const line1 = text.slice(0, maxChars);
  const rest  = text.slice(maxChars);
  if (rest.length <= maxChars) return [line1, rest];
  return [line1, rest.slice(0, maxChars - 1) + "…"];
}

const C: Record<string, string> = {
  "0": "#1c1917", "S": "#f5c5a3", "s": "#d4956a",
  "W": "#faf6ef", "w": "#d6c4a0",
  "A": "#d97706", "a": "#92400e",
  "G": "#78716c", "g": "#374151", "n": "#292524",
  "E": "#059669", "e": "#047857",
  "R": "#dc2626", "r": "#991b1b",
  "K": "#0ea5e9", "Y": "#fbbf24",
};

type Pxs = [number, number, string][];

function px(rows: string[]): Pxs {
  const out: Pxs = [];
  rows.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      if (ch !== "." && C[ch]) out.push([c, r, C[ch]]);
    });
  });
  return out;
}

// 10 wide × 15 tall @ P=4 = 40×60 SVG units
const HEUNGBU = px([
  "..0000....",
  ".00000000.",
  ".0aaaaaa0.",
  "..SSSSSS..",
  "..S0SS0S..",
  "..SSSSSS..",
  "..S0..0S..",
  "...SSSS...",
  "..WWWWWW..",
  ".WWAAAAAW.",
  ".WWAAAAAW.",
  ".WWAAAAAW.",
  "..AAAAAAA.",
  "..AA..AA..",
  "..ww..ww..",
]);

const NOLBU = px([
  ".0000000..",
  "0000000000",
  "0nnnnnnnn0",
  "0SSSSSSSS0",
  "0SS0SS0SS0",
  "0SSSSSSSS0",
  "0S000000S0",
  ".SSSSSSSS.",
  ".nGGGGGGn.",
  ".nGGGGGGn.",
  ".nGGGGGGn.",
  ".nGGYGGGn.",
  "..nGGGnnn.",
  "..GG..GGG.",
  "..nn..nnn.",
]);

const HWIFE = px([
  ".EEEEEEEE.",
  "EEEEEEEEEE",
  "ESSSSSSSSE",
  ".SSSSSSSS.",
  ".SS0SS0SS.",
  ".SSSSSSSS.",
  ".SS0..0SS.",
  "..SSSSSS..",
  ".EEWWWEEE.",
  "EEWWWWWWEE",
  "EEWWWWWWEE",
  "EEEEEEEEEE",
  "EEEEEEEEEE",
  "eEEEEEEEe.",
  ".wwwwwww..",
]);

const NWIFE = px([
  "..000000..",
  ".00000000.",
  ".SSSSSSSS.",
  ".SSSSSSSS.",
  ".SS0SS0SS.",
  ".SSSSSSSS.",
  ".S0SSSS0S.",
  "..SSSSSS..",
  ".rRRRRRRr.",
  "RRRRRRRRRR",
  "RRRRRRRRRR",
  "rRRRYRRRrr",
  "RRRRRRRRRR",
  "RRRRRRRRRR",
  ".wwwwwwww.",
]);

// 8 wide × 7 tall @ 4px = 32×28
const SWALLOW = px([
  "...000..",
  "..0KK0..",
  ".0KRRKr.",
  ".0WRR00.",
  ".0WW000.",
  "..0000..",
  ".0..0...",
]);

const SPRITES: Record<string, Pxs> = {
  c1: HEUNGBU, c2: NOLBU, c3: HWIFE, c4: NWIFE, c5: SWALLOW,
};

const CHARS = [
  { id: "c1", name: "흥부",     cx: 110, cy: 102, sc: P },
  { id: "c3", name: "흥부 아내", cx: 188, cy: 102, sc: P },
  { id: "c5", name: "제비",     cx: 256, cy: 144, sc: P },
  { id: "c4", name: "놀부 아내", cx: 325, cy: 102, sc: P },
  { id: "c2", name: "놀부",     cx: 403, cy: 102, sc: P },
];

interface Props {
  phase: "idle" | "loading" | "done";
  activeTurn: MeetingTurn | null;
}

export default function MeetingRoomPixel({ phase, activeTurn }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-paper-300 bg-white shadow-card">
      <svg viewBox="0 0 500 228" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ imageRendering: "pixelated" }}>
        <defs>
          <style>{`
            .cb { animation: bob 2.5s ease-in-out infinite; transform-box: fill-box; transform-origin: bottom center; }
            .cs { animation: spk 0.65s ease-in-out infinite; transform-box: fill-box; transform-origin: bottom center; }
            .bbl { animation: bpop 0.22s ease-out both; transform-box: fill-box; transform-origin: bottom center; }
            @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
            @keyframes spk { 0%,100%{transform:translateY(0) scale(1.02)} 50%{transform:translateY(-5px) scale(1.06)} }
            @keyframes bpop { from{opacity:0;transform:scale(0.5) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
          `}</style>
        </defs>

        {/* ── 배경 벽 ── */}
        <rect width="500" height="228" fill="#f5ead5" />
        {[0,1,2,3,4,5,6,7].map(i => (
          <rect key={i} x={0} y={i * 22} width={500} height={22}
            fill={i % 2 === 0 ? "#f2e4cc" : "#eedcc4"} />
        ))}

        {/* ── 창문 (왼쪽, 좁게) ── */}
        <rect x="8" y="14" width="68" height="68" rx="3" fill="#c8dff0" stroke="#b09060" strokeWidth="2" />
        <rect x="10" y="16" width="64" height="64" rx="2" fill="#d4e9f5" />
        <line x1="42" y1="16" x2="42" y2="80" stroke="#b09060" strokeWidth="1.5" />
        <line x1="10" y1="48" x2="76" y2="48" stroke="#b09060" strokeWidth="1.5" />
        <rect x="11" y="17" width="30" height="30" fill="#bce0f5" rx="1" opacity="0.8" />
        <rect x="43" y="17" width="29" height="30" fill="#c5e5f5" rx="1" opacity="0.8" />
        <rect x="11" y="49" width="30" height="29" fill="#cce8f5" rx="1" opacity="0.6" />
        <rect x="43" y="49" width="29" height="29" fill="#d0ecf8" rx="1" opacity="0.6" />
        {/* 커튼 */}
        <path d="M6,12 Q13,34 8,84" stroke="#e8b060" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M78,12 Q72,34 76,84" stroke="#e8b060" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.9" />

        {/* ── 족자 (중앙 벽 걸개) ── */}
        <rect x="212" y="6" width="76" height="72" rx="2" fill="#f0e8d0" stroke="#a08050" strokeWidth="1.5" />
        <rect x="212" y="6" width="76" height="8" rx="1" fill="#8B5E2A" />
        <rect x="212" y="70" width="76" height="8" rx="1" fill="#8B5E2A" />
        <text x="250" y="28" textAnchor="middle" fontSize="13" fill="#5c3a14" fontFamily="serif" fontWeight="bold">흥</text>
        <text x="250" y="46" textAnchor="middle" fontSize="13" fill="#5c3a14" fontFamily="serif" fontWeight="bold">부</text>
        <text x="250" y="64" textAnchor="middle" fontSize="13" fill="#5c3a14" fontFamily="serif" fontWeight="bold">전</text>

        {/* ── 책장 (오른쪽, 좁게) ── */}
        <rect x="424" y="8" width="72" height="108" rx="3" fill="#c09050" stroke="#8b5e2a" strokeWidth="2" />
        {[32, 56, 80, 104].map(y => (
          <rect key={y} x="426" y={y} width="68" height="2" fill="#7a4e20" />
        ))}
        {[
          [427,28,"#b91c1c"],[433,26,"#1d4ed8"],[439,30,"#059669"],
          [445,24,"#d97706"],[451,28,"#7c3aed"],[457,26,"#0891b2"],
          [427,26,"#065f46"],[433,30,"#dc2626"],[439,24,"#1e40af"],
          [445,28,"#be185d"],[451,26,"#a16207"],[457,30,"#374151"],
          [427,28,"#047857"],[433,24,"#9a3412"],[451,30,"#1d4ed8"],
        ].map(([x, h, fill], i) => {
          const shelf = [10, 34, 58][Math.floor(i / 5)];
          return (
            <rect key={i} x={x as number} y={(shelf + 20) - (h as number)}
              width="5" height={h as number} rx="1" fill={fill as string} />
          );
        })}

        {/* ── 바닥 ── */}
        <rect y="172" width="500" height="56" fill="#9a6530" />
        {[0, 72, 144, 216, 288, 360, 432, 500].map(x => (
          <line key={x} x1={x} y1="172" x2={x} y2="228" stroke="#7a4f22" strokeWidth="1" opacity="0.4" />
        ))}
        <line x1="0" y1="172" x2="500" y2="172" stroke="#5c3515" strokeWidth="2" />

        {/* ── 회의 테이블 ── */}
        <polygon points="25,162 475,162 455,184 45,184" fill="#7B4520" />
        <polygon points="27,163 473,163 465,170 35,170" fill="#9B6535" opacity="0.7" />
        <rect x="45" y="183" width="410" height="7" fill="#5a3210" />
        <rect x="60" y="190" width="10" height="30" fill="#5a3210" />
        <rect x="430" y="190" width="10" height="30" fill="#5a3210" />
        {/* 탁자 위 물건들 */}
        <rect x="188" y="152" width="26" height="18" rx="1" fill="#faf6ef" stroke="#c8a060" strokeWidth="1" transform="rotate(-4,201,161)" />
        <line x1="191" y1="157" x2="211" y2="157" stroke="#d0b080" strokeWidth="0.8" opacity="0.6" transform="rotate(-4,201,161)" />
        <line x1="191" y1="161" x2="211" y2="161" stroke="#d0b080" strokeWidth="0.8" opacity="0.6" transform="rotate(-4,201,161)" />
        <ellipse cx="310" cy="165" rx="9" ry="4" fill="#6B4020" />
        <rect x="301" y="161" width="18" height="8" rx="2" fill="#8B6040" />
        <ellipse cx="310" cy="161" rx="9" ry="3" fill="#a07050" />
        <rect x="236" y="155" width="2" height="15" rx="1" fill="#2c1a0a" transform="rotate(-14,237,163)" />
        <polygon points="235,170 239,170 237,174" fill="#1c1917" transform="rotate(-14,237,163)" />

        {/* ── 캐릭터 ── */}
        {CHARS.map(({ id, name, cx, cy, sc }, charIdx) => {
          const sprite = SPRITES[id];
          if (!sprite) return null;
          const isActive = activeTurn?.characterId === id;
          const isDimmed = phase === "done" && !!activeTurn && !isActive;
          const cols = Math.max(...sprite.map(([c]) => c)) + 1;
          const rows = Math.max(...sprite.map(([, r]) => r)) + 1;
          const ox = cx - (cols * sc) / 2;
          const spriteH = rows * sc;

          return (
            <g key={id}>
              {/* 바닥 그림자 (항상 표시) */}
              <ellipse
                cx={cx} cy={cy + spriteH + 1}
                rx={isActive ? 26 : 18} ry={isActive ? 9 : 5}
                fill={isActive ? "#fbbf24" : "#5a3210"}
                opacity={isActive ? 0.45 : 0.3}
              >
                {isActive && (
                  <animate attributeName="rx" values="26;34;26" dur="0.9s" repeatCount="indefinite" />
                )}
              </ellipse>

              {/* 스프라이트: 위치 고정 outer-g + 애니메이션 inner-g 분리 */}
              <g transform={`translate(${ox}, ${cy})`} opacity={isDimmed ? 0.4 : 1}>
                <g
                  className={isActive ? "cs" : "cb"}
                  style={{ animationDelay: `${charIdx * 0.38}s` }}
                >
                  {sprite.map(([col, row, color], i) => (
                    <rect key={i} x={col * sc} y={row * sc} width={sc} height={sc} fill={color} />
                  ))}
                </g>
              </g>

              {/* 말풍선 */}
              {isActive && activeTurn && (() => {
                const lines = splitBubbleLines(activeTurn.statement);
                const isAct = activeTurn.isAction;
                const stroke = isAct ? "#0ea5e9" : "#d97706";
                const bw = 172;
                const bh = 16 + lines.length * 15;
                // 왼쪽/오른쪽 끝 캐릭터 버블이 화면 밖으로 나가지 않도록 클램프
                const bx = Math.max(4, Math.min(cx - bw / 2, 500 - bw - 4));
                const by = cy - bh - 18;
                const tailX = Math.max(bx + 8, Math.min(cx, bx + bw - 8));
                return (
                  <g className="bbl">
                    <rect x={bx} y={by} width={bw} height={bh} rx="7"
                      fill="white" stroke={stroke} strokeWidth="1.5" />
                    <polygon
                      points={`${tailX - 5},${by + bh} ${tailX + 5},${by + bh} ${tailX},${by + bh + 8}`}
                      fill="white" stroke={stroke} strokeWidth="1.2"
                    />
                    {/* 감정 태그 */}
                    <text x={bx + bw / 2} y={by + 11} textAnchor="middle" fontSize="8"
                      fill={isAct ? "#0369a1" : "#92400e"} fontFamily="sans-serif" fontWeight="bold">
                      {activeTurn.emotion}
                    </text>
                    {/* 대사 줄 */}
                    {lines.map((line, li) => (
                      <text key={li} x={bx + bw / 2} y={by + 23 + li * 15}
                        textAnchor="middle" fontSize="8.5"
                        fill="#374151" fontFamily="sans-serif"
                        fontStyle={isAct ? "italic" : "normal"}>
                        {line}
                      </text>
                    ))}
                  </g>
                );
              })()}

              {/* 이름 라벨 */}
              <text
                x={cx} y={cy + spriteH + 13}
                textAnchor="middle"
                fontSize={isActive ? "9.5" : "8.5"}
                fill={isActive ? "#92400e" : "#7c6248"}
                fontFamily="sans-serif"
                fontWeight={isActive ? "bold" : "normal"}
              >
                {name}
              </text>
            </g>
          );
        })}

        {/* ── 바닥 배너 오버레이 (캐릭터 하단에 표시) ── */}
        {phase === "loading" && (
          <g>
            <rect x="0" y="194" width="500" height="34" fill="rgba(0,0,0,0.52)" />
            <text x="250" y="208" textAnchor="middle" fontSize="10"
              fill="#fbbf24" fontFamily="sans-serif" fontWeight="bold">회의 준비 중</text>
            {[0, 1, 2].map(i => (
              <circle key={i} cx={234 + i * 16} cy={221} r="3.5" fill="#fbbf24">
                <animate attributeName="opacity" values="0.2;1;0.2"
                  dur="1s" begin={`${i * 0.33}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        )}

        {phase === "idle" && (
          <g>
            <rect x="0" y="194" width="500" height="34" fill="rgba(0,0,0,0.38)" />
            <text x="250" y="208" textAnchor="middle" fontSize="10"
              fill="rgba(255,255,255,0.9)" fontFamily="sans-serif">상황을 입력하고 회의를 시작하세요</text>
            <text x="250" y="223" textAnchor="middle" fontSize="8.5"
              fill="rgba(255,255,255,0.6)" fontFamily="sans-serif">각자의 기억으로 반응합니다</text>
          </g>
        )}
      </svg>
    </div>
  );
}
