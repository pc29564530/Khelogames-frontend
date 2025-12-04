# Image Optimization Guide

This guide covers the image optimization features implemented in the Khelogames application, including optimized image loading, lazy loading, and compression utilities.

## Components

### 1. OptimizedImage

A high-performance image component using `react-native-fast-image` with caching, progressive loading, and error handling.

#### Features
- **Fast Loading**: Uses native image caching for better performance
- **Progressive Loading**: Shows low-quality placeholder while loading
- **Multiple Cache Policies**: Memory, disk, or both
- **Priority Loading**: Control loading priority (low, normal, high)
- **Error Handling**: Fallback images and error states
- **Accessibility**: Built-in accessibility support

#### Usage

```javascript
import { OptimizedImage } from './components/atoms';

// Basic usage
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200 }}
/>

// With placeholder and caching
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  placeholder={require('./placeholder.png')}
  cachePolicy="memory-disk"
  priority="high"
  resizeMode="cover"
  style={{ width: 200, height: 200 }}
/>

// With fallback
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  fallbackSource={require('./fallback.png')}
  onLoad={() => console.log('Loaded')}
  onError={(error) => console.error('Failed', error)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `object\|number` | required | Image source (URI or require()) |
| `placeholder` | `object\|number` | - | Low-quality placeholder |
| `fallbackSource` | `object\|number` | - | Fallback if main source fails |
| `cachePolicy` | `'memory'\|'disk'\|'memory-disk'` | `'memory-disk'` | Cache strategy |
| `resizeMode` | `'cover'\|'contain'\|'stretch'\|'center'` | `'cover'` | How to resize |
| `priority` | `'low'\|'normal'\|'high'` | `'normal'` | Loading priority |
| `showLoadingIndicator` | `boolean` | `true` | Show spinner when no placeholder |
| `onLoad` | `function` | - | Callback when loaded |
| `onError` | `function` | - | Callback on error |

### 2. LazyImage

A lazy-loading image component that loads images only when they're about to enter the viewport.

#### Features
- **Viewport Detection**: Loads only when visible
- **Priority Loading**: Above-the-fold images load immediately
- **Configurable Threshold**: Control when loading starts
- **Root Margin**: Start loading before entering viewport
- **Eager Loading**: Option to disable lazy loading

#### Usage

```javascript
import { LazyImage } from './components/atoms';

// Basic lazy loading
<LazyImage
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200 }}
/>

// With priority and root margin
<LazyImage
  source={{ uri: 'https://example.com/image.jpg' }}
  priority="high"  // Load immediately
  rootMargin={200}  // Start loading 200px before viewport
  onVisible={() => console.log('Image visible')}
/>

// Eager loading (disable lazy loading)
<LazyImage
  source={{ uri: 'https://example.com/image.jpg' }}
  eager={true}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `object\|number` | required | Image source |
| `placeholder` | `object\|number` | - | Placeholder while waiting |
| `priority` | `'low'\|'normal'\|'high'` | `'normal'` | Loading priority |
| `threshold` | `number` | `0.1` | Visibility threshold (0-1) |
| `rootMargin` | `number` | `100` | Pixels before viewport to load |
| `eager` | `boolean` | `false` | Load immediately |
| `onVisible` | `function` | - | Callback when visible |

## Utilities

### Image Compression

Utilities for compressing images before upload, with network-aware quality selection.

#### Features
- **Network-Aware Compression**: Adjust quality based on connection
- **Use Case Presets**: Profile, thumbnail, post, banner
- **Dimension Calculation**: Maintain aspect ratio
- **Size Estimation**: Estimate compressed file size
- **File Size Formatting**: Human-readable file sizes

#### Usage

```javascript
import {
  compressImage,
  compressImageForNetwork,
  compressImageForUseCase,
  getNetworkQuality,
} from './utils/imageCompression';

// Basic compression
const compressed = await compressImage(imageUri, {
  quality: 0.8,
  maxWidth: 1280,
  maxHeight: 1280,
});

// Network-aware compression
const compressed = await compressImageForNetwork(imageUri);

// Use case compression
const profileImage = await compressImageForUseCase(imageUri, 'profile');
const thumbnail = await compressImageForUseCase(imageUri, 'thumbnail');
const postImage = await compressImageForUseCase(imageUri, 'post');
```

