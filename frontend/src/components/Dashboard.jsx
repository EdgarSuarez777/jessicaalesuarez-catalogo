import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import ProductModal from './ProductModal';
import { parseColorName } from '../lib/colorDictionary';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product => {
      const nameMatch = product.nombre.toLowerCase().includes(query);
      const colorMatch = product.colores?.some(color => 
        color.nombre.toLowerCase().includes(query)
      );
      return nameMatch || colorMatch;
    });

    setFilteredProducts(filtered);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteDoc(doc(db, 'productos', productToDelete.id));
      toast.success('Producto eliminado');
      setShowDeleteModal(false);
      setProductToDelete(null);
      loadProducts();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
    loadProducts();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Sesión cerrada');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <div className="dashboard" data-testid="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="brand-name-header">jessicaalesuarez</h1>
          <div className="header-actions">
            <button 
              onClick={handleLogout} 
              className="logout-button"
              data-testid="logout-button"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="controls-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre o color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              data-testid="search-input"
            />
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="add-button"
            data-testid="add-product-button"
          >
            + Nuevo Producto
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Cargando...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state" data-testid="empty-state">
            {searchQuery ? 'No se encontraron productos' : 'No hay productos. Crea uno nuevo.'}
          </div>
        ) : (
          <div className="products-grid" data-testid="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card" data-testid="product-card">
                <div className="product-image-container">
                  {product.fotos && product.fotos.length > 0 ? (
                    <img 
                      src={product.fotos[0]} 
                      alt={product.nombre} 
                      className="product-image"
                    />
                  ) : (
                    <div className="product-image-placeholder">Sin imagen</div>
                  )}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.nombre}</h3>
                  
                  {product.colores && product.colores.length > 0 && (
                    <div className="color-circles">
                      {product.colores.map((color, index) => (
                        <div key={index} className="color-circle-wrapper">
                          <div 
                            className="color-circle"
                            style={{ backgroundColor: color.hex }}
                            title={color.nombre}
                            data-testid="color-circle"
                          />
                          <span className="color-tooltip">{color.nombre}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="product-actions">
                  <button 
                    onClick={() => handleEdit(product)} 
                    className="edit-button"
                    data-testid="edit-product-button"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(product)} 
                    className="delete-button"
                    data-testid="delete-product-button"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal 
          onClose={handleModalClose} 
          product={editingProduct}
        />
      )}

      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 className="delete-modal-title">¿Eliminar producto?</h3>
            <p className="delete-modal-text">
              ¿Estás segura de eliminar "<strong>{productToDelete?.nombre}</strong>"? Esta acción no se puede deshacer.
            </p>
            <div className="delete-modal-actions">
              <button onClick={cancelDelete} className="delete-cancel-btn">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="delete-confirm-btn">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
