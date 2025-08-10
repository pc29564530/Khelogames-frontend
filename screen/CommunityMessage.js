import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Pressable, ScrollView, Image} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { launchImageLibrary } from 'react-native-image-picker';
import  RFNS from 'react-native-fs';
import axiosInstance from './axios_config'; 
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EmojiSelector from 'react-native-emoji-selector';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';


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

function CommunityMessage ({route}) {
    const communityData = route.params.communityPageData;
    const [content, setContent] = useState('');
    const [mediaURL, setMediaURL] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [mediaId, setMediaId] = useState();
    const [contentId, setContentId] = useState();
    const [receivedMessage, setReceivedMessage] = useState([]);
    const [showEmojiSelect, setShowEmojiSelect] = useState(false);
    const [currentUser, setCurrentUser] = useState('');
    const [admin, setAdmin] = useState(false);
    const navigation = useNavigation();

    const handleUpload = () => {
            let options = { 
                noData: false,
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
                      const formData = new FormData();
                      formData.append('media_url', base64File)
                      formData.append('media_type', type)

                      const authToken = await AsyncStorage.getItem("AccessToken")
                      const response = await axiosInstance.post(`${BASE_URL}/createUploadMedia`, formData, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'multipart/form-data',
                        },
                      });

                    setMediaId(response.data.id);
                    } else {
                      console.log('unsupported media type:', type);
                    }
                  }
              });
    }

    const handleContent = async () => {
        try {
            const user = await AsyncStorage.getItem("Users")
            const data = {
                name: communityData.name,
                sender_username: user,
                content: content
            }
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.post(`${BASE_URL}/createCommunityMessage`, data, {
                headers:{
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            setContent(response.data)
            setContentId(response.data.id)
        } catch (err) {
            console.error("unable to create the content", err)
        }
    }

    const handleMessageMedia = async () => {
        try {
            const data = {
                message_id: contentId,
                media_id: mediaId
            }
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/createMessageMedia`,data,{
                headers:{
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            } );
        } catch(err) {
            console.error('unable to send the response: ', err);
        }
    }

    const checkUserAdmim = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken')
            const user = await AsyncStorage.getItem('User');
            const response = await axiosInstance.get(`${BASE_URL}/getCommunityByCommunityName/${communityData.communities_name}`,null,{
                headers:{
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            } );
            const item = response.data;
            if (item.owner === user){
                setAdmin(true);
            }

        } catch(err) {
            console.log("unable to get the community by community name: ", err)
        }
    }

    useEffect(() => {
        const fetchData = async() => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getCommunityMessage`,{
                    headers:{
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                } );
                setReceivedMessage(response.data)
                const user = await AsyncStorage.getItem('Users')
                setCurrentUser(user);
            } catch (err) {
                console.error("unable to fetch the message: ", err);
            }
        }
        checkUserAdmim();
        fetchData();
        
    }, [])

    const handleEmoji = () => {
        setShowEmojiSelect(!showEmojiSelect);
    };

    navigation.setOptions({
        headerTitle:communityData.communities_name,
        headerStyle:{
          backgroundColor: tailwind.color('bg-red-400')
        },
        headerTintColor: 'white'
    });
    
    return (
    <View style={tailwind`flex-1 bg-white`}>
      <ScrollView 
        style={tailwind`flex-3/5 bg-white p-10`}
        contentContainerStyle={tailwind`gap-2`}
      >
        {receivedMessage.map((item, index) => (
          <View key={index} style={[
            tailwind`flex-row items-end`,
            item.sender_username !== currentUser
              ? tailwind`justify-start`
              : tailwind`justify-end`,
          ]}>
            <View style={[
                    tailwind`p-2 border rounded-2xl`,
                    item.sender_username !== currentUser
                    ? tailwind`bg-gray-300`
                    : tailwind`bg-green-200`,
                ]}         
            >
                {item.media_type === 'image'&& (
                    <Image 
                        source={{uri: item.media_url}}
                        style={{ width: 200, height: 200 }}
                    />
                )}
                 {item.media_type === 'video' && (
                    <Video style={tailwind`w-full h-80 aspect-w-16 aspect-h-9`} source={{ uri: item.media_url }} controls={true} onFullscreenPlayerWillPresent={() => {handleFullScreen()}} onVolumeChange={()=>{handleVolume()}} resizeMode='cover'/>
                )}
                {item.content && (
                    <Text
                        style={[
                        tailwind`text-black`,
                        item.media_type === 'image' && tailwind`mt-2`,
                        ]}
                    >
                        {item.content}
                  </Text>
                )}
                <Text style={tailwind`text-sm text-gray-500`}>{item.sent_at}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      {admin ? (
            <View style={tailwind`flex-end flex-row items-center p-2 bg-white  justify-between shadow-lg`}>
                <MaterialIcons onPress={handleEmoji} style={tailwind`mt-1`} name="emoji-emotions" size={25} color="black"/>
                <TextInput
                    style={tailwind` border border-gray-300 rounded-2xl p-2 text-lg text-black w-60`}
                    multiline
                    value={content}
                    onChangeText={setContent}
                    placeholder="Enter message..."
                    placeholderTextColor="black"
                    onEndEditing={handleContent}
                />
                <FontAwesome onPress={handleUpload} name="camera" size={24} color="black" />
                <Pressable onPress={handleMessageMedia} style={tailwind`bg-white rounded-lg p-2 shadow-lg `}>
                    <Text style={tailwind`text-black`}>Send</Text>
                </Pressable>
            </View>
            ):( 
            <View style={tailwind`flex-end flex-row items-center p-2 bg-white  justify-evenly shadow-lg`}>
                    <Text style={tailwind`text-black items-center`}>Only community admin can sent message.</Text>
            </View>
        )}
      {showEmojiSelect && (
        <EmojiSelector
        showSearchBar={false}
        headerStyle={{ backgroundColor: 'lightgray', padding: 10 }}
        style={{ borderColor: 'red', borderWidth: 1, height: 300 }}
        onEmojiSelected={(emoji) => {
           setNewMessageContent((prevMessage) => prevMessage + emoji)
        }}
        />
      )}
    </View>
    );
}

export default CommunityMessage;