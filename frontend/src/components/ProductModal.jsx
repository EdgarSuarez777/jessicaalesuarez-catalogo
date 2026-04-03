import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { toast } from 'sonner';
import { parseColorName } from '../lib/colorDictionary';
import { compressImage } from '../lib/imageCompressor';

export default function ProductModal({ onClose, product }) {
  const [nombre, setNombre] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [colores, setColores] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [fotosPreview, setFotosPreview] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
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
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      );

      const previews = compressedFiles.map(file => URL.createObjectURL(file));
      setFotosPreview([...fotosPreview, ...previews]);
      setFotos([...fotos, ...compressedFiles]);
    } catch (error) {
      toast.error('Error al procesar imágenes');
    }
  };

  const removePhoto = (index) => {
    setFotosPreview(fotosPreview.filter((_, i) => i !== index));
    setFotos(fotos.filter((_, i) => i !== index));
    if (currentPhotoIndex >= fotosPreview.length - 1) {
      setCurrentPhotoIndex(Math.max(0, fotosPreview.length - 2));
    }
  };

  const uploadPhotos = async () => {
    const uploadedUrls = [];

    for (const foto of fotos) {
      const timestamp = Date.now();
      const storageRef = ref(storage, `productos/${timestamp}_${foto.name}`);
      await uploadBytes(storageRef, foto);
      const url = await getDownloadURL(storageRef);
      uploadedUrls.push(url);
    }

    return uploadedUrls;
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
        const newUrls = await uploadPhotos();
        fotosUrls = [...fotosUrls, ...newUrls];
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
              placeholder="Ej: Vestido Elegante"
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
                placeholder="Escribe un color y presiona Enter"
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
            <label className="form-label">Fotos (máximo 5)</label>
            
            {fotosPreview.length > 0 && (
              <div className="photo-carousel">
                <div className="carousel-main">
                  <img 
                    src={fotosPreview[currentPhotoIndex]} 
                    alt="Preview" 
                    className="carousel-image"
                  />
                  
                  {fotosPreview.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                        className="carousel-button carousel-prev"
                        disabled={currentPhotoIndex === 0}
                        data-testid="carousel-prev-button"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentPhotoIndex(Math.min(fotosPreview.length - 1, currentPhotoIndex + 1))}
                        className="carousel-button carousel-next"
                        disabled={currentPhotoIndex === fotosPreview.length - 1}
                        data-testid="carousel-next-button"
                      >
                        ›
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => removePhoto(currentPhotoIndex)}
                    className="remove-photo-button"
                    data-testid="remove-photo-button"
                  >
                    Eliminar Foto
                  </button>
                </div>
                
                <div className="carousel-indicators">
                  {fotosPreview.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`carousel-indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                      data-testid="carousel-indicator"
                    />
                  ))}
                </div>
              </div>
            )}

            {fotosPreview.length < 5 && (
              <div className="file-input-container">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="file-input"
                  id="photo-input"
                  data-testid="photo-input"
                />
                <label htmlFor="photo-input" className="file-input-label">
                  Seleccionar Fotos
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
