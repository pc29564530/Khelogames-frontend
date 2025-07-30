import React, {useState, useRef, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, KeyboardAvoidingView, TextInput} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import { addComments, setCommentText, setLikes } from '../redux/actions/actions';
import useAxiosInterceptor from './axios_config';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useSelector, useDispatch} from 'react-redux';
import Comment from '../components/Comment'
import tailwind from 'twrnc';
import Video from 'react-native-video';
import { BASE_URL } from '../constants/ApiConstants';
import { useNavigation } from '@react-navigation/native';
import { handleUser, handleLikes } from '../utils/ThreadUtils';
import { addThreadComment } from '../services/commentServices';

function ThreadComment ({route}) {
    const navigation = useNavigation();
    const commentInputRef = useRef();
    const { item, publicID } = route.params;
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const commentText = useSelector((state) => state.comments.commentText)
    const [likeCount, setLikesCount] = useState(useSelector((state) => state.Like));
    const likeCounts = useSelector((state) => state.threads.threads.find((thread) => (thread.id === item.id)).like_count)

      const handleReduxSubmit = async () => {
        addThreadComment({commentText: commentText, dispatch: dispatch, itemPublicID: item.public_id, axiosInstance: axiosInstance})
    }

    useEffect(()=> {
      const handleLikeCount = async () => {
        try {
          const authToken =  await AsyncStorage.getItem('AccessToken');
          const response = await axiosInstance.get(`${BASE_URL}/getThread/${item.id}`, null , {
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
    }, [])

    const handleComment = () => {
      commentInputRef.current.focus();
    }

    navigation.setOptions({
        headerTitle: '',
        headerStyle:tailwind`bg-red-400`,
        headerTintColor:'white'
    });
    return (
        <View style={tailwind`flex-1 bg-white`}>
            <ScrollView  style={tailwind`bg-white`}>
                  <View  style={tailwind`p-2`}>
                      <Pressable style={tailwind`flex-row items-center p-2`} onPress={() => {handleUser({username: item.username, navigation})}}>
                        {item.profile?.avatar_url ? (
                            <Image source={{uri: item.profile.avatar_url}} style={tailwind`w-15 h-15 rounded-full bg-red-400`} />
                          ):(
                            <View style={tailwind`w-15 h-15 rounded-12 bg-red-400 items-center justify-center`}>
                              <Text style={tailwind`text-white text-6x3`}>
                               {item.displayText}
                              </Text>
                            </View>
                          )
                        }
                        
                        <View style={tailwind`ml-3`}>
                          <Text style={tailwind`font-bold text-black text-lg`}>{item.full_name}</Text>
                          <Text style={tailwind`text-black`}>@{item.username}</Text>
                        </View>
                      </Pressable>
                  </View>
                  <Text style={tailwind`text-black pb-10 text-xl`}>{item.content}</Text>
                  {item.media_type === 'image' && (
                    <Image
                    style={tailwind`w-full h-70 aspect-w-1 -mt-7 aspect-h-1 `}
                      source={{uri:item.media_url}}
                    />
                  )}
                  {(item.media_type === "video/mp4" || item.media_type === "video/quicktime" || item.media_type === "video/mkv") && (
                    <Video style={tailwind`w-full h-70 aspect-w-1 aspect-h-1 -mt-7`}
                      source={{uri:item.media_url}} controls={true} />
                  )}
                  <View style={tailwind`p-2`}>
                    <Text style={tailwind`text-black`}>{likeCounts} Likes</Text>
                  </View>
                  <View style={tailwind`w-full h-0.4 bg-gray-200 mb-2`} />
                  <View style={tailwind`flex-row justify-evenly gap-50 h-10 mb-2`}>
                    <Pressable style={tailwind`items-center`} onPress={() => handleLikes({id: itemId, dispatch, axiosInstance})}>
                      <FontAwesome
                        name="thumbs-o-up"
                        color="black"
                        size={20}
                      />
                      <Text style={tailwind`text-black`}>Like</Text>
                    </Pressable>
                    <Pressable style={tailwind`items-center`} onPress={() => handleComment()}>
                      <FontAwesome 
                        name="comment-o"
                        color="black"
                        size={20}
                      />
                      <Text style={tailwind`text-black `}>Comment</Text>
                    </Pressable>
                  </View>
                  <View style={tailwind`w-full h-0.4 bg-gray-200 mb-2`} />
                  <View>
                    <Comment  thread = {item}/>
                  </View>
            </ScrollView>
            <KeyboardAvoidingView style={tailwind`flex-end p-0.2 bg-white justify-between flex-row shadow-lg`}>
              <TextInput
                ref={commentInputRef}
                style={tailwind`p-2 pl-4 w-60 m-2 rounded-2xl border-2 border-gray-300 text-lg text-white`} // Updated border color
                value={commentText}
                onChangeText={(text) => dispatch(setCommentText(text))}
                placeholder="Write a comment..."
                placeholderTextColor="black"
              />
              <Pressable
                style={tailwind`m-3 bg-white items-center w-20 rounded-xl justify-center shadow-lg`}
                onPress={() => handleReduxSubmit()}
              >
                <Text style={tailwind`font-bold text-gray text-lg`}>POST</Text>
              </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
  };

export default ThreadComment;
