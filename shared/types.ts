export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type Division =
  | 'Open'
  | 'Standard'
  | 'Production'
  | 'Production Optics'
  | 'Classic'
  | 'Revolver';
export interface Shooter {
  id: string;
  name: string;
  division: Division;
}
export interface Stage {
  id: string;
  name: string;
  maxPoints: number;
}
export interface Score {
  id: string;
  shooterId: string;
  stageId: string;
  time: number;
  a: number; // Alpha hits
  c: number; // Charlie hits
  d: number; // Delta hits
  miss: number;
  penalty: number;
}