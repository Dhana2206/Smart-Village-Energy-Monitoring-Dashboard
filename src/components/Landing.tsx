
import React, { useRef, useState } from 'react';
import { VillageIcons } from '../constants';

interface LandingProps {
  onStartLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStartLogin }) => {
  const impactRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const scrollToImpact = () => {
    impactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white text-sm font-bold flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center bg-blue-500 rounded-lg">
              <VillageIcons.Bolt />
            </div>
            {toast}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-100">
              <VillageIcons.Bolt />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">SmartVillage</span>
          </div>
          <button 
            onClick={onStartLogin}
            className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 px-5 py-2.5 bg-blue-50 rounded-xl transition-all outline-none"
          >
            Admin Portal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[0.95] mb-10 tracking-tighter">
              Energizing the <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-emerald-400">Smart</span> Grid
            </h1>
            <p className="text-xl text-gray-500 mb-14 leading-relaxed font-medium max-w-2xl mx-auto">
              Empowering local communities with next-gen real-time data, AI insights, and zero-waste energy management tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={onStartLogin}
                className="px-10 py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-slate-800 hover:shadow-2xl hover:shadow-blue-200/50 transition-all transform active:scale-95 text-lg outline-none"
              >
                Access Dashboard
              </button>
              <button 
                onClick={scrollToImpact}
                className="px-10 py-5 bg-white text-gray-700 font-black rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all text-lg outline-none"
              >
                View Global Impact
              </button>
            </div>
          </div>
        </div>
        
        {/* Background blobs for aesthetic */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-[10%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-pulse"></div>
          <div className="absolute bottom-10 right-[10%] w-[500px] h-[500px] bg-emerald-100 rounded-full mix-blend-multiply filter blur-[150px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Impact Statistics Section */}
      <section ref={impactRef} className="py-24 bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Active Villages", value: "1,240+" },
              { label: "CO2 Reduction", value: "420k Tons" },
              { label: "Renewable Mix", value: "68%" },
              { label: "Cost Saved", value: "$12.4M" }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Village-Scale Intelligence</h2>
            <p className="text-gray-500 font-medium text-lg">Infrastructure-grade monitoring for modern utility management.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Live Zonal Pulse",
                desc: "Second-by-second visibility into Residential, Commercial, and Industrial demand sectors.",
                icon: <VillageIcons.Home />,
                color: "bg-blue-600"
              },
              {
                title: "Gemini Analysis",
                desc: "Advanced AI models identify inefficiencies and propose carbon-neutral optimization strategies.",
                icon: <VillageIcons.Bolt />,
                color: "bg-emerald-500"
              },
              {
                title: "Predictive Load",
                desc: "Predict and flatten peak demand curves to protect grid health and reduce village operational costs.",
                icon: <VillageIcons.Chart />,
                color: "bg-amber-500"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
                <div className={`w-16 h-16 rounded-2xl ${feature.color} text-white flex items-center justify-center mb-10 shadow-lg shadow-${feature.color.split('-')[1]}-200 group-hover:rotate-6 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-5">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                  <VillageIcons.Bolt />
                </div>
                <span className="text-2xl font-black tracking-tight text-white">SmartVillage</span>
              </div>
              <p className="text-slate-400 max-w-sm mb-8 leading-relaxed font-medium">
                Leading the global shift in rural infrastructure through modern sensory technology and ecological accountability.
              </p>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500 mb-8">Ecosystem</h4>
              <ul className="space-y-5 text-slate-400 font-bold text-sm">
                <li><button onClick={() => showToast('Smart Grid API documentation is coming soon')} className="hover:text-blue-400 transition-all outline-none text-left">Smart Grid API</button></li>
                <li><button onClick={() => showToast('Case Library is being archived')} className="hover:text-blue-400 transition-all outline-none text-left">Case Library</button></li>
                <li><button onClick={() => showToast('Open Village portal is in beta')} className="hover:text-blue-400 transition-all outline-none text-left">Open Village</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500 mb-8">Authority</h4>
              <ul className="space-y-5 text-slate-400 font-bold text-sm">
                <li><button onClick={onStartLogin} className="hover:text-blue-400 transition-all outline-none text-left">Admin Dashboard</button></li>
                <li><button onClick={() => showToast('Crisis Protocols are classified')} className="hover:text-blue-400 transition-all outline-none text-left">Crisis Protocols</button></li>
                <li><button onClick={() => showToast('Infrastructure Terms are being reviewed')} className="hover:text-blue-400 transition-all outline-none text-left">Infrastructure Terms</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-800 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
            © SMART VILLAGE SYSTEMS • GRID INFRASTRUCTURE GROUP
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
