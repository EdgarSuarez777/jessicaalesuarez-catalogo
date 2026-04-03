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

  const scrollToCatalog = () => {
    document.getElementById('catalogo-productos').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="catalogo-premium" data-testid="catalogo-publico">
      <nav className="catalogo-nav">
        <div className="nav-content">
          <img 
            src="/logo-banner.png" 
            alt="jessicaalesuarez" 
            className="nav-logo"
          />
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-overlay-dark"></div>
        <div className="hero-text">
          <h1 className="hero-title">JESSICAALESUAREZ</h1>
          <p className="hero-subtitle">Descubre nuestra colección exclusiva</p>
          <button onClick={scrollToCatalog} className="btn-explorar">
            EXPLORAR COLECCIÓN
          </button>
        </div>
      </section>

      <section id="catalogo-productos" className="catalogo-section">
        <div className="catalogo-wrap">
          <div className="search-box-premium">
            <svg className="icon-search" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-search-premium"
              data-testid="catalogo-search-input"
            />
          </div>

          {loading ? (
            <div className="state-loading">
              <div className="loader-premium"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="state-empty" data-testid="catalogo-empty">
              <p>{searchQuery ? 'No se encontraron productos' : 'Próximamente'}</p>
            </div>
          ) : (
            <div className="products-grid-premium" data-testid="catalogo-grid">
              {filteredProducts.map(product => (
                <article key={product.id} className="card-premium" data-testid="catalogo-card">
                  <div className="card-image-box">
                    {product.fotos && product.fotos.length > 0 ? (
                      <img 
                        src={product.fotos[0]} 
                        alt={product.nombre} 
                        className="card-image"
                      />
                    ) : (
                      <div className="card-placeholder">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-body">
                    <h3 className="card-name">{product.nombre}</h3>
                    
                    {product.colores && product.colores.length > 0 && (
                      <div className="colors-container">
                        {product.colores.map((color, index) => (
                          <div key={index} className="color-pill">
                            <span 
                              className="pill-dot"
                              style={{ backgroundColor: color.hex }}
                              data-testid="catalogo-color-circle"
                            />
                            <span className="pill-label">{color.nombre}</span>
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
      </section>

      <footer className="footer-premium">
        <p>© 2024 jessicaalesuarez</p>
      </footer>
    </div>
  );
}
