import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

type ViewState = 'landing' | 'login' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [user, setUser] = useState<string | null>(null);
  const [avatarSeed, setAvatarSeed] = useState<string>('admin');
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  // Persistence check (Mock session)
  useEffect(() => {
    const savedUser = localStorage.getItem('village_admin_user');
    const savedSeed = localStorage.getItem('village_admin_seed');
    const savedAvatar = localStorage.getItem('village_admin_custom_avatar');
    if (savedUser) {
      setUser(savedUser);
      setAvatarSeed(savedSeed || savedUser);
      setCustomAvatar(savedAvatar);
      setView('dashboard');
    }
  }, []);

  const handleStartLogin = () => {
    setView('login');
  };

  const handleLogin = (username: string) => {
    setUser(username);
    setAvatarSeed(username);
    setCustomAvatar(null);
    setView('dashboard');
    localStorage.setItem('village_admin_user', username);
    localStorage.setItem('village_admin_seed', username);
    localStorage.removeItem('village_admin_custom_avatar');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    localStorage.removeItem('village_admin_user');
    localStorage.removeItem('village_admin_seed');
    localStorage.removeItem('village_admin_custom_avatar');
  };

  const handleUpdateProfile = (newName: string, newSeed: string, newAvatar: string | null) => {
    setUser(newName);
    setAvatarSeed(newSeed);
    setCustomAvatar(newAvatar);
    localStorage.setItem('village_admin_user', newName);
    localStorage.setItem('village_admin_seed', newSeed);
    if (newAvatar) {
      localStorage.setItem('village_admin_custom_avatar', newAvatar);
    } else {
      localStorage.removeItem('village_admin_custom_avatar');
    }
  };

  const handleGoBack = () => {
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 selection:bg-blue-100 selection:text-blue-700">
      {view === 'landing' && (
        <Landing onStartLogin={handleStartLogin} />
      )}
      
      {view === 'login' && (
        <div className="relative min-h-screen flex flex-col overflow-hidden">
          <nav className="absolute top-0 w-full p-8 flex items-center z-50">
            <button 
              onClick={handleGoBack}
              className="group flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-all px-5 py-2.5 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </nav>
          
          <Login onLogin={handleLogin} />
          
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-emerald-100 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
        </div>
      )}
      
      {view === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          avatarSeed={avatarSeed} 
          customAvatar={customAvatar}
          onLogout={handleLogout} 
          onUpdateProfile={handleUpdateProfile} 
        />
      )}
    </div>
  );
};

export default App;
