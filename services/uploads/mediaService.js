import RFNS from 'react-native-fs';
import {BASE_URL } from '../../constants/ApiConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';



const   CHUNK_SIZE = 5 * 1024 * 1024;

// Create chunk
const createChunk = async (fileUrl, CHUNK_SIZE) => {
    try {
        const file = await RFNS.stat(fileUrl)
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
        const tempPath = `${RFNS.TemporaryDirectoryPath}/chunk_${start}.part`;
        
        const fileBuffer = await RFNS.read(path, CHUNK_SIZE, start, 'base64');
        await RFNS.writeFile(tempPath, fileBuffer, 'base64');
        return `file://${tempPath}`;
    } catch(err) {
        console.error("Failed to read chunk: ", err)
    }
}
// Upload chunk to database

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

        const authToken = await AsyncStorage.getItem('AccessToken')
        const uploadedDataUrl = await axiosInstance.post(`${BASE_URL}/createUploadChunks`, formData, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'multipart/form-data',
            }
        });
        return uploadedDataUrl.data
    } catch (err) {
        console.error("Failed to upload the chunks: ", err)
        throw err
    }
}

//Generate custom uuid
const generateCustomUUID = () => {
  return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};


export const uploadMedia = async (fileUrl, fileType, axiosInstance) => {

    try {
        // Generate random upload id
        const uploadID = generateCustomUUID()
        const {chunks, totalSize, totalChunks} = await createChunk(fileUrl, CHUNK_SIZE);
        for(let i = 0; i <chunks.length; i++){
            const data = chunks[i];
            try {
                const chunkData = await readChunk(fileUrl, data.start, data.size);
                await uploadChunk(chunkData, totalChunks,uploadID, data.chunkIndex, axiosInstance);
                const progress = ((i/totalChunks)*100).toFixed(2);
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