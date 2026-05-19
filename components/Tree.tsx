import type { TreeBranchData, LevelKey } from "@/lib/types";

/**
 * THREE-STATE TREE COLORS — mapped to seasons for natural feel
 * - "verified" → zomer-groen (rijk, levend)
 * - "claimed"  → herfst-tinten (warm bruin/oranje, niet helemaal kaal)
 * - "empty"    → winter-grijs (kaal, geduldig wachtend)
 */
type LeafState = "empty" | "claimed" | "verified";

interface StateColors {
  branchBase: string;
  branchHighlight: string;
  foliageDark: string;
  foliageMid: string;
  foliageLight: string;
  opacity: number;
}

const STATE_COLORS: Record<LeafState, StateColors> = {
  empty: {
    branchBase: "#8B7E6E",
    branchHighlight: "#B0A595",
    foliageDark: "#A89E8C",
    foliageMid: "#B8AC97",
    foliageLight: "#C6BCAA",
    opacity: 0.7,
  },
  claimed: {
    branchBase: "#6B4F38",
    branchHighlight: "#9C7A56",
    foliageDark: "#8B5E2D",
    foliageMid: "#B47B3F",
    foliageLight: "#D89B5D",
    opacity: 0.95,
  },
  verified: {
    branchBase: "#4A3018",
    branchHighlight: "#7A5435",
    foliageDark: "#2D5043",
    foliageMid: "#4F7A5C",
    foliageLight: "#7AB079",
    opacity: 1.0,
  },
};

function leafState(branch: TreeBranchData): LeafState {
  if (branch.currentLevel) return "verified";
  if (branch.selfIndicated) return "claimed";
  return "empty";
}

function levelTextColor(level: LevelKey | null): string {
  if (level === "EXPERT") return "#C74E3A";
  if (level === "GEVORDERD") return "#D89B5D";
  if (level === "BASIS") return "#6BA368";
  return "#8B7E6E";
}

interface BranchSpec {
  index: number;
  branchPath: string;
  leafCx: number;
  leafCy: number;
  leafR: number;
  textX: number;
  textY: number;
  textAnchor: "start" | "end" | "middle";
  rotation: number; // foliage rotation for organic variation
}

// 9 branches. Text-anchor positions zijn ruim genoeg voor de langste competentienamen
// (zoals "Kennisgericht werken" / "Productgericht werken") zonder uit de SVG te lopen.
const BRANCHES: BranchSpec[] = [
  { index: 0, branchPath: "M395 470 Q330 460 250 470", leafCx: 230, leafCy: 465, leafR: 40, textX: 175, textY: 465, textAnchor: "end", rotation: -8 },
  { index: 1, branchPath: "M408 470 Q470 460 550 470", leafCx: 565, leafCy: 465, leafR: 40, textX: 625, textY: 465, textAnchor: "start", rotation: 6 },
  { index: 2, branchPath: "M398 380 Q330 365 260 360", leafCx: 245, leafCy: 355, leafR: 36, textX: 190, textY: 355, textAnchor: "end", rotation: 4 },
  { index: 3, branchPath: "M402 360 Q470 345 540 340", leafCx: 555, leafCy: 335, leafR: 36, textX: 615, textY: 335, textAnchor: "start", rotation: -5 },
  { index: 4, branchPath: "M400 280 Q340 265 280 250", leafCx: 265, leafCy: 245, leafR: 33, textX: 215, textY: 245, textAnchor: "end", rotation: -7 },
  { index: 5, branchPath: "M404 260 Q470 245 530 230", leafCx: 545, leafCy: 225, leafR: 33, textX: 605, textY: 225, textAnchor: "start", rotation: 8 },
  { index: 6, branchPath: "M403 200 Q350 185 305 175", leafCx: 290, leafCy: 170, leafR: 30, textX: 240, textY: 170, textAnchor: "end", rotation: 3 },
  { index: 7, branchPath: "M405 180 Q455 165 510 155", leafCx: 520, leafCy: 150, leafR: 30, textX: 580, textY: 150, textAnchor: "start", rotation: -4 },
  { index: 8, branchPath: "M405 140 Q400 110 400 80", leafCx: 400, leafCy: 75, leafR: 42, textX: 400, textY: 24, textAnchor: "middle", rotation: 0 },
];

function Blossom({ x, y, alt = false, scale = 1 }: { x: number; y: number; alt?: boolean; scale?: number }) {
  const color = alt ? "#F2C57C" : "#E8A0B8";
  const dark = alt ? "#D8A95C" : "#C8809A";
  const r = 3.2 * scale;
  return (
    <g className="blossom" transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="-3.5" cy="0" rx={r} ry={r * 1.05} fill={color} opacity="0.92" />
      <ellipse cx="3.5" cy="0" rx={r} ry={r * 1.05} fill={color} opacity="0.92" />
      <ellipse cx="0" cy="-3.5" rx={r * 1.05} ry={r} fill={color} opacity="0.92" />
      <ellipse cx="0" cy="3.5" rx={r * 1.05} ry={r} fill={color} opacity="0.92" />
      <ellipse cx="-2.4" cy="-2.4" rx="2.6" ry="2.6" fill={dark} opacity="0.4" />
      <circle cx="0" cy="0" r="1.8" fill="#FFFEF6" opacity="0.9" />
      <circle cx="0" cy="0" r="0.9" fill="#D8A95C" opacity="0.7" />
    </g>
  );
}

function Foliage({ cx, cy, r, c, rotation, state }: { cx: number; cy: number; r: number; c: StateColors; rotation: number; state: LeafState }) {
  // Layered organic ellipses for a soft cloud-of-leaves silhouette.
  const e = (dx: number, dy: number, rx: number, ry: number, fill: string, opacity = 1) => (
    <ellipse cx={cx + dx} cy={cy + dy} rx={rx} ry={ry} fill={fill} opacity={opacity} />
  );

  return (
    <g transform={`rotate(${rotation} ${cx} ${cy})`}>
      {/* Outer rim — softest color, broadest spread */}
      {e(-r * 0.55, r * 0.25, r * 0.85, r * 0.7, c.foliageLight, 0.85)}
      {e(r * 0.45, r * 0.2, r * 0.78, r * 0.72, c.foliageLight, 0.85)}
      {e(0, r * 0.45, r * 0.7, r * 0.55, c.foliageLight, 0.8)}
      {e(-r * 0.15, -r * 0.5, r * 0.68, r * 0.55, c.foliageLight, 0.85)}

      {/* Middle layer — denser color */}
      {e(-r * 0.3, r * 0.05, r * 0.7, r * 0.65, c.foliageMid, 0.96)}
      {e(r * 0.35, -r * 0.15, r * 0.65, r * 0.7, c.foliageMid, 0.95)}
      {e(r * 0.1, r * 0.3, r * 0.55, r * 0.5, c.foliageMid, 0.9)}

      {/* Inner shadow — darkest core */}
      {e(0, -r * 0.15, r * 0.55, r * 0.55, c.foliageDark, 0.85)}
      {e(-r * 0.25, r * 0.15, r * 0.4, r * 0.42, c.foliageDark, 0.65)}

      {/* Highlight specks — small leaf bumps catching light */}
      {state !== "empty" && (
        <>
          <ellipse cx={cx + r * 0.5} cy={cy - r * 0.35} rx={r * 0.18} ry={r * 0.15} fill={c.foliageLight} opacity="0.65" />
          <ellipse cx={cx - r * 0.45} cy={cy - r * 0.4} rx={r * 0.15} ry={r * 0.13} fill={c.foliageLight} opacity="0.55" />
          {/* Individual leaf hints — small slanted ovals along rim */}
          <ellipse cx={cx + r * 0.75} cy={cy - r * 0.05} rx="2.5" ry="5" fill={c.foliageDark} opacity="0.55" transform={`rotate(25 ${cx + r * 0.75} ${cy - r * 0.05})`} />
          <ellipse cx={cx - r * 0.78} cy={cy + r * 0.1} rx="2.5" ry="5" fill={c.foliageDark} opacity="0.55" transform={`rotate(-25 ${cx - r * 0.78} ${cy + r * 0.1})`} />
          <ellipse cx={cx + r * 0.05} cy={cy - r * 0.85} rx="2.5" ry="5" fill={c.foliageDark} opacity="0.55" transform={`rotate(5 ${cx + r * 0.05} ${cy - r * 0.85})`} />
        </>
      )}
    </g>
  );
}

function GrassTuft({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M ${x} ${y} Q ${x - 2} ${y - 6}, ${x - 3} ${y - 10}`} stroke="#4F7A5C" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d={`M ${x} ${y} Q ${x} ${y - 7}, ${x + 1} ${y - 12}`} stroke="#4F7A5C" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d={`M ${x} ${y} Q ${x + 2} ${y - 6}, ${x + 3} ${y - 9}`} stroke="#4F7A5C" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  );
}

export function Tree({ branches }: { branches: TreeBranchData[] }) {
  const anyVerified = branches.some((b) => b.currentLevel);

  return (
    <div>
      <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-3xl mx-auto">
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes sway {
            0%, 100% { transform: rotate(-1.2deg); }
            50%      { transform: rotate(1.2deg); }
          }
          @keyframes bloom {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(1.18); }
          }
          @keyframes drift {
            0%   { transform: translate(0, 0); opacity: 0.55; }
            50%  { transform: translate(-12px, 18px); opacity: 0.85; }
            100% { transform: translate(0, 36px); opacity: 0; }
          }
          .branch-group {
            animation: fade-in 0.6s ease-out backwards;
            transform-box: fill-box;
            transform-origin: center;
          }
          .branch-verified { animation: sway 5s ease-in-out infinite; }
          .branch-claimed  { animation: sway 7s ease-in-out infinite; }
          .blossom         { transform-box: fill-box; transform-origin: center; animation: bloom 3.2s ease-in-out infinite; }
          .petal-drift     { animation: drift 6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        `}</style>
        <defs>
          {/* Sky gradient */}
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BCDEEC" />
            <stop offset="65%" stopColor="#E6EEF0" />
            <stop offset="100%" stopColor="#FAF7F2" />
          </linearGradient>
          {/* Sun radial glow */}
          <radialGradient id="sun-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#F5C77A" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#F5C77A" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#F5C77A" stopOpacity="0" />
          </radialGradient>
          {/* Soft drop shadow */}
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
            <feOffset dx="1" dy="2" />
            <feComponentTransfer><feFuncA type="linear" slope="0.35" /></feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Trunk vertical bark gradient */}
          <linearGradient id="trunk-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3A2410" />
            <stop offset="40%" stopColor="#5C3D24" />
            <stop offset="80%" stopColor="#7A5435" />
            <stop offset="100%" stopColor="#4A3018" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="800" height="600" fill="url(#sky)" />

        {/* Sun */}
        <circle cx="660" cy="100" r="80" fill="url(#sun-glow)" />
        <circle cx="660" cy="100" r="28" fill="#F5C77A" opacity="0.85" />

        {/* Distant hills — soft horizon */}
        <path d="M 0 510 Q 180 480, 360 495 Q 540 510, 720 485 Q 770 480, 800 488 L 800 560 L 0 560 Z" fill="#8FB088" opacity="0.35" />
        <path d="M 0 525 Q 200 500, 400 515 Q 600 530, 800 510 L 800 560 L 0 560 Z" fill="#A8C39E" opacity="0.4" />

        {/* Ground */}
        <ellipse cx="400" cy="560" rx="380" ry="25" fill="#6BA368" opacity="0.4" />
        <ellipse cx="400" cy="565" rx="350" ry="14" fill="#4F7A5C" opacity="0.3" />

        {/* Grass tufts */}
        {[120, 175, 220, 290, 340, 470, 530, 600, 660, 720].map((x, i) => (
          <GrassTuft key={i} x={x} y={555 + ((i % 3) - 1)} />
        ))}

        {/* Trunk — tapered with 3 segments + bark texture */}
        <g filter="url(#soft-shadow)">
          <path
            d="M 386 562 Q 384 510, 388 460"
            stroke="url(#trunk-grad)"
            strokeWidth="32"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 388 462 Q 391 380, 396 300"
            stroke="url(#trunk-grad)"
            strokeWidth="25"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 396 302 Q 402 220, 400 142"
            stroke="url(#trunk-grad)"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Trunk highlight (right side, narrow) */}
        <path d="M 398 540 Q 396 480, 400 420 Q 405 340, 408 240 Q 410 180, 405 142" stroke="#A8825C" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />

        {/* Bark texture marks */}
        <path d="M 388 540 Q 390 520, 386 500" stroke="#2A1A0A" strokeWidth="1.2" fill="none" opacity="0.45" />
        <path d="M 390 480 Q 392 460, 388 440" stroke="#2A1A0A" strokeWidth="1.2" fill="none" opacity="0.4" />
        <path d="M 394 400 Q 396 380, 392 360" stroke="#2A1A0A" strokeWidth="1.2" fill="none" opacity="0.4" />
        <path d="M 398 320 Q 400 300, 396 280" stroke="#2A1A0A" strokeWidth="1.2" fill="none" opacity="0.4" />
        <path d="M 402 240 Q 404 220, 400 200" stroke="#2A1A0A" strokeWidth="1.2" fill="none" opacity="0.4" />
        {/* Small horizontal bark cracks */}
        <line x1="380" y1="500" x2="394" y2="502" stroke="#2A1A0A" strokeWidth="1" opacity="0.3" />
        <line x1="384" y1="420" x2="396" y2="421" stroke="#2A1A0A" strokeWidth="1" opacity="0.3" />
        <line x1="392" y1="340" x2="404" y2="342" stroke="#2A1A0A" strokeWidth="1" opacity="0.3" />

        {/* Branches with foliage */}
        {BRANCHES.map((b) => {
          const branch = branches[b.index];
          if (!branch) return null;
          const state = leafState(branch);
          const c = STATE_COLORS[state];

          const animationClass =
            state === "verified" ? "branch-group branch-verified" :
            state === "claimed" ? "branch-group branch-claimed" :
            "branch-group";

          return (
            <g
              key={b.index}
              className={animationClass}
              style={{ animationDelay: `${b.index * 80}ms` }}
              opacity={c.opacity}
            >
              {/* Branch — base stroke */}
              <path
                d={b.branchPath}
                stroke={c.branchBase}
                strokeWidth={state === "verified" ? 11 : 9}
                strokeLinecap="round"
                fill="none"
                filter="url(#soft-shadow)"
              />
              {/* Branch — slim highlight */}
              <path
                d={b.branchPath}
                stroke={c.branchHighlight}
                strokeWidth={state === "verified" ? 3.5 : 2.5}
                strokeLinecap="round"
                fill="none"
                opacity="0.65"
                transform="translate(-1, -1)"
              />

              {/* Foliage cluster */}
              <Foliage cx={b.leafCx} cy={b.leafCy} r={b.leafR} c={c} rotation={b.rotation} state={state} />

              {/* Flowers — only when verified at higher levels */}
              {(branch.currentLevel === "GEVORDERD" || branch.currentLevel === "EXPERT") && (
                <Blossom x={b.leafCx + b.leafR * 0.5} y={b.leafCy - b.leafR * 0.55} />
              )}
              {branch.currentLevel === "EXPERT" && (
                <>
                  <Blossom x={b.leafCx - b.leafR * 0.5} y={b.leafCy - b.leafR * 0.35} alt scale={0.85} />
                  <Blossom x={b.leafCx + b.leafR * 0.1} y={b.leafCy - b.leafR * 0.85} scale={0.7} />
                </>
              )}

              {/* Dier — peeking from the foliage, smaller than before */}
              <text
                x={b.leafCx + b.leafR * 0.08}
                y={b.leafCy + 5}
                fontSize={state === "empty" ? 16 : 22}
                textAnchor="middle"
                opacity={state === "empty" ? 0.45 : 1}
              >
                {branch.icon}
              </text>

              {/* Labels — outside foliage */}
              <text x={b.textX} y={b.textY} fontFamily="Inter" fontSize="13" fill="#2C2418" fontWeight="600" textAnchor={b.textAnchor}>
                {branch.name}
              </text>
              <text x={b.textX} y={b.textY + 15} fontFamily="Inter" fontSize="10" fill={levelTextColor(branch.currentLevel)} textAnchor={b.textAnchor}>
                {state === "verified"
                  ? `${branch.currentLevel!.toLowerCase()} · bewezen`
                  : state === "claimed"
                  ? `${branch.selfIndicated!.toLowerCase()} · zelfscan`
                  : "nog niet"}
                {state !== "empty" && ` · ${branch.approvedIndicatorCount}/${branch.totalIndicatorCount}`}
              </text>
              {branch.peerCount > 0 && (
                <text x={b.textX} y={b.textY + 29} fontFamily="Inter" fontSize="10" fill="#8B7E6E" textAnchor={b.textAnchor}>
                  🤝 {branch.peerCount} {branch.peerCount === 1 ? "peer" : "peers"}
                  {branch.peerAverageLevel && ` · gem. ${branch.peerAverageLevel.toLowerCase()}`}
                </text>
              )}
            </g>
          );
        })}

        {/* Atmospheric floating petals — only if at least one branch verified */}
        {anyVerified && (
          <g opacity="0.6">
            <g className="petal-drift" style={{ animationDelay: "0s" }}>
              <Blossom x={235} y={310} scale={0.55} />
            </g>
            <g className="petal-drift" style={{ animationDelay: "1.5s" }}>
              <Blossom x={620} y={290} alt scale={0.45} />
            </g>
            <g className="petal-drift" style={{ animationDelay: "3s" }}>
              <Blossom x={460} y={395} scale={0.4} />
            </g>
            <circle className="petal-drift" style={{ animationDelay: "2s" }} cx="180" cy="240" r="2" fill="#E8A0B8" opacity="0.55" />
            <circle className="petal-drift" style={{ animationDelay: "4s" }} cx="560" cy="380" r="2.5" fill="#F2C57C" opacity="0.5" />
            <circle className="petal-drift" style={{ animationDelay: "5s" }} cx="320" cy="430" r="1.8" fill="#E8A0B8" opacity="0.5" />
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-3 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#B8AC97" }}></span>
          nog niets
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#B47B3F" }}></span>
          zelfscan, nog geen bewijs
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#4F7A5C" }}></span>
          bewezen
        </span>
        <span className="flex items-center gap-1.5">
          <span>🌸</span> bloei bij gevorderd & expert
        </span>
        <span className="flex items-center gap-1.5">
          <span>🤝</span> peer-feedback
        </span>
      </div>
    </div>
  );
}