#### Network Quality Presets

| Quality | Max Dimensions | Compression |
|---------|---------------|-------------|
| Excellent (5G/WiFi) | 1920x1920 | 90% |
| Good (4G) | 1280x1280 | 80% |
| Fair (3G) | 1024x1024 | 70% |
| Poor (2G) | 720x720 | 50% |

#### Use Case Presets

| Use Case | Max Dimensions | Compression |
|----------|---------------|-------------|
| Profile | 400x400 | 80% |
| Thumbnail | 200x200 | 70% |
| Post | 1280x1280 | 85% |
| Banner | 1920x600 | 90% |

### useImageCompression Hook

React hook for image compression with loading states.

#### Usage

```javascript
import useImageCompression from './hooks/useImageCompression';

function MyComponent() {
  const {
    compress,
    compressForNetwork,
    compressForUseCase,
    compressing,
    error,
    result,
    networkQuality,
  } = useImageCompression();

  const handleImageSelect = async (imageUri) => {
    try {
      const compressed = await compressForNetwork(imageUri);
      // Upload compressed image
      await uploadImage(compressed);
    } catch (err) {
      console.error('Compression failed:', err);
    }
  };

  return (
    <View>
      {compressing && <Text>Compressing...</Text>}
      {error && <Text>Error: {error}</Text>}
      {result && <Text>Size: {formatFileSize(result.size)}</Text>}
    </View>
  );
}
```

## Best Practices

### 1. Choose the Right Component

- **OptimizedImage**: Use for all images that need to load immediately
- **LazyImage**: Use for images below the fold or in long lists
- **Priority**: Set `priority="high"` for above-the-fold images

### 2. Caching Strategy

```javascript
// Static images (logos, icons)
<OptimizedImage cachePolicy="disk" />

// Dynamic images (user content)
<OptimizedImage cachePolicy="memory-disk" />

// Temporary images
<OptimizedImage cachePolicy="memory" />
```

### 3. Compression Strategy

```javascript
// Before upload
const compressed = await compressImageForNetwork(imageUri);

// For specific use cases
const avatar = await compressImageForUseCase(imageUri, 'profile');
const thumb = await compressImageForUseCase(imageUri, 'thumbnail');
```

### 4. Progressive Loading

Always provide placeholders for better UX:

```javascript
<OptimizedImage
  source={{ uri: largeImageUrl }}
  placeholder={{ uri: thumbnailUrl }}
  // or
  placeholder={require('./placeholder.png')}
/>
```

### 5. Error Handling

Provide fallback images:

```javascript
<OptimizedImage
  source={{ uri: imageUrl }}
  fallbackSource={require('./default-avatar.png')}
  onError={(error) => {
    // Log error
    console.error('Image load failed:', error);
  }}
/>
```

### 6. Accessibility

Always provide accessibility labels:

```javascript
<OptimizedImage
  source={{ uri: imageUrl }}
  accessibilityLabel="User profile picture"
/>
```

## Performance Tips

1. **Use appropriate image sizes**: Don't load 4K images for thumbnails
2. **Compress before upload**: Reduce bandwidth and storage costs
3. **Cache aggressively**: Use `memory-disk` for frequently accessed images
4. **Lazy load**: Don't load images that aren't visible
5. **Set priorities**: Load important images first
6. **Provide placeholders**: Improve perceived performance
7. **Monitor network**: Adjust quality based on connection

## Example Implementation

See `components/ImageOptimizationExample.js` for a complete example demonstrating all features.

## Requirements Satisfied

This implementation satisfies the following requirements:

- **11.1**: Progressive image loading with low-quality placeholders ✓
- **11.2**: Local image caching to reduce network requests ✓
- **11.3**: Image compression before upload ✓
- **11.4**: Multiple quality options based on network conditions ✓
- **11.5**: Lazy loading for images outside viewport ✓

## Future Enhancements

- WebP format support for better compression
- Automatic format selection (WebP vs JPEG)
- Image CDN integration
- Advanced caching strategies (LRU cache)
- Preloading for predictive loading
