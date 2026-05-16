import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { formatDate } from '../lib/utils';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { 
  Search, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ReportListProps {
  setView: (v: any, id?: string) => void;
}

export function ReportList({ setView }: ReportListProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchReports() {
      try {
        const q = query(collection(db, 'inspections'), orderBy('timestamp', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => 
    r.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.uploaderEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Inspection History</h2>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-primary/50 transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-3">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
          <span className="font-mono text-xs uppercase tracking-widest">Retrieving logs...</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="h-64 glass-panel rounded-3xl flex flex-col items-center justify-center text-slate-500 space-y-3">
          <Calendar size={48} className="opacity-20" />
          <p>No inspection reports found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => (
            <button
              key={report.id}
              onClick={() => setView('detail', report.id)}
              className="group glass-panel p-4 rounded-2xl flex items-center gap-6 hover:bg-white/10 transition-all text-left border-l-4 border-l-transparent hover:border-l-brand-primary"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                <img src={report.imageUrl} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
              </div>

              <div className="flex-1 min-w-0 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-tighter">REF_{report.id.slice(0, 8)}</span>
                  <span className="text-slate-700">•</span>
                  <span className="text-slate-400">{formatDate(report.timestamp?.toDate() || new Date())}</span>
                </div>
                <h3 className="text-lg font-bold text-white truncate max-w-lg">{report.summary}</h3>
                <div className="flex items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{report.location?.lat.toFixed(4)}, {report.location?.lng.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {report.faultsDetected?.length > 0 ? (
                      <div className="flex items-center gap-1 text-brand-danger">
                        <AlertTriangle size={14} />
                        <span>{report.faultsDetected.length} Critical Faults</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 size={14} />
                        <span>Healthy Asset</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <ChevronRight className="text-slate-600 group-hover:text-brand-primary transition-all" size={24} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
