import { Zap, ShieldCheck, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

export function AuthView() {
  const { login, loading, error } = useAuth();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleLogin = async () => {
    await login();
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col lg:flex-row tech-grid w-full">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0f172a] border-r border-slate-800 overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent opacity-50" />
        <div className="relative z-10 p-20 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-16 bg-brand-primary shadow-lg shadow-brand-primary/30 rounded-2xl flex items-center justify-center mb-8">
              <Zap className="w-10 h-10 text-slate-900" />
            </div>
            <h1 className="text-6xl font-bold text-white tracking-tighter mb-6 leading-tight">
              VOLT-EYE <br />
              <span className="text-brand-primary">INTELLIGENCE.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-sm leading-relaxed">
              Autonomous grid inspection and fault detection powered by industrial-grade vision AI.
            </p>
          </motion.div>
          
          <div className="mt-20 grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-brand-primary">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Precision</span>
              </div>
              <p className="text-slate-500 text-xs">98.4% model accuracy verified across HV networks.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Zap size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Real-Time</span>
              </div>
              <p className="text-slate-500 text-xs">Instant classification of damaged insulators and leaks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0b0e14]">
        <div className="max-w-sm w-full space-y-8">
          <div className="lg:hidden text-center mb-12">
             <div className="w-12 h-12 bg-brand-primary rounded-xl mx-auto flex items-center justify-center mb-2">
                <Zap className="text-slate-900" />
             </div>
             <h2 className="text-2xl font-bold text-white tracking-tighter">VOLT-EYE</h2>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-8 relative overflow-hidden">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Grid Access Portal</h2>
              <p className="text-slate-500 text-xs mt-2 uppercase tracking-wide">SEC_PROTO: {new Date().getFullYear()}</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-brand-danger/10 border border-brand-danger/20 rounded-xl flex items-center gap-3 text-brand-danger text-[10px] uppercase font-bold tracking-wider"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-white text-slate-900 py-4 px-6 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                  <span className="text-sm">Initiate Authorization Sequence</span>
                </>
              )}
            </button>

            <div className="relative">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
               <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-[#0f172a] px-3 text-slate-600">Encrypted Path</span></div>
            </div>

            <p className="text-[9px] text-slate-600 text-center uppercase tracking-widest leading-loose">
              By entering this portal, you confirm compliance with <br/>
              Grid Intelligence Unit security directives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
