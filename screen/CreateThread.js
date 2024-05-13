import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Pressable, ScrollView, Image} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {launchImageLibrary} from 'react-native-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import  RFNS from 'react-native-fs';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import Video from 'react-native-video';
import useAxiosInterceptor from './axios_config';
import AntDesign from 'react-native-vector-icons/AntDesign';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { addNewThreadServices } from '../services/threadsServices';

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

function CreateThread() {
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const axiosInstance = useAxiosInterceptor();
    const route = useRoute();
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [mediaURL,setMediaURL] = useState('');
    const [likeCount, setLikeCount] = useState(0);
    const [communityType, setCommunityType] = useState(route.params?.communityType || 'Select Community')
    const threads = useSelector(state => state.threads.threads)

    const SelectMedia =  async () => {

        let options = { 
            noData: true,
            mediaType: 'mixed',
        }
        
         launchImageLibrary(options, async (res) => {
          
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
        const thread = {
          communities_name: communityType,
          title: title,
          content: content,
          mediaType: mediaType,
          mediaURL: mediaURL,
          likeCount: likeCount,
        };
        addNewThreadServices({dispatch: dispatch, axiosInstance: axiosInstance, thread: thread, navigation: navigation});
    }

    const handleSelectCommunity = () => {
      navigation.navigate('CommunityList', communityType)
    }
    
    useEffect(() => {
      let isMount = true; 
      const fetchData = async () => {
          try {
            if (isMount) {
              if (isFocused && route.params?.communityType) {
                setCommunityType(route.params.communityType);
              }
            }
          } catch (e) {
            console.error("unable to set the community type: ", err)
          }
      }
      fetchData();
      return () => {
        isMount= false;
      };
    }, [isFocused, route.params?.communityType]);
    

    navigation.setOptions({
      headerTitle:'',
      headerStyle:{
        backgroundColor:'black'
      },
      headerStyle: tailwind`border-shadow bg-black`,
      headerTintColor:'black',
      headerLeft: ()=> (
        <View style={tailwind`flex-row items-center gap-35 p-2`}>
            <AntDesign name="arrowleft" onPress={()=>navigation.goBack()} size={24} color="white" />
        </View>
      ),
      headerRight:()=>(
        <View style={tailwind`flex-row items-center mr-2 gap-18`}>
        <Pressable style={tailwind`p-2 flex-row border border-white rounded`} onPress={handleSelectCommunity}>
          <Text style={tailwind`text-white text-lg mr-2`}>{communityType}</Text>
          <AntDesign name="down" size={20} color="white"  style={tailwind`mt-1`}/>
        </Pressable>
        <Pressable style={tailwind`p-2`} onPress={HandleSubmit}>
          <MaterialIcons name="send" size={24} color="white" />
        </Pressable>
      </View>
      )
    })

    return (
        <View style={tailwind`flex-1 p-4 bg-black`}>
            <View style={tailwind`mb-5`}>
              <TextInput
                    style={tailwind` font-bold text-2xl h-24 text-white`}
                    value={title} 
                    onChangeText={setTitle} 
                    placeholder="Write the title here..."
                    placeholderTextColor="white"
                />
                <ScrollView style={tailwind`h-100`}>
                  <TextInput
                      style={tailwind` text-lg text-white`}
                      multiline 
                      value={content} 
                      onChangeText={setContent} 
                      placeholder="Write something here..."
                      placeholderTextColor="white"
                  />
                </ScrollView>
            </View>
            
            {mediaType === 'image' && <Image source={{uri: mediaURL}} />}
            {mediaType === 'video' && <Video source={{uri: mediaURL}} controls={true} />}
            <View style={tailwind`flex-1 justify-end items-end p-4`}>
              <Pressable style={tailwind`bg-gray-400 rounded-full p-2`} onPress={SelectMedia}>
                  <FontAwesome name="image" size={25} color="white" />
              </Pressable>
            </View>
        </View>
    );
}

export default CreateThread;
