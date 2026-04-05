import imageCompression from 'browser-image-compression';

/**
 * Convierte una imagen a formato WebP con compresión optimizada
 * @param {File} file - Archivo de imagen original
 * @param {Object} options - Opciones de compresión
 * @returns {Promise<File>} - Archivo WebP comprimido
 */
export const compressAndConvertToWebP = async (file, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8,
    alwaysKeepResolution: false,
  };

  const compressionOptions = { ...defaultOptions, ...options };

  try {
    // Comprimir la imagen
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Crear un nuevo archivo con extensión .webp
    const webpFileName = file.name.replace(/\.[^/.]+$/, '.webp');
    const webpFile = new File([compressedFile], webpFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    console.log(`Imagen comprimida: ${(file.size / 1024).toFixed(2)}KB -> ${(webpFile.size / 1024).toFixed(2)}KB`);
    
    return webpFile;
  } catch (error) {
    console.error('Error al comprimir imagen:', error);
    throw error;
  }
};

/**
 * Comprime múltiples imágenes en paralelo
 * @param {FileList|File[]} files - Lista de archivos
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<File[]>} - Archivos comprimidos
 */
export const compressMultipleImages = async (files, onProgress = () => {}) => {
  const fileArray = Array.from(files);
  const totalFiles = fileArray.length;
  const compressedFiles = [];

  for (let i = 0; i < totalFiles; i++) {
    const compressed = await compressAndConvertToWebP(fileArray[i]);
    compressedFiles.push(compressed);
    onProgress(((i + 1) / totalFiles) * 100, i + 1, totalFiles);
  }

  return compressedFiles;
};

/**
 * Crea una URL de vista previa para una imagen
 * @param {File} file - Archivo de imagen
 * @returns {string} - URL de objeto
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revoca una URL de vista previa
 * @param {string} url - URL a revocar
 */
export const revokeImagePreview = (url) => {
  URL.revokeObjectURL(url);
};
