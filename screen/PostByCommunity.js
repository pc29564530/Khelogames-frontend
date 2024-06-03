import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text, View,Pressable, Image, ScrollView} from 'react-native'
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {setThreads, setLikes} from '../redux/actions/actions';
import Video from 'react-native-video';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import { TouchableOpacity } from 'react-native-gesture-handler';

const PostByCommunity = ({route}) => {
    
    //get the thread by community
    const navigation = useNavigation()
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const threads = useSelector((state) => state.threads.threads)
    const likesCount = useSelector((state) => state.Like)
    const [threadWithUserProfile, setThreadWithUserProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');
    const community = route.params?.communityPageData;

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
                dispatch(setLikes(id, newLikeCount.data.like_count))
              } catch (err) {
                console.error(err);
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
      }

      const handleUser = async (username) => {
        try {
          const user = await AsyncStorage.getItem('User');
          if(username === undefined || username === null) {
            const response = await axiosInstance.get(`${AUTH_URL}/user/${user}`);
            navigation.navigate('Profile', { username: response.data.username });
          } else {
            const response = await axiosInstance.get(`${AUTH_URL}/user/${username}`);
            navigation.navigate('Profile', { username: response.data.username });
          }
  
        } catch (err) {
          console.error(err);
        }
      }

    const fetchThreadByCommunity = async () => {

        try {
            const authToken = AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.get(`${BASE_URL}/getAllThreadByCommunity/${community.communities_name}`,null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            })
            
            const item = response.data;

            if(item === null){
            setThreadWithUserProfile([]);
            dispatch(setThreads([]));
            } else {
            const threadUser = item.map(async (item,index) => {
                const profileResponse = await axiosInstance.get(`${AUTH_URL}/getProfile/${item.username}`);
                if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
                const usernameInitial = profileResponse.data.owner ? profileResponse.data.owner.charAt(0) : '';
                setDisplayText(usernameInitial.toUpperCase());
                } else {
                setDisplayText(''); // Reset displayText if the avatar is present
                }
                return {...item, profile: profileResponse.data}
            });
            const threadsWithUserData = await Promise.all(threadUser);
            setThreadWithUserProfile(threadsWithUserData);
            dispatch(setThreads(threadsWithUserData))
            }

        } catch(e) {
            console.error("unable to get the thread by community: ", e);
        }
    }

    useEffect(()=> {
        fetchThreadByCommunity();
    }, []);

    return (
        <ScrollView nestedScrollEnabled={true} contentContainerStyle={{ height: 1070 }}>
            {threads.map((item,i) => (
                <View key={i} style={tailwind`bg-black mt-0.5 `}>
                    <View >
                        <Pressable style={tailwind`flex-row items-center p-2`} onPress={() => {handleUser(item.username)}}>
                          {item.profile && item.profile.avatar_url ? (
                              <Image source={{uri: item.profile.avatar_url}} style={tailwind`w-12 h-12 aspect-w-1 aspect-h-1 rounded-full bg-white`} />
                            ):(
                              <View style={tailwind`w-12 h-12 rounded-12 bg-white items-center justify-center`}>
                                <Text style={tailwind`text-red-500 text-6x3`}>
                                  {displayText}
                                </Text>
                              </View>
                            )
                          }
                          
                          <View style={tailwind`ml-3`}>
                            <Text style={tailwind`font-bold text-white`}>{item.profile && item.profile.full_name?item.profile.full_name:''}</Text>
                            <Text style={tailwind`text-white`}>@{item.username}</Text>
                          </View>
                        </Pressable>
                    </View>
                    <Text style={tailwind`text-white p-3 pl-2`}>{item.content}</Text>
                    {item.media_type === 'image' && (
                      <Image
                      style={tailwind`w-full h-80 aspect-w-1 aspect-h-1`}
                        source={{uri:item.media_url}}
                      />
                    )}
                    {item.media_type === 'video' && (
                      <Video style={tailwind`w-full h-80 aspect-w-1 aspect-h-1`}
                      source={{uri:item.media_url}} controls={true} />
                    )}
                    <View style={tailwind`p-2`}>
                      <Text style={tailwind`text-white`}>{item.like_count} Likes</Text>
                    </View>
                    <View style={tailwind`border-b border-white mb-2`}></View>
                    <View style={tailwind`flex-row justify-evenly gap-50`}>
                      <Pressable  style={tailwind`items-center`} onPress={() => handleLikes(item.id)}>
                        <FontAwesome 
                            name="thumbs-o-up"
                            color="white"
                            size={20}
                        />
                        <Text style={tailwind`text-white`}>Like</Text> 
                      </Pressable>
                      <Pressable style={tailwind`items-center`} onPress={() => handleThreadComment(item, item.id)}>
                        <FontAwesome 
                           name="comment-o"
                           color="white"
                           size={20}
                        />
                        <Text style={tailwind`text-white`}>Comment</Text> 
                      </Pressable>
                    </View>
                    <View style={tailwind`border-b border-white mt-2`}></View>
              </View>
              ))}
        </ScrollView>
    );
}

export default PostByCommunity;