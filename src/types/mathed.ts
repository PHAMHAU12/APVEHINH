export type MathTopic = 'geometry' | 'calculus';

export interface ConsistencyCheck {
  isValid: boolean;
  notes: string;
}

export interface Section1Analysis {
  hypotheses: string[];
  conclusion: string;
  summary: string;
}

export interface Section2Pedagogy {
  thinkingDirection: string;
  auxiliaryElements: string[];
  pedagogicalAdvice: string;
}

export interface SolutionStep {
  title: string;
  detail: string;
}

export interface Section3Solution {
  steps: SolutionStep[];
  finalAnswer: string;
}

export interface Vertex3D {
  name: string;
  coord: [number, number, number];
  color?: string;
  isAuxiliary?: boolean;
}

export interface CuttingPlaneData {
  points?: string[];
  polygon?: string[];
  normal?: [number, number, number];
  distance?: number;
}

export interface CriticalPoint {
  x: number;
  y: number;
  type: string;
}

export interface BBTData {
  x: string[];
  yPrime: string[];
  y: string[];
}

export interface AsymptotesData {
  vertical?: number[];
  horizontal?: number[];
  slant?: {
    a: number;
    b: number;
    expr: string;
  };
}

export interface CustomEdges {
  solid: [string, string][];
  dashed: [string, string][];
}

export interface VisualData {
  type: '3d_geometry' | '2d_function' | 'integral_region';
  modelKind?:
    | 'pyramid_sabcd'
    | 'pyramid_sabc'
    | 'prism'
    | 'cube'
    | 'box'
    | 'oxyz_system'
    | 'poly3'
    | 'poly4'
    | 'fractional'
    | 'fractional_2_1'
    | 'parabola'
    | 'integral_region';
  vertices?: Vertex3D[];
  edges?: CustomEdges;
  cuttingPlane?: CuttingPlaneData;
  functionExpr?: string;
  functionType?: 'poly3' | 'poly4' | 'rational_1_1' | 'rational_2_1' | 'parabola' | 'other';
  functionParams?: {
    a?: number;
    b?: number;
    c?: number;
    d?: number;
    e?: number;
  };
  domain?: [number, number];
  criticalPoints?: CriticalPoint[];
  asymptotes?: AsymptotesData;
  symmetryCenter?: { x: number; y: number };
  bbt?: BBTData;
  integralRegion?: {
    fExpr: string;
    gExpr?: string;
    from: number;
    to: number;
    areaValue?: number;
  };
}

export interface ParameterSlider {
  hasParameter: boolean;
  paramName: string;
  range: [number, number];
  description: string;
}

export interface Section4Visual {
  visualDescription: string;
  recommendedViewpoint: string;
  parameterSlider?: ParameterSlider;
  visualData: VisualData;
  tikzCode: string;
  asymptoteCode: string;
}

export interface Section5Publication {
  formatNotes: string;
  sgkPlacement: string;
  exportSuggestions: string;
}

export interface MathEdResponse {
  topic: MathTopic;
  title: string;
  curriculum: string;
  consistencyCheck: ConsistencyCheck;
  section1_analysis: Section1Analysis;
  section2_pedagogy: Section2Pedagogy;
  section3_solution: Section3Solution;
  section4_visual: Section4Visual;
  section5_publication: Section5Publication;
}
