import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { parseColorName } from '../lib/colorDictionary';
import { compressImage } from '../lib/imageCompressor';

export default function ProductModal({ onClose, product }) {
  const [nombre, setNombre] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [colores, setColores] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [fotosPreview, setFotosPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setNombre(product.nombre || '');
      setColores(product.colores || []);
      setFotosPreview(product.fotos || []);
    }
  }, [product]);

  const handleColorKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addColor();
    }
  };

  const addColor = () => {
    if (!colorInput.trim()) return;

    const hexColor = parseColorName(colorInput.trim());
    if (!hexColor) {
      toast.error(`Color "${colorInput}" no encontrado`);
      return;
    }

    const newColor = {
      nombre: colorInput.trim(),
      hex: hexColor
    };

    setColores([...colores, newColor]);
    setColorInput('');
    toast.success(`Color "${newColor.nombre}" agregado`);
  };

  const removeColor = (index) => {
    setColores(colores.filter((_, i) => i !== index));
  };

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    if (fotos.length + files.length > 5) {
      toast.error('Máximo 5 fotos por producto');
      return;
    }

    try {
      const compressedDataUrls = await Promise.all(
        files.map(file => compressImage(file))
      );

      setFotosPreview([...fotosPreview, ...compressedDataUrls]);
      setFotos([...fotos, ...compressedDataUrls]);
    } catch (error) {
      toast.error('Error al procesar imágenes');
    }
  };

  const removePhoto = (index) => {
    setFotosPreview(fotosPreview.filter((_, i) => i !== index));
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setLoading(true);

    try {
      let fotosUrls = product?.fotos || [];

      if (fotos.length > 0) {
        fotosUrls = [...fotosUrls, ...fotos];
      }

      const productData = {
        nombre: nombre.trim(),
        colores,
        fotos: fotosUrls,
        updatedAt: new Date().toISOString()
      };

      if (product) {
        await updateDoc(doc(db, 'productos', product.id), productData);
        toast.success('Producto actualizado');
      } else {
        productData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'productos'), productData);
        toast.success('Producto creado');
      }

      onClose();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast.error('Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="product-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="modal-close" data-testid="modal-close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <label className="form-label">Nombre del Producto</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="form-input"
              placeholder="EJ. CONSOLA DE VIDEOJUEGOS"
              required
              data-testid="product-name-input"
            />
          </div>

          <div className="form-section">
            <label className="form-label">Colores</label>
            <div className="color-input-container">
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyPress={handleColorKeyPress}
                className="form-input"
                placeholder="Escribe un color"
                data-testid="color-input"
              />
              <button 
                type="button" 
                onClick={addColor} 
                className="add-color-button"
                data-testid="add-color-button"
              >
                +
              </button>
            </div>
            
            {colores.length > 0 && (
              <div className="color-pills">
                {colores.map((color, index) => (
                  <div key={index} className="color-pill" data-testid="color-pill">
                    <div 
                      className="color-pill-circle" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.nombre}</span>
                    <button 
                      type="button" 
                      onClick={() => removeColor(index)}
                      className="color-pill-remove"
                      data-testid="remove-color-button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-section">
            <label className="form-label">Galería de Fotos</label>
            
            {fotosPreview.length > 0 ? (
              <div className="photos-gallery">
                {fotosPreview.map((foto, index) => (
                  <div key={index} className="photo-thumbnail-card" data-testid="photo-thumbnail">
                    <div className="photo-thumbnail-wrapper">
                      <img 
                        src={foto} 
                        alt={`Foto ${index + 1}`} 
                        className="photo-thumbnail-image"
                      />
                      <div className="photo-thumbnail-overlay">
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="photo-remove-icon"
                          data-testid="remove-photo-button"
                          title="Eliminar"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                      {index === 0 && (
                        <div className="photo-principal-badge">Principal</div>
                      )}
                    </div>
                  </div>
                ))}
                
                {fotosPreview.length < 5 && (
                  <div className="photo-upload-card">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="file-input-hidden"
                      id="photo-input"
                      data-testid="photo-input"
                    />
                    <label htmlFor="photo-input" className="photo-upload-label">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span className="photo-upload-text">Agregar Foto</span>
                      <span className="photo-upload-hint">{5 - fotosPreview.length} restantes</span>
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="photo-dropzone">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="file-input-hidden"
                  id="photo-input-empty"
                  data-testid="photo-input"
                />
                <label htmlFor="photo-input-empty" className="dropzone-label">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <h3 className="dropzone-title">Agrega fotos de tu producto</h3>
                  <p className="dropzone-subtitle">Haz clic o arrastra hasta 5 imágenes</p>
                  <span className="dropzone-formats">JPG, PNG, WEBP</span>
                </label>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-button"
              data-testid="cancel-button"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="save-button"
              data-testid="save-product-button"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
