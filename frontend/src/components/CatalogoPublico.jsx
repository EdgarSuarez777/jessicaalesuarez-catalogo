import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function CatalogoPublico() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="catalogo-publico" data-testid="catalogo-publico">
      <div className="catalogo-hero">
        <div className="catalogo-hero-overlay"></div>
        <div className="catalogo-hero-content">
          <div className="catalogo-logo-container">
            <img 
              src="/logo-banner.png" 
              alt="jessicaalesuarez" 
              className="catalogo-hero-logo"
            />
          </div>
          <h1 className="catalogo-hero-title">Colección Exclusiva</h1>
          <p className="catalogo-hero-subtitle">Descubre nuestra selección de piezas únicas diseñadas con elegancia y estilo</p>
        </div>
      </div>

      <div className="catalogo-container">
        <div className="catalogo-search-wrapper">
          <div className="catalogo-search-box">
            <svg className="catalogo-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre o color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="catalogo-search-input-new"
              data-testid="catalogo-search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="catalogo-loading">
            <div className="catalogo-spinner"></div>
            <p>Cargando colección...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="catalogo-empty-state" data-testid="catalogo-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <h3>{searchQuery ? 'No se encontraron productos' : 'Próximamente nuevas colecciones'}</h3>
            <p>{searchQuery ? 'Intenta con otro término de búsqueda' : 'Estamos preparando increíbles piezas para ti'}</p>
          </div>
        ) : (
          <>
            <div className="catalogo-results-header">
              <h2 className="catalogo-section-title">Nuestra Colección</h2>
              <span className="catalogo-count">{filteredProducts.length} {filteredProducts.length === 1 ? 'pieza' : 'piezas'}</span>
            </div>
            
            <div className="catalogo-grid-new" data-testid="catalogo-grid">
              {filteredProducts.map(product => (
                <article key={product.id} className="catalogo-product-card" data-testid="catalogo-card">
                  <div className="catalogo-product-image">
                    {product.fotos && product.fotos.length > 0 ? (
                      <img 
                        src={product.fotos[0]} 
                        alt={product.nombre} 
                        className="catalogo-img"
                      />
                    ) : (
                      <div className="catalogo-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}
                    <div className="catalogo-product-overlay">
                      <span className="catalogo-view-text">Ver detalles</span>
                    </div>
                  </div>
                  
                  <div className="catalogo-product-details">
                    <h3 className="catalogo-product-name">{product.nombre}</h3>
                    
                    {product.colores && product.colores.length > 0 && (
                      <div className="catalogo-product-colors">
                        <span className="catalogo-colors-label">Colores disponibles:</span>
                        <div className="catalogo-color-list">
                          {product.colores.map((color, index) => (
                            <div key={index} className="catalogo-color-item">
                              <div 
                                className="catalogo-color-dot"
                                style={{ backgroundColor: color.hex }}
                                title={color.nombre}
                                data-testid="catalogo-color-circle"
                              />
                              <span className="catalogo-color-name">{color.nombre}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="catalogo-footer">
        <p className="catalogo-footer-text">© 2024 jessicaalesuarez - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
