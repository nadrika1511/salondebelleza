import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/roles';

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', roles: ['all'] },
    { path: '/appointments', label: 'Citas', icon: '📅', roles: ['all'] },
    { path: '/orders', label: 'Comandas', icon: '🧾', roles: [ROLES.PROPIETARIO, ROLES.CAJA] },
    { path: '/clients', label: 'Clientes', icon: '👥', roles: [ROLES.PROPIETARIO] },
    { path: '/services', label: 'Servicios', icon: '✂️', roles: [ROLES.PROPIETARIO] },
    { path: '/products', label: 'Productos', icon: '🛍️', roles: [ROLES.PROPIETARIO] },
    { path: '/packages', label: 'Paquetes', icon: '🎁', roles: [ROLES.PROPIETARIO] },
  ];

  const hasAccess = (roles) => {
    if (roles.includes('all')) return true;
    return roles.includes(userData?.rol);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-pink-100">
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-primary-600 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                A
              </div>
              <div>
                <div className="text-xl font-black text-gray-800">AppSalon</div>
                <div className="text-xs text-gray-500">Belleza</div>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="relative w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary-100 transition-colors">
                🔔
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-400 to-red-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-lg">
                  3
                </div>
              </div>

              <div className="flex items-center gap-3 bg-primary-50 px-4 py-2 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  {userData?.nombre?.charAt(0) || 'A'}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">{userData?.nombre}</p>
                  <p className="text-xs text-gray-500 capitalize">{userData?.rol}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                🚪 Salir
              </button>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-2">
            {navItems.filter(item => hasAccess(item.roles)).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};
