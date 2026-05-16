import React from 'react';
import { User } from 'firebase/auth';
import { 
  LayoutDashboard, 
  CloudUpload, 
  ClipboardList, 
  LogOut, 
  ShieldAlert,
  Zap,
  MapPin,
  Radio
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentView: string;
  setView: (v: any) => void;
}

export function Layout({ children, user, onLogout, currentView, setView }: LayoutProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'upload', label: 'New Inspection', icon: CloudUpload },
    { id: 'live', label: 'Live Monitor', icon: Radio },
    { id: 'map', label: 'Asset Map', icon: MapPin },
    { id: 'reports', label: 'History', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e14] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#0f172a] flex flex-col shrink-0">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-primary shadow-lg shadow-brand-primary/20 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">VOLT-EYE AI</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Fault Detection</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                currentView === item.id 
                  ? "bg-brand-primary/10 text-brand-primary" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 border border-slate-700/50 mb-6">
            <p className="text-[10px] font-bold text-brand-primary uppercase mb-2 tracking-wider">Drone Status</p>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px]"><span>Signal</span><span className="text-emerald-400">Stable (94%)</span></div>
              <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden"><div className="h-full w-[94%] bg-emerald-500"></div></div>
              <div className="flex justify-between text-[9px]"><span>Battery</span><span className="text-brand-primary">62%</span></div>
              <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden"><div className="h-full w-[62%] bg-brand-primary"></div></div>
            </div>
          </div>

          <div className="flex items-center space-x-3 px-4 py-3 border-t border-slate-800">
            <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-slate-600" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full mt-2 flex items-center space-x-3 px-4 py-2 text-slate-500 hover:text-brand-danger hover:bg-brand-danger/5 rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span className="text-xs font-medium">System Shutdown</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto tech-grid flex flex-col">
        <header className="h-16 border-b border-slate-800 bg-[#0f172a] px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DRONE_UNIT_772</span>
            <span className="text-slate-700 mx-2">/</span>
            <span className="text-xs font-medium text-slate-200 capitalize tracking-wide">{currentView}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              AI Engine: Online
            </div>
          </div>
        </header>
        
        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
