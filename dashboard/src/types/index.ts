// src/types/index.ts

export type Status = "up" | "down";

export interface Point {
  x: number;
  y: number;
}

export type LayoutVariant =
  | "1x1"
  | "2col-25-right"
  | "4col-2row-special"
  | "2x2-right-25"
  | "2x2-right-33";

export interface BoxEntry {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;

  colIndex: number;
  index: number;

  status: Status;
  layoutVariant?: LayoutVariant;

  deviceType?: string;
  name?: string;
  statusInfo?: string;
  address?: string;

  chartValues?: number[];
}

export type BoxMap = Record<string, BoxEntry>;

export interface LayoutResult {
  boxMap: Record<string, BoxEntry>;
  boxes: BoxEntry[];
  canvasHeight: number;
  colWidth: number;
  width: number;
}

export interface DiagramBoxConfig {
  id: string;
  status: Status;
  name?: string;
  deviceType?: string;
  statusInfo?: string;
  address?: string;
  layoutVariant?: LayoutVariant;
  chartValues?: number[];
}

export interface DiagramColumn {
  color: string;
  boxes: DiagramBoxConfig[];
}

export interface DiagramConnection {
  from: string;
  to: string;
  color: string;

  // internal routing metadata
  _sourceCount?: number;
  _sourceIndex?: number;
  _sourceLane?: number;
  _targetCount?: number;
  _targetIndex?: number;
  _targetLane?: number;
}

export interface DiagramConfig {
  columns: DiagramColumn[];
  connections: DiagramConnection[];
  boxMargin: number;
  baseBoxHeight: number;
  lineSpacing: number;
}

export interface RouteResult {
  conn: DiagramConnection;
  start: Point;
  end: Point;
  midX: number;
  midY: number;
  color: string;
  isDegraded: boolean;
  elbowIcons: Point[];
  sourceBox: BoxEntry;
  targetBox: BoxEntry;
}
