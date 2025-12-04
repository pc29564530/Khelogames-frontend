import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Button } from './atoms';
import OptimizedImage from './atoms/OptimizedImage';
import LazyImage from './atoms/LazyImage';
import useImageCompression from '../hooks/useImageCompression';
import { useTheme } from '../hooks/useTheme';

/**
 * Example component demonstrating image optimization features
 * - OptimizedImage with caching and progressive loading
 * - LazyImage with viewport detection
 * - Image compression for uploads
 */
const ImageOptimizationExample = () => {
  const theme = useTheme();
  const {
    compress,
    compressForNetwork,
    compressForUseCase,
    compressing,
    error,
    result,
    networkQuality,
    formatFileSize,
  } = useImageCompression();

  const [selectedImage, setSelectedImage] = useState(null);

  // Example image URLs
  const exampleImages = [
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/800/600?random=3',
    'https://picsum.photos/800/600?random=4',
    'https://picsum.photos/800/600?random=5',
  ];

  const handleCompressForNetwork = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    try {
      const compressed = await compressForNetwork(selectedImage);
      Alert.alert(
        'Compression Complete',
        `Network Quality: ${networkQuality}\n` +
        `Original Size: ${formatFileSize(compressed.size)}\n` +
        `Dimensions: ${compressed.width}x${compressed.height}`
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleCompressForUseCase = async (useCase) => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    try {
      const compressed = await compressForUseCase(selectedImage, useCase);
      Alert.alert(
        'Compression Complete',
        `Use Case: ${useCase}\n` +
        `Size: ${formatFileSize(compressed.size)}\n` +
        `Dimensions: ${compressed.width}x${compressed.height}`
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>
          Image Optimization Examples
        </Text>
        <Text variant="body" style={styles.description}>
          Demonstrating OptimizedImage, LazyImage, and compression utilities
        </Text>
      </View>

      {/* OptimizedImage Examples */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          1. OptimizedImage with Caching
        </Text>
        <Text variant="body" style={styles.description}>
          Uses react-native-fast-image for better performance and caching
        </Text>
        
        <View style={styles.imageGrid}>
          <OptimizedImage
            source={{ uri: exampleImages[0] }}
            style={styles.gridImage}
            cachePolicy="memory-disk"
            priority="high"
            resizeMode="cover"
            accessibilityLabel="Example image with high priority"
          />
          <OptimizedImage
            source={{ uri: exampleImages[1] }}
            style={styles.gridImage}
            cachePolicy="memory-disk"
            priority="normal"
            resizeMode="cover"
            accessibilityLabel="Example image with normal priority"
          />
        </View>
      </View>

      {/* LazyImage Examples */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          2. LazyImage with Viewport Detection
        </Text>
        <Text variant="body" style={styles.description}>
          Images load only when they're about to enter the viewport
        </Text>
        
        <View style={styles.lazyImageContainer}>
          {exampleImages.slice(2).map((uri, index) => (
            <LazyImage
              key={index}
              source={{ uri }}
              style={styles.lazyImage}
              priority={index === 0 ? 'high' : 'normal'}
              rootMargin={200}
              onVisible={() => console.log(`Image ${index} became visible`)}
              accessibilityLabel={`Lazy loaded image ${index + 1}`}
            />
          ))}
        </View>
      </View>

      {/* Image Compression Examples */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          3. Image Compression
        </Text>
        <Text variant="body" style={styles.description}>
          Compress images based on network quality or use case
        </Text>

        <TouchableOpacity
          style={[styles.imageSelector, { borderColor: theme.colors.primary }]}
          onPress={() => setSelectedImage(exampleImages[0])}
        >
          <Text variant="body">
            {selectedImage ? 'Image Selected' : 'Tap to Select Image'}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonGroup}>
          <Button
            variant="primary"
            size="sm"
            onPress={handleCompressForNetwork}
            disabled={compressing || !selectedImage}
            loading={compressing}
            accessibilityLabel="Compress for network"
          >
            Compress for Network
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onPress={() => handleCompressForUseCase('profile')}
            disabled={compressing || !selectedImage}
            accessibilityLabel="Compress for profile"
          >
            Profile (400x400)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onPress={() => handleCompressForUseCase('thumbnail')}
            disabled={compressing || !selectedImage}
            accessibilityLabel="Compress for thumbnail"
          >
            Thumbnail (200x200)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onPress={() => handleCompressForUseCase('post')}
            disabled={compressing || !selectedImage}
            accessibilityLabel="Compress for post"
          >
            Post (1280x1280)
          </Button>
        </View>

        {error && (
          <Text variant="body" style={[styles.errorText, { color: theme.colors.error }]}>
            Error: {error}
          </Text>
        )}

        {result && (
          <View style={[styles.resultBox, { backgroundColor: theme.colors.surface }]}>
            <Text variant="body">Compression Result:</Text>
            <Text variant="caption">Size: {formatFileSize(result.size)}</Text>
            <Text variant="caption">Dimensions: {result.width}x{result.height}</Text>
            {networkQuality && (
              <Text variant="caption">Network: {networkQuality}</Text>
            )}
          </View>
        )}
      </View>

      {/* Best Practices */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          Best Practices
        </Text>
        <View style={styles.bestPractices}>
          <Text variant="body">• Use OptimizedImage for all images</Text>
          <Text variant="body">• Use LazyImage for images below the fold</Text>
          <Text variant="body">• Set priority="high" for above-the-fold images</Text>
          <Text variant="body">• Compress images before upload</Text>
          <Text variant="body">• Use appropriate cache policies</Text>
          <Text variant="body">• Provide placeholders for better UX</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    opacity: 0.7,
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  gridImage: {
    flex: 1,
    height: 200,
    borderRadius: 8,
  },
  lazyImageContainer: {
    gap: 16,
  },
  lazyImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imageSelector: {
    padding: 16,
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonGroup: {
    gap: 8,
  },
  errorText: {
    marginTop: 8,
  },
  resultBox: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  bestPractices: {
    gap: 8,
  },
});

export default ImageOptimizationExample;
