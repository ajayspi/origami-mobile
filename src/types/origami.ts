export interface OrigamiStep {
  stepNumber: number;
  title: string;
  foldType: string;
  time: string;
  instruction: string;
  tip?: string;
}

export interface PaperSpec {
  color: string;
  size: string;
  qty: number;
  gsm?: string;
  frontColorHex?: string;
  backColorHex?: string;
}

export interface OrigamiKit {
  id: string;
  kitNumber?: number;
  title: string;
  subtitle?: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  time: string;
  category: string;
  collection: string;
  collectionTitle: string;
  accent: string;
  goal?: string;
  paper?: PaperSpec[];
  tools?: string[];
  principles?: string[];
  steps: OrigamiStep[];
  stepCount?: number;
}
