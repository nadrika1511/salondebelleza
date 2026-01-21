import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  updateStock 
} from '../services/productService';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockQuantity, setStockQuantity] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    category: 'shampoo',
    price: '',
    cost: '',
    stock: '',
    minStock: '5',
    description: ''
  });

  const categories = [
    { value: 'shampoo', label: 'Shampoo', icon: '🧴' },
    { value: 'tinte', label: 'Tinte', icon: '🎨' },
    { value: 'tratamiento', label: 'Tratamiento', icon: '💆' },
    { value: 'herramienta', label: 'Herramienta', icon: '✂️' },
    { value: 'styling', label: 'Styling', icon: '💇' },
    { value: 'otro', label: 'Otro', icon: '📦' }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data.filter(p => p.active));
      setFilteredProducts(data.filter(p => p.active));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        description: formData.description
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }

      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar producto');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      description: product.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Desactivar este producto?')) return;

    try {
      await deleteProduct(productId);
      loadProducts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStockAdjustment = (product) => {
    setStockProduct(product);
    setStockQuantity(product.stock);
    setShowStockModal(true);
  };

  const handleUpdateStock = async () => {
    try {
      await updateStock(stockProduct.id, parseInt(stockQuantity));
      setShowStockModal(false);
      setStockProduct(null);
      setStockQuantity(0);
      loadProducts();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar stock');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'shampoo',
      price: '',
      cost: '',
      stock: '',
      minStock: '5',
      description: ''
    });
    setEditingProduct(null);
  };

  const getCategoryIcon = (category) => {
    return categories.find(c => c.value === category)?.icon || '📦';
  };

  const getCategoryLabel = (category) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) {
      return { color: 'bg-red-100 text-red-700 border-red-300', label: '❌ Sin stock' };
    } else if (product.stock <= product.minStock) {
      return { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: '⚠️ Stock bajo' };
    } else {
      return { color: 'bg-green-100 text-green-700 border-green-300', label: '✅ En stock' };
    }
  };

  const calculateProfit = (product) => {
    return ((product.price - product.cost) / product.cost * 100).toFixed(1);
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
            <h2 className="text-3xl font-bold text-gray-800">🛍️ Productos</h2>
            <p className="text-gray-600">{products.length} producto{products.length !== 1 ? 's' : ''} registrado{products.length !== 1 ? 's' : ''}</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            ➕ Nuevo Producto
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
              placeholder="Buscar productos..."
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          </div>

          {/* Categorías */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({products.length})
            </button>
            {categories.map(cat => {
              const count = products.filter(p => p.category === cat.value).length;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-sm text-gray-600 mb-1">Productos Totales</p>
            <p className="text-2xl font-bold text-gray-800">{products.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm text-gray-600 mb-1">En Stock</p>
            <p className="text-2xl font-bold text-gray-800">
              {products.filter(p => p.stock > p.minStock).length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="text-sm text-gray-600 mb-1">Stock Bajo</p>
            <p className="text-2xl font-bold text-gray-800">
              {products.filter(p => p.stock > 0 && p.stock <= p.minStock).length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-sm text-gray-600 mb-1">Sin Stock</p>
            <p className="text-2xl font-bold text-gray-800">
              {products.filter(p => p.stock === 0).length}
            </p>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const stockStatus = getStockStatus(product);
            const profit = calculateProfit(product);

            return (
              <div key={product.id} className="card hover:shadow-xl transition-shadow">
                {/* Header del producto */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-pink-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {getCategoryIcon(product.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                        {getCategoryLabel(product.category)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                {product.description && (
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                )}

                {/* Status de stock */}
                <div className={`px-3 py-2 rounded-lg border-2 ${stockStatus.color} mb-4 text-center font-semibold text-sm`}>
                  {stockStatus.label}: {product.stock} unidades
                </div>

                {/* Precios y margen */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Costo</p>
                    <p className="font-bold text-gray-800">Q{product.cost.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Precio</p>
                    <p className="font-bold text-green-600">Q{product.price.toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Margen</p>
                    <p className="font-bold text-blue-600">{profit}%</p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStockAdjustment(product)}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold"
                  >
                    📊 Stock
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="btn-secondary text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all text-sm font-semibold"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full card text-center py-16">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {searchTerm || selectedCategory !== 'all' ? 'No se encontraron productos' : 'No hay productos'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Intenta con otro filtro' 
                  : 'Comienza agregando tu primer producto'}
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <button 
                  onClick={() => setShowModal(true)}
                  className="btn-primary"
                >
                  ➕ Crear Primer Producto
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">
                  {editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    placeholder="Shampoo L'Oréal 500ml"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-field"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Actual *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Costo Unitario (Q) *
                  </label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    className="input-field"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio de Venta (Q) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="input-field"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                    className="input-field"
                    min="0"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input-field"
                    rows="3"
                    placeholder="Detalles adicionales del producto..."
                  />
                </div>
              </div>

              {/* Preview de margen */}
              {formData.cost && formData.price && (
                <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Margen de ganancia:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.cost)) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Ganancia: Q{(parseFloat(formData.price) - parseFloat(formData.cost)).toFixed(2)} por unidad
                  </p>
                </div>
              )}

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

      {/* Modal Ajustar Stock */}
      {showStockModal && stockProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">📊 Ajustar Stock</h3>
                <button 
                  onClick={() => { setShowStockModal(false); setStockProduct(null); }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Producto:</p>
                <p className="text-lg font-bold text-gray-800">{stockProduct.name}</p>
                <p className="text-sm text-gray-600 mt-2">Stock actual: <span className="font-bold">{stockProduct.stock}</span> unidades</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nuevo Stock
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="input-field"
                  min="0"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStockQuantity(Math.max(0, parseInt(stockQuantity) - 1))}
                  className="btn-secondary flex-1"
                >
                  - 1
                </button>
                <button
                  type="button"
                  onClick={() => setStockQuantity(Math.max(0, parseInt(stockQuantity) - 10))}
                  className="btn-secondary flex-1"
                >
                  - 10
                </button>
                <button
                  type="button"
                  onClick={() => setStockQuantity(parseInt(stockQuantity) + 10)}
                  className="btn-secondary flex-1"
                >
                  + 10
                </button>
                <button
                  type="button"
                  onClick={() => setStockQuantity(parseInt(stockQuantity) + 1)}
                  className="btn-secondary flex-1"
                >
                  + 1
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => { setShowStockModal(false); setStockProduct(null); }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleUpdateStock}
                  className="btn-primary flex-1"
                >
                  ✓ Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
