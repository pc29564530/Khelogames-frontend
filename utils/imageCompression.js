import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import NetInfo from '@react-native-community/netinfo';

/**
 * Image compression utility for optimizing images before upload
 * Provides compression, resizing, and quality selection based on network conditions
 */

/**
 * Network quality thresholds
 */
const NETWORK_QUALITY = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  OFFLINE: 'offline',
};

/**
 * Quality presets for different network conditions
 */
const QUALITY_PRESETS = {
  [NETWORK_QUALITY.EXCELLENT]: {
    quality: 0.9,
    maxWidth: 1920,
    maxHeight: 1920,
  },
  [NETWORK_QUALITY.GOOD]: {
    quality: 0.8,
    maxWidth: 1280,
    maxHeight: 1280,
  },
  [NETWORK_QUALITY.FAIR]: {
    quality: 0.7,
    maxWidth: 1024,
    maxHeight: 1024,
  },
  [NETWORK_QUALITY.POOR]: {
    quality: 0.5,
    maxWidth: 720,
    maxHeight: 720,
  },
};

/**
 * Use case specific presets
 */
const USE_CASE_PRESETS = {
  profile: {
    quality: 0.8,
    maxWidth: 400,
    maxHeight: 400,
  },
  thumbnail: {
    quality: 0.7,
    maxWidth: 200,
    maxHeight: 200,
  },
  post: {
    quality: 0.85,
    maxWidth: 1280,
    maxHeight: 1280,
  },
  banner: {
    quality: 0.9,
    maxWidth: 1920,
    maxHeight: 600,
  },
};

/**
 * Get current network quality
 * @returns {Promise<string>} Network quality level
 */
export const getNetworkQuality = async () => {
  try {
    const state = await NetInfo.fetch();
    
    if (!state.isConnected) {
      return NETWORK_QUALITY.OFFLINE;
    }

    // For cellular connections, check the type
    if (state.type === 'cellular') {
      const effectiveType = state.details?.cellularGeneration;
      
      if (effectiveType === '5g') {
        return NETWORK_QUALITY.EXCELLENT;
      } else if (effectiveType === '4g') {
        return NETWORK_QUALITY.GOOD;
      } else if (effectiveType === '3g') {
        return NETWORK_QUALITY.FAIR;
      } else {
        return NETWORK_QUALITY.POOR;
      }
    }

    // For WiFi, assume good quality
    if (state.type === 'wifi') {
      return NETWORK_QUALITY.EXCELLENT;
    }

    return NETWORK_QUALITY.GOOD;
  } catch (error) {
    console.error('Error getting network quality:', error);
    return NETWORK_QUALITY.GOOD; // Default to good
  }
};

/**
 * Calculate dimensions maintaining aspect ratio
 * @param {number} width - Original width
 * @param {number} height - Original height
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Object} New dimensions
 */
export const calculateDimensions = (width, height, maxWidth, maxHeight) => {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const aspectRatio = width / height;

  if (width > height) {
    const newWidth = Math.min(width, maxWidth);
    const newHeight = Math.round(newWidth / aspectRatio);
    
    if (newHeight > maxHeight) {
      return {
        width: Math.round(maxHeight * aspectRatio),
        height: maxHeight,
      };
    }
    
    return { width: newWidth, height: newHeight };
  } else {
    const newHeight = Math.min(height, maxHeight);
    const newWidth = Math.round(newHeight * aspectRatio);
    
    if (newWidth > maxWidth) {
      return {
        width: maxWidth,
        height: Math.round(maxWidth / aspectRatio),
      };
    }
    
    return { width: newWidth, height: newHeight };
  }
};

/**
 * Get compression options based on network quality
 * @param {string} networkQuality - Current network quality
 * @param {Object} customOptions - Custom compression options
 * @returns {Object} Compression options
 */
export const getCompressionOptions = (networkQuality, customOptions = {}) => {
  const preset = QUALITY_PRESETS[networkQuality] || QUALITY_PRESETS[NETWORK_QUALITY.GOOD];
  
  return {
    ...preset,
    ...customOptions,
  };
};

