import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';

function Message({ route }) {
  const axiosInstance = useAxiosInterceptor();
  const [receivedMessage, setReceivedMessage] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const profileData = route.params?.profileData;
  const wsRef = useRef(null);

  useEffect(async () => {
    const authToken = await AsyncStorage.getItem('AccessToken');
    wsRef.current = new WebSocket('ws://10.0.2.2:8080/ws', '', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    wsRef.current.onopen = () => {
      console.log("WebSocket connection open");
      console.log("WebSocket Ready: ", wsRef.current.readyState);
    }

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received Message: ', message);
      setReceivedMessage((prevMessages) => [...prevMessages, message]);
    }

    wsRef.current.onerror = (error) => {
      console.log("Error: ", error);
    }

    wsRef.current.onclose = (event) => {
      console.log("WebSocket connection closed: ", event.reason);
    }
  }, []);

  useEffect(() => {
    const fetchAllMessage = async () => {
      try {
        const user = profileData.owner;
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`http://10.0.2.2:8080/getMessage/${user}`, null, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'content-type': 'application/json'
          }
        });

        if (response.data === null || !response.data) {
          setReceivedMessage([]);
        } else {
          setReceivedMessage(response.data);
        }
      } catch (e) {
        console.error('Unable to get the message: ', e)
      }
    }
    fetchAllMessage();
  }, []);

  const sendMessage = async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const currentUser = await AsyncStorage.getItem('User');
      const newMessage = {
        content: newMessageContent,
        sender_username: currentUser,
        receiver_username: profileData.owner,
        sent_at: new Date().toISOString()
      }
      console.log("Message : ", newMessage)
      wsRef.current.send(JSON.stringify(newMessage));
      setNewMessageContent('');
    } else {
      console.log("WebSocket is not ready");
    }
  }

  return (
    <View style={tailwind`flex-1 bg-white`}>
      <View style={tailwind`flex-1/5 p-4 flex-row items-center`}>
        <Image source={profileData?.avatar_url} style={tailwind`h-20 w-20 rounded-full bg-red-500`} />
        <View style={tailwind`ml-3`}>
          <Text style={tailwind`text-xl font-bold`}>{profileData?.full_name}</Text>
          <Text style={tailwind`text-xl text-gray-500`}>{profileData?.owner}</Text>
        </View>
      </View>
      <ScrollView style={tailwind`flex-4/5 bg-gray-100`}>
        {receivedMessage.map((item, index) => (
          <View key={index} style={tailwind`p-2 border-b border-gray-300`}>
            <Text style={tailwind`text-black`}>{item.content}</Text>
            <Text style={tailwind`text-sm text-gray-500`}>{item.sent_at}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={tailwind`flex-1/5 flex-row items-center p-2 bg-white border-t border-gray-300`}>
        <TextInput
          style={tailwind`flex-1 border border-gray-300 rounded-2xl p-2 text-lg text-black mr-2`}
          multiline
          value={newMessageContent}
          onChangeText={(text) => setNewMessageContent(text)}
          placeholder="Enter message..."
          placeholderTextColor="gray"
        />
        <Pressable onPress={sendMessage}>
          <FontAwesome name="send" size={24} color="black" />
        </Pressable>
      </View>
    </View>
  );
}

export default Message;
