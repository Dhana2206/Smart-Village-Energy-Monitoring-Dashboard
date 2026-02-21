
import { 
  AreaChart, Area, PieChart, Pie, Cell, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { fetchVillageData, calculateStats, formatChartData } from '../services/dataService';
import { getEnergySuggestions } from '../services/geminiService';
import { EnergyDataPoint, VillageStats, DailyUsageData } from '../types';
import { COLORS, USAGE_THRESHOLD, VillageIcons } from '../constants';

type Tab = 'dashboard' | 'grid' | 'analytics' | 'reports' | 'settings';

interface DashboardProps {
  user: string;
  avatarSeed: string;
  customAvatar: string | null;
  onLogout: () => void;
  onUpdateProfile: (newName: string, newSeed: string, newAvatar: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, avatarSeed, customAvatar, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [rawData, setRawData] = useState<EnergyDataPoint[]>([]);
  const [stats, setStats] = useState<VillageStats | null>(null);
  const [chartData, setChartData] = useState<DailyUsageData[]>([]);
  const [suggestions, setSuggestions] = useState<string>('Analyzing grid patterns...');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  
  // Filter States
  const [dateRange, setDateRange] = useState('Today');
  const [selectedArea, setSelectedArea] = useState('All Areas');

  // UI states
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Profile Form States
  const [editName, setEditName] = useState(user);
  const [editSeed, setEditSeed] = useState(avatarSeed);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(customAvatar);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock Asset Data
  const [assets] = useState([
    { id: 'TX-01', name: 'Main Transformer', zone: 'Infrastructure', status: 'Online', load: '65%', health: 98 },
    { id: 'SL-N', name: 'North Streetlights', zone: 'Residential-North', status: 'Standby', load: '12%', health: 85 },
    { id: 'SM-COM', name: 'Commercial Meters', zone: 'Commercial', status: 'Active', load: '88%', health: 92 },
    { id: 'PV-W', name: 'West Solar Array', zone: 'Infrastructure', status: 'Warning', load: '45%', health: 62 },
    { id: 'SM-RES-S', name: 'South Residential Hub', zone: 'Residential-South', status: 'Active', load: '72%', health: 95 },
  ]);

  // Memoized AI Insights
  const chartInsights = useMemo(() => {
    if (!stats) return { main: '', zonal: '' };
    const commercialPerc = (stats.areaBreakdown['Commercial'] / stats.totalUsage) * 100;
    const resPerc = ((stats.areaBreakdown['Residential-North'] + stats.areaBreakdown['Residential-South']) / stats.totalUsage) * 100;
    
    return {
      main: `Grid efficiency is currently ${stats.efficiency}%. Commercial demand peaked at ${stats.peakHour} representing ${commercialPerc.toFixed(1)}% of the total load.`,
      zonal: `Residential areas are consuming ${resPerc.toFixed(1)}% of supply. System stability remains within nominal range.`
    };
  }, [stats]);

  useEffect(() => {
    if (isProfileModalOpen) {
      setEditName(user);
      setEditSeed(avatarSeed);
      setPreviewAvatar(customAvatar);
    }
  }, [isProfileModalOpen, user, avatarSeed, customAvatar]);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = () => {
    if (editName.trim() === '') {
      showToast('Name cannot be empty', 'info');
      return;
    }
    onUpdateProfile(editName, editSeed, previewAvatar);
    setIsProfileModalOpen(false);
    showToast('Admin Profile Updated', 'success');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('File too large (>2MB)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewAvatar(reader.result as string);
      showToast('New profile photo selected', 'success');
    };
    reader.readAsDataURL(file);
  };

  const loadData = async () => {
    setLoading(true);
    const data = await fetchVillageData();
    const calculatedStats = calculateStats(data);
    setRawData(data);
    setStats(calculatedStats);
    setChartData(formatChartData(data));
    setLoading(false);
    
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    
    const aiResponse = await getEnergySuggestions(calculatedStats);
    setSuggestions(aiResponse);
  };

  useEffect(() => {
    loadData();
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A] mx-auto"></div>
          <p className="mt-4 text-slate-500 font-bold tracking-tight uppercase text-xs tracking-widest">Initialising Smart Village Insights...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Control Center', icon: <VillageIcons.Home /> },
    { id: 'grid' as Tab, label: 'Grid Assets', icon: <VillageIcons.Bolt /> },
    { id: 'analytics' as Tab, label: 'Smart Analytics', icon: <VillageIcons.Analytics /> },
    { id: 'reports' as Tab, label: 'Event Logs', icon: <VillageIcons.Reports /> },
    { id: 'settings' as Tab, label: 'System Prefs', icon: <VillageIcons.Settings /> },
  ];

  const getHeaderTitle = () => {
    const item = navItems.find(i => i.id === activeTab);
    return item ? item.label.toUpperCase() : 'OVERVIEW';
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] text-slate-900 transition-colors">
      {/* Toast System */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] transition-all duration-300 transform translate-y-0">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl border ${
            toast.type === 'success' ? 'bg-[#008080] border-[#008080]' : 
            toast.type === 'error' ? 'bg-rose-500 border-rose-400' : 
            'bg-[#1E3A8A] border-[#1E3A8A]'} text-white text-sm font-bold flex items-center gap-3 shadow-blue-900/10`}>
            {toast.type === 'error' ? <VillageIcons.Alert /> : <VillageIcons.Bolt />} {toast.message}
          </div>
        </div>
      )}

      {/* Admin Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-[#F9FAFB] w-full max-w-lg rounded-[2.5rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <button 
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-6 left-6 w-10 h-10 bg-white shadow-sm border border-slate-100 text-slate-400 rounded-full flex items-center justify-center transition-all hover:text-[#008080] hover:shadow-md active:scale-90 z-50 group"
              aria-label="Back to Dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="h-32 bg-[#1E3A8A] relative"></div>
            <div className="px-10 pb-12 -mt-16 relative flex flex-col items-center text-center">
              <div 
                className="w-[120px] h-[120px] rounded-full border-[6px] border-[#F9FAFB] bg-slate-100 shadow-xl overflow-hidden relative group cursor-pointer mb-6"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={previewAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editSeed}&backgroundColor=b6e3f4`} alt="Admin" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase">Edit Photo</div>
                <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg,.png" onChange={handleImageUpload} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editName}</h2>
              <p className="text-[10px] font-black text-[#008080] uppercase tracking-[0.2em] mt-1">Utility Administrator</p>
              <div className="w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mt-8 space-y-6 text-left">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Admin Display Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-5 py-4 bg-[#F9FAFB] border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#1E3A8A] outline-none transition-all font-bold" />
                </div>
              </div>
              <button onClick={handleSaveProfile} className="w-full mt-10 py-5 bg-[#1E3A8A] text-white font-black rounded-3xl hover:shadow-xl transition-all active:scale-95 text-base shadow-blue-900/20">Save Profile Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col fixed h-full z-40 border-r border-slate-800">
        <div className="p-8 flex items-center gap-4 border-b border-slate-800">
          <div className="p-2 bg-[#008080] text-white rounded-xl shadow-lg">
            <VillageIcons.Bolt />
          </div>
          <span className="text-xl font-black text-white tracking-tight leading-tight">Smart Village Insights</span>
        </div>
        <nav className="flex-1 mt-10 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group text-sm font-bold border outline-none ${
                activeTab === item.id 
                  ? 'bg-[#008080]/10 text-[#008080] border-[#008080]/20 shadow-lg ring-1 ring-[#008080]/10' 
                  : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className={`${activeTab === item.id ? 'text-[#008080]' : 'text-slate-500'}`}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 mt-auto border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 text-sm font-bold text-slate-400 hover:text-rose-400 rounded-2xl transition-all outline-none group">
            <VillageIcons.SignOut /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative overflow-x-hidden">
        <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100 px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#008080] animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{getHeaderTitle()}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SYSTEM STATUS: ACTIVE</p>
               <p className="text-xs font-bold text-slate-700">Last Updated: {lastUpdated}</p>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
              <button onClick={loadData} className="p-2.5 rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-[#1E3A8A]" title="Refresh Data">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                 </svg>
              </button>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`p-2.5 rounded-xl transition-all relative ${notificationsOpen ? 'bg-[#008080]/10 text-[#008080]' : 'text-slate-400 hover:bg-slate-100 hover:text-[#008080]'}`}
                >
                  <VillageIcons.Bell />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Alerts</h4>
                      <span className="text-[10px] font-bold text-[#008080]">2 New</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center flex-shrink-0"><VillageIcons.Alert /></div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 leading-snug">North Transformer exceeding 92% capacity threshold.</p>
                            <p className="text-[10px] text-slate-400 mt-1">14 mins ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0"><VillageIcons.Bolt /></div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 leading-snug">System-wide grid calibration completed successfully.</p>
                            <p className="text-[10px] text-slate-400 mt-1">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1E3A8A] bg-slate-50/50">View All Events</button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
                className="flex items-center gap-4 cursor-pointer group border-l border-slate-100 pl-6 transition-all"
              >
                <div className="text-right hidden md:block">
                  <p className="text-xs font-black text-slate-900 group-hover:text-[#1E3A8A] transition-colors">{user}</p>
                  <p className="text-[9px] font-bold text-[#008080] uppercase">ADMIN PORTAL</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden shadow-sm ring-2 ring-transparent group-hover:ring-[#008080]/20 transition-all">
                  <img src={customAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=b6e3f4`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
              
              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-black text-slate-900">{user}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Primary Administrator</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => { setIsProfileModalOpen(true); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A] rounded-xl transition-all"
                    >
                      <VillageIcons.Settings /> Edit Profile
                    </button>
                    <button 
                      onClick={() => { setActiveTab('settings'); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A] rounded-xl transition-all"
                    >
                      <VillageIcons.Bolt /> System Settings
                    </button>
                    <div className="my-1 border-t border-slate-50"></div>
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <VillageIcons.SignOut /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-12 pb-32 space-y-12">
          {activeTab === 'dashboard' && (
            <div className="space-y-12 opacity-100 transition-opacity duration-500">
              {/* Data Filters Section */}
              <div className="flex flex-wrap items-center justify-between gap-6 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-center gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Resolution</label>
                    <div className="flex bg-slate-50 p-1 rounded-xl">
                      {['Today', 'Weekly', 'Monthly'].map(range => (
                        <button 
                          key={range}
                          onClick={() => { setDateRange(range); loadData(); }}
                          className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${dateRange === range ? 'bg-white shadow-sm text-[#1E3A8A]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Sector</label>
                    <select 
                      value={selectedArea}
                      onChange={(e) => { setSelectedArea(e.target.value); loadData(); }}
                      className="block w-full px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none cursor-pointer hover:bg-white transition-colors"
                    >
                      <option>All Areas</option>
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Infrastructure</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* KPI Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'Total Energy Pulse', value: `${stats?.totalUsage?.toFixed(2)} kWh`, color: 'text-[#1E3A8A]', bg: 'bg-blue-50', icon: <VillageIcons.Bolt /> },
                  { label: 'System Peak Period', value: stats?.peakHour, color: 'text-amber-600', bg: 'bg-amber-50', icon: <VillageIcons.Clock /> },
                  { label: 'Grid Efficiency', value: `${stats?.efficiency?.toFixed(1)}%`, color: 'text-[#008080]', bg: 'bg-emerald-50', icon: <VillageIcons.Analytics /> },
                  { label: 'Estimated Carbon', value: `${stats?.carbonFootprint?.toFixed(2)} kg`, color: 'text-rose-600', bg: 'bg-rose-50', icon: <VillageIcons.Leaf /> },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-default">
                    <div className="flex items-start justify-between mb-6">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                       <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>{item.icon}</div>
                    </div>
                    <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Dashboard Main Visual */}
              <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Demand Pulse (Real-time)</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Village Load Monitoring</p>
                  </div>
                </div>
                <div className="h-96 w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="loadColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#008080" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#008080" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip 
                          contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontWeight: 'bold' }} 
                          formatter={(value: number) => [value.toFixed(2), 'kWh']}
                      />
                      <Area type="monotone" dataKey="commercial" stroke="#1E3A8A" strokeWidth={5} fill="url(#loadColor)" />
                      <Area type="monotone" dataKey="residential" stroke="#008080" strokeWidth={2} strokeDasharray="4 4" fill="none" />
                      <Area type="monotone" dataKey="infrastructure" stroke="#f59e0b" strokeWidth={2} fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-[#1E3A8A] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                  <span className="px-3 py-1.5 bg-[#008080] rounded-xl text-[9px] font-black uppercase tracking-widest mb-10 inline-block">GEMINI AI ADVISOR</span>
                  <p className="text-slate-200 text-lg leading-relaxed italic font-medium border-l-4 border-[#008080]/40 pl-8 py-2">
                      {suggestions}
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-12 opacity-100 transition-opacity duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Zonal Consumption Bar Chart */}
                <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-10 text-center">Zonal Consumption Variance</h3>
                  <div className="flex-1 min-h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(stats?.areaBreakdown || {}).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight={900} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} fontWeight={900} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value: number) => [value.toFixed(2), 'kWh']} cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="value" fill="#1E3A8A" radius={[12, 12, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grid Efficiency Donut Chart */}
                <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-10 text-center">Grid Efficiency</h3>
                   <div className="h-80 w-full relative mb-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={Object.entries(stats?.areaBreakdown || {}).map(([name, value]) => ({ name, value }))} 
                            cx="50%" cy="50%" 
                            innerRadius={80} 
                            outerRadius={110} 
                            paddingAngle={8} 
                            dataKey="value" 
                            stroke="none"
                          >
                            {Object.entries(stats?.areaBreakdown || {}).map((_, index) => <Cell key={`cell-${index}`} fill={['#1E3A8A', '#008080', '#F59E0B', '#EF4444'][index % 4]} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-4xl font-black text-[#008080]">{stats?.efficiency?.toFixed(1)}%</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EFFICIENT</span>
                      </div>
                   </div>
                   
                   <div className="w-full p-6 bg-[#1E3A8A]/5 rounded-3xl border border-[#1E3A8A]/10 flex gap-4 items-center">
                      <div className="p-3 bg-[#1E3A8A] text-white rounded-xl flex-shrink-0 shadow-lg">
                        <VillageIcons.Bolt />
                      </div>
                      <p className="text-sm font-bold text-slate-600 italic leading-relaxed">
                        {chartInsights.zonal}
                      </p>
                   </div>
                </div>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
                 <h3 className="text-xl font-black text-slate-900 mb-8">System Analysis Insight</h3>
                 <div className="p-6 bg-[#008080]/5 rounded-2xl border border-[#008080]/10 flex gap-4 items-start">
                    <div className="p-2 bg-[#008080] text-white rounded-lg"><VillageIcons.Analytics /></div>
                    <p className="text-base font-bold text-slate-600 leading-relaxed italic">{chartInsights.main}</p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'grid' && (
            <div className="space-y-10 opacity-100 transition-opacity duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Grid Assets</h2>
                <div className="flex gap-2">
                   <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">All Systems Nominal</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {assets.map(asset => (
                   <div key={asset.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className="flex items-center justify-between mb-6">
                        <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg ${asset.status === 'Active' || asset.status === 'Online' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {asset.status}
                        </span>
                        <span className="text-[10px] font-black text-slate-300">ID: {asset.id}</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 mb-1 group-hover:text-[#1E3A8A] transition-colors">{asset.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{asset.zone}</p>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                         <span>Load: {asset.load}</span>
                         <span className={asset.health > 80 ? 'text-emerald-500' : 'text-rose-500'}>Health: {asset.health}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${asset.health > 80 ? 'bg-emerald-400' : 'bg-rose-400'}`} style={{ width: `${asset.health}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-16 opacity-100 transition-opacity duration-500">
               <div className="flex items-center justify-between mb-16">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Village Events Log</h2>
                  <button onClick={() => showToast('Log report exported as CSV', 'success')} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all outline-none active:scale-95 shadow-lg">Export Logs</button>
               </div>
               <div className="space-y-4">
                 {[
                   { type: 'warning', msg: 'Sector North: Transformer load approached 92% capacity.', time: '14:23:01' },
                   { type: 'success', msg: 'System: Carbon offset goal surpassed by 4% this morning.', time: '12:05:42' },
                   { type: 'info', msg: 'Admin: Periodic maintenance scheduled for West Gate transformers.', time: '09:15:00' },
                   { type: 'info', msg: 'System: Daily backup sequence completed with zero redundancies.', time: '04:00:00' },
                   { type: 'warning', msg: 'Grid Sensor A-12: Battery level below 15%. Scheduling swap.', time: '02:44:12' },
                 ].map((event, i) => (
                   <div key={i} className="flex items-center gap-6 p-6 bg-[#F9FAFB] rounded-2xl border border-slate-100 hover:border-slate-300 transition-all cursor-default">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${event.type === 'warning' ? 'bg-rose-500 animate-pulse' : event.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                      <p className="flex-1 text-sm font-bold text-slate-700">{event.msg}</p>
                      <span className="text-[10px] font-black text-slate-400 tracking-widest">{event.time}</span>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-16 max-w-3xl mx-auto text-center opacity-100 transition-opacity duration-500">
              <div className="w-24 h-24 bg-slate-50 text-[#008080] rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-slate-100 shadow-inner">
                <VillageIcons.Settings />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">System Configuration</h3>
              <p className="text-slate-500 font-medium text-lg mb-14">Refine grid thresholds, sensory sensitivity, and AI optimization parameters for regional village deployment.</p>
              <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                <button onClick={() => showToast('Full Grid Calibration initiated...', 'success')} className="w-full py-5 bg-[#1E3A8A] text-white font-black rounded-3xl hover:bg-[#162a6b] transition-all shadow-xl shadow-blue-900/10 active:scale-95 outline-none">Force Grid Calibration</button>
                <button onClick={() => showToast('AI Context synchronized with current telemetry')} className="w-full py-5 bg-white text-slate-900 border-2 border-slate-100 font-black rounded-3xl hover:bg-slate-50 hover:border-slate-200 transition-all outline-none active:scale-95">Sync Gemini Context</button>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-auto px-12 py-10 border-t border-slate-100 bg-white/60 backdrop-blur-md flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] z-20">
           <p>© SMART VILLAGE INSIGHTS • SYSTEM v2.5.0</p>
           <div className="flex gap-12">
             <button onClick={() => showToast('Privacy Policy active')} className="hover:text-[#008080] transition-all">Privacy</button>
             <button onClick={() => showToast('Opening infrastructure support ticket...')} className="hover:text-[#008080] transition-all">Support</button>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
