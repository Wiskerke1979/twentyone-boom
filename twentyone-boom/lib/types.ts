import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export type LevelKey = "BASIS" | "GEVORDERD" | "EXPERT";

export interface TreeBranchData {
  competenceSlug: string;
  name: string;
  icon: string;
  currentLevel: LevelKey | null; // highest achieved
  selfIndicated: LevelKey | null; // from latest selfscore
  approvedIndicatorCount: number;
  totalIndicatorCount: number;
}
