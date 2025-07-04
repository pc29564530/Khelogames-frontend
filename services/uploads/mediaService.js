import RNFS from 'react-native-fs';
import * as tus from 'tus-js-client';
import { AUTH_URL, BASE_URL } from '../../constants/ApiConstants';
import { Platform } from 'react-native';
import {TusClient} from 'react-native-tus-client';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';



const   CHUNK_SIZE = 5 * 1024 * 1024;

const createChunk = async (fileUrl, CHUNK_SIZE) => {
    try {
        const file = await RNFS.stat(fileUrl)
        const totalSize = file.size;
        const chunks = [];
        for(let start = 0; start < totalSize; start += CHUNK_SIZE) {
            const end = Math.min(start + CHUNK_SIZE, totalSize);
                chunks.push({
                    start,
                    end,
                    size: end - start,
                    chunkIndex: Math.floor(start / CHUNK_SIZE),
                });
            }
        return {chunks, totalSize, totalChunks: chunks.length};
    } catch (err) {
        console.error("Failed to create chunk: ", err);
    }
}

const readChunk = async (fileUrl, start, CHUNK_SIZE) => {
    try {
        const path = fileUrl.replace('file://', '');
        const tempPath = `${RNFS.TemporaryDirectoryPath}/chunk_${start}.part`;
        
        const fileBuffer = await RNFS.read(path, CHUNK_SIZE, start, 'base64');
        await RNFS.writeFile(tempPath, fileBuffer, 'base64');
        return `file://${tempPath}`;
    } catch(err) {
        console.error("Failed to read chunk: ", err)
    }
}

const uploadChunk = async (chunkData, totalChunks, uploadID, chunkIndex, axiosInstance) => {
    try {
        const formData = new FormData()
        formData.append('uploadId', uploadID)
        formData.append('chunkIndex', chunkIndex)
        formData.append('totalChunks', totalChunks.toString())
        formData.append('chunk', {
            uri: chunkData,
            type: 'application/octet-stream',
            name: `chunk_${chunkIndex}`,
        });
        // console.log("Chunks: ", chunkData)
        console.log("Upload Id: ", uploadID)
        console.log("Chunk Index: ", chunkIndex)
        console.log("Total Chunks: ", totalChunks)
        const authToken = await AsyncStorage.getItem('AccessToken')
        const uploadedDataUrl = await axiosInstance.post(`${BASE_URL}/createUploadChunks`, formData, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'multipart/form-data',
            }
        });
        console.log("Line no Response 73: ", uploadedDataUrl.data)
        return uploadedDataUrl.data
    } catch (err) {
        console.error("Failed to upload the chunks: ", err)
        throw err
    }
}

const generateCustomUUID = () => {
  return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};


export const uploadMedia = async (fileUrl, fileType, axiosInstance) => {

    try {
        console.log("Axios Instance: ", axiosInstance)
        const uploadID = generateCustomUUID()
        console.log("Linen no 324: ", uploadID)
        const {chunks, totalSize, totalChunks} = await createChunk(fileUrl, CHUNK_SIZE);
        for(let i = 0; i <chunks.length; i++){
            const data = chunks[i];
            try {
                const chunkData = await readChunk(fileUrl, data.start, data.size);
                await uploadChunk(chunkData, totalChunks,uploadID, data.chunkIndex, axiosInstance);
                const progress = ((i/totalChunks)*100).toFixed(2);
                console.log("Progress: ", progress)
                // write the progess for total chunks uploaded
            } catch (err) {
                console.error("Failed to upload chunks; ", err)
                throw err
            }

        }
        return {uploadID, totalChunks};

    } catch (err) {
        console.error("Error uploading media: ", err);
        throw(err)
    }
    
}

// export const uploadMediaWithTUS = async (fileUrl, fileType) => {
//     try {
//         const stats = await RNFS.stat(fileUrl); // Use await here
//         const file = {
//             uri: fileUrl,
//             size: stats.size,
//             type: fileType,
//             name: fileUrl.split('/').pop(),
//         };

//         console.log("Starting TUS upload for file:", file.name);
//         console.log("Endpoint:", `http://192.168.1.3:8080/files/`); // Confirm endpoint

//         const tusClient = new TusClient({
//             endpoint: `http://192.168.1.3:8080/files/`,
//         });

//         const upload11 = await tusClient.uploadFile({
//             filePath: fileUrl,
//             fileType: fileType,
//             fileName: fileUrl.name,
//             onProgress: (bytesUploaded, bytesTotal) => {
//                 console.log(`Uploaded ${((bytesUploaded / bytesTotal) * 100).toFixed(2)}%`);
//             },
//             onSuccess: () => {
//                 console.log('TUS upload completed successfully:', upload.url);
//             },
            
//         })

//         const upload = new tus.Upload(file, {
//             endpoint: `http://192.168.1.3:8080/files`,
//             chunkSize: 5 * 1024 * 1024,
//             metadata: {
//                 filename: file.name,
//                 filetype: file.type,
//             },
//             retryDelays: [0, 1000, 3000],
//             onError: (error) => {
//                 console.log("Line no 27: ", metadata)
//                 console.error("TUS upload error:", error);
//                 // Attempt to log more details from the error object
//                 if (error.originalResponse) {
//                     // console.error("Original HTTP Response Status:", error.originalResponse.getStatus());
//                     // console.error("Original HTTP Response Headers:", error.originalResponse.getHeader());
//                     error.originalResponse.getBody().then(body => {
//                         console.error("Original HTTP Response Body:", body);
//                     }).catch(bodyError => {
//                         console.error("Error getting response body:", bodyError);
//                     });
//                 }
//             },
//             onProgress: (bytesUploaded, bytesTotal) => {
//                 console.log(`Uploaded ${((bytesUploaded / bytesTotal) * 100).toFixed(2)}%`);
//             },
//             onSuccess: () => {
//                 console.log('TUS upload completed successfully:', upload.url);
//             },
//         });

//         upload.start();
//     } catch (err) {
//         console.error("Error preparing file for upload:", err);
//     }
// };