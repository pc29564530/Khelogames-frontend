import  RFNS from 'react-native-fs';
import {launchImageLibrary} from 'react-native-image-picker';

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

const fileToBase64 = async (filePath) => {
    try {
      const fileContent = await RFNS.readFile(filePath, 'base64');
      return fileContent;
    } catch (error) {
      console.error('Error converting image to Base64:', error);
      return null;
    }
  };

export const SelectMedia =  async () => {

    return new Promise((resolve, reject) =>  {
        let options = { 
            noData: true,
            mediaType: 'mixed',
        }
        
         launchImageLibrary(options, async (res) => {
          
            if (res.didCancel) {
                console.log('User cancelled photo picker');
                reject("User cancelled photo picker");
              } else if (res.error) {
                console.log('ImagePicker Error: ', response.error);
                reject(res.error);
              } else {
                const type = getMediaTypeFromURL(res.assets[0].uri);
                
                if(type === 'image' || type === 'video') {
                  const base64File = await fileToBase64(res.assets[0].uri);
                    resolve({mediaURL: base64File, mediaType: type});
                } else {
                  console.log('unsupported media type:', type);
                }
              }
          });
    });
};