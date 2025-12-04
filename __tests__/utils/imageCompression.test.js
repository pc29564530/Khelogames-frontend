// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  stat: jest.fn(),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

// Mock react-native-image-resizer
jest.mock('react-native-image-resizer', () => ({
  default: {
    createResizedImage: jest.fn(),
  },
}));

import {
  calculateDimensions,
  getCompressionOptions,
  getUseCaseOptions,
  estimateCompressedSize,
  needsCompression,
  formatFileSize,
} from '../../utils/imageCompression';

import imageCompressionModule from '../../utils/imageCompression';

const { NETWORK_QUALITY, QUALITY_PRESETS, USE_CASE_PRESETS } = imageCompressionModule;

describe('Image Compression Utilities', () => {
  describe('calculateDimensions', () => {
    it('should maintain dimensions when within max bounds', () => {
      const result = calculateDimensions(800, 600, 1280, 1280);
      expect(result).toEqual({ width: 800, height: 600 });
    });

    it('should scale down width-dominant images', () => {
      const result = calculateDimensions(2000, 1000, 1280, 1280);
      expect(result.width).toBe(1280);
      expect(result.height).toBe(640);
    });

    it('should scale down height-dominant images', () => {
      const result = calculateDimensions(1000, 2000, 1280, 1280);
      expect(result.width).toBe(640);
      expect(result.height).toBe(1280);
    });

    it('should maintain aspect ratio when scaling', () => {
      const result = calculateDimensions(1920, 1080, 1280, 720);
      const aspectRatio = result.width / result.height;
      const originalAspectRatio = 1920 / 1080;
      expect(Math.abs(aspectRatio - originalAspectRatio)).toBeLessThan(0.01);
    });

    it('should handle square images', () => {
      const result = calculateDimensions(2000, 2000, 1280, 1280);
      expect(result).toEqual({ width: 1280, height: 1280 });
    });

    it('should handle very wide images', () => {
      const result = calculateDimensions(3000, 500, 1280, 1280);
      expect(result.width).toBe(1280);
      expect(result.height).toBeLessThanOrEqual(1280);
    });

    it('should handle very tall images', () => {
      const result = calculateDimensions(500, 3000, 1280, 1280);
      expect(result.height).toBe(1280);
      expect(result.width).toBeLessThanOrEqual(1280);
    });

    it('should not upscale small images', () => {
      const result = calculateDimensions(100, 100, 1280, 1280);
      expect(result).toEqual({ width: 100, height: 100 });
    });
  });

  describe('getCompressionOptions', () => {
    it('should return excellent quality options for excellent network', () => {
      const options = getCompressionOptions(NETWORK_QUALITY.EXCELLENT);
      expect(options).toEqual(QUALITY_PRESETS[NETWORK_QUALITY.EXCELLENT]);
      expect(options.quality).toBe(0.9);
      expect(options.maxWidth).toBe(1920);
    });

    it('should return good quality options for good network', () => {
      const options = getCompressionOptions(NETWORK_QUALITY.GOOD);
      expect(options).toEqual(QUALITY_PRESETS[NETWORK_QUALITY.GOOD]);
      expect(options.quality).toBe(0.8);
      expect(options.maxWidth).toBe(1280);
    });

    it('should return fair quality options for fair network', () => {
      const options = getCompressionOptions(NETWORK_QUALITY.FAIR);
      expect(options).toEqual(QUALITY_PRESETS[NETWORK_QUALITY.FAIR]);
      expect(options.quality).toBe(0.7);
      expect(options.maxWidth).toBe(1024);
    });

    it('should return poor quality options for poor network', () => {
      const options = getCompressionOptions(NETWORK_QUALITY.POOR);
      expect(options).toEqual(QUALITY_PRESETS[NETWORK_QUALITY.POOR]);
      expect(options.quality).toBe(0.5);
      expect(options.maxWidth).toBe(720);
    });

    it('should merge custom options with preset', () => {
      const customOptions = { quality: 0.95, maxWidth: 2000 };
      const options = getCompressionOptions(NETWORK_QUALITY.EXCELLENT, customOptions);
      expect(options.quality).toBe(0.95);
      expect(options.maxWidth).toBe(2000);
      expect(options.maxHeight).toBe(1920); // From preset
    });

    it('should use good quality as default for unknown network quality', () => {
      const options = getCompressionOptions('unknown');
      expect(options).toEqual(QUALITY_PRESETS[NETWORK_QUALITY.GOOD]);
    });

    it('should handle empty custom options', () => {
      const options = getCompressionOptions(NETWORK_QUALITY.EXCELLENT, {});
      expect(options).toEqual(QUALITY_PRESETS[NETWORK_QUALITY.EXCELLENT]);
    });
  });

  describe('getUseCaseOptions', () => {
    it('should return profile options for profile use case', () => {
      const options = getUseCaseOptions('profile');
      expect(options).toEqual(USE_CASE_PRESETS.profile);
      expect(options.quality).toBe(0.8);
      expect(options.maxWidth).toBe(400);
      expect(options.maxHeight).toBe(400);
    });

    it('should return thumbnail options for thumbnail use case', () => {
      const options = getUseCaseOptions('thumbnail');
      expect(options).toEqual(USE_CASE_PRESETS.thumbnail);
      expect(options.quality).toBe(0.7);
      expect(options.maxWidth).toBe(200);
      expect(options.maxHeight).toBe(200);
    });

    it('should return post options for post use case', () => {
      const options = getUseCaseOptions('post');
      expect(options).toEqual(USE_CASE_PRESETS.post);
      expect(options.quality).toBe(0.85);
      expect(options.maxWidth).toBe(1280);
      expect(options.maxHeight).toBe(1280);
    });

    it('should return banner options for banner use case', () => {
      const options = getUseCaseOptions('banner');
      expect(options).toEqual(USE_CASE_PRESETS.banner);
      expect(options.quality).toBe(0.9);
      expect(options.maxWidth).toBe(1920);
      expect(options.maxHeight).toBe(600);
    });

    it('should merge custom options with use case preset', () => {
      const customOptions = { quality: 0.95 };
      const options = getUseCaseOptions('profile', customOptions);
      expect(options.quality).toBe(0.95);
      expect(options.maxWidth).toBe(400); // From preset
      expect(options.maxHeight).toBe(400); // From preset
    });

    it('should use post preset as default for unknown use case', () => {
      const options = getUseCaseOptions('unknown');
      expect(options).toEqual(USE_CASE_PRESETS.post);
    });

    it('should handle empty custom options', () => {
      const options = getUseCaseOptions('profile', {});
      expect(options).toEqual(USE_CASE_PRESETS.profile);
    });
  });

  describe('estimateCompressedSize', () => {
    it('should estimate compressed size based on quality', () => {
      const originalSize = 1000000; // 1MB
      const quality = 0.8;
      const estimated = estimateCompressedSize(originalSize, quality);
      expect(estimated).toBe(800000);
    });

    it('should handle quality of 1.0', () => {
      const originalSize = 1000000;
      const quality = 1.0;
      const estimated = estimateCompressedSize(originalSize, quality);
      expect(estimated).toBe(1000000);
    });

    it('should handle quality of 0.5', () => {
      const originalSize = 1000000;
      const quality = 0.5;
      const estimated = estimateCompressedSize(originalSize, quality);
      expect(estimated).toBe(500000);
    });

    it('should handle quality of 0.0', () => {
      const originalSize = 1000000;
      const quality = 0.0;
      const estimated = estimateCompressedSize(originalSize, quality);
      expect(estimated).toBe(0);
    });

    it('should round to nearest integer', () => {
      const originalSize = 1000000;
      const quality = 0.75;
      const estimated = estimateCompressedSize(originalSize, quality);
      expect(estimated).toBe(750000);
      expect(Number.isInteger(estimated)).toBe(true);
    });

    it('should handle large file sizes', () => {
      const originalSize = 10000000; // 10MB
      const quality = 0.6;
      const estimated = estimateCompressedSize(originalSize, quality);
      expect(estimated).toBe(6000000);
    });

    it('should handle small file sizes', () => {
      const originalSize = 1000; // 1KB
      const quality = 0.8;
      const estimated = estimateCompressedSize(originalSize, quality);
      expect(estimated).toBe(800);
    });
  });

  describe('needsCompression', () => {
    it('should return true when file size exceeds default max (5MB)', () => {
      const fileSize = 6 * 1024 * 1024; // 6MB
      expect(needsCompression(fileSize)).toBe(true);
    });

    it('should return false when file size is below default max', () => {
      const fileSize = 4 * 1024 * 1024; // 4MB
      expect(needsCompression(fileSize)).toBe(false);
    });

    it('should return false when file size equals default max', () => {
      const fileSize = 5 * 1024 * 1024; // 5MB
      expect(needsCompression(fileSize)).toBe(false);
    });

    it('should respect custom max size', () => {
      const fileSize = 2 * 1024 * 1024; // 2MB
      const maxSize = 1 * 1024 * 1024; // 1MB
      expect(needsCompression(fileSize, maxSize)).toBe(true);
    });

    it('should handle very small files', () => {
      const fileSize = 1024; // 1KB
      expect(needsCompression(fileSize)).toBe(false);
    });

    it('should handle very large files', () => {
      const fileSize = 50 * 1024 * 1024; // 50MB
      expect(needsCompression(fileSize)).toBe(true);
    });

    it('should handle zero file size', () => {
      const fileSize = 0;
      expect(needsCompression(fileSize)).toBe(false);
    });

    it('should handle custom max size of 0', () => {
      const fileSize = 1;
      const maxSize = 0;
      expect(needsCompression(fileSize, maxSize)).toBe(true);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(10240)).toBe('10 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1610612736)).toBe('1.5 GB');
      expect(formatFileSize(5368709120)).toBe('5 GB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1536000)).toBe('1.46 MB');
      expect(formatFileSize(1234567)).toBe('1.18 MB');
    });

    it('should handle edge case at boundaries', () => {
      expect(formatFileSize(1023)).toBe('1023 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048575)).toBe('1024 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should handle very large sizes', () => {
      const size = 10 * 1024 * 1024 * 1024; // 10GB
      expect(formatFileSize(size)).toBe('10 GB');
    });

    it('should handle fractional bytes', () => {
      expect(formatFileSize(1.5)).toBe('1.5 Bytes');
    });
  });

  describe('Constants', () => {
    it('should export NETWORK_QUALITY constants', () => {
      expect(NETWORK_QUALITY.EXCELLENT).toBe('excellent');
      expect(NETWORK_QUALITY.GOOD).toBe('good');
      expect(NETWORK_QUALITY.FAIR).toBe('fair');
      expect(NETWORK_QUALITY.POOR).toBe('poor');
      expect(NETWORK_QUALITY.OFFLINE).toBe('offline');
    });

    it('should export QUALITY_PRESETS with correct structure', () => {
      expect(QUALITY_PRESETS).toHaveProperty(NETWORK_QUALITY.EXCELLENT);
      expect(QUALITY_PRESETS).toHaveProperty(NETWORK_QUALITY.GOOD);
      expect(QUALITY_PRESETS).toHaveProperty(NETWORK_QUALITY.FAIR);
      expect(QUALITY_PRESETS).toHaveProperty(NETWORK_QUALITY.POOR);

      Object.values(QUALITY_PRESETS).forEach(preset => {
        expect(preset).toHaveProperty('quality');
        expect(preset).toHaveProperty('maxWidth');
        expect(preset).toHaveProperty('maxHeight');
      });
    });

    it('should export USE_CASE_PRESETS with correct structure', () => {
      expect(USE_CASE_PRESETS).toHaveProperty('profile');
      expect(USE_CASE_PRESETS).toHaveProperty('thumbnail');
      expect(USE_CASE_PRESETS).toHaveProperty('post');
      expect(USE_CASE_PRESETS).toHaveProperty('banner');

      Object.values(USE_CASE_PRESETS).forEach(preset => {
        expect(preset).toHaveProperty('quality');
        expect(preset).toHaveProperty('maxWidth');
        expect(preset).toHaveProperty('maxHeight');
      });
    });

    it('should have quality values between 0 and 1', () => {
      Object.values(QUALITY_PRESETS).forEach(preset => {
        expect(preset.quality).toBeGreaterThanOrEqual(0);
        expect(preset.quality).toBeLessThanOrEqual(1);
      });

      Object.values(USE_CASE_PRESETS).forEach(preset => {
        expect(preset.quality).toBeGreaterThanOrEqual(0);
        expect(preset.quality).toBeLessThanOrEqual(1);
      });
    });

    it('should have positive dimension values', () => {
      Object.values(QUALITY_PRESETS).forEach(preset => {
        expect(preset.maxWidth).toBeGreaterThan(0);
        expect(preset.maxHeight).toBeGreaterThan(0);
      });

      Object.values(USE_CASE_PRESETS).forEach(preset => {
        expect(preset.maxWidth).toBeGreaterThan(0);
        expect(preset.maxHeight).toBeGreaterThan(0);
      });
    });
  });
});
