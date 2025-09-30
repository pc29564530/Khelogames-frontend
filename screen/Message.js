import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, Image, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EmojiSelector from 'react-native-emoji-selector';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { BASE_URL } from '../constants/ApiConstants';
import {SelectMedia} from '../services/SelectMedia';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthProfilePublicID } from '../redux/actions/actions';
import { useWebSocket } from '../context/WebSocketContext';

function Message({ route }) {
    const navigation = useNavigation();
    const [receivedMessage, setReceivedMessage] = useState([]);
    const [newMessageContent, setNewMessageContent] = useState('');
    const authProfilePublicID = useSelector(state => state.profile.authProfilePublicID)
    const [allMessage, setAllMessage] = useState([]);
    const receiverProfile = route.params.profileData;
    const [currentUser, setCurrentUser] = useState('');
    const [showEmojiSelect, setShowEmojiSelect] = useState(false);
    const [mediaType, setMediaType] = useState('');
    const [mediaURL,setMediaURL] = useState('');
    const [uploadImage, setUploadImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state.user.user)
    const wsRef = useWebSocket();
    
    // const wsRef = useRef(null);
    const isMountedRef = useRef(true);

    const handleMediaSelection = async () => {
      const {mediaURL, mediaType} = await SelectMedia(axiosInstance);
      setMediaURL(mediaURL);
      setMediaType(mediaType);
      setUploadImage(true);
    }
      
    useEffect(() => {
      if(!wsRef.current) {
        return
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

    }, []);

    //Recieved Message Functionality
    useEffect(() => {
      const fetchAllMessage = async () => {
        try {
          setLoading(true);
          const authToken = await AsyncStorage.getItem('AccessToken');
          const userPublicID = await AsyncStorage.getItem('UserPublicID');
          const response = await axiosInstance.get(`${BASE_URL}/getMessage/${receiverProfile.public_id}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'content-type': 'application/json'
            }
          });

          setCurrentUser(userPublicID);

          if (response.data === null || !response.data) {
              setReceivedMessage([]);
          } else {
            setAllMessage(response.data);
            setReceivedMessage(response.data);
          }
        } catch (e) {
          console.error('Unable to get the message: ', e)
        } finally {
          setLoading(false);
        }
      }
      fetchAllMessage();
    }, []);

    //Send Message Functionality
    const sendMessage = async () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const userPublicID = await AsyncStorage.getItem('UserPublicID');
          const data = {
              sender_public_id: userPublicID,
              receiver_public_id: receiverProfile.public_id,
              content: newMessageContent,
              media_url: mediaURL,
              media_type: mediaType,
              sent_at: new Date().toISOString(),
          }

          if(uploadImage){
              data.media_url = mediaURL;
              data.media_type= mediaType;
              setUploadImage(false);
          }

          const newMessage = {
              "type": "CREATE_MESSAGE",
              "payload": data
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
                      <Image source={{uri: receiverProfile.avatar_url}} style={tailwind`h-8 w-8 rounded-full bg-red-500 mt-1`}/>
                      <View>
                          <Text style={tailwind`text-white`}>{receiverProfile.full_name}</Text>
                          <Text style={tailwind`text-white`}>@{receiverProfile.username}</Text>
                      </View> 
                  </View>
              </View>
          )
      })
    },[navigation,receiverProfile]);

    // Helper function to check if we need a date separator
    const shouldShowDateSeparator = (currentMessage, previousMessage) => {
      if (!previousMessage) return true; // Show for first message
      
      const currentDate = new Date(currentMessage.created_at);
      const previousDate = new Date(previousMessage.created_at);
      
      // Compare dates without time
      const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const previousDateOnly = new Date(previousDate.getFullYear(), previousDate.getMonth(), previousDate.getDate());
      
      return currentDateOnly.getTime() !== previousDateOnly.getTime();
    };


    const formatDateForSeparator = (dateString) => {
      let messageDate = new Date();
      if (dateString) {
          messageDate = new Date(dateString);
      }

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate()-1);

      // Reset time to compare dates only
      const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      
      if(messageDateOnly.getTime() === todayOnly.getTime()){
          return 'Today';
      } else if(messageDateOnly.getTime() === yesterdayOnly.getTime()){
          return 'Yesterday';
      } else {
        return messageDateOnly.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }

    }

    const renderDateSeparator = (dateString) => {
      console.log("Date String: ", dateString)
      return(
        <View style={tailwind`flex-row items-center my-4`}>
          <View style={tailwind`flex-1 h-px bg-gray-300`} />
          <View style={tailwind`px-4 py-1 bg-gray-200 rounded-full mx-4`}>
            <Text style={tailwind`text-xs text-gray-600 font-medium`}>
              {formatDateForSeparator(dateString)}
            </Text>
          </View>
          <View style={tailwind`flex-1 h-px bg-gray-300`} />
        </View>
      )
    }

    const renderMessage = (item,index) => {
        const isMyMessage = item?.sender?.public_id !== user?.public_id ? false : true;
        const previousMessage = index > 0 ? receivedMessage[index - 1] : null;
        const showDateSeparator = shouldShowDateSeparator(item, previousMessage);
        return (
          <View style={tailwind`flex-1`}>
              {showDateSeparator && renderDateSeparator(item.sent_at || item.created_at)}
               <View key={index} style={[
                  tailwind`flex-row`,
                  isMyMessage
                    ? tailwind`justify-start`
                    : tailwind`justify-end`,
                  ]}
                >
                <View style={[
                        tailwind`p-2 rounded-2xl`,
                        isMyMessage
                        ? tailwind`bg-gray-300`
                        : tailwind`bg-green-200`,
                    ]}         
                >
                    {item.media_type === 'image'&& (
                        <View style={tailwind`rounded-xl overflow-hidden mb-1`}>
                            <Image 
                                source={{uri: item.media_url}}
                                style={{ width: 220, height: 160 }}
                                resizeMode='cover'
                            />
                        </View>
                    )}
                    {(item.media_type == "video/mp4" || item.media_type == "video/quicktime" || item.media_type == "video/mkv") && (
                        <View style={tailwind`rounded-xl overflow-hidden mb-1 relative`}>
                            <Video style={tailwind`w-full h-80 aspect-w-16 aspect-h-9`}
                              source={{ uri: item.media_url }}
                              controls={true}
                              onFullscreenPlayerWillPresent={() => {handleFullScreen()}}
                              onVolumeChange={()=>{handleVolume()}}
                              resizeMode='cover'
                            />
                        </View>
                    )}
                    {item.content && (
                        <Text
                            style={[
                            tailwind`text-base leading-5`,
                            ]}
                        >
                            {item.content}
                      </Text>
                    )}
                    <Text style={tailwind`text-xs text-gray-500`}>
                      {new Date(item.isMyMessage ? item.created_at : item.sent_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>

                </View>
              </View>
          </View>
        )
    }

    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="red" />
          <Text style={{ marginTop: 10 }}>Loading Standings...</Text>
        </View>
      );
    }

    console.log("Received Message: ", receivedMessage)

  return (
    <View style={tailwind`flex-1 bg-white`}>
      <ScrollView 
        style={tailwind`flex-3/5 bg-white pb-16`}
        contentContainerStyle={tailwind`gap-2`}
      > 
        {receivedMessage.map((item, index) => renderMessage(item, index))}
      </ScrollView>
      <View style={[tailwind`bg-white px-4 py-3 border-t border-gray-100`, { paddingBottom: Platform.OS === 'ios' ? 34 : 16 }]}>
          <View style={tailwind`flex-row items-end`}>
            {/* Emoji Button */}
            <Pressable 
              onPress={handleEmoji}
              style={tailwind`p-2 mr-2`}
            >
              <MaterialIcons 
                name="emoji-emotions" 
                size={24} 
                color={showEmojiSelect ? "#3b82f6" : "#6b7280"}
              />
            </Pressable>
            
            {/* Text Input */}
            <View style={tailwind`flex-1 mr-2`}>
              <TextInput
                style={[
                  tailwind`bg-gray-100 rounded-2xl px-4 py-3 text-base text-gray-800`,
                  { minHeight: 44, maxHeight: 120 }
                ]}
                multiline
                value={newMessageContent}
                onChangeText={(text) => setNewMessageContent(text)}
                placeholder="Message..."
                placeholderTextColor="#9ca3af"
                textAlignVertical="center"
              />
            </View>
            
            {/* Media/Send Button */}
            {newMessageContent.trim() || uploadImage ? (
              <Pressable 
                onPress={sendMessage}
                style={tailwind`bg-blue-500 rounded-full p-3 shadow-sm`}
              >
                <MaterialIcons name="send" size={20} color="white" />
              </Pressable>
            ) : (
              <View style={tailwind`flex-row`}>
                <Pressable 
                  onPress={handleMediaSelection}
                  style={tailwind`p-3 mr-1`}
                >
                  <AntDesign name="camera" size={22} color="#6b7280" />
                </Pressable>
              </View>
            )}
          </View>
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