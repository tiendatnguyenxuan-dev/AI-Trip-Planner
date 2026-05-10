import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BellNotification } from './BellNotification';

export default function UserLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-background text-on-surface flex min-h-screen font-body">
      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* TopNavBar */}
        <header className="sticky top-0 w-full z-50 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-8 flex justify-between items-center border-b border-outline-variant/5">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>fluid</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-headline hidden md:block">TripPlanner</span>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full border border-outline-variant/10">
            <NavLink 
              to="/" 
              className={({ isActive }) => `px-6 py-1.5 rounded-full text-sm font-medium transition-all ${isActive ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
              Explore
            </NavLink>
            <NavLink 
              to="/my-trips" 
              className={({ isActive }) => `px-6 py-1.5 rounded-full text-sm font-medium transition-all ${isActive ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
            >
              My Trips
            </NavLink>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <BellNotification />
              <button className="p-2 text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-lg transition-all">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-outline-variant/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{user?.role || 'Guest'}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
                title="Logout"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-x-hidden relative">
          <Outlet />
        </div>
      </main>

      {/* Mobile Navigation Shell */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl flex justify-around items-center h-20 px-4 border-t border-slate-100 dark:border-slate-800 z-50">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>explore</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">Explore</span>
            </>
          )}
        </NavLink>
        <NavLink to="/my-trips" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>dashboard</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">My Trips</span>
            </>
          )}
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>person</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
