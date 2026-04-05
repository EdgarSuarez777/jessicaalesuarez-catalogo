import React, { useState, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ThemeToggle } from './ThemeToggle';
import { getColorValue } from '../lib/colorDictionary';

const Catalogo = () => {
  const { products, loading, searchProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

 useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(searchProducts(searchTerm));

      // ESTA LÍNEA HACE EL SALTO:
      const section = document.getElementById('seccion-productos');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products, searchProducts]);

  const handleWhatsApp = () => {
    window.open('https://wa.me/527297441082', '_blank');
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    if (selectedProduct && selectedProduct.imagenes) {
      setCurrentImageIndex((prev) => 
        prev === selectedProduct.imagenes.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct && selectedProduct.imagenes) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProduct.imagenes.length - 1 : prev - 1
      );
    }
  };

  // Get image URL - supports both base64 and URL formats
  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.url) return image.url;
    if (image.data) return image.data;
    if (typeof image === 'string') return image;
    return null;
  };

  const renderColorBadge = (color) => {
    let colorName = typeof color === 'string' ? color : (color?.nombre || color?.name || '');
    // Limpiar nombres como "Azul 500", "Rojo 900" etc - quitar números al final
    colorName = colorName.replace(/\s*\d+$/, '').trim();
    
    const colorHex = typeof color === 'string' ? getColorValue(colorName) : (color?.hex || color?.color || getColorValue(colorName));
    
    if (!colorName) return null;
    
    return (
      <span
        key={colorName}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200"
      >
        {colorHex && (
          <span
            className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-500 shadow-sm flex-shrink-0"
            style={{ background: colorHex }}
          />
        )}
        <span className="truncate max-w-[80px]">{colorName}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE6DB] to-[#E5DED3] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a]">
      {/* Fixed Header with Search and Theme Toggle */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Logo */}
            <h1 
              className="text-lg sm:text-xl md:text-2xl font-light tracking-wider text-gray-800 dark:text-white flex-shrink-0"
              style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
            >
              <span className="hidden sm:inline">jessicaalesuarez</span>
              <span className="sm:hidden">jessica</span>
            </h1>

            {/* Search Bar */}
            <div id="seccion-productos" className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle inline />
          </div>
        </div>
      </header>

      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-16">
        <div className="text-center space-y-6 animate-fadeIn">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight tracking-[0.1em] sm:tracking-[0.2em] text-gray-800 dark:text-white uppercase leading-tight">
            <span className="block sm:inline">JESSICA</span>
            <span className="block sm:inline">ALESUAREZ</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 tracking-[0.1em] sm:tracking-[0.15em] uppercase text-xs sm:text-sm">
            Descubre nuestro catálogo
          </p>
          <div className="pt-4">
            <ChevronLeft className="w-6 h-6 text-[#C9A96E] mx-auto rotate-[-90deg] animate-bounce" />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12" id="catalogo">
        <div class="text-center pt-16 pb-24 px-4"> <h3 class="text-3xl md:text-4xl font-extralight tracking-[0.15em] text-gray-800 dark:text-white uppercase mb-8" style="font-family: 'Georgia', serif;">
    Nuestros Productos
  </h3>
  
  <div class="h-px w-24 bg-[#C9A96E] mx-auto opacity-80 mb-10 mb-20"></div>
  
  <div class="h-8"></div> 
</div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                onClick={() => openProductModal(product)}
                className="group bg-white dark:bg-[#1e293b] rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl dark:shadow-gray-900/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 active:scale-[0.98] animate-fadeIn"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Product Image */}
                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-[#0f172a]">
                  {product.imagenes && product.imagenes.length > 0 ? (
                    <img
                      src={getImageUrl(product.imagenes[0])}
                      alt={product.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4 space-y-2">
                  <h4 className="font-medium text-sm sm:text-base text-gray-800 dark:text-white truncate">
                    {product.nombre}
                  </h4>
                  
                  {product.colores && product.colores.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.colores.slice(0, 3).map(renderColorBadge)}
                      {product.colores.length > 3 && (
                        <span className="text-xs text-gray-400">+{product.colores.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-[#0f172a]/95 border-t border-gray-200 dark:border-gray-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <p className="text-gray-600 dark:text-gray-400 text-sm tracking-wide">
            © 2026 jessicaalesuarez
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs italic">
            Gracias por su preferencia ♥
          </p>
        </div>
      </footer>

      {/* Product Modal - Fully responsive */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onClick={closeProductModal}
        >
          <div className="min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4">
            <div 
              className="bg-white dark:bg-[#1e293b] w-full sm:max-w-4xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slideIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeProductModal}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 dark:bg-[#0f172a]/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              <div className="flex flex-col sm:flex-row">
                {/* Image Carousel */}
                <div className="relative w-full sm:flex-1 aspect-square sm:aspect-auto sm:min-h-[400px] bg-gray-100 dark:bg-[#0f172a]">
                  {selectedProduct.imagenes && selectedProduct.imagenes.length > 0 ? (
                    <>
                      <img
                        src={getImageUrl(selectedProduct.imagenes[currentImageIndex])}
                        alt={`${selectedProduct.nombre} - ${currentImageIndex + 1}`}
                        className="w-full h-full object-contain"
                      />

                      {/* Navigation Arrows */}
                      {selectedProduct.imagenes.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#1e293b]/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#1e293b]/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          </button>

                          {/* Dots Indicator */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {selectedProduct.imagenes.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-[#C9A96E] w-6' : 'bg-white/60 w-2 hover:bg-white/80'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-5 sm:p-6 sm:w-72 lg:w-80 flex flex-col">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-3">
                    {selectedProduct.nombre}
                  </h2>

                  {selectedProduct.descripcion && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {selectedProduct.descripcion}
                    </p>
                  )}

                  {selectedProduct.colores && selectedProduct.colores.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Colores</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colores.map(renderColorBadge)}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleWhatsApp}
                    className="mt-auto w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Consultar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsApp}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 hover:scale-110 active:scale-95"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  );
};

export default Catalogo;
