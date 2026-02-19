import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { View, Text, Image, Pressable, TextInput, ScrollView, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EmojiSelector from 'react-native-emoji-selector';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import {SelectMedia} from '../services/SelectMedia';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthProfilePublicID, setCurrentProfile } from '../redux/actions/actions';
import { useWebSocket } from '../context/WebSocketContext';
import { handleInlineError } from '../utils/errorHandler';
import Video from 'react-native-video';

function Message({ route }) {
    const navigation = useNavigation();
    const dispatch = useDispatch()
    const [receivedMessage, setReceivedMessage] = useState([]);
    const [newMessageContent, setNewMessageContent] = useState('');
    const authProfilePublicID = useSelector(state => state.profile?.authProfilePublicID)
    const currentProfile = useSelector(state => state.profile.currentProfile);
    const authUserPublicID = useSelector(state => state.profile.authUserPublicID)
    const authProfile = useSelector(state => state.profile.authProfile)
    const [allMessage, setAllMessage] = useState([]);
    const receiverProfile = route?.params?.profileData;
    const [currentUser, setCurrentUser] = useState('');
    const [showEmojiSelect, setShowEmojiSelect] = useState(false);
    const [mediaType, setMediaType] = useState('');
    const [mediaURL,setMediaURL] = useState('');
    const [uploadImage, setUploadImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const user = useSelector((state) => state.user?.user)
    const {wsRef, subscribe} = useWebSocket();
    const scrollViewRef = useRef(null);

    const isMountedRef = useRef(true);


    const fetchProfileData = async () => {
        try {
        const targetPublicID = receiverProfile.public_id
        const response = await axiosInstance.get(`${AUTH_URL}/getProfileByPublicID/${targetPublicID}`);
        dispatch(setCurrentProfile(response.data.data));
        setError({ global: null, fields: {} });
        } catch (err) {
        const backendErrors = err?.response?.data?.error?.fields || {};
        setError({
            global: err?.response?.data?.error?.message || "Unable to load profile.",
            fields: backendErrors,
        })
        console.error('Unable to fetch the profile data: ', err);
        }
    };

  useFocusEffect( useCallback(() => {
    fetchProfileData();
  }, [receiverProfile.public_id, dispatch]));

    // Safe WebSocket subscription — waits for OPEN if still CONNECTING
    useEffect(() => {
        if (!currentProfile?.public_id || !wsRef?.current) return;

        const sendSubscribe = () => {
            try {
                const payloadData = {
                    "type": "SUBSCRIBE",
                    "category": "CHAT",
                    "payload": {"profile_public_id": authProfile.public_id}
                };
                wsRef.current.send(JSON.stringify(payloadData));
                console.log("Subscribed to chat:", authProfile.public_id);
            } catch (err) {
                console.error("Failed to subscribe to chat:", err);
            }
        };

        if (wsRef.current.readyState === WebSocket.OPEN) {
            // Already open — subscribe immediately
            sendSubscribe();
        } else if (wsRef.current.readyState === WebSocket.CONNECTING) {
            // Still connecting — hook into onopen so we subscribe as soon as it opens
            const prevOnOpen = wsRef.current.onopen;
            wsRef.current.onopen = (e) => {
                if (prevOnOpen) prevOnOpen(e);
                sendSubscribe();
            };
        }
        // CLOSING or CLOSED — reconnect will re-mount this effect via wsRef change
    }, [receiverProfile?.public_id, wsRef]);

    const handleMediaSelection = async () => {
        try {
            setSendingMessage(true);
            const {mediaURL, mediaType} = await SelectMedia(axiosInstance);
            setMediaURL(mediaURL);
            setMediaType(mediaType);
            setUploadImage(true);
            setError({ global: null, fields: {} });
        } catch (err) {
            const errorMessage = handleInlineError(err);
            setError({
                global: "Failed to select media. Please try again.",
                fields: {},
            });
            console.error("Media selection failed:", err);
        } finally {
            setSendingMessage(false);
        }
    }

        //Received Message Functionality
    useEffect(() => {
      if (!receiverProfile?.public_id) {
          setError({
              global: "Invalid receiver profile",
              fields: {},
          });
          return;
      }

      const fetchAllMessage = async () => {
        try {
          setLoading(true);
          setError({ global: null, fields: {} });

          const authToken = await AsyncStorage.getItem('AccessToken');
          const userPublicID = await AsyncStorage.getItem('UserPublicID');

          if (!authToken || !userPublicID) {
              throw new Error("Authentication required");
          }

          const response = await axiosInstance.get(`${BASE_URL}/getMessage/${receiverProfile.public_id}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'content-type': 'application/json'
            }
          });
          const item = response.data;

          if (isMountedRef.current) {
              setCurrentUser(userPublicID);
              if (item?.data === null || !item?.data || !Array.isArray(item?.data)) {
                  setReceivedMessage([]);
              } else {
                setAllMessage(item.data);
                setReceivedMessage(item.data);
              }
          }
        } catch (err) {
          if (isMountedRef.current) {
              const backendErrors = err?.response?.data?.error?.fields || {};
              setError({
                  global: "Unable to load messages.",
                  fields: backendErrors,
              });
              console.error("Failed to fetch messages:", err);
          }
        } finally {
          if (isMountedRef.current) {
              setLoading(false);
          }
        }
      }
      fetchAllMessage();

      return () => {
          isMountedRef.current = false;
      };
    }, [receiverProfile?.public_id]);

   const handleWebSocketMessage = useCallback((event) => {
           try {
               const rawData = event?.data;
               if (!rawData) {
                   console.error("WebSocket: raw data is undefined");
                   return;
               }

               const message = JSON.parse(rawData);
               console.log("Message data: ", message);

               if (message?.payload && isMountedRef.current) {
                   setReceivedMessage((prevMessages) => {
                       // Prevent duplicate messages
                       const isDuplicate = prevMessages.some(
                           msg => msg?.id === message.payload?.id && msg?.created_at === message.payload?.created_at
                       );
                       if (isDuplicate) return prevMessages;

                       return [...prevMessages, message.payload];
                   });

                   // Auto scroll to bottom when new message arrives
                   setTimeout(() => {
                       scrollViewRef.current?.scrollToEnd({ animated: true });
                   }, 100);
               }
           } catch (err) {
               console.error("Failed to parse WebSocket message:", err);
           }
       }, [])

       useEffect(() => {
           console.log("Message - Subscribing to WebSocket messages");
           const unsubscribe = subscribe(handleWebSocketMessage);
           return () => {
               if (unsubscribe) unsubscribe();
           };
       }, [handleWebSocketMessage, subscribe])

    //Send Message Functionality
    const sendMessage = async () => {
        if (!wsRef?.current) {
            setError({ global: "Not connected. Please try again.", fields: {} });
            return;
        }

        // If WebSocket is still connecting, wait up to 3 seconds for it to open
        if (wsRef.current.readyState === WebSocket.CONNECTING) {
            try {
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error('timeout')), 3000);
                    const prevOnOpen = wsRef.current.onopen;
                    wsRef.current.onopen = (e) => {
                        clearTimeout(timeout);
                        if (prevOnOpen) prevOnOpen(e);
                        resolve();
                    };
                });
            } catch {
                setError({ global: "Connection timeout. Please try again.", fields: {} });
                return;
            }
        }

        // After waiting (or if not CONNECTING), re-check state
        if (wsRef.current.readyState !== WebSocket.OPEN) {
            setError({ global: "Connection closed. Reconnecting...", fields: {} });
            return;
        }

        if (!newMessageContent.trim() && !uploadImage) {
            return; // Don't send empty messages
        }

        try {
            setSendingMessage(true);
            setError({ global: null, fields: {} });

            if (!authProfilePublicID) {
                throw new Error("User not authenticated");
            }

            const data = {
                sender_public_id: authProfilePublicID,
                receiver_public_id: receiverProfile?.public_id,
                content: newMessageContent.trim(),
                sent_at: new Date().toISOString(),
            }

            if (uploadImage && mediaURL && mediaType) {
                data.media_url = mediaURL;
                data.media_type = mediaType;
            }

            const newMessage = {
                "type": "CREATE_MESSAGE",
                "payload": data
            }

            wsRef.current.send(JSON.stringify(newMessage));

            // Clear input immediately for better UX
            setNewMessageContent('');
            setMediaURL('');
            setMediaType('');
            setUploadImage(false);
            setShowEmojiSelect(false);

            // Auto scroll to bottom after sending
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);

        } catch (err) {
            const backendErrors = err?.response?.data?.error?.fields || {};
            setError({
                global: err?.response?.data?.error?.message || "Failed to send message. Please try again.",
                fields: backendErrors,
            });
            console.error("Failed to send message:", err);
        } finally {
            setSendingMessage(false);
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
                      {receiverProfile?.avatar_url ? (
                          <Image source={{uri: receiverProfile.avatar_url}} style={tailwind`h-8 w-8 rounded-full bg-red-500 mt-1`}/>
                      ) : (
                          <View style={tailwind`h-8 w-8 rounded-full bg-red-500 mt-1 items-center justify-center`}>
                              <Text style={tailwind`text-white text-sm`}>
                                  {receiverProfile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                              </Text>
                          </View>
                      )}
                      <View>
                          <Text style={tailwind`text-white`}>{receiverProfile?.full_name || 'Unknown'}</Text>
                          <Text style={tailwind`text-white`}>@{receiverProfile?.username || 'user'}</Text>
                      </View>
                  </View>
              </View>
          )
      })
    },[navigation, receiverProfile]);

    // Helper function to check if we need a date separator
    const shouldShowDateSeparator = (currentMessage, previousMessage) => {
      if (!previousMessage) return true; // Show for first message

      try {
          const currentDate = new Date(currentMessage?.created_at || currentMessage?.sent_at);
          const previousDate = new Date(previousMessage?.created_at || previousMessage?.sent_at);

          // Check if dates are valid
          if (isNaN(currentDate.getTime()) || isNaN(previousDate.getTime())) {
              return false;
          }

          // Compare dates without time
          const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
          const previousDateOnly = new Date(previousDate.getFullYear(), previousDate.getMonth(), previousDate.getDate());

          return currentDateOnly.getTime() !== previousDateOnly.getTime();
      } catch (err) {
          console.error("Date comparison error:", err);
          return false;
      }
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

    const renderMessage = (item, index) => {
        if (!item) return null;

        try {
            // sender.public_id is a profile UUID; authProfilePublicID is also the profile UUID — correct comparison
            const isMyMessage = item?.sender?.public_id === authProfilePublicID;
            const previousMessage = index > 0 ? receivedMessage[index - 1] : null;
            const showDateSeparator = shouldShowDateSeparator(item, previousMessage);

            return (
              <View key={item?.id || index} style={tailwind`flex-1 px-2`}>
                  {showDateSeparator && renderDateSeparator(item.sent_at || item.created_at)}
                   <View style={[
                      tailwind`flex-row mb-2`,
                      isMyMessage
                        ? tailwind`justify-end`
                        : tailwind`justify-start`,
                      ]}
                    >
                    <View style={[
                            tailwind`p-3 rounded-2xl max-w-[80%]`,
                            isMyMessage
                            ? tailwind`bg-blue-500`
                            : tailwind`bg-gray-300`,
                        ]}
                    >
                        {item?.media_type === 'image' && item?.media_url && (
                            <View style={tailwind`rounded-xl overflow-hidden mb-1`}>
                                <Image
                                    source={{uri: item.media_url}}
                                    style={{ width: 220, height: 160 }}
                                    resizeMode='cover'
                                    onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
                                />
                            </View>
                        )}
                        {(item?.media_type === "video/mp4" || item?.media_type === "video/quicktime" || item?.media_type === "video/mkv") && item?.media_url && (
                            <View style={tailwind`rounded-xl overflow-hidden mb-1 relative`}>
                                <Video
                                    style={tailwind`w-full h-80 aspect-w-16 aspect-h-9`}
                                    source={{ uri: item.media_url }}
                                    controls={true}
                                    resizeMode='cover'
                                    onError={(e) => console.log("Video load error:", e)}
                                />
                            </View>
                        )}
                        {item?.content && (
                            <Text
                                style={[
                                    tailwind`text-base leading-5`,
                                    isMyMessage ? tailwind`text-white` : tailwind`text-gray-900`
                                ]}
                            >
                                {item.content}
                          </Text>
                        )}
                        <Text style={[
                            tailwind`text-xs mt-1`,
                            isMyMessage ? tailwind`text-blue-100` : tailwind`text-gray-500`
                        ]}>
                          {item?.created_at || item?.sent_at ?
                              new Date(item.created_at || item.sent_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                              : '--:--'
                          }
                        </Text>

                    </View>
                  </View>
              </View>
            );
        } catch (err) {
            console.error("Error rendering message:", err);
            return null;
        }
    }

    if (loading) {
      return (
        <View style={tailwind`flex-1 justify-center items-center bg-white`}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={tailwind`mt-4 text-gray-600`}>Loading messages...</Text>
        </View>
      );
    }

    if (!receiverProfile?.public_id) {
        return (
            <View style={tailwind`flex-1 justify-center items-center bg-white p-4`}>
                <MaterialIcons name="error-outline" size={48} color="#ef4444" />
                <Text style={tailwind`mt-4 text-lg text-gray-900 text-center`}>Invalid Chat</Text>
                <Text style={tailwind`mt-2 text-sm text-gray-600 text-center`}>
                    Unable to load chat. Please go back and try again.
                </Text>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={tailwind`mt-4 bg-blue-500 px-6 py-3 rounded-lg`}
                >
                    <Text style={tailwind`text-white font-semibold`}>Go Back</Text>
                </Pressable>
            </View>
        );
    }


  return (
    <View style={tailwind`flex-1 bg-white`}>
      {/* Global Error Banner */}
      {error?.global && (
        <View style={tailwind`bg-red-50 border-b border-red-200 p-3`}>
          <View style={tailwind`flex-row items-center`}>
            <MaterialIcons name="error-outline" size={18} color="#ef4444" />
            <Text style={tailwind`text-sm text-red-800 ml-2 flex-1`}>
              {error.global}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={tailwind`flex-1 bg-white`}
        contentContainerStyle={tailwind`py-4 gap-1`}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        {receivedMessage.length > 0 ? (
            receivedMessage.map((item, index) => renderMessage(item, index))
        ) : (
            <View style={tailwind`flex-1 justify-center items-center py-20`}>
                <MaterialIcons name="chat-bubble-outline" size={64} color="#d1d5db" />
                <Text style={tailwind`mt-4 text-gray-500 text-center`}>
                    No messages yet.{'\n'}Start the conversation!
                </Text>
            </View>
        )}
      </ScrollView>
      <View style={[tailwind`bg-white px-4 py-3 border-t border-gray-100`, { paddingBottom: Platform.OS === 'ios' ? 34 : 16 }]}>
          {/* Media Preview */}
          {uploadImage && mediaURL && (
              <View style={tailwind`mb-2 flex-row items-center bg-gray-50 p-2 rounded-lg`}>
                  {mediaType === 'image' ? (
                      <Image source={{uri: mediaURL}} style={tailwind`w-16 h-16 rounded-lg`} />
                  ) : (
                      <View style={tailwind`w-16 h-16 bg-gray-300 rounded-lg items-center justify-center`}>
                          <AntDesign name="playcircleo" size={24} color="#6b7280" />
                      </View>
                  )}
                  <Text style={tailwind`flex-1 ml-3 text-sm text-gray-700`}>
                      {mediaType === 'image' ? 'Image attached' : 'Video attached'}
                  </Text>
                  <Pressable
                      onPress={() => {
                          setUploadImage(false);
                          setMediaURL('');
                          setMediaType('');
                      }}
                      style={tailwind`p-2`}
                  >
                      <MaterialIcons name="close" size={20} color="#6b7280" />
                  </Pressable>
              </View>
          )}

          <View style={tailwind`flex-row items-end`}>
            {/* Emoji Button */}
            <Pressable
              onPress={handleEmoji}
              style={tailwind`p-2 mr-2`}
              disabled={sendingMessage}
            >
              <MaterialIcons
                name="emoji-emotions"
                size={24}
                color={showEmojiSelect ? "#ef4444" : "#6b7280"}
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
                editable={!sendingMessage}
              />
            </View>

            {/* Media/Send Button */}
            {newMessageContent.trim() || uploadImage ? (
              <Pressable
                onPress={sendMessage}
                disabled={sendingMessage}
                style={[
                    tailwind`rounded-full p-3 shadow-sm`,
                    sendingMessage ? tailwind`bg-gray-400` : tailwind`bg-blue-500`
                ]}
              >
                {sendingMessage ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <MaterialIcons name="send" size={20} color="white" />
                )}
              </Pressable>
            ) : (
              <View style={tailwind`flex-row`}>
                <Pressable
                  onPress={handleMediaSelection}
                  style={tailwind`p-3 mr-1`}
                  disabled={sendingMessage}
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