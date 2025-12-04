import { renderHook, act, waitFor } from '@testing-library/react-native';
import useImageCompression from '../../hooks/useImageCompression';
import * as imageCompression from '../../utils/imageCompression';

// Mock the imageCompression utilities
jest.mock('../../utils/imageCompression', () => ({
  compressImage: jest.fn(),
  compressImageForNetwork: jest.fn(),
  compressImageForUseCase: jest.fn(),
  getNetworkQuality: jest.fn(),
  needsCompression: jest.fn(),
  formatFileSize: jest.fn((bytes) => `${bytes} bytes`),
}));

describe('useImageCompression Hook', () => {
  const mockUri = 'file:///path/to/image.jpg';
  const mockCompressedResult = {
    uri: 'file:///path/to/compressed.jpg',
    width: 1280,
    height: 720,
    size: 500000,
    type: 'image/jpeg',
    name: 'compressed.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useImageCompression());

      expect(result.current.compressing).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.result).toBe(null);
      expect(result.current.networkQuality).toBe(null);
    });

    it('should provide all expected functions', () => {
      const { result } = renderHook(() => useImageCompression());

      expect(typeof result.current.compress).toBe('function');
      expect(typeof result.current.compressForNetwork).toBe('function');
      expect(typeof result.current.compressForUseCase).toBe('function');
      expect(typeof result.current.checkNeedsCompression).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.formatFileSize).toBe('function');
    });
  });

  describe('compress', () => {
    it('should compress image successfully', async () => {
      imageCompression.compressImage.mockResolvedValue(mockCompressedResult);

      const { result } = renderHook(() => useImageCompression());

      let compressedImage;
      await act(async () => {
        compressedImage = await result.current.compress(mockUri, { quality: 0.8 });
      });

      expect(imageCompression.compressImage).toHaveBeenCalledWith(mockUri, { quality: 0.8 });
      expect(compressedImage).toEqual(mockCompressedResult);
      expect(result.current.result).toEqual(mockCompressedResult);
      expect(result.current.compressing).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should set compressing state during compression', async () => {
      imageCompression.compressImage.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockCompressedResult), 100))
      );

      const { result } = renderHook(() => useImageCompression());

      act(() => {
        result.current.compress(mockUri);
      });

      expect(result.current.compressing).toBe(true);

      await waitFor(() => {
        expect(result.current.compressing).toBe(false);
      });
    });

    it('should handle compression errors', async () => {
      const errorMessage = 'Compression failed';
      imageCompression.compressImage.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useImageCompression());

      await act(async () => {
        try {
          await result.current.compress(mockUri);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.compressing).toBe(false);
      expect(result.current.result).toBe(null);
    });

    it('should clear error on successful compression after error', async () => {
      imageCompression.compressImage
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockCompressedResult);

      const { result } = renderHook(() => useImageCompression());

      // First compression fails
      await act(async () => {
        try {
          await result.current.compress(mockUri);
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBe('First error');

      // Second compression succeeds
      await act(async () => {
        await result.current.compress(mockUri);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.result).toEqual(mockCompressedResult);
    });

    it('should handle compression with default options', async () => {
      imageCompression.compressImage.mockResolvedValue(mockCompressedResult);

      const { result } = renderHook(() => useImageCompression());

      await act(async () => {
        await result.current.compress(mockUri);
      });

      expect(imageCompression.compressImage).toHaveBeenCalledWith(mockUri, {});
    });
  });

  describe('compressForNetwork', () => {
    it('should compress image based on network quality', async () => {
      const networkQuality = 'good';
      imageCompression.getNetworkQuality.mockResolvedValue(networkQuality);
      imageCompression.compressImageForNetwork.mockResolvedValue(mockCompressedResult);

      const { result } = renderHook(() => useImageCompression());

      let compressedImage;
      await act(async () => {
        compressedImage = await result.current.compressForNetwork(mockUri);
      });

      expect(imageCompression.compressImageForNetwork).toHaveBeenCalledWith(mockUri, {});
      expect(compressedImage).toEqual(mockCompressedResult);
      expect(result.current.networkQuality).toBe(networkQuality);
      expect(result.current.result).toEqual(mockCompressedResult);
    });

    it('should pass custom options to compressImageForNetwork', async () => {
      imageCompression.getNetworkQuality.mockResolvedValue('good');
      imageCompression.compressImageForNetwork.mockResolvedValue(mockCompressedResult);

      const { result } = renderHook(() => useImageCompression());
      const customOptions = { maxWidth: 1000 };

      await act(async () => {
        await result.current.compressForNetwork(mockUri, customOptions);
      });

      expect(imageCompression.compressImageForNetwork).toHaveBeenCalledWith(mockUri, customOptions);
    });

    it('should handle network quality detection errors', async () => {
      imageCompression.getNetworkQuality.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useImageCompression());

      await act(async () => {
        try {
          await result.current.compressForNetwork(mockUri);
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should set compressing state during network compression', async () => {
      imageCompression.getNetworkQuality.mockResolvedValue('good');
      imageCompression.compressImageForNetwork.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockCompressedResult), 100))
      );

      const { result } = renderHook(() => useImageCompression());

      act(() => {
        result.current.compressForNetwork(mockUri);
      });

      expect(result.current.compressing).toBe(true);

      await waitFor(() => {
        expect(result.current.compressing).toBe(false);
      });
    });
  });

  describe('compressForUseCase', () => {
    it('should compress image for specific use case', async () => {
      imageCompression.compressImageForUseCase.mockResolvedValue(mockCompressedResult);

      const { result } = renderHook(() => useImageCompression());

      let compressedImage;
      await act(async () => {
        compressedImage = await result.current.compressForUseCase(mockUri, 'profile');
      });

      expect(imageCompression.compressImageForUseCase).toHaveBeenCalledWith(mockUri, 'profile', {});
      expect(compressedImage).toEqual(mockCompressedResult);
      expect(result.current.result).toEqual(mockCompressedResult);
    });

    it('should pass custom options to compressImageForUseCase', async () => {
      imageCompression.compressImageForUseCase.mockResolvedValue(mockCompressedResult);

      const { result } = renderHook(() => useImageCompression());
      const customOptions = { quality: 0.9 };

      await act(async () => {
        await result.current.compressForUseCase(mockUri, 'thumbnail', customOptions);
      });

      expect(imageCompression.compressImageForUseCase).toHaveBeenCalledWith(
        mockUri,
        'thumbnail',
        customOptions
      );
    });

    it('should handle different use cases', async () => {
      imageCompression.compressImageForUseCase.mockResolvedValue(mockCompressedResult);

      const { result } = renderHook(() => useImageCompression());
      const useCases = ['profile', 'thumbnail', 'post', 'banner'];

      for (const useCase of useCases) {
        await act(async () => {
          await result.current.compressForUseCase(mockUri, useCase);
        });

        expect(imageCompression.compressImageForUseCase).toHaveBeenCalledWith(
          mockUri,
          useCase,
          {}
        );
      }
    });

    it('should handle use case compression errors', async () => {
      imageCompression.compressImageForUseCase.mockRejectedValue(new Error('Use case error'));

      const { result } = renderHook(() => useImageCompression());

      await act(async () => {
        try {
          await result.current.compressForUseCase(mockUri, 'profile');
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Use case error');
    });
  });

  describe('checkNeedsCompression', () => {
    it('should check if compression is needed', () => {
      imageCompression.needsCompression.mockReturnValue(true);

      const { result } = renderHook(() => useImageCompression());

      const needs = result.current.checkNeedsCompression(10000000, 5000000);

      expect(imageCompression.needsCompression).toHaveBeenCalledWith(10000000, 5000000);
      expect(needs).toBe(true);
    });

    it('should return false when compression not needed', () => {
      imageCompression.needsCompression.mockReturnValue(false);

      const { result } = renderHook(() => useImageCompression());

      const needs = result.current.checkNeedsCompression(1000000, 5000000);

      expect(needs).toBe(false);
    });

    it('should work without maxSize parameter', () => {
      imageCompression.needsCompression.mockReturnValue(true);

      const { result } = renderHook(() => useImageCompression());

      result.current.checkNeedsCompression(10000000);

      expect(imageCompression.needsCompression).toHaveBeenCalledWith(10000000, undefined);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      imageCompression.compressImage.mockResolvedValue(mockCompressedResult);

      const { result } = renderHook(() => useImageCompression());

      // Perform compression to set state
      await act(async () => {
        await result.current.compress(mockUri);
      });

      expect(result.current.result).toEqual(mockCompressedResult);

      // Reset state
      act(() => {
        result.current.reset();
      });

      expect(result.current.compressing).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.result).toBe(null);
      expect(result.current.networkQuality).toBe(null);
    });

    it('should reset error state', async () => {
      imageCompression.compressImage.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useImageCompression());

      await act(async () => {
        try {
          await result.current.compress(mockUri);
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBe(null);
    });

    it('should reset network quality', async () => {
      imageCompression.getNetworkQuality.mockResolvedValue('excellent');
      imageCompression.compressImageForNetwork.mockResolvedValue(mockCompressedResult);

      const { result } = renderHook(() => useImageCompression());

      await act(async () => {
        await result.current.compressForNetwork(mockUri);
      });

      expect(result.current.networkQuality).toBe('excellent');

      act(() => {
        result.current.reset();
      });

      expect(result.current.networkQuality).toBe(null);
    });
  });

  describe('formatFileSize', () => {
    it('should format file size', () => {
      const { result } = renderHook(() => useImageCompression());

      const formatted = result.current.formatFileSize(1024);

      expect(imageCompression.formatFileSize).toHaveBeenCalledWith(1024);
      expect(formatted).toBe('1024 bytes');
    });

    it('should handle different file sizes', () => {
      const { result } = renderHook(() => useImageCompression());

      result.current.formatFileSize(0);
      result.current.formatFileSize(1024);
      result.current.formatFileSize(1048576);

      expect(imageCompression.formatFileSize).toHaveBeenCalledTimes(3);
    });
  });

  describe('Multiple Compressions', () => {
    it('should handle multiple sequential compressions', async () => {
      imageCompression.compressImage.mockResolvedValue(mockCompressedResult);

      const { result } = renderHook(() => useImageCompression());

      await act(async () => {
        await result.current.compress(mockUri);
      });

      expect(result.current.result).toEqual(mockCompressedResult);

      const secondResult = { ...mockCompressedResult, size: 300000 };
      imageCompression.compressImage.mockResolvedValue(secondResult);

      await act(async () => {
        await result.current.compress(mockUri);
      });

      expect(result.current.result).toEqual(secondResult);
    });

    it('should handle mixed compression methods', async () => {
      imageCompression.compressImage.mockResolvedValue(mockCompressedResult);
      imageCompression.getNetworkQuality.mockResolvedValue('good');
      imageCompression.compressImageForNetwork.mockResolvedValue(mockCompressedResult);
      imageCompression.compressImageForUseCase.mockResolvedValue(mockCompressedResult);

      const { result } = renderHook(() => useImageCompression());

      await act(async () => {
        await result.current.compress(mockUri);
      });

      await act(async () => {
        await result.current.compressForNetwork(mockUri);
      });

      await act(async () => {
        await result.current.compressForUseCase(mockUri, 'profile');
      });

      expect(imageCompression.compressImage).toHaveBeenCalled();
      expect(imageCompression.compressImageForNetwork).toHaveBeenCalled();
      expect(imageCompression.compressImageForUseCase).toHaveBeenCalled();
    });
  });
});
