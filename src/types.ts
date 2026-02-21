
export interface EnergyDataPoint {
  timestamp: string;
  usage_kwh: number;
  zone: 'Residential-North' | 'Residential-South' | 'Commercial' | 'Infrastructure';
}

export interface VillageStats {
  totalUsage: number;
  peakUsage: number;
  peakHour: string;
  avgUsage: number;
  areaBreakdown: Record<string, number>;
  efficiency: number; // Percentage
  carbonFootprint: number; // in kg CO2
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'viewer';
}

export interface ChartData {
  name: string;
  value: number;
}

export interface DailyUsageData {
  time: string;
  residential: number;
  commercial: number;
  infrastructure: number;
}
