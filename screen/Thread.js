import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Image, Pressable, SafeAreaView, ScrollView, TouchableOpacity} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import useAxiosInterceptor from './axios_config';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {setThreads, setLikes} from '../redux/actions/actions';
import Video from 'react-native-video';
import { BASE_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import ThreadItem from '../components/ThreadItems';
import { handleLikes, handleThreadComment, handleUser } from '../utils/ThreadUtils';

const Thread = () => {
    const navigation = useNavigation()
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const threads = useSelector((state) => state.threads.threads)
    const likesCount = useSelector((state) => state.Like)
    const [username,setUsername] = useState('');
    const [threadWithUserProfile, setThreadWithUserProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');
    
    useEffect(() => {
      const fetchData = async () => {
        try {
          const authToken = await AsyncStorage.getItem('AccessToken');
          const response = await axiosInstance.get(`${BASE_URL}/all_threads`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          });
          const item = response.data;
          if (item === null) {
            setThreadWithUserProfile([]);
            dispatch(setThreads([]));
          } else {
            const threadUser = item.map(async (item, index) => {
              const profileResponse = await axiosInstance.get(`${BASE_URL}/getProfile/${item.username}`);
              let displayText = '';
              if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
                const usernameInitial = profileResponse.data.owner ? profileResponse.data.owner.charAt(0) : '';
                displayText = usernameInitial.toUpperCase();
                setDisplayText(displayText);
              }
              const timestamp  = item.created_at;
              const timeDate = new Date(timestamp)
              const options = { month:'long', day:'2-digit'}
              const formattedTime = timeDate.toLocaleString('en-US', options)
              item.created_at = formattedTime; 
              return { ...item, profile: profileResponse.data, displayText };
            });
            const threadsWithUserData = await Promise.all(threadUser);
            setThreadWithUserProfile(threadsWithUserData);
            dispatch(setThreads(threadsWithUserData));
          }
        } catch (err) {
          console.error(err);
        }
      };
  
      fetchData();
    }, []); 

  
    return (
        <View style={tailwind`flex-1 bg-black`} vertical={true}>
            {threads.map((item,i) => (
              <ThreadItem
                key={i}
                item={item}
                handleUser={handleUser}
                handleLikes={handleLikes}
                handleThreadComment={handleThreadComment}
                axiosInstance={axiosInstance}
              />
            ))}
        </View>
    );
  };

export default Thread;
