import  RFNS from 'react-native-fs';
import {launchImageLibrary} from 'react-native-image-picker';
import { uploadMedia } from './uploads/mediaService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import DocumentPicker, { types } from 'react-native-document-picker';
import { Platform } from 'react-native';

const copyContentUriToFile = async (uri, name) => {
    try {
        // For content:// URIs, we need to copy the file to a temporary location
        const tempPath = `${RFNS.TemporaryDirectoryPath}/temp_${Date.now()}_${name}`;
        
        // Copy the file from content URI to temporary path
        await RFNS.copyFile(uri, tempPath);
        
        return tempPath; // Return the file path without file:// prefix
    } catch (err) {
        console.error("Failed to copy content URI to file: ", err);
        throw err;
    }
}

// Get Media Type from url
function getMediaTypeFromURL(url) {
    const fileExtensionMatch = url.match(/\.([0-9a-z]+)$/i);
    if (fileExtensionMatch) {
      const fileExtension = fileExtensionMatch[1].toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
      const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'MP4'];
  
      if (imageExtensions.includes(fileExtension)) {
        return 'image';
      } else if (videoExtensions.includes(fileExtension)) {
        return 'video';
      }
    }
    return null;
}
// convert file to base64
const fileToBase64 = async (filePath) => {
    try {
      const fileContent = await RFNS.readFile(filePath, 'base64');
      return fileContent;
    } catch (error) {
      console.error('Error converting image to Base64:', error);
      return null;
    }
  };


// Select media functionality
export const SelectMedia =  async (axiosInstance) => {
  try {
    const res = await DocumentPicker.pickSingle({
      type: [types.images, types.video]
    })
    const file = {
      uri: res.uri,
      name: res.name,
      type: res.type,
      size: res.size,
    }
    
    const fileURL = await copyContentUriToFile(file.uri, res.name)

    const {uploadID, totalChunks} = await uploadMedia(fileURL, file.type, axiosInstance)
    try {
      const authToken = await AsyncStorage.getItem("AccessToken");
      const data = {
          "upload_id": uploadID,
          "total_chunks": totalChunks,
          "media_type": file.type
      }
      const response = await axiosInstance.post(`${BASE_URL}/completedChunkUpload`, data, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      return {
        mediaUrl: response.data.data.file_url,
        mediaType: file.type
      }

    } catch (err) {
      console.log("Failed to get file url from upload media:", err);
    }
  } catch {
    console.log('Error in SelectMedia');
  }
};