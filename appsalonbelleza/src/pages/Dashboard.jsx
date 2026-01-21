import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { ROLES } from '../utils/roles';

export const Dashboard = () => {
  const { userData } = useAuth();

  const modules = [
    { 
      to: '/appointments', 
      title: 'Citas', 
      icon: '📅',
      description: 'Gestionar citas y agenda',
      bgColor: 'from-blue-400 to-blue-600',
      roles: ['all']
    },
    { 
      to: '/orders', 
      title: 'Comandas', 
      icon: '🧾',
      description: 'Órdenes y cobros',
      bgColor: 'from-pink-400 to-pink-600',
      roles: [ROLES.PROPIETARIO, ROLES.CAJA]
    },
    { 
      to: '/clients', 
      title: 'Clientes', 
      icon: '👥',
      description: 'Base de datos de clientes',
      bgColor: 'from-orange-400 to-orange-600',
      roles: [ROLES.PROPIETARIO]
    },
    { 
      to: '/services', 
      title: 'Servicios', 
      icon: '✂️',
      description: 'Catálogo de servicios',
      bgColor: 'from-teal-400 to-teal-600',
      roles: [ROLES.PROPIETARIO]
    },
    { 
      to: '/products', 
      title: 'Productos', 
      icon: '🛍️',
      description: 'Inventario de productos',
      bgColor: 'from-purple-400 to-purple-600',
      roles: [ROLES.PROPIETARIO]
    }
  ];

  const hasAccess = (moduleRoles) => {
    if (moduleRoles.includes('all')) return true;
    return moduleRoles.includes(userData?.rol);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header mejorado */}
        <div className="bg-gradient-to-r from-primary-500 to-pink-500 rounded-3xl p-8 text-white shadow-xl">
          <h1 className="text-4xl font-black mb-2">
            ¡Hola, {userData?.nombre}! 👋
          </h1>
          <p className="text-xl opacity-90">
            Bienvenido a AppSalonBelleza - Rol: <span className="font-bold capitalize">{userData?.rol}</span>
          </p>
        </div>

        {/* Módulos en grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Módulos Disponibles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.filter(m => hasAccess(m.roles)).map((module) => (
              <Link
                key={module.to}
                to={module.to}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
                  {/* Icono con gradiente */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${module.bgColor} rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    {module.icon}
                  </div>
                  
                  {/* Título y descripción */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {module.description}
                  </p>
                  
                  {/* Flecha */}
                  <div className="mt-4 flex items-center text-primary-600 font-semibold text-sm group-hover:gap-2 transition-all">
                    Acceder
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats rápidos (opcional) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 mb-1">Ingresos Hoy</p>
            <p className="text-2xl font-bold text-gray-800">Q 0.00</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-sm text-gray-600 mb-1">Citas Hoy</p>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm text-gray-600 mb-1">Clientes Totales</p>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
          
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
            <div className="text-3xl mb-2">✂️</div>
            <p className="text-sm text-gray-600 mb-1">Servicios</p>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
