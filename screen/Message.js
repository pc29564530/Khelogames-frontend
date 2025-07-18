import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, Image, Pressable, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EmojiSelector from 'react-native-emoji-selector';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { BASE_URL } from '../constants/ApiConstants';
import {SelectMedia} from '../services/SelectMedia';

function Message({ route }) {
  const navigation = useNavigation();
  const axiosInstance = useAxiosInterceptor();
  const [receivedMessage, setReceivedMessage] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [allMessage, setAllMessage] = useState([]);
  const profileData = route.params?.profileData;
  const [currentUser, setCurrentUser] = useState('');
  const [showEmojiSelect, setShowEmojiSelect] = useState(false);
  const [mediaType, setMediaType] = useState('');
  const [mediaURL,setMediaURL] = useState('');
  const [uploadImage, setUploadImage] = useState(false);
  
  const wsRef = useRef(null);
  const isMountedRef = useRef(true);

  const handleMediaSelection = async () => {
    const {mediaURL, mediaType} = await SelectMedia(axiosInstance);
    setMediaURL(mediaURL);
    setMediaType(mediaType);
    setUploadImage(true);
  }
    
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        wsRef.current = new WebSocket('ws://192.168.1.3:8080/api/ws', '', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        wsRef.current.onopen = () => {
          console.log("WebSocket connection open");
          console.log("WebSocket Ready: ", wsRef.current.readyState);
        }

        wsRef.current.onmessage = (event) => {
          const rawData = event?.data;
          try {
            if (rawData === null || !rawData) {
              console.error("raw data is undefined");
            } else {
              const message = JSON.parse(rawData);
              if (isMountedRef.current) {
                setReceivedMessage((prevMessages) => [...prevMessages, message]);
              }
            }
          } catch (e) {
            console.error('error parsing json: ', e);
          }
        }

        wsRef.current.onerror = (error) => {
          console.log("Error: ", error);
        }

        wsRef.current.onclose = (event) => {
          console.log("WebSocket connection closed: ", event.reason);
        }
      } catch (e) {
        console.error('unable to setup the websocket', err)
      }
    }

    setupWebSocket();

    return () => {
      isMountedRef.current = false;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const fetchAllMessage = async () => {
      try {
        const user = profileData.owner;
        const authToken = await AsyncStorage.getItem('AccessToken');
        const username = await AsyncStorage.getItem('User');
        
        const response = await axiosInstance.get(`${BASE_URL}/getMessage/${user}`, null, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'content-type': 'application/json'
          }
        });

        setCurrentUser(username);

        if (response.data === null || !response.data) {
            setReceivedMessage([]);
        } else {
            const messageData = response.data.map((item, index) => {
                const timestampStr = item.sent_at;
                const timestamp = new Date(timestampStr);
                const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
                const formattedTime = timestamp.toLocaleString('en-US', options);
                item.sent_at = formattedTime; 
                return item;
            });
          setAllMessage(messageData);
          setReceivedMessage(messageData);
        }
      } catch (e) {
        console.error('Unable to get the message: ', e)
      }
    }
    fetchAllMessage();
  }, []);

  const sendMessage = async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const user = await AsyncStorage.getItem('User');

        const newMessage = {
            content: newMessageContent,
            sender_username: user,
            receiver_username: profileData.owner,
            sent_at: new Date().toISOString(),
            media_url: mediaURL,
            media_type: mediaType,
        }

        if(uploadImage){
            newMessage.media_url =mediaURL;
            newMessage.media_type= mediaType;
            setUploadImage(false);
        }

        wsRef.current.send(JSON.stringify(newMessage));
        setNewMessageContent('');
        setMediaURL('');
        setMediaType('');
    
    } else {
      console.log("WebSocket is not ready");
    }
  }
  const handleEmoji = () => {
    setShowEmojiSelect(!showEmojiSelect);
  };
  
    useLayoutEffect(() => {
      navigation.setOptions({
          headerTitle: "",
          headerStyle: tailwind`bg-red-400`,
          headerLeft: ()=> (
              <View style={tailwind`flex-row items-center gap-4 p-6`}>
                  <AntDesign name="arrowleft" onPress={()=>navigation.goBack()} size={24} color="white" />
                  <View style={tailwind`flex-row gap-4`}>
                      <Image source={{uri: profileData.avatar_url}} style={tailwind`h-8 w-8 rounded-full bg-red-500 mt-1`}/>
                      <View>
                          <Text style={tailwind`text-white`}>{profileData.full_name}</Text>
                          <Text style={tailwind`text-white`}>@{profileData.owner}</Text>
                      </View> 
                  </View>
              </View>
          )
      })
    },[navigation,profileData]);

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
                {(item.media_type == "video/mp4" || item.media_type == "video/quicktime" || item.media_type == "video/mkv") && (
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
        <View style={tailwind`flex-end flex-row items-center p-2 bg-black  justify-between`}>
            <MaterialIcons onPress={handleEmoji} style={tailwind`mt-1`} name="emoji-emotions" size={25} color="white"/>
            <TextInput
                style={tailwind` border border-gray-300 rounded-2xl p-2 text-lg text-black w-60`}
                multiline
                value={newMessageContent}
                onChangeText={(text) => setNewMessageContent(text)}
                placeholder="Enter message..."
                placeholderTextColor="black"
            />
            <FontAwesome onPress={() => handleMediaSelection} name="camera" size={24} color="black" />
            <Pressable onPress={sendMessage} style={tailwind`bg-blue-400 rounded-2xl p-2`}>
                <Text style={tailwind`text-white`}>Send</Text>
            </Pressable>
        </View>
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

export default Message;