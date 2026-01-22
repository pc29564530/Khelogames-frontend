import React, {useState, useRef, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, KeyboardAvoidingView, TextInput, Platform} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import { addComments, setComments, setCommentText, setLikes } from '../redux/actions/actions';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useSelector, useDispatch} from 'react-redux';
import Comment from '../components/Comment'
import tailwind from 'twrnc';
import Video from 'react-native-video';
import { BASE_URL } from '../constants/ApiConstants';
import { useNavigation } from '@react-navigation/native';
import { handleUser, handleLikes } from '../utils/ThreadUtils';
import { addThreadComment } from '../services/commentServices';
import axiosInstance from './axios_config';
import { CommentValidationFields, validateCommentForm } from '../utils/validation/commentValidation';

function ThreadComment ({route}) {
    //TODO: comment count in thread
    const navigation = useNavigation();
    const commentInputRef = useRef();
    const scrollViewRef = useRef();
    const { item, threadPublicID } = route.params;
    console.log("Line no 22: ", item)
    const dispatch = useDispatch();
    const commentText = useSelector((state) => state.comments.commentText)
    const [likeCount, setLikesCount] = useState(useSelector((state) => state.Like));
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [loading, setLoading] = useState(false);
    const likeCounts = useSelector((state) => state.threads.threads.find((thread) => (thread.id === item.id)).like_counts)

    const handleReduxSubmit = async () => {
        setLoading(true);
        try {
            const formData = {
                comment_text: commentText
            }
            const validation = validateCommentForm(formData);
            if(!validation.isValid) {
                setError({
                    global: null,
                    fields: validation.errors,
                })
                return
            }
            const response = await addThreadComment({commentText: commentText, itemPublicID: item.public_id})
            const commentData = response.data;
            dispatch(setComments(commentData || []));
        } catch (err) {
            const backendErrors = err?.response?.data?.error?.fields;
            setError({
                global: "Unable to add comment",
                fields: backendErrors,
            })
            console.error("Unable to add comment: ", err);
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(()=> {
      const handleLikeCount = async () => {
        try {
          const authToken =  await AsyncStorage.getItem('AccessToken');
          const response = await axiosInstance.get(`${BASE_URL}/getThread/${item.public_id}`, null , {
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

    const isValidComment = commentText.trim().length > 0;

    return (
        <KeyboardAvoidingView
            style={tailwind`flex-1 bg-white`}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScrollView
                ref={scrollViewRef}
                style={tailwind`flex-1 bg-white`}
                contentContainerStyle={tailwind`pb-2`}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                bounces={true}
            >
                <View  style={tailwind`bg-white`}>
                    <View  style={tailwind`p-2`}>
                        <Pressable style={tailwind`flex-row items-center p-2`} onPress={() => {handleUser({profilePublicID: item.profile.public_id})}}>
                            {item.profile?.avatar_url ? (
                                <Image source={{uri: item.profile.avatar_url}} style={tailwind`w-15 h-15 rounded-full bg-red-400`} />
                            ):(
                                <View style={tailwind`w-15 h-15 rounded-12 bg-red-400 items-center justify-center`}>
                                    <Text style={tailwind`text-white text-6x3`}>
                                        {item.displayText}
                                    </Text>
                                </View>
                            )}

                            <View style={tailwind`ml-3`}>
                                <Text style={tailwind`font-bold text-black text-lg`}>{item?.profile?.full_name}</Text>
                                <Text style={tailwind`text-black`}>@{item.profile.username}</Text>
                            </View>
                        </Pressable>
                    </View>
                    <Text style={tailwind`text-black  text-xl`}>{item.content}</Text>
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
                        <Text style={tailwind`text-black`}>{item.like_count} Like</Text>
                    </View>
                    <View style={tailwind`w-full h-0.4 bg-gray-200 mb-2`} />
                    <View style={tailwind`flex-row justify-evenly gap-50 h-10 mb-2`}>
                        <Pressable style={tailwind`items-center`} onPress={() => handleLikes({threadPublicID: item.public_id, dispatch, axiosInstance})}>
                            <FontAwesome
                                name="thumbs-o-up"
                                color="black"
                                size={20}
                            />
                            <Text style={tailwind`text-black `}>Like</Text>
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
                    <Comment thread={item} />
                </View>
            </ScrollView>
            
            {error?.fields?.comment_text &&  (
                <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                    <Text style={tailwind`text-red-700 text-sm`}>
                        {error?.fields.comment_text}
                    </Text>
                </View>
            )}
            
            <View style={tailwind`flex-end p-0.2 bg-white justify-between flex-row shadow-lg border-t border-gray-200`}>
                <TextInput
                    ref={commentInputRef}
                    style={tailwind`p-2 pl-4 w-60 m-2 rounded-2xl border-2 border-gray-300 text-lg text-black`}
                    value={commentText}
                    onChangeText={(text) => dispatch(setCommentText(text))}
                    placeholder="Write a comment..."
                    placeholderTextColor="black"
                    multiline
                    maxLength={500}
                />
                <Pressable
                    disabled={!isValidComment}
                    style={[tailwind`m-3 bg-white items-center w-20 rounded-xl justify-center shadow-lg`, isValidComment ? tailwind`bg-red-400` : tailwind`bg-gray-400`]}
                    onPress={() => handleReduxSubmit()}
                >
                    <Text style={[tailwind`font-bold text-white text-lg`]}>POST</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
  };

export default ThreadComment;
