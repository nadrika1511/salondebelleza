import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { getAllClients, createClient } from '../services/clientService';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await getAllClients();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredClients(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingClient) {
        await updateDoc(doc(db, 'clients', editingClient.id), formData);
      } else {
        await createClient(formData);
      }

      setShowModal(false);
      resetForm();
      loadClients();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar cliente');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      notes: client.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;

    try {
      await deleteDoc(doc(db, 'clients', clientId));
      loadClients();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar cliente');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', notes: '' });
    setEditingClient(null);
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
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">👥 Clientes</h2>
            <p className="text-gray-600">{clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            ➕ Nuevo Cliente
          </button>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
              placeholder="Buscar por nombre, teléfono o email..."
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="grid gap-4">
          {filteredClients.map(client => (
            <div key={client.id} className="card hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{client.name}</h3>
                    
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      {client.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📱</span>
                          <span>{client.phone}</span>
                        </div>
                      )}
                      
                      {client.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📧</span>
                          <span>{client.email}</span>
                        </div>
                      )}
                    </div>

                    {client.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Notas:</span> {client.notes}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 mt-3">
                      <div className="bg-blue-50 px-3 py-1 rounded-lg">
                        <span className="text-xs text-blue-600 font-semibold">
                          {client.stats?.totalVisits || 0} visita{(client.stats?.totalVisits || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="bg-green-50 px-3 py-1 rounded-lg">
                        <span className="text-xs text-green-600 font-semibold">
                          Q {(client.stats?.totalSpent || 0).toFixed(2)} gastado
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={() => handleEdit(client)}
                    className="btn-secondary text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(client.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredClients.length === 0 && (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {searchTerm ? 'No se encontraron clientes' : 'No hay clientes'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza agregando tu primer cliente'}
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => setShowModal(true)}
                  className="btn-primary"
                >
                  ➕ Crear Primer Cliente
                </button>
              )}
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
                  {editingClient ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}
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
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field"
                  placeholder="+502 1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field"
                  placeholder="cliente@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input-field"
                  rows="3"
                  placeholder="Observaciones, preferencias, alergias..."
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
