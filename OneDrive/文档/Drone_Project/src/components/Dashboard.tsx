import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { 
  Zap, 
  AlertOctagon, 
  CheckCircle2, 
  Activity, 
  TrendingUp, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface DashboardProps {
  setView: (v: any) => void;
}

const mockTrendData = [
  { name: 'Mon', faults: 4 },
  { name: 'Tue', faults: 3 },
  { name: 'Wed', faults: 7 },
  { name: 'Thu', faults: 2 },
  { name: 'Fri', faults: 5 },
  { name: 'Sat', faults: 8 },
  { name: 'Sun', faults: 6 },
];

const mockTypeData = [
  { name: 'Insulator', count: 12, color: '#f59e0b' },
  { name: 'Wire Dam.', count: 8, color: '#f59e0b' },
  { name: 'Tower Rust', count: 6, color: '#ef4444' },
  { name: 'Pole Lean', count: 4, color: '#8b5cf6' },
];

export function Dashboard({ setView }: DashboardProps) {
  const [stats, setStats] = useState({
    total: 0,
    faulty: 0,
    healthy: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const q = query(collection(db, 'inspections'), limit(100));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data());
        
        const total = data.length;
        const faulty = data.filter(d => d.faultsDetected?.length > 0).length;
        const healthy = total - faulty;
        
        setStats({ total, faulty, healthy });
      } catch (error) {
        // handleFirestoreError(error, OperationType.LIST, 'inspections');
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIItem title="Analyzed Images" value={stats.total} trend="+12% from last flight" color="text-white" />
        <KPIItem title="Detected Faults" value={stats.faulty} trend={`${stats.faulty} Active Issues`} color="text-brand-primary" />
        <KPIItem title="Model Accuracy" value="98.4%" trend="YOLOv8-X Optimized" color="text-white" />
        <KPIItem title="Inspection State" value="Active" trend="Drone: DR-772 Alpha" color="text-slate-900" isLive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Charts */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Fault Detection Trends
            </h3>
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">7D_CYCLE</span>
          </div>
          
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorFaults" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Area type="monotone" dataKey="faults" stroke="#f59e0b" fillOpacity={1} fill="url(#colorFaults)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Fault Classification
            </h3>
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">TYPE_DIST</span>
          </div>
          
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {mockTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Action Block */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col md:flex-row min-h-[300px]">
        <div className="flex-1 p-12 flex flex-col justify-center space-y-6">
          <div>
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] mb-4 block">System Status: Ready</span>
            <h3 className="text-4xl font-bold text-white tracking-tight mb-4">Initialize High-Voltage <br/> Inspection Mission</h3>
            <p className="text-slate-400 max-w-md">Connect drone telemetry and upload industrial imagery for autonomous fault classification and technical reporting.</p>
          </div>
          <button 
            onClick={() => setView('upload')}
            className="w-fit flex items-center gap-3 bg-brand-primary text-slate-900 px-10 py-5 rounded-xl font-bold border-2 border-brand-primary hover:bg-transparent hover:text-brand-primary transition-all uppercase tracking-widest text-xs"
          >
            Start New Mission
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="hidden md:block w-1/3 bg-[url('https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center grayscale opacity-50 border-l border-slate-800"></div>
      </div>
    </div>
  );
}

function KPIItem({ title, value, trend, color, isLive }: any) {
  return (
    <div className={cn(
      "rounded-xl border border-slate-800 p-5 space-y-2",
      isLive ? "bg-brand-primary" : "bg-[#0f172a]"
    )}>
      <p className={cn("text-[9px] font-bold uppercase tracking-widest", isLive ? "text-slate-900" : "text-slate-500")}>{title}</p>
      <h3 className={cn("text-2xl font-bold", color)}>{value}</h3>
      <p className={cn("text-[9px]", isLive ? "text-slate-800 font-medium" : "text-emerald-400 font-medium")}>{trend}</p>
    </div>
  );
}
