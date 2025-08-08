import React, { useEffect, useState } from 'react';
import {ScrollView, View, Text} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import axiosInstance from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {setThreads, setLikes} from '../redux/actions/actions';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import ThreadItem from './ThreadItems';

const ThreadProfileCompement = ({profilePublicID}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const likesCount = useSelector((state) => state.Like)
    const [threadWithUserProfile, setThreadWithUserProfile] = useState([]);
    const [hasReplies, setHasReplies] = useState(true);
    const [displayText, setDisplayText] = useState('');
    const handleThreadComment = (item, threadPublicID) => {
      navigation.navigate('ThreadComment', {item: item, threadPublicID: threadPublicID})
    }

    const handleLikes = async (threadPublicID) => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }

        // here when click on like icon call api createLike
        const userCount = await axiosInstance.get(`${BASE_URL}/checkLikeByUser/${threadPublicID}`, {headers});
        if(userCount.data == 0) {
          const response = await axiosInstance.post(`${BASE_URL}/createLikeThread/${threadPublicID}`,null, {headers} );
          if(response.status === 200) {
            try {
              const updatedLikeCount = await axiosInstance.get(`${BASE_URL}/countLike/${threadPublicID}`,null,{headers});
              const updateLikeData = {
                like_count: updatedLikeCount.data,
                thread_public_id: threadPublicID
              }

              const newLikeCount = await axiosInstance.put(`${BASE_URL}/update_like/${threadPublicID}`, {headers});
              dispatch(setLikes(threadPublicID, newLikeCount.data.like_counts));
            } catch (err) {
              console.error(err);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    useEffect(() => {
      const fetchData = async () => {
        try { 
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getThreadByUser/${profilePublicID}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.data === null || response.data.length === 0) {
                setHasReplies(false);
                return;
            }
            
            const item = response.data;
              setThreadWithUserProfile(item);
              // dispatch(setThreads(threadsWithUserData));
        } catch (err) {
          console.error("Failed to get thread by user: ", err)
        }
      }
      fetchData();
    }, []); 

    return (
        <ScrollView style={tailwind`flex-1 bg-white`} vertical={true} nestedScrollEnabled={true}>
          {!hasReplies ? (
                <View style={tailwind`flex-1 mt-2 ml-2 mr-2 mb-2  h-60 shadow-lg bg-white items-center justify-center`}>
                    <Text style={tailwind`text-black text-xl`}>Not post thread yet</Text>
                </View>
            ) : (threadWithUserProfile.map((item,i) => (
                <ThreadItem 
                    key={i}
                    item={item}
                    handleLikes={handleLikes}
                    handleThreadComment={handleThreadComment}
                    handleUser={handleUser}
                />
            ))
            )
          }
        </ScrollView>
    );
  };

export default ThreadProfileCompement;
