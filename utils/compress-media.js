import { Video } from 'react-native-compressor';
import  RNFS from 'react-native-fs';

export const compressVideo = async (path) => {
  try {
    const inputPath = path.startsWith("file://")
    ? path
    : `file://${path}`;
    console.log("Input Path: ", inputPath)
    const compressedUri = await Video.compress(
      inputPath,
      {
        compressionMethod: 'auto',
      },
      (progress) => {
        console.log('Compression Progress:', progress);
      }
    );
    console.log("Commpressed Path: ", compressedUri)
    const stat = await RNFS.stat(compressedUri);
    console.log("Compressed size:", stat.size);

    return compressedUri;
  } catch (error) {
    console.log("Compression failed:", error);
    throw error;
  }
};