import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { compressAndConvertToWebP } from '../lib/imageCompressor';

const PRODUCTS_COLLECTION = 'productos';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Convertir imagen a base64
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Procesar imagen: comprimir y convertir a base64
  const processImage = async (file) => {
    try {
      // Comprimir y convertir a WebP
      const compressedFile = await compressAndConvertToWebP(file, {
        maxSizeMB: 0.3, // Máximo 300KB para guardar en Firestore
        maxWidthOrHeight: 800,
      });
      
      // Convertir a base64
      const base64 = await imageToBase64(compressedFile);
      
      return {
        data: base64,
        name: compressedFile.name,
        size: compressedFile.size
      };
    } catch (err) {
      console.error('Error processing image:', err);
      throw err;
    }
  };

  // Crear producto
  const createProduct = async (productData, imageFiles) => {
    try {
      setLoading(true);
      
      // Procesar imágenes a base64
      const processedImages = [];
      for (const file of imageFiles) {
        const imageData = await processImage(file);
        processedImages.push(imageData);
      }

      // Crear documento
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        nombre: productData.nombre,
        descripcion: productData.descripcion || '',
        colores: productData.colores || [],
        imagenes: processedImages,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setLoading(false);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Actualizar producto
  const updateProduct = async (productId, productData, newImageFiles = [], imagesToDelete = []) => {
    try {
      setLoading(true);

      // Procesar nuevas imágenes
      const newProcessedImages = [];
      for (const file of newImageFiles) {
        const imageData = await processImage(file);
        newProcessedImages.push(imageData);
      }

      // Filtrar imágenes existentes (quitar las eliminadas)
      // Las imágenes a eliminar vienen como índices o nombres
      let existingImages = productData.imagenes || [];
      if (imagesToDelete.length > 0) {
        existingImages = existingImages.filter((img, idx) => {
          // Si imagesToDelete contiene índices numéricos
          if (typeof imagesToDelete[0] === 'number') {
            return !imagesToDelete.includes(idx);
          }
          // Si contiene nombres o paths
          const imgName = img.name || img.path || `img_${idx}`;
          return !imagesToDelete.includes(imgName);
        });
      }

      // Actualizar documento
      await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
        nombre: productData.nombre,
        descripcion: productData.descripcion || '',
        colores: productData.colores || [],
        imagenes: [...existingImages, ...newProcessedImages],
        updatedAt: serverTimestamp()
      });

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Eliminar producto
  const deleteProduct = async (productId) => {
    try {
      setLoading(true);

      // Eliminar documento (las imágenes se eliminan con el documento ya que están en base64)
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Buscar productos
  const searchProducts = useCallback((searchTerm) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return products;

    return products.filter(product => {
      const matchName = product.nombre?.toLowerCase().includes(term);
      const matchColors = product.colores?.some(color => {
        const colorName = typeof color === 'string' ? color : (color?.nombre || '');
        return colorName.toLowerCase().includes(term);
      });
      const matchDesc = product.descripcion?.toLowerCase().includes(term);
      return matchName || matchColors || matchDesc;
    });
  }, [products]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
  };
};

export default useProducts;
