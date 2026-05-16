import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { AuthView } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { UploadView } from './components/UploadView';
import { ReportList } from './components/ReportList';
import { ReportDetail } from './components/ReportDetail';
import { LiveMonitor } from './components/LiveMonitor';
import { MapView } from './components/MapView';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0B0E] flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-brand-primary" />
        </motion.div>
        <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Initializing Protocol...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user, logout } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthView />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex h-screen">
               {/* Since I didn't heavily refactor views to use nested routes yet, 
                   I'll use a wrapper that handles the layout and a simple view state 
                   or just route them individually if they were separate pages. 
                   For now, let's keep the internal navigation to avoid broken states, 
                   but wrap it in the ProtectedRoute. */}
               <MainContainer />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// Internal container to maintain the "view" state logic for now
import { useState } from 'react';
function MainContainer() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<'dashboard' | 'upload' | 'reports' | 'detail' | 'live' | 'map'>('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const navigateTo = (newView: any, id?: string) => {
    setView(newView);
    if (id) setSelectedReportId(id);
  };

  if (!user) return null;

  return (
    <Layout user={user} onLogout={logout} currentView={view} setView={navigateTo}>
      <AnimatePresence mode="wait">
        <motion.div
          key={view + (selectedReportId || '')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {view === 'dashboard' && <Dashboard setView={navigateTo} />}
          {view === 'upload' && <UploadView setView={navigateTo} />}
          {view === 'reports' && <ReportList setView={navigateTo} />}
          {view === 'live' && <LiveMonitor />}
          {view === 'map' && <MapView setView={navigateTo} />}
          {view === 'detail' && selectedReportId && (
            <ReportDetail id={selectedReportId} setView={navigateTo} />
          )}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#0f172a',
          color: '#fff',
          border: '1px solid #1e293b',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
        },
      }} />
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
