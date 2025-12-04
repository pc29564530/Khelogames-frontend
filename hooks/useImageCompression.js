import { useState, useCallback } from 'react';
import {
  compressImage,
  compressImageForNetwork,
  compressImageForUseCase,
  getNetworkQuality,
  needsCompression,
  formatFileSize,
} from '../utils/imageCompression';

/**
 * Hook for image compression with loading states and error handling
 * 
 * @example
 * const { compress, compressing, error, result } = useImageCompression();
 * 
 * const handleImageSelect = async (imageUri) => {
 *   const compressed = await compress(imageUri, { quality: 0.8 });
 *   // Upload compressed image
 * };
 */
const useImageCompression = () => {
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [networkQuality, setNetworkQuality] = useState(null);

  /**
   * Compress image with custom options
   */
  const compress = useCallback(async (uri, options = {}) => {
    setCompressing(true);
    setError(null);
    
    try {
      const compressed = await compressImage(uri, options);
      setResult(compressed);
      return compressed;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCompressing(false);
    }
  }, []);

  /**
   * Compress image based on current network quality
   */
  const compressForNetwork = useCallback(async (uri, customOptions = {}) => {
    setCompressing(true);
    setError(null);
    
    try {
      const quality = await getNetworkQuality();
      setNetworkQuality(quality);
      
      const compressed = await compressImageForNetwork(uri, customOptions);
      setResult(compressed);
      return compressed;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCompressing(false);
    }
  }, []);

  /**
   * Compress image for specific use case
   */
  const compressForUseCase = useCallback(async (uri, useCase, customOptions = {}) => {
    setCompressing(true);
    setError(null);
    
    try {
      const compressed = await compressImageForUseCase(uri, useCase, customOptions);
      setResult(compressed);
      return compressed;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCompressing(false);
    }
  }, []);

  /**
   * Check if image needs compression
   */
  const checkNeedsCompression = useCallback((fileSize, maxSize) => {
    return needsCompression(fileSize, maxSize);
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setCompressing(false);
    setError(null);
    setResult(null);
    setNetworkQuality(null);
  }, []);

  return {
    compress,
    compressForNetwork,
    compressForUseCase,
    checkNeedsCompression,
    reset,
    compressing,
    error,
    result,
    networkQuality,
    formatFileSize,
  };
};

export default useImageCompression;
