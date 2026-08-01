import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Users', path: '/admin/users', icon: 'group' },
    { name: 'Places', path: '/admin/places', icon: 'location_on' },
    { name: 'Community', path: '/admin/community', icon: 'chat_bubble' },
  ];

  return (
    <div className="flex min-h-screen bg-[#111318] text-white font-['Plus_Jakarta_Sans']">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0B0D12] border-r border-slate-800 flex flex-col justify-between py-6">
        <div>
          {/* Logo Section */}
          <div className="px-6 flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white">handshake</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Admin Portal</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Fluid Concierge System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 px-4">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#1C2333] text-sky-400' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="px-4">
          <button className="w-full bg-[#00B4D8] hover:bg-sky-400 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 mb-6 shadow-lg shadow-sky-500/20 transition-all active:scale-95">
            <span className="material-symbols-outlined">add</span>
            New Entry
          </button>
          
          <div className="flex items-center gap-3 px-2">
            <img 
              src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name || 'Alex Sterling'}</p>
              <p className="text-xs text-slate-400 truncate">Global Moderator</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
