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
      <header className="catalogo-header">
        <div className="catalogo-header-content">
          <img 
            src="/logo-banner.png" 
            alt="jessicaalesuarez" 
            className="catalogo-header-logo"
          />
        </div>
      </header>

      <div className="catalogo-main">
        <div className="catalogo-search-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="catalogo-search"
            data-testid="catalogo-search-input"
          />
        </div>

        {loading ? (
          <div className="catalogo-loading">
            <div className="spinner"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="catalogo-empty" data-testid="catalogo-empty">
            <p>{searchQuery ? 'No se encontraron productos' : 'Sin productos disponibles'}</p>
          </div>
        ) : (
          <div className="catalogo-products" data-testid="catalogo-grid">
            {filteredProducts.map(product => (
              <article key={product.id} className="product-item" data-testid="catalogo-card">
                <div className="product-image-box">
                  {product.fotos && product.fotos.length > 0 ? (
                    <img 
                      src={product.fotos[0]} 
                      alt={product.nombre} 
                      className="product-img"
                    />
                  ) : (
                    <div className="product-no-image">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="product-content">
                  <h3 className="product-title">{product.nombre}</h3>
                  
                  {product.colores && product.colores.length > 0 && (
                    <div className="product-colors-box">
                      {product.colores.map((color, index) => (
                        <div key={index} className="color-tag">
                          <span 
                            className="color-dot"
                            style={{ backgroundColor: color.hex }}
                            data-testid="catalogo-color-circle"
                          />
                          <span className="color-text">{color.nombre}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
