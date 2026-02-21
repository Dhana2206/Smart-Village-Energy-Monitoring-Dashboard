import { useState, useEffect } from 'react'
import Landing from './components/Landing';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

type ViewState = 'landing' | 'login' | 'dashboard';

const App = () => {
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
  <div className="min-h-screen bg-[#F9FAFB] text-gray-800">

    {view === "landing" && (
      <Landing onStartLogin={handleStartLogin} />
    )}

    {view === "login" && (
      <div className="relative min-h-screen flex flex-col">

        <nav className="absolute top-0 w-full p-4">
          <button
            onClick={handleGoBack}
            className="group flex items-center gap-2"
          >
            Back to Home
          </button>
        </nav>

        <Login onLogin={handleLogin} />

      </div>
    )}

    {view === "dashboard" && user && (
      <Dashboard
        user={user}
        avatarSeed={avatarSeed}
        customAvatar={customAvatar}
        onLogout={handleLogout}
      />
    )}

  </div>
);
};

export default App;
