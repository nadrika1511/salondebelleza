import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { 
  getAllPackages, 
  createPackage, 
  updatePackage, 
  deletePackage 
} from '../services/packageService';
import { getActiveServices } from '../services/serviceService';

export const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    serviceId: '',
    serviceName: '',
    quantity: '',
    price: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [packagesData, servicesData] = await Promise.all([
        getAllPackages(),
        getActiveServices()
      ]);
      
      setPackages(packagesData.filter(p => p.active));
      setServices(servicesData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        name: formData.name,
        serviceId: formData.serviceId,
        serviceName: formData.serviceName,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        description: formData.description
      };

      if (editingPackage) {
        await updatePackage(editingPackage.id, data);
      } else {
        await createPackage(data);
      }
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar paquete');
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      serviceId: pkg.serviceId,
      serviceName: pkg.serviceName,
      quantity: pkg.quantity,
      price: pkg.price,
      description: pkg.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (packageId) => {
    if (!window.confirm('¿Desactivar este paquete?')) return;
    
    try {
      await deletePackage(packageId);
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleServiceChange = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    setFormData({
      ...formData,
      serviceId: service.id,
      serviceName: service.name
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      serviceId: '',
      serviceName: '',
      quantity: '',
      price: '',
      description: ''
    });
    setEditingPackage(null);
  };

  const calculatePricePerService = (pkg) => {
    return (pkg.price / pkg.quantity).toFixed(2);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin text-6xl">⏳</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">🎁 Paquetes</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            ➕ Nuevo Paquete
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div key={pkg.id} className="card hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center text-4xl">
                  🎁
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(pkg)}
                    className="btn-secondary text-sm"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(pkg.id)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
              
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Servicio incluido:</p>
                  <p className="font-bold text-blue-700">{pkg.serviceName}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Cantidad</p>
                    <p className="text-2xl font-bold text-gray-800">{pkg.quantity}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Precio</p>
                    <p className="text-2xl font-bold text-green-600">Q{pkg.price}</p>
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-600 mb-1">Precio por servicio:</p>
                  <p className="text-lg font-bold text-purple-700">Q{calculatePricePerService(pkg)}</p>
                </div>

                {pkg.description && (
                  <p className="text-sm text-gray-600 italic">{pkg.description}</p>
                )}
              </div>
            </div>
          ))}

          {packages.length === 0 && (
            <div className="col-span-full card text-center py-16">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay paquetes</h3>
              <button 
                onClick={() => setShowModal(true)}
                className="btn-primary mt-4"
              >
                ➕ Crear Primer Paquete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">
                  {editingPackage ? '✏️ Editar Paquete' : '➕ Nuevo Paquete'}
                </h3>
                <button 
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Paquete *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="Ej: Paquete 10 Peinados"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Servicio Incluido *
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Seleccionar servicio...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="input-field"
                    placeholder="10"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio Total (Q) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="input-field"
                    placeholder="500.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              {formData.quantity && formData.price && (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700">
                    Precio por servicio: <span className="font-bold">Q{(parseFloat(formData.price) / parseInt(formData.quantity)).toFixed(2)}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field"
                  rows="3"
                  placeholder="Descripción opcional del paquete..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-primary flex-1"
                >
                  ✓ Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
