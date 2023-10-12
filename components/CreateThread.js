import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Pressable, TouchableOpacity, Image, Video} from 'react-native';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import axios from 'axios';
import {addThreads} from '../redux/actions/actions';
import { useSelector, useDispatch } from 'react-redux';
import  RFNS from 'react-native-fs';
import {PermissionsAndroid} from 'react-native'
import Video from 'react-native-video';
import useAxiosInterceptor from './axios_config';

function getMediaTypeFromURL(url) {
  const fileExtensionMatch = url.match(/\.([0-9a-z]+)$/i);
  if (fileExtensionMatch) {
    const fileExtension = fileExtensionMatch[1].toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp']; // Add more image extensions if needed
    const videoExtensions = ['mp4', 'avi', 'mkv', 'mov']; // Add more video extensions if needed

    if (imageExtensions.includes(fileExtension)) {
      return 'image';
    } else if (videoExtensions.includes(fileExtension)) {
      return 'video';
    }
  }
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

function CreateThread({navigation}) {
    const axiosInstance = useAxiosInterceptor()
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [mediaURL,setMediaURL] = useState('');
    const [likeCount, setLikeCount] = useState(0);
    // const [videoURL, setVideoURL] = useState('');

    const SelectMedia =  async () => {

        // const response = await ImagePicker.launchImageLibraryAsync({
        //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
        //     allowsEditing: false,
        //   });
    
        //   if (!response.canceled) {
        //     setMediaType('image');
        //     setMediaURL(response.uri);
        //   }

        // console.log("line no 19")
        let options = { 
            noData: true,
            mediaType: 'photo',
        }
        
        launchImageLibrary(options, res => {
            if (res.didCancel) {
                console.log('User cancelled photo picker');
              } else if (res.error) {
                console.log('ImagePicker Error: ', response.error);
              } else {
                let source = {uri: res.assets[0].uri};
                const dataType = GetDataTypeFromDataURI(source.uri);
                console.log(dataType)
                if(dataType === 'image') {
                  setMediaType('image');
                  setMediaURL(source.uri);
                }  else if(dataType === 'video') {
                  console.log(source.uri)
                  setMediaType('video');
                  setMediaURL(source.uri);
                  console.log("hello India")
                }
                setLikeCount(0)
              }
          });
    };

    const HandleSubmit = async () => {
        try {
            const thread = {
                title: title,
                content: content,
                mediaType: mediaType,
                mediaURL: mediaURL,
                likeCount: likeCount,
            };

            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post('http://192.168.0.107:8080/create_thread', thread, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            dispatch(addThreads(response.data));
            console.log(response.data)
            navigation.navigate('Home');
        } catch (e) {
            console.error(e);
        }
        
    }

    return (
        <View style={styles.Container}>
            <View style={styles.Bodybox}>   
                <TextInput style={styles.Input} value={title} onChangeText={setTitle} placeholder="Enter Title..."/>
                <TextInput
                    style={[styles.Input, styles.BodyInput]}
                    multiline 
                    value={content} 
                    onChangeText={setContent} 
                    placeholder="Enter body..."
                />
            </View>
            
            {mediaType === 'image' && <Image source={{uri: mediaURL}} />}
            {mediaType === 'video' && <Video source={{uri: mediaURL}} controls={true} />}
            
            <Text style={styles.FileUploadButton} onPress={SelectMedia} >
                <FontAwesome name="upload" size={25} color="#900" /> 
            </Text>
            <Button onPress={HandleSubmit} title="Submit"/>
            
        </View>
    );
}

function GetDataTypeFromDataURI(dataURI) {
  // Regular expression to match the data type in the Data URI
  const regex = /^data:(image|video)\/[a-zA-Z]+;/;
  const match = dataURI.match(regex);

  if (match && match[1]) {
    return match[1]; // Returns "image" or "video" if matched
  }

  return null; // If no match is found or if the match is invalid
}


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        padding: 20,
      },
      Header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
      },
      Bodybox: {
        marginBottom: 20,
      },
      Input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
      },
      BodyInput: {
        height: 100,
      },
      MediaImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
      },
      FileUploadButton: {
        backgroundColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        alignSelf: 'flex-start',
        marginBottom: 20,
      },
      FileUploadIcon: {
        fontSize: 20,
        color: 'white',
      },
});



export default CreateThread;