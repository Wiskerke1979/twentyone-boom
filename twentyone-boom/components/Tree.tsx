import type { TreeBranchData, LevelKey } from "@/lib/types";

function levelColor(level: LevelKey | null): string {
  if (level === "EXPERT") return "#C74E3A";
  if (level === "GEVORDERD") return "#D89B5D";
  if (level === "BASIS") return "#6BA368";
  return "#A89E8C"; // muted bark
}

function leafFill(level: LevelKey | null): string {
  if (level === "EXPERT") return "#2D5043";
  if (level === "GEVORDERD") return "#4F7A5C";
  if (level === "BASIS") return "#6BA368";
  return "#E0DACE"; // bare
}

/**
 * Branch coordinates. 9 branches arranged around a central trunk.
 * Each entry: [labelX, labelY (text), branchPath, leafX, leafY, leafR]
 */
interface BranchSpec {
  index: number;
  branchPath: string; // SVG path
  leafCx: number;
  leafCy: number;
  leafR: number;
  textX: number;
  textY: number;
  textAnchor: "start" | "end" | "middle";
}

const BRANCHES: BranchSpec[] = [
  // Lower left — samenwerken
  { index: 0, branchPath: "M395 470 Q330 460 250 470", leafCx: 230, leafCy: 465, leafR: 35, textX: 100, textY: 468, textAnchor: "end" },
  // Lower right — individueel
  { index: 1, branchPath: "M408 470 Q470 460 550 470", leafCx: 565, leafCy: 465, leafR: 35, textX: 700, textY: 468, textAnchor: "start" },
  // Mid left — planmatig
  { index: 2, branchPath: "M398 380 Q330 365 260 360", leafCx: 245, leafCy: 355, leafR: 32, textX: 100, textY: 358, textAnchor: "end" },
  // Mid right — inventiviteit
  { index: 3, branchPath: "M402 360 Q470 345 540 340", leafCx: 555, leafCy: 335, leafR: 32, textX: 700, textY: 338, textAnchor: "start" },
  // Mid-upper left — productgericht
  { index: 4, branchPath: "M400 280 Q340 265 280 250", leafCx: 265, leafCy: 245, leafR: 30, textX: 100, textY: 248, textAnchor: "end" },
  // Mid-upper right — procesgericht
  { index: 5, branchPath: "M404 260 Q470 245 530 230", leafCx: 545, leafCy: 225, leafR: 30, textX: 700, textY: 228, textAnchor: "start" },
  // Upper left — kennisgericht
  { index: 6, branchPath: "M403 200 Q350 185 305 175", leafCx: 290, leafCy: 170, leafR: 28, textX: 100, textY: 173, textAnchor: "end" },
  // Upper right — doorzetten
  { index: 7, branchPath: "M405 180 Q455 165 510 155", leafCx: 520, leafCy: 150, leafR: 28, textX: 700, textY: 153, textAnchor: "start" },
  // Top crown — presenteren
  { index: 8, branchPath: "M405 140 Q400 110 400 80", leafCx: 400, leafCy: 75, leafR: 38, textX: 400, textY: 30, textAnchor: "middle" },
];

export function Tree({ branches, linkable = false }: { branches: TreeBranchData[]; linkable?: boolean }) {
  return (
    <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-3xl mx-auto">
      {/* Sky */}
      <circle cx="650" cy="100" r="40" fill="#F2C57C" opacity="0.5" />

      {/* Ground */}
      <ellipse cx="400" cy="560" rx="320" ry="20" fill="#6BA368" opacity="0.3" />

      {/* Trunk */}
      <path
        d="M395 560 Q390 480 395 400 Q400 320 405 240 Q410 180 405 140"
        stroke="#6B4F38"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />

      {/* Branches */}
      {BRANCHES.map((b) => {
        const branch = branches[b.index];
        if (!branch) return null;
        const level = branch.currentLevel;
        const branchColor = level ? "#6B4F38" : "#A89E8C";
        const leafColor = leafFill(level);
        const showFlower = level === "GEVORDERD" || level === "EXPERT";
        const showExtraFlower = level === "EXPERT";

        return (
          <g key={b.index} opacity={level ? 1 : 0.45}>
            <path d={b.branchPath} stroke={branchColor} strokeWidth={level === "EXPERT" ? 12 : 9} strokeLinecap="round" fill="none" />
            <circle cx={b.leafCx} cy={b.leafCy} r={b.leafR} fill={leafColor} />
            {level && (
              <circle cx={b.leafCx - 8} cy={b.leafCy - 8} r={b.leafR * 0.55} fill="#6BA368" opacity="0.85" />
            )}
            {/* Animal */}
            <text x={b.leafCx} y={b.leafCy + 6} fontSize={level ? "24" : "18"} textAnchor="middle" opacity={level ? 1 : 0.45}>
              {branch.icon}
            </text>
            {/* Flowers */}
            {showFlower && <circle cx={b.leafCx + 12} cy={b.leafCy - 18} r="5" fill="#E8A0B8" />}
            {showExtraFlower && (
              <>
                <circle cx={b.leafCx - 14} cy={b.leafCy - 16} r="4" fill="#E8A0B8" />
                <circle cx={b.leafCx + 4} cy={b.leafCy - 26} r="3" fill="#F2C57C" />
              </>
            )}

            {/* Label */}
            <text
              x={b.textX}
              y={b.textY}
              fontFamily="Inter"
              fontSize="13"
              fill="#2C2418"
              fontWeight="600"
              textAnchor={b.textAnchor}
            >
              {branch.name}
            </text>
            <text
              x={b.textX}
              y={b.textY + 16}
              fontFamily="Inter"
              fontSize="10"
              fill={levelColor(level)}
              textAnchor={b.textAnchor}
            >
              {level ? level.toLowerCase() : "nog niet bewezen"} · {branch.approvedIndicatorCount}/{branch.totalIndicatorCount}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
