import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { getAllServices, createService, updateService, deleteService } from '../services/serviceService';

export const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    commissionRate: '30'
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await getAllServices();
      setServices(data.filter(s => s.active));
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
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        commissionRate: parseFloat(formData.commissionRate)
      };

      if (editingService) {
        await updateService(editingService.id, data);
      } else {
        await createService(data);
      }
      
      setShowModal(false);
      resetForm();
      loadServices();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar servicio');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      duration: service.duration,
      commissionRate: service.commissionRate
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('¿Desactivar este servicio?')) return;
    
    try {
      await deleteService(serviceId);
      loadServices();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', duration: '', commissionRate: '30' });
    setEditingService(null);
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
          <h2 className="text-3xl font-bold text-gray-800">✂️ Servicios</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            ➕ Nuevo Servicio
          </button>
        </div>

        <div className="grid gap-4">
          {services.map(service => (
            <div key={service.id} className="card hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Precio:</span>
                      <p className="font-semibold text-green-600">Q {service.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Duración:</span>
                      <p className="font-semibold">{service.duration} min</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Comisión:</span>
                      <p className="font-semibold text-primary-600">{service.commissionRate}%</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(service)}
                    className="btn-secondary text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">✂️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay servicios</h3>
              <button 
                onClick={() => setShowModal(true)}
                className="btn-primary mt-4"
              >
                ➕ Crear Primer Servicio
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
                  {editingService ? '✏️ Editar Servicio' : '➕ Nuevo Servicio'}
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
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="Ej: Corte Dama"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio (Q) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="input-field"
                    placeholder="150.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duración (min) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="input-field"
                    placeholder="60"
                    min="5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comisión Estilista (%)
                </label>
                <input
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({...formData, commissionRate: e.target.value})}
                  className="input-field"
                  placeholder="30"
                  min="0"
                  max="100"
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
