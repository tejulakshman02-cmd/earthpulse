export type VariableType = 'temperature' | 'rainfall' | 'solar';

export interface LocationInfo {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  climateZone?: string;
}

export interface TimePeriod {
  start: number;
  end: number;
}

export interface TimeSeriesPoint {
  year: number;
  value: number;
  trendValue: number; // Theil-Sen fitted line value
  anomaly?: number;
  lowerConfidence?: number; // Uncertainty lower band
  upperConfidence?: number; // Uncertainty upper band
}

export interface TrendStatistics {
  average: number;
  change: number; // total shift evaluated via Theil-Sen line
  percentageChange: number;
  trendRate: number; // Theil-Sen median slope (units/year)
  theilSenSlope: number; // explicitly named Theil-Sen robust slope
  theilSenIntercept: number;
  olsSlope: number; // OLS linear regression slope for reference
  rSquared: number; // Ordinary linear regression R² (goodness of linear fit)
  direction: 'upward' | 'downward' | 'stable';
  significant: boolean; // True if Mann-Kendall p < 0.05
  pValue: number | null; // Two-sided Mann-Kendall p-value (null if insufficient data)
  zScore: number | null; // Continuity-corrected Z statistic
  mannKendallS: number | null; // Mann-Kendall S statistic
  tieCount: number; // Number of tied values identified
  hasSufficientData: boolean;
  confidencePercent: number; // 95% threshold for α = 0.05
  unit: string;
  baselinePeriod: string;
  sampleCount: number;
  lag1Autocorrelation?: number; // Sample lag-1 serial autocorrelation coefficient
  methodologyNotes?: string;
}

export interface TrendExplanationData {
  whatChanged: string;
  howMuch: string;
  howStrong: string;
  whatToNotice: string;
  statisticalInterpretation?: {
    summary: string;
    impactContext: string;
    drivingFactors: string[];
    recommendedFollowUp: string;
  };
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  location: LocationInfo;
  variable: VariableType;
  variableName: string;
  variableUnit: string;
  period: TimePeriod;
  statistics: TrendStatistics;
  series: TimeSeriesPoint[];
  explanation: TrendExplanationData;
  isRealData: boolean; // True if fetched from NASA POWER API
  isSimulatedFallback: boolean; // True if offline/demo synthesized fallback
  dailyObservationsCount?: number;
  dataSource: {
    name: string;
    mission: string;
    resolution: string;
    lastUpdated: string;
    apiEndpoint?: string;
    notice?: string;
  };
}

export interface ComparisonResult {
  locationA: AnalysisResult;
  locationB: AnalysisResult;
  deltaChange: number;
  deltaRate: number;
  comparativeConclusion: string;
}

export interface DetectiveHotspot {
  id: string;
  title: string;
  locationName: string;
  location: LocationInfo;
  variable: VariableType;
  period: TimePeriod;
  tag: string;
  headlineTrend: string;
  teaser: string;
  rateHighlight: string;
}
