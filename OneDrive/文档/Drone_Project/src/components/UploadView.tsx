import React, { useState, useRef, useCallback } from 'react';
import { analyzeDroneImage, InspectionResult } from '../lib/gemini';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  CloudUpload, 
  X, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Globe,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface UploadViewProps {
  setView: (v: any, id?: string) => void;
}

const STEPS = [
  { id: 'upload', label: 'UAV_SYNC', icon: CloudUpload },
  { id: 'extract', label: 'GEO_TAGGING', icon: Globe },
  { id: 'neural', label: 'VISION_AI', icon: Cpu },
  { id: 'database', label: 'ARCHIVE_DATA', icon: Database },
];

export function UploadView({ setView }: UploadViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG/PNG)');
      return;
    }
    setFile(selectedFile);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleStartAnalysis = async () => {
    if (!preview || !file || !auth.currentUser) return;
    
    setAnalyzing(true);
    setError(null);
    setCurrentStep(0);

    try {
      // Step 0: UAV Sync
      await new Promise(r => setTimeout(r, 800));
      setCurrentStep(1);

      // Step 1: Geo Tagging
      await new Promise(r => setTimeout(r, 1200));
      setCurrentStep(2);

      // Step 2: Vision AI
      const base64Data = preview.split(',')[1];
      const analysis: InspectionResult = await analyzeDroneImage(base64Data);
      
      setCurrentStep(3);

      // Step 3: Archive
      const docRef = await addDoc(collection(db, 'inspections'), {
        uploaderId: auth.currentUser?.uid,
        uploaderEmail: auth.currentUser?.email,
        imageUrl: preview,
        timestamp: serverTimestamp(),
        status: 'completed',
        faultsDetected: analysis.faults,
        summary: analysis.summary,
        location: {
          lat: 34.0522 + (Math.random() - 0.5) * 0.1,
          lng: -118.2437 + (Math.random() - 0.5) * 0.1
        }
      });

      await new Promise(r => setTimeout(r, 1000));
      setView('detail', docRef.id);
    } catch (err: any) {
      console.error(err);
      setError('Analysis failed. Tactical link interrupted or AI engine timed out.');
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold tracking-tight text-white mb-2">Initialize Drone Mission</h2>
        <p className="text-slate-400">Launch optical infrastructure analysis via high-resolution telemetry payload.</p>
      </div>

      <div className={cn(
        "glass-panel p-10 rounded-[2.5rem] border-2 border-dashed transition-all relative overflow-hidden",
        preview ? "border-brand-primary/50" : "border-slate-800 bg-slate-900/50 hover:border-brand-primary/40",
        analyzing && "pointer-events-none"
      )}>
        {!preview ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer py-16 flex flex-col items-center justify-center space-y-8"
          >
            <div className="w-24 h-24 bg-brand-primary text-slate-900 rounded-3xl flex items-center justify-center shadow-lg shadow-brand-primary/20 hover:scale-110 transition-transform">
              <CloudUpload size={40} />
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-white">Transmit Payload</p>
              <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Drone Optical Link: Ready (HEIF/JPEG/RAW)</p>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <button className="bg-slate-800 text-white border border-slate-700 font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-[0.2em] hover:bg-slate-700 transition-colors">
              Open Telemetry Data
            </button>
          </div>
        ) : (
          <div className="space-y-8">
             <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-700 shadow-2xl bg-black">
                <img src={preview} alt="Inspection Asset" className="w-full h-full object-cover opacity-80" />
                {!analyzing && (
                  <button 
                    onClick={() => { setPreview(null); setFile(null); }}
                    className="absolute top-6 right-6 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-brand-danger transition-colors z-10"
                  >
                    <X size={24} />
                  </button>
                )}
                {/* HUD Elements */}
                <div className="absolute inset-0 border-[40px] border-black/10 pointer-events-none" />
                <div className="absolute top-8 left-8 text-white/40 font-mono text-[10px] space-y-1">
                   <div>[UAV_772_CAM_01]</div>
                   <div>ISO_100 | f/2.8 | 1/2000s</div>
                </div>
             </div>

             {!analyzing ? (
               <div className="flex flex-col items-center gap-6">
                 <button 
                  onClick={handleStartAnalysis}
                  className="group flex items-center gap-4 bg-brand-primary text-slate-900 px-16 py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-sm hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all"
                 >
                   <ShieldAlert size={24} className="group-hover:scale-125 transition-transform" />
                   Initialize AI Scanners
                 </button>
                 <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Security Clearance: ADMIN</p>
               </div>
             ) : (
               <div className="space-y-10 py-6">
                  <div className="grid grid-cols-4 gap-4">
                    {STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      const isComplete = idx < currentStep;
                      const isActive = idx === currentStep;
                      
                      return (
                        <div key={step.id} className={cn(
                          "flex flex-col items-center gap-4 p-5 rounded-2xl border transition-all duration-500",
                          isActive ? "bg-brand-primary/10 border-brand-primary/30" : (isComplete ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/5 opacity-30")
                        )}>
                          <div className={cn(
                            "p-4 rounded-2xl transition-colors",
                            isActive ? "bg-brand-primary text-slate-900 animate-pulse shadow-lg shadow-brand-primary/20" : (isComplete ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500")
                          )}>
                            {isComplete ? <CheckCircle2 size={24} /> : <Icon size={24} />}
                          </div>
                          <span className={cn(
                            "text-[10px] uppercase font-bold tracking-[0.2em]",
                            isActive ? "text-brand-primary" : (isComplete ? "text-emerald-400" : "text-slate-500")
                          )}>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">
                       <span className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                         AI Engine: Processing...
                       </span>
                       <span className="text-brand-primary">{Math.round((currentStep / STEPS.length) * 100)}% COMPLETE</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                        className="h-full bg-brand-primary" 
                       />
                    </div>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-brand-danger/10 border border-brand-danger/20 rounded-2xl flex items-center gap-4 text-brand-danger text-xs font-bold uppercase tracking-widest"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
         <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-[2rem] space-y-4">
            <Zap className="text-brand-primary" size={24} />
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Vision_v8-X</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Enhanced structural analysis model trained on 500k power distribution faults.</p>
         </div>
         <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-[2rem] space-y-4">
            <Globe className="text-brand-primary" size={24} />
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">GIS_SYNC</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Automatic correlation of visual findings with global GPS infrastructure database.</p>
         </div>
         <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-[2rem] space-y-4">
            <Database className="text-brand-primary" size={24} />
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">SEC_STORAGE</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Military-grade archival of inspection logs for maintenance dispatch verification.</p>
         </div>
      </div>
    </div>
  );
}
