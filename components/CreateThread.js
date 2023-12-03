import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Pressable, TouchableOpacity, Image} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import {addThreads} from '../redux/actions/actions';
import { useSelector, useDispatch } from 'react-redux';
import  RFNS from 'react-native-fs';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import Video from 'react-native-video';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import Header from './Header';

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
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [mediaURL,setMediaURL] = useState('');
    const [likeCount, setLikeCount] = useState(0);
    const threads = useSelector(state => state.threads.threads)

    const SelectMedia =  async () => {

        let options = { 
            noData: true,
            mediaType: 'mixed',
        }
        
         launchImageLibrary(options, async (res) => {
          //console.log("lin no 82 created image library")
          
            if (res.didCancel) {
                console.log('User cancelled photo picker');
              } else if (res.error) {
                console.log('ImagePicker Error: ', response.error);
              } else {
                const type = getMediaTypeFromURL(res.assets[0].uri);
                
                if(type === 'image' || type === 'video') {
                  const base64File = await fileToBase64(res.assets[0].uri);
                  setMediaURL(base64File)
                  setMediaType(type);
                } else {
                  console.log('unsupported media type:', type);
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
            const response = await axiosInstance.post('http://192.168.0.101:8080/create_thread', thread, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const item = response.data;
            const profileResponse = await axiosInstance.get(`http://192.168.0.101:8080/getProfile/${item.username}`, null, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            })
            const threadItem = {
              item,
              profile: profileResponse.data
            }
            if(item === null || !item) {
              dispatch(addThreads([]));
            } else {
              dispatch(addThreads(item));
            }
            
            navigation.navigate('Home');
        } catch (e) {
            console.error(e);
        }
        
    }

    return (
        <View style={tailwind`flex-1 p-10 bg-black`}>
            <View style={tailwind`flex-row h-25  gap-30 p-2 justify-between`}>
              <Text style={tailwind`text-white font-bold text-lg`}>Edit Profile</Text>
              <FontAwesome
                name="close"
                size={24}
                color="white"
                style={{ marginLeft: 5 }}
                onPress={() => navigation.goBack()}
              />
            </View>
            <View style={tailwind`mb-5`}>   
                <TextInput style={tailwind`border border-gray-300 rounded p-3 mb-10 font-bold text-lg text-white`} value={title} onChangeText={setTitle} placeholder="Enter Title..." placeholderTextColor="white"/>
                <TextInput
                    style={tailwind`border border-gray-300 rounded p-3 mb-10 font-bold text-lg h-24 text-white`}
                    multiline 
                    value={content} 
                    onChangeText={setContent} 
                    placeholder="Enter description..."
                    placeholderTextColor="white"
                />
            </View>
            <Pressable style={tailwind`flex mb-10`} onPress={SelectMedia} >
                <FontAwesome name="upload" size={25} color="white"  style={tailwind`bg-gray-400 h-10 w-10 p-2`}/>
                <Text style={tailwind`text-white`}>Please upload media</Text> 
            </Pressable>
            
            {mediaType === 'image' && <Image source={{uri: mediaURL}} />}
            {mediaType === 'video' && <Video source={{uri: mediaURL}} controls={true} />}
            <Button onPress={HandleSubmit} title="Submit" color="gray"/>
            
        </View>
    );
}

export default CreateThread;
