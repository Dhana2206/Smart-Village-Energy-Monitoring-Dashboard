
import { EnergyDataPoint, VillageStats, DailyUsageData } from '../types';

/**
 * DATABASE SCHEMA (Conceptual for MySQL/SQLite)
 * 
 * TABLE energy_logs (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
 *   usage_kwh DECIMAL(10, 2),
 *   zone VARCHAR(50)
 * );
 */

const generateMockData = (): EnergyDataPoint[] => {
  const data: EnergyDataPoint[] = [];
  const zones = ['Residential-North', 'Residential-South', 'Commercial', 'Infrastructure'] as const;
  
  // Generating hourly data for the "present" day
  for (let h = 0; h < 24; h++) {
    const timestamp = `${h.toString().padStart(2, '0')}:00`;
    zones.forEach(zone => {
      let base = 30; // Base load for the village
      if (zone === 'Commercial' && h >= 9 && h <= 18) base = 210;
      if (zone.includes('Residential') && (h >= 18 || h <= 7)) base = 120;
      if (zone === 'Infrastructure') base = 80 + Math.sin(h / 3) * 20; 
      
      const usage = base + Math.random() * 40;
      data.push({ 
        timestamp, 
        usage_kwh: parseFloat(usage.toFixed(2)), 
        zone 
      });
    });
  }
  return data;
};

export const fetchVillageData = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  return generateMockData();
};

export const calculateStats = (data: EnergyDataPoint[]): VillageStats => {
  const totalUsage = data.reduce((acc, curr) => acc + curr.usage_kwh, 0);
  
  const hourlyUsage: Record<string, number> = {};
  data.forEach(d => {
    hourlyUsage[d.timestamp] = (hourlyUsage[d.timestamp] || 0) + d.usage_kwh;
  });
  
  let peakUsage = 0;
  let peakHour = '';
  Object.entries(hourlyUsage).forEach(([hour, usage]) => {
    if (usage > peakUsage) {
      peakUsage = usage;
      peakHour = hour;
    }
  });

  const areaBreakdown: Record<string, number> = {};
  data.forEach(d => {
    areaBreakdown[d.zone] = (areaBreakdown[d.zone] || 0) + d.usage_kwh;
  });

  // Derived metrics
  const carbonFootprint = totalUsage * 0.421; // 0.421kg CO2 per kWh (avg mix)
  const efficiency = 85 + (Math.random() * 10); // Simulated grid efficiency %

  return {
    totalUsage: parseFloat(totalUsage.toFixed(2)),
    peakUsage: parseFloat(peakUsage.toFixed(2)),
    peakHour,
    avgUsage: parseFloat((totalUsage / 24).toFixed(2)),
    areaBreakdown,
    efficiency: parseFloat(efficiency.toFixed(1)),
    carbonFootprint: parseFloat(carbonFootprint.toFixed(2))
  };
};

export const formatChartData = (data: EnergyDataPoint[]): DailyUsageData[] => {
  const chartMap: Record<string, DailyUsageData> = {};
  
  data.forEach(d => {
    if (!chartMap[d.timestamp]) {
      chartMap[d.timestamp] = {
        time: d.timestamp,
        residential: 0,
        commercial: 0,
        infrastructure: 0
      };
    }
    
    if (d.zone.includes('Residential')) {
      chartMap[d.timestamp].residential += d.usage_kwh;
    } else if (d.zone === 'Commercial') {
      chartMap[d.timestamp].commercial += d.usage_kwh;
    } else if (d.zone === 'Infrastructure') {
      chartMap[d.timestamp].infrastructure += d.usage_kwh;
    }
  });
  
  // Round results
  const result = Object.values(chartMap).map(item => ({
    ...item,
    residential: parseFloat(item.residential.toFixed(2)),
    commercial: parseFloat(item.commercial.toFixed(2)),
    infrastructure: parseFloat(item.infrastructure.toFixed(2))
  }));
  
  return result.sort((a, b) => a.time.localeCompare(b.time));
};
