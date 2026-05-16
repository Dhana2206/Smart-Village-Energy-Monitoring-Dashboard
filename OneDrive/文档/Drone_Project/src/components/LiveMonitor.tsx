import React, { useRef, useState, useEffect } from 'react';
import { analyzeDroneImage, InspectionResult } from '../lib/gemini';
import { Camera, StopCircle, Play, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function LiveMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [analysis, setAnalysis] = useState<InspectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied. Please ensure permissions are granted.");
    }
  };

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setAnalysis(null);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        const result = await analyzeDroneImage(base64);
        setAnalysis(result);
      }
    } catch (err) {
      console.error("Live Analysis Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze every 5 seconds if streaming
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(captureAndAnalyze, 5000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Mission Control: Live</h2>
          <p className="text-slate-400 mt-1">Real-time infrastructure analysis via drone optical feed.</p>
        </div>

        <div className="flex items-center gap-3">
          {!isStreaming ? (
            <button
              onClick={startStream}
              className="flex items-center gap-2 bg-brand-primary text-slate-900 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all"
            >
              <Play size={18} />
              Engage Feed
            </button>
          ) : (
            <button
              onClick={stopStream}
              className="flex items-center gap-2 bg-brand-danger text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all"
            >
              <StopCircle size={18} />
              Terminate Link
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feed Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden group shadow-2xl">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover grayscale brightness-75"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* AI Overlay Layer */}
            {isStreaming && analysis?.faults.map((fault, index) => {
              const [ymin, xmin, ymax, xmax] = fault.box_2d;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "absolute border-2 shadow-lg transition-all",
                    fault.severity === 'critical' ? "border-brand-danger bg-brand-danger/10" : "border-brand-primary bg-brand-primary/10"
                  )}
                  style={{
                    top: `${ymin/10}%`,
                    left: `${xmin/10}%`,
                    width: `${(xmax-xmin)/10}%`,
                    height: `${(ymax-ymin)/10}%`
                  }}
                >
                  <div className={cn(
                    "absolute -top-6 left-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap",
                    fault.severity === 'critical' ? "bg-brand-danger text-white" : "bg-brand-primary text-slate-900"
                  )}>
                    {fault.type} ({(fault.confidence * 100).toFixed(0)}%)
                  </div>
                </motion.div>
              );
            })}

            {/* HUD Elements */}
            <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                    <span className="text-[10px] font-mono text-brand-primary uppercase tracking-widest font-bold">Signal: Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest font-bold">Res: 1080p_UAV</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-[24px] font-mono font-bold text-white/40 tracking-tighter">04:20:12:88</div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Global_Grid_Sync</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                 <div className="w-48 h-48 border border-white/10 rounded-full flex items-center justify-center relative opacity-40">
                    <div className="absolute w-full h-[1px] bg-white/10" />
                    <div className="absolute w-[1px] h-full bg-white/10" />
                    <div className="w-12 h-12 border border-brand-primary/40 rounded-full flex items-center justify-center">
                       <div className="w-1 h-1 bg-brand-primary rounded-full animate-ping" />
                    </div>
                 </div>
              </div>

              <div className="flex justify-between items-end italic opacity-60">
                 <div className="text-[9px] text-slate-400">LAT_34.05 / LNG_-118.24</div>
                 <div className="text-[9px] text-slate-400">ALT_14.5M / SPD_2.4KMH</div>
              </div>
            </div>

            <AnimatePresence>
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 z-20"
                >
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                    <ShieldAlert className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary" />
                  </div>
                  <p className="text-xs font-mono text-brand-primary uppercase tracking-[0.3em] font-bold">Neural Engine Scanning...</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {error && (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
                <AlertTriangle className="text-brand-danger mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Protocol Error</h3>
                <p className="text-slate-500 max-w-sm">{error}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/30 border border-slate-800">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-xs text-slate-400">Stable connection maintained via Grid Command Link. Last AI scan successful.</p>
          </div>
        </div>

        {/* Live Logs */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col h-full space-y-6">
           <div className="border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={16} className="text-brand-primary" />
                Live Log Entries
              </h3>
           </div>

           <div className="flex-1 overflow-auto space-y-4 pr-2 custom-scrollbar">
              {analysis?.faults.map((fault, i) => (
                <motion.div 
                   key={i}
                   initial={{ x: 20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   className={cn(
                     "p-4 rounded-xl border border-white/5",
                     fault.severity === 'critical' ? "bg-brand-danger/10 border-brand-danger/20" : "bg-[#15171C]"
                   )}
                >
                   <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase",
                        fault.severity === 'critical' ? "text-brand-danger" : "text-brand-primary"
                      )}>{fault.type}</span>
                      <span className="text-[9px] font-mono text-slate-500">{(fault.confidence * 100).toFixed(0)}%</span>
                   </div>
                   <p className="text-[11px] text-slate-400 leading-normal">{fault.description}</p>
                </motion.div>
              ))}

              {!analysis && !isAnalyzing && (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-30">
                   <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center mb-4">
                      <Camera size={20} />
                   </div>
                   <p className="text-xs uppercase tracking-widest">Waiting for opt-feed</p>
                </div>
              )}
           </div>

           <div className="pt-6 border-t border-white/5">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-slate-500">
                   <span>AI Severity Index</span>
                   <span className="text-slate-300">Classified_v2</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="flex-1 h-3 bg-emerald-500/10 border border-emerald-500/20 rounded" />
                   <div className="flex-1 h-3 bg-brand-primary/10 border border-brand-primary/20 rounded" />
                   <div className="flex-1 h-3 bg-brand-danger/10 border border-brand-danger/20 rounded animate-pulse" />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
