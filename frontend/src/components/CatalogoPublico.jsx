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
      <div className="catalogo-banner">
        <img 
          src="/logo-banner.png" 
          alt="jessicaalesuarez" 
          className="catalogo-logo"
        />
      </div>

      <div className="catalogo-content">
        <div className="catalogo-search-section">
          <input
            type="text"
            placeholder="Buscar productos o colores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="catalogo-search-input"
            data-testid="catalogo-search-input"
          />
        </div>

        {loading ? (
          <div className="catalogo-loading">Cargando productos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="catalogo-empty" data-testid="catalogo-empty">
            {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
          </div>
        ) : (
          <div className="catalogo-grid" data-testid="catalogo-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="catalogo-card" data-testid="catalogo-card">
                <div className="catalogo-image-container">
                  {product.fotos && product.fotos.length > 0 ? (
                    <img 
                      src={product.fotos[0]} 
                      alt={product.nombre} 
                      className="catalogo-image"
                    />
                  ) : (
                    <div className="catalogo-image-placeholder">Sin imagen</div>
                  )}
                </div>
                
                <div className="catalogo-info">
                  <h3 className="catalogo-name">{product.nombre}</h3>
                  
                  {product.colores && product.colores.length > 0 && (
                    <div className="catalogo-colors">
                      {product.colores.map((color, index) => (
                        <div key={index} className="catalogo-color-wrapper">
                          <div 
                            className="catalogo-color-circle"
                            style={{ backgroundColor: color.hex }}
                            title={color.nombre}
                            data-testid="catalogo-color-circle"
                          />
                          <span className="catalogo-color-tooltip">{color.nombre}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
