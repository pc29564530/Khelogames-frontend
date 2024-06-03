import React, { useEffect, useState } from 'react';
import {ScrollView} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import useAxiosInterceptor from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {setThreads, setLikes} from '../redux/actions/actions';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import ThreadItem from './ThreadItems';

const ThreadProfileCompement = ({owner}) => {
    const navigation = useNavigation();
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const likesCount = useSelector((state) => state.Like)
    const [ownername,setOwnername] = useState(owner);
    const [threadWithUserProfile, setThreadWithUserProfile] = useState([]);
    const [hasReplies, setHasReplies] = useState(true);
    const [displayText, setDisplayText] = useState('');
    const handleThreadComment = (item, id) => {
      navigation.navigate('ThreadComment', {item: item, itemId: id})
    }

    const handleLikes = async (id) => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }

        // here when click on like icon call api createLike
        const userCount = await axiosInstance.get(`${BASE_URL}/checkLikeByUser/${id}`, {headers});
        if(userCount.data == 0) {
          const response = await axiosInstance.post(`${BASE_URL}/createLikeThread/${id}`,null, {headers} );
          if(response.status === 200) {
            try {
              const updatedLikeCount = await axiosInstance.get(`${BASE_URL}/countLike/${id}`,null,{headers});
              const updateLikeData = {
                like_count: updatedLikeCount.data,
                id: id
              }

              const newLikeCount = await axiosInstance.put(`${BASE_URL}/update_like`, updateLikeData, {headers});
              dispatch(setLikes(id, newLikeCount.data.like_count));
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
          const response = await axiosInstance.get(`${BASE_URL}/getThreadByUser/${owner}`, {
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
          if (item === null) {
            setThreadWithUserProfile([]);
          } else {
            const threadUser = item.map(async (item, index) => {
              const profileResponse = await axiosInstance.get(`${AUTH_URL}/getProfile/${item.username}`);
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
            // dispatch(setThreads(threadsWithUserData));
          }
        } catch (err) {
          console.error(err);
        }
      };
  
      fetchData();
    }, [owner]); 

    //update the handleUser to directly navigate to profile and profile menu
    const handleUser = async (username) => {
      navigation.navigate('Profile', {username: username})
    }

    return (
        <ScrollView style={tailwind`flex-1 bg-black`} vertical={true} nestedScrollEnabled={true}>
          {!hasReplies ? (
                <View style={tailwind`flex-1 mt-2 shadow-lg bg-white h-40 w-full ml-6 mr-6 items-center justify-center`}>
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
