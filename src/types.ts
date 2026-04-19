export type View = "resumen" | "kpi" | "costos" | "programacion" | "alertas" | "documentacion" | "configuracion" | "admin";

export type UFStatus = "ok" | "warning" | "critical";

export interface ContractData {
  name: string;
  value: number;
  executed: number;
  invoiced: number;
}

export interface Milestone {
  id: number;
  title: string;
  date: string;
  responsible: string;
  status: "completed" | "upcoming" | "delayed";
}

export interface Alert {
  id: number;
  type: "critical" | "warning" | "info";
  title: string;
  uf: string;
  description: string;
  impact: string;
  action: string;
  date: string;
}

export interface SCurvePoint {
  month: string;
  programmed: number;
  programmedInitial?: number;
  reprogramming1?: number;
  reprogramming2?: number;
  reprogramming3?: number;
  reprogramming4?: number;
  reprogramming5?: number;
  executed: number;
  invoiced: number;
}

export interface ReprogrammingMarker {
  month: string;
  label: string;
}

export interface UFData {
  id: string;
  name: string;
  contractor: string;
  interventoria: string;
  status: UFStatus;
  statusText: string;
  physicalProgress: number;
  physicalProgrammed: number;
  financialProgress: number;
  financialProgrammed: number;
  constructorContract: ContractData;
  interventoriaContract: ContractData;
  startDate: string;
  endDate: string;
  preconstructionStart: string;
  preconstructionEnd: string;
  constructionStart: string;
  constructionEnd: string;
  deliveryStart: string;
  deliveryEnd: string;
  liquidationStart: string;
  liquidationEnd: string;
  advanceAditionEnd?: string;
  anticipoGirado: number;
  anticipoAmortizado: number;
  milestones: Milestone[];
  alerts: Alert[];
  sCurve: SCurvePoint[];
  constructionSCurve: SCurvePoint[];
  reprogrammingMarkers?: ReprogrammingMarker[];
  criticalPathComments: string;
  media: {
    photos: string[];
    videos: string[];
  };
}

export interface GlobalStats {
  totalContractual: number;
  totalExecuted: number;
  globalExecution: number;
  activeUFs: number;
  totalUFs: number;
}