/**
 * Get compression options for specific use case
 * @param {string} useCase - Use case (profile, thumbnail, post, banner)
 * @param {Object} customOptions - Custom compression options
 * @returns {Object} Compression options
 */
export const getUseCaseOptions = (useCase, customOptions = {}) => {
  const preset = USE_CASE_PRESETS[useCase] || USE_CASE_PRESETS.post;
  
  return {
    ...preset,
    ...customOptions,
  };
};

/**
 * Compress image using react-native-image-resizer
 * 
 * @param {string} uri - Image URI
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} Compressed image info
 */
export const compressImage = async (uri, options = {}) => {
  try {
    const {
      quality = 0.8,
      maxWidth = 1280,
      maxHeight = 1280,
      format = 'JPEG',
    } = options;

    // Import ImageResizer dynamically to avoid issues if not linked
    let ImageResizer;
    try {
      ImageResizer = require('react-native-image-resizer').default;
    } catch (err) {
      console.warn('react-native-image-resizer not available, returning original image');
      // Fallback: return original image info
      const fileInfo = await RNFS.stat(uri);
      return {
        uri,
        width: maxWidth,
        height: maxHeight,
        size: fileInfo.size,
        type: `image/${format.toLowerCase()}`,
        name: fileInfo.name || 'image.jpg',
      };
    }

    // Compress and resize the image
    const compressed = await ImageResizer.createResizedImage(
      uri,
      maxWidth,
      maxHeight,
      format,
      quality * 100, // Convert 0-1 to 0-100
      0, // rotation
      null, // outputPath
      false, // keepMeta
      {
        mode: 'contain', // Maintain aspect ratio
        onlyScaleDown: true, // Don't upscale images
      }
    );
    
    return {
      uri: compressed.uri,
      width: compressed.width,
      height: compressed.height,
      size: compressed.size,
      type: `image/${format.toLowerCase()}`,
      name: compressed.name || 'image.jpg',
      path: compressed.path,
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Compress image based on network quality
 * @param {string} uri - Image URI
 * @param {Object} customOptions - Custom compression options
 * @returns {Promise<Object>} Compressed image info
 */
export const compressImageForNetwork = async (uri, customOptions = {}) => {
  const networkQuality = await getNetworkQuality();
  const options = getCompressionOptions(networkQuality, customOptions);
  
  return compressImage(uri, options);
};

/**
 * Compress image for specific use case
 * @param {string} uri - Image URI
 * @param {string} useCase - Use case (profile, thumbnail, post, banner)
 * @param {Object} customOptions - Custom compression options
 * @returns {Promise<Object>} Compressed image info
 */
export const compressImageForUseCase = async (uri, useCase, customOptions = {}) => {
  const options = getUseCaseOptions(useCase, customOptions);
  
  return compressImage(uri, options);
};

/**
 * Estimate compressed file size
 * @param {number} originalSize - Original file size in bytes
 * @param {number} quality - Compression quality (0-1)
 * @returns {number} Estimated compressed size in bytes
 */
export const estimateCompressedSize = (originalSize, quality) => {
  // Rough estimation: compressed size is approximately quality * originalSize
  // This is a simplification and actual results may vary
  return Math.round(originalSize * quality);
};

/**
 * Check if image needs compression
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes (default 5MB)
 * @returns {boolean} Whether compression is needed
 */
export const needsCompression = (fileSize, maxSize = 5 * 1024 * 1024) => {
  return fileSize > maxSize;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default {
  getNetworkQuality,
  calculateDimensions,
  getCompressionOptions,
  getUseCaseOptions,
  compressImage,
  compressImageForNetwork,
  compressImageForUseCase,
  estimateCompressedSize,
  needsCompression,
  formatFileSize,
  NETWORK_QUALITY,
  QUALITY_PRESETS,
  USE_CASE_PRESETS,
};
