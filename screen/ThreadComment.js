import React, {useState, useRef, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, KeyboardAvoidingView, TextInput} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import { addComments, setCommentText, setLikes } from '../redux/actions/actions';
import Comment from './Comment';
import useAxiosInterceptor from './axios_config';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useSelector, useDispatch} from 'react-redux';
import tailwind from 'twrnc'
import Video from 'react-native-video';
import { BASE_URL } from '../constants/ApiConstants';
import { useNavigation } from '@react-navigation/native';
import { handleUser, handleLikes } from '../utils/ThreadUtils';

function ThreadComment ({route}) {
    const navigation = useNavigation();
    const commentInputRef = useRef();
    const { item, itemId} = route.params;
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const commentText = useSelector((state) => state.comments.commentText)
    const [displayText, setDisplayText] = useState('');
    const [likeCount, setLikesCount] = useState(useSelector((state) => state.Like))

      const handleReduxSubmit = async () => {
        try {
            const authToken =  await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/createComment/${itemId}`, {comment_text: commentText}, {
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                    'content-type': 'application/json'
                }
            })
            dispatch(addComments(response.data));
            dispatch(setCommentText(''));


        } catch (e) {
            console.error(e);
        }
    }

    useEffect(()=> {
      const handleLikeCount = async () => {
        try {
          const authToken =  await AsyncStorage.getItem('AccessToken');
          const response = await axiosInstance.get(`${BASE_URL}/getThread/${itemId}`, null , {
            headers: { 
              'Authorization': `Bearer ${authToken}`,
              'content-type': 'application/json'
          }
          });
          const updatedLikesCount = response.data.like_count;
          dispatch(setLikes(updatedLikesCount));
          setLikesCount(updatedLikesCount);
        } catch (e) {
          console.error(e);
        }
      };
      handleLikeCount();
    }, [likeCount])

    // const handleLikeCount = () => {
    //   handleLikes({id: itemId, dispatch, axiosInstance});
    // }

    const handleComment = () => {
      commentInputRef.current.focus();
    }

    navigation.setOptions({
        headerTitle: '',
        headerStyle:{
            backgroundColor:'black'
        },
        headerTintColor:'white'
    });
  
    return (
        <View style={tailwind`flex-1 bg-black`}>
            <ScrollView  style={tailwind`bg-black mt-1`}>
                  <View  style={tailwind`p-2`}>
                      <Pressable style={tailwind`flex-row items-center p-2`} onPress={() => {handleUser({username: item.username, navigation})}}>
                        {item.profile?.avatar_url ? (
                            <Image source={{uri: item.profile.avatar_url}} style={tailwind`w-15 h-15 rounded-full bg-white`} />
                          ):(
                            <View style={tailwind`w-15 h-15 rounded-12 bg-white items-center justify-center`}>
                              <Text style={tailwind`text-red-500 text-6x3`}>
                                {displayText}
                              </Text>
                            </View>
                          )
                        }
                        
                        <View style={tailwind`ml-3`}>
                          <Text style={tailwind`font-bold text-white text-lg`}>{item.profile.full_name}</Text>
                          <Text style={tailwind`text-white`}>@{item.username}</Text>
                        </View>
                      </Pressable>
                  </View>
                  <Text style={tailwind`text-white pb-10 text-xl`}>{item.content}</Text>
                  {item.media_type === 'image' && (
                    <Image
                    style={tailwind`w-full h-70 aspect-w-1 -mt-7 aspect-h-1 `}
                      source={{uri:item.media_url}}
                    />
                  )}
                  {item.media_type === 'video' && (
                    <Video style={tailwind`w-full h-70 aspect-w-1 aspect-h-1 -mt-7`}
                      source={{uri:item.media_url}} controls={true} />
                  )}
                  <View style={tailwind`p-2`}>
                    <Text style={tailwind`text-white`}>{likeCount} Likes</Text>
                  </View>
                  <View style={tailwind`border-b border-white mb-2`}></View>
                  <View style={tailwind`flex-row justify-evenly gap-50 h-10`}>
                  <Pressable style={tailwind`items-center`} onPress={() => handleLikes({id: itemId, dispatch, axiosInstance})}>
                    <FontAwesome
                      name="thumbs-o-up"
                      color="white"
                      size={20}
                    />
                    <Text style={tailwind`text-white`}>Like</Text>
                  </Pressable>
                    <Pressable style={tailwind`items-center`} onPress={() => handleComment()}>
                      <FontAwesome 
                        name="comment-o"
                        color="white"
                        size={20}
                      />
                      <Text style={tailwind`text-white `}>Comment</Text>
                    </Pressable>
                  </View>
                  <View style={tailwind`border-b border-white mt-2`}></View>
                  <View>
                    <Comment  thread = {item}/>
                </View>
            </ScrollView>
            <KeyboardAvoidingView style={tailwind`flex-end p-2 bg-black justify-between flex-row`}>
              <TextInput
                ref={commentInputRef}
                style={tailwind`p-2 pl-4 w-60 m-2 rounded-2xl border-2 border-white text-lg text-white`}
                value={commentText}
                onChangeText={(text) => dispatch(setCommentText(text))}
                placeholder="Write a comment..."
                placeholderTextColor="white"
              />
              <Pressable style={tailwind`m-3 bg-gray-500 items-center w-20 rounded-xl justify-center`} onPress={() => handleReduxSubmit()}>
                <Text style={tailwind`font-bold text-white text-lg`}>POST</Text>
              </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
  };

export default ThreadComment;