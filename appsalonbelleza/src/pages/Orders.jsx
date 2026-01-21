import { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { 
  getOrdersByDate, 
  searchOrdersByClient, 
  getOrderById,
  updateOrder, 
  closeOrder,
  reopenOrder
} from '../services/orderService';
import { getTodayDate, getYesterdayDate } from '../services/appointmentService';
import { getAllStylists } from '../services/userService';
import { getActiveServices } from '../services/serviceService';
import { getActiveProducts } from '../services/productService';
import { getActivePackages } from '../services/packageService';
import { getClientPackages, createClientPackage, usePackageService } from '../services/packageService';

export const Orders = () => {
  const { userData } = useAuth();
  const [view, setView] = useState('today');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editedOrder, setEditedOrder] = useState(null);
  
  const [productToAdd, setProductToAdd] = useState({
    productId: '',
    stylistId: '',
    quantity: 1
  });

  const [packageToAdd, setPackageToAdd] = useState({
    packageId: '',
    stylistId: '',
    quantity: 1
  });

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [view]);

  useEffect(() => {
    if (view === 'history' && searchTerm.length > 0) {
      searchOrders();
    }
  }, [searchTerm, view]);

  const loadMasterData = async () => {
    try {
      const [stylistsData, servicesData, productsData, packagesData] = await Promise.all([
        getAllStylists(),
        getActiveServices(),
        getActiveProducts(),
        getActivePackages()
      ]);
      
      setStylists(stylistsData);
      setServices(servicesData);
      setProducts(productsData);
      setPackages(packagesData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadOrders = async () => {
    console.log("🔍 loadOrders ejecutándose, view:", view);
    try {
      setLoading(true);
      let data = [];
      
      if (view === 'today') {
        const todayDate = getTodayDate();
        console.log("📅 Buscando órdenes para fecha:", todayDate);
        data = await getOrdersByDate(getTodayDate());
      } else if (view === 'yesterday') {
        const todayDate = getTodayDate();
        console.log("📅 Buscando órdenes para fecha:", todayDate);
        data = await getOrdersByDate(getYesterdayDate());
      }
      
      console.log("📦 Datos cargados:", data);
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchOrders = async () => {
    try {
      setLoading(true);
      const data = await searchOrdersByClient(searchTerm);
      console.log("📦 Datos cargados:", data);
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrder = async (order) => {
    if (order.status === 'closed' && userData.rol !== 'propietario') {
      alert('Solo el propietario puede editar comandas cerradas');
      return;
    }

    if (!order.services || order.services.length === 0) {
      const initialServices = services.map(service => ({
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        stylistId: null,
        stylistName: null,
        selected: false
      }));
      order.services = initialServices;
    }

    if (!order.products) {
      order.products = [];
    }

    if (!order.tips) {
    if (!order.packagesSold) {
      order.packagesSold = [];
    }
      order.tips = {};
    }

    setEditedOrder({ ...order });
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleSelectStylist = (serviceIndex, stylistId) => {
    const stylist = stylists.find(s => s.id === stylistId);
    
    setEditedOrder(prev => {
      const newServices = [...prev.services];
      newServices[serviceIndex] = {
        ...newServices[serviceIndex],
        stylistId: stylist.id,
        stylistName: stylist.nombre
      };
      return { ...prev, services: newServices };
    });
  };

  const handleToggleService = (serviceIndex) => {
    setEditedOrder(prev => {
      const newServices = [...prev.services];
      const service = newServices[serviceIndex];
      
      if (!service.stylistId) {
        alert('Primero selecciona un estilista');
        return prev;
      }
      
      newServices[serviceIndex] = {
        ...service,
        selected: !service.selected
      };
      
      return { ...prev, services: newServices };
    });
  };

  const handleAddProduct = () => {
    if (!productToAdd.productId) {
      alert('Selecciona un producto');
      return;
    }

    const product = products.find(p => p.id === productToAdd.productId);
    const quantity = parseInt(productToAdd.quantity) || 1;

    const newProduct = {
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.price,
      subtotal: product.price * quantity
    };

    setEditedOrder(prev => ({
      ...prev,
      products: [...(prev.products || []), newProduct]
    }));

    setProductToAdd({ productId: '', quantity: 1 });
  };

  const handleRemoveProduct = (index) => {
    setEditedOrder(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };


  const handleAddPackage = () => {
    if (!packageToAdd.packageId) {
      alert('Selecciona un paquete');
      return;
    }

    const pkg = packages.find(p => p.id === packageToAdd.packageId);
    const quantity = parseInt(packageToAdd.quantity) || 1;

    const newPackage = {
      packageId: pkg.id,
      packageName: pkg.name,
      serviceId: pkg.serviceId,
      serviceName: pkg.serviceName,
      quantity: pkg.quantity * quantity,
      price: pkg.price,
      subtotal: pkg.price * quantity,
      quantityPurchased: quantity
    };

    setEditedOrder(prev => ({
      ...prev,
      packagesSold: [...(prev.packagesSold || []), newPackage]
    }));

    setPackageToAdd({ packageId: '', quantity: 1 });
  };

  const handleRemovePackage = (index) => {
    setEditedOrder(prev => ({
      ...prev,
      packagesSold: prev.packagesSold.filter((_, i) => i !== index)
    }));
  };
  const handleTipChange = (stylistId, amount) => {
    setEditedOrder(prev => {
      const stylist = stylists.find(s => s.id === stylistId);
      return {
        ...prev,
        tips: {
          ...prev.tips,
          [stylistId]: {
            stylistName: stylist.nombre,
            amount: parseInt(amount) || 0
          }
        }
      };
    });
  };

  const calculateTotals = () => {
    if (!editedOrder) return { subtotalServices: 0, subtotalProducts: 0, subtotal: 0, totalTips: 0, total: 0 };

    const subtotalServices = (editedOrder.services || [])
      .filter(s => s.selected)
      .reduce((sum, s) => sum + s.price, 0);

    const subtotalProducts = (editedOrder.products || [])
      .reduce((sum, p) => sum + p.subtotal, 0);

    const subtotal = subtotalServices + subtotalProducts;

    const totalTips = Object.values(editedOrder.tips || {})
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const total = subtotal + totalTips;

    return { subtotalServices, subtotalProducts, subtotal, totalTips, total };
  };

  const handleSaveOrder = async () => {
    try {
      const totals = calculateTotals();
      
      await updateOrder(editedOrder.id, {
        services: editedOrder.services,
        products: editedOrder.products,
        tips: editedOrder.tips,
        ...totals
      });

      alert('✓ Comanda guardada');
      setShowModal(false);
      setSelectedOrder(null);
      setEditedOrder(null);
      loadOrders();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar comanda');
    }
  };

  const canPayWithPackage = () => {
    if (!editedOrder) return false;
    const hasPackagesSold = (editedOrder.packagesSold || []).length > 0;
    const hasServices = (editedOrder.services || []).some(s => s.selected);
    const hasProducts = (editedOrder.products || []).length > 0;
    return hasPackagesSold && !hasServices && !hasProducts;
  };


  const handleCloseOrder = () => {
    const totals = calculateTotals();
    if (totals.total === 0) {
      alert('La comanda está vacía');
      return;
    }
    setShowCloseModal(true);
  };

  const handleConfirmClose = async (paymentMethod) => {
    try {
      const totals = calculateTotals();
      
      await updateOrder(editedOrder.id, {
        services: editedOrder.services,
        products: editedOrder.products,
        tips: editedOrder.tips,
        ...totals
      });

      await closeOrder(editedOrder.id, paymentMethod, userData.id);

      alert('✓ Comanda cerrada');
      setShowCloseModal(false);
      setShowModal(false);
      setSelectedOrder(null);
      setEditedOrder(null);
      loadOrders();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cerrar comanda');
    }
  };

  const handleReopenOrder = async () => {
    if (userData.rol !== 'propietario') {
      alert('Solo el propietario puede reabrir comandas');
      return;
    }

    try {
      await reopenOrder(editedOrder.id);
      alert('✓ Comanda reabierta');
      
      const updatedOrder = await getOrderById(editedOrder.id);
      setEditedOrder(updatedOrder);
      setSelectedOrder(updatedOrder);
      loadOrders();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al reabrir comanda');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'closed') {
      return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">✓ Cerrada</span>;
    }
    return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">📝 Abierta</span>;
  };

  const getSelectedStylists = () => {
    if (!editedOrder) return [];
    
    const stylistIds = new Set();
    (editedOrder.services || [])
      .filter(s => s.selected && s.stylistId)
      .forEach(s => stylistIds.add(s.stylistId));
    
    return Array.from(stylistIds).map(id => 
      stylists.find(s => s.id === id)
    ).filter(Boolean);
  };

  console.log("🔍 editedOrder.packagesSold:", editedOrder?.packagesSold);
  const totals = calculateTotals();

  if (loading && view !== 'history') {
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-gray-800">🧾 Comandas</h2>
          
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm p-1">
            <button 
              onClick={() => setView('today')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                view === 'today' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📅 Hoy
            </button>
            <button 
              onClick={() => setView('yesterday')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                view === 'yesterday' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⏮️ Ayer
            </button>
            <button 
              onClick={() => setView('history')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                view === 'history' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📚 Histórico
            </button>
          </div>
        </div>

        {view === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
                placeholder="Buscar por nombre de cliente..."
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {orders.map(order => (
            <div 
              key={order.id} 
              className="card hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleOpenOrder(order)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-black text-lg">#{order.orderNumber}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{order.clientName}</h3>
                      <p className="text-sm text-gray-600">{order.date} • {order.clientPhone}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded-xl text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Servicios</p>
                      <p className="font-bold text-gray-800">
                        {(order.services || []).filter(s => s.selected).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Subtotal</p>
                      <p className="font-bold text-gray-800">Q{order.subtotal || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Propinas</p>
                      <p className="font-bold text-green-600">Q{order.totalTips || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-bold text-primary-600">Q{order.total || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">🧾</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {view === 'history' && !searchTerm 
                  ? 'Escribe para buscar comandas' 
                  : 'No hay comandas'}
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {showModal && editedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
            <div className="bg-gradient-to-r from-primary-500 to-pink-500 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-3xl font-black mb-2">Comanda #{editedOrder.orderNumber}</h3>
                  <p className="text-lg">{editedOrder.clientName}</p>
                  <p className="text-sm opacity-90">{editedOrder.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(editedOrder.status)}
                  <button 
                    onClick={() => { setShowModal(false); setSelectedOrder(null); setEditedOrder(null); }}
                    className="text-white hover:bg-white/20 w-10 h-10 rounded-lg transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-white border-2 border-primary-300 rounded-xl overflow-hidden mb-6">
                <div className="bg-primary-100 grid grid-cols-12 gap-2 p-3 font-bold text-sm border-b-2 border-primary-300">
                  <div className="col-span-3 text-primary-800">ESTILISTA</div>
                  <div className="col-span-6 text-primary-800">SERVICIO</div>
                  <div className="col-span-2 text-right text-primary-800">PRECIO</div>
                  <div className="col-span-1 text-center text-primary-800">✓</div>
                </div>

                <div className="divide-y divide-gray-200">
                  {(editedOrder.services || []).map((service, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50 transition-colors">
                      <div className="col-span-3">
                        <div className="flex flex-wrap gap-1">
                          {stylists.map(stylist => (
                            <button
                              key={stylist.id}
                              onClick={() => handleSelectStylist(index, stylist.id)}
                              disabled={editedOrder.status === 'closed'}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                service.stylistId === stylist.id
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              } ${editedOrder.status === 'closed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {stylist.nombre.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="col-span-6 flex items-center">
                        <span className="font-semibold text-gray-800">{service.serviceName}</span>
                      </div>

                      <div className="col-span-2 flex items-center justify-end">
                        <span className="font-bold text-gray-800">Q{service.price}</span>
                      </div>

                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          onClick={() => handleToggleService(index)}
                          disabled={editedOrder.status === 'closed'}
                          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                            service.selected
                              ? 'bg-green-500 border-green-600 text-white'
                              : 'bg-white border-gray-300 hover:border-green-400'
                          } ${editedOrder.status === 'closed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {service.selected && '✓'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3">🛍️ Productos Físicos</h4>
                
                {editedOrder.status === 'open' && (
                  <div className="grid grid-cols-12 gap-3 mb-4">
                    <div className="col-span-6">
                      <select
                        value={productToAdd.productId}
                        onChange={(e) => setProductToAdd({...productToAdd, productId: e.target.value})}
                        className="input-field"
                      >
                        <option value="">Seleccionar producto...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - Q{p.price}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={productToAdd.quantity}
                        onChange={(e) => setProductToAdd({...productToAdd, quantity: e.target.value})}
                        className="input-field"
                        min="1"
                        placeholder="Cantidad"
                      />
                    </div>
                    <div className="col-span-3">
                      <button onClick={handleAddProduct} className="btn-primary w-full">
                        ➕ Agregar
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {(editedOrder.products || []).map((product, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{product.productName}</p>
                        <p className="text-sm text-gray-600">Cantidad: {product.quantity} × Q{product.price}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800">Q{product.subtotal}</span>
                        {editedOrder.status === 'open' && (
                          <button
                            onClick={() => handleRemoveProduct(index)}
                            className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(editedOrder.products || []).length === 0 && (
                    <p className="text-center text-gray-400 py-4">No hay productos agregados</p>
                  )}
                </div>
              </div>

              {/* Sección de Paquetes */}
              <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4 mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3">🎁 Venta de Paquetes</h4>
                
                {editedOrder.status === 'open' && (
                  <div className="grid grid-cols-12 gap-3 mb-4">
                    <div className="col-span-6">
                      <select
                        value={packageToAdd.packageId}
                        onChange={(e) => setPackageToAdd({...packageToAdd, packageId: e.target.value})}
                        className="input-field"
                      >
                        <option value="">Seleccionar paquete...</option>
                        {packages.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.quantity} {p.serviceName}) - Q{p.price}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={packageToAdd.quantity}
                        onChange={(e) => setPackageToAdd({...packageToAdd, quantity: e.target.value})}
                        className="input-field"
                        min="1"
                        placeholder="Cantidad"
                      />
                    </div>
                    <div className="col-span-3">
                      <button onClick={handleAddPackage} className="btn-primary w-full">
                        ➕ Agregar
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {(editedOrder.packagesSold || []).map((pkg, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{pkg.packageName}</p>
                        <p className="text-sm text-gray-600">{pkg.quantity} {pkg.serviceName} (x{pkg.quantityPurchased} paquete{pkg.quantityPurchased > 1 ? 's' : ''})</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800">Q{pkg.subtotal}</span>
                        {editedOrder.status === 'open' && (
                          <button
                            onClick={() => handleRemovePackage(index)}
                            className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(editedOrder.packagesSold || []).length === 0 && (
                    <p className="text-center text-gray-400 py-4">No se han vendido paquetes</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <h4 className="text-lg font-bold text-gray-800 mb-3">💰 Propinas por Estilista</h4>
                  
                  {getSelectedStylists().length === 0 ? (
                    <p className="text-center text-gray-400 py-4">
                      Selecciona servicios para agregar propinas
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {getSelectedStylists().map(stylist => (
                        <div key={stylist.id} className="bg-white p-3 rounded-lg">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Propina {stylist.nombre}
                          </label>
                          <input
                            type="number"
                            value={editedOrder.tips?.[stylist.id]?.amount || 0}
                            onChange={(e) => handleTipChange(stylist.id, e.target.value)}
                            disabled={editedOrder.status === 'closed'}
                            className="input-field"
                            min="0"
                            step="1"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-pink-50 border-2 border-primary-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">📊 Resumen</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Servicios:</span>
                      <span className="font-bold">Q{totals.subtotalServices}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-700">
                      <span>Productos:</span>
                      <span className="font-bold">Q{totals.subtotalProducts}</span>
                    </div>
                    
                    <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-lg">
                      <span className="font-bold">SUBTOTAL:</span>
                      <span className="font-black text-gray-800">Q{totals.subtotal}</span>
                    </div>
                    
                    <div className="flex justify-between text-green-600">
                      <span className="font-semibold">Propinas:</span>
                      <span className="font-bold">Q{totals.totalTips}</span>
                    </div>
                    
                    <div className="bg-primary-500 text-white p-4 rounded-xl flex justify-between text-2xl">
                      <span className="font-bold">TOTAL:</span>
                      <span className="font-black">Q{totals.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowModal(false); setSelectedOrder(null); setEditedOrder(null); }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                
                {editedOrder.status === 'open' ? (
                  <>
                    <button 
                      onClick={handleSaveOrder}
                      className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all flex-1"
                    >
                      💾 Guardar
                    </button>
                    <button 
                      onClick={handleCloseOrder}
                      className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-all flex-1"
                    >
                      ✓ Cerrar Comanda
                    </button>
                  </>
                ) : (
                  userData.rol === 'propietario' && (
                    <button 
                      onClick={handleReopenOrder}
                      className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all flex-1"
                    >
                      🔓 Reabrir Comanda
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CIERRE */}
      {showCloseModal && editedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-800">💳 Cerrar Comanda</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl text-center">
                <p className="text-lg mb-2">Total a Cobrar:</p>
                <p className="text-5xl font-black">Q{totals.total}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-3">Detalle:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Servicios ({(editedOrder.services || []).filter(s => s.selected).length}):</span>
                    <span className="font-bold">Q{totals.subtotalServices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Productos ({(editedOrder.products || []).length}):</span>
                    <span className="font-bold">Q{totals.subtotalProducts}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Propinas:</span>
                    <span className="font-bold">Q{totals.totalTips}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-3">Forma de Pago:</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleConfirmClose('efectivo')}
                    className="bg-green-100 hover:bg-green-200 border-2 border-green-400 text-green-800 p-4 rounded-xl font-bold transition-all"
                  >
                    💵 Efectivo
                  </button>
                  <button
                    onClick={() => handleConfirmClose('visa')}
                    className="bg-blue-100 hover:bg-blue-200 border-2 border-blue-400 text-blue-800 p-4 rounded-xl font-bold transition-all"
                  >
                    💳 VISA
                  </button>
                  <button
                    onClick={() => handleConfirmClose('cheque')}
                    className="bg-yellow-100 hover:bg-yellow-200 border-2 border-yellow-400 text-yellow-800 p-4 rounded-xl font-bold transition-all"
                  >
                    📝 Cheque
                  </button>
                  <button
                    onClick={() => handleConfirmClose('credito')}
                    className="bg-purple-100 hover:bg-purple-200 border-2 border-purple-400 text-purple-800 p-4 rounded-xl font-bold transition-all"
                  >
                    🏦 Crédito
                  </button>
                  <button
                    onClick={() => handleConfirmClose('paquete')}
                    className="bg-pink-100 hover:bg-pink-200 border-2 border-pink-400 text-pink-800 p-4 rounded-xl font-bold transition-all"
                  >
                    🎁 Paquete
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowCloseModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
