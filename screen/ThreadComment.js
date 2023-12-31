import React, {useState, useRef } from 'react';
import {Video, View, Text, Image, Pressable, ScrollView, KeyboardAvoidingView, TextInput} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import { addComments, setCommentText, setLikes } from '../redux/actions/actions';
import Comment from './Comment';
import useAxiosInterceptor from './axios_config';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useSelector, useDispatch} from 'react-redux';
import tailwind from 'twrnc'
import { useNavigation } from '@react-navigation/native';

function ThreadComment ({route}) {
    const navigation = useNavigation();
    const commentInputRef = useRef();
    const { item, itemId } = route.params;
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const commentText = useSelector((state) => state.comments.commentText)
    const [displayText, setDisplayText] = useState('');

      const handleReduxSubmit = async () => {
        try {
            const authToken =  await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`http://10.0.2.2:8080/createComment/${itemId}`, {comment_text: commentText}, {
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


    const handleLikes = async (id) => {
      try {
        const authUser = await AsyncStorage.getItem('User');
        const authToken = await AsyncStorage.getItem('AccessToken');
        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }

        // here when click on like icon call api createLike
        const userCount = await axiosInstance.get(`http://10.0.2.2:8080/checkLikeByUser/${id}`, {headers});
        if(userCount.data == 0) {
          const response = await axiosInstance.post(`http://10.0.2.2:8080/createLikeThread/${id}`,null, {headers} );
          if(response.status === 200) {
            try {
              const updatedLikeCount = await axiosInstance.get(`http://10.0.2.2:8080/countLike/${id}`,null,{headers});
              const updateLikeData = {
                like_count: updatedLikeCount.data,
                id: id
              }

              const newLikeCount = await axiosInstance.put(`http://10.0.2.2:8080/update_like`, updateLikeData, {headers});
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
              <ScrollView>
              <View  style={tailwind`bg-black mt-1`}>
                    <View  style={tailwind`p-2`}>
                        <Pressable style={tailwind`flex-row items-center p-2`} onPress={() => {handleUser(item.username)}}>
                          {item.profile.avatar_url ? (
                              <Image source={{uri: item.profile.avatar_url}} style={tailwind`w-24 h-24 rounded-full bg-white`} />
                            ):(
                              <View style={tailwind`w-20 h-20 rounded-12 bg-white items-center justify-center`}>
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
                    <Text style={tailwind`text-white p-5 text-xl`}>{item.content}</Text>
                    {item.media_type === 'image' && (
                      <Image
                      style={tailwind`w-full h-70 aspect-w-1 -mt-7 aspect-h-1`}
                        source={{uri:item.media_url}}
                      />
                    )}
                    {item.media_type === 'video' && (
                      <Video style={tailwind`w-full aspect-w-1 aspect-h-1 -mt-7`}
                      source={{uri:item.media_url}} controls={true} />
                    )}
                    <View style={tailwind`p-2`}>
                      <Text style={tailwind`text-white`}>{item.like_count} Likes</Text>
                    </View>
                    <View style={tailwind`border-b border-white mb-2`}></View>
                    <View style={tailwind`flex-row justify-evenly gap-50 h-10`}>
                      <Pressable  style={tailwind`items-center`} onPress={() => handleLikes(item.id)}>
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
                      <Comment  thread = {item} />
                  </View>
              </View>
              </ScrollView>
              <KeyboardAvoidingView style={tailwind`p-2 w-full bg-black items-start`}>
                <TextInput
                    ref={commentInputRef}
                    style={tailwind`p-4 m-2 w-90 rounded-md border-2 border-white text-lg text-white`}
                    value={commentText}
                    onChangeText={(text) => dispatch(setCommentText(text))}
                    placeholder="Write a comment..."
                    placeholderTextColor="white"
                />
                <Pressable style={tailwind`m-2 ml-30 p-4 bg-gray-500 items-center w-40 rounded-md justify-center`} onPress={() => handleReduxSubmit()}>
                    <Text style={tailwind`font-bold text-white text-lg`}>POST</Text>
                </Pressable>
            </KeyboardAvoidingView>
             </View>
    );
  };

export default ThreadComment;
