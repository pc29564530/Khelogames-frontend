import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, KeyboardAvoidingView, TextInput, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addComments, setComments, setCommentText, setLikes } from '../redux/actions/actions';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector, useDispatch } from 'react-redux';
import Comment from '../components/Comment';
import tailwind from 'twrnc';
import Video from 'react-native-video';
import { BASE_URL } from '../constants/ApiConstants';
import { useNavigation } from '@react-navigation/native';
import { handleUser,  } from '../utils/ThreadUtils';
import { addThreadComment } from '../services/commentServices';
import axiosInstance from './axios_config';
import { CommentValidationFields, validateCommentForm } from '../utils/validation/commentValidation';

function ThreadComment ({route}) {
    //TODO: comment count in thread
    const navigation = useNavigation();
    const commentInputRef = useRef();
    const scrollViewRef = useRef();
    const { item, threadPublicID } = route.params;
    const dispatch = useDispatch();
    const commentText = useSelector((state) => state.comments.commentText);

    const likeCount = useSelector(state =>
        state.threads.threads.find(t => t.public_id === item.public_id)?.like_count ?? item.like_count
    );

    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [loading, setLoading] = useState(false);

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
            dispatch(addComments(commentData));
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

    const handleComment = () => {
      commentInputRef.current.focus();
    }

    navigation.setOptions({
        headerTitle: () => (
            <Text style={tailwind`text-xl font-bold text-white`}>Thread</Text>
        ),
        headerStyle: {
            backgroundColor: tailwind.color('red-400'),
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        headerTintColor: 'white',
        headerTitleAlign: 'center',
        headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
                <AntDesign name="arrowleft" size={24} color="white" />
            </Pressable>
        ),
    });

    const isValidComment = commentText.trim().length > 0;

    return (
        <KeyboardAvoidingView
            style={tailwind`flex-1 bg-gray-50`}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScrollView
                ref={scrollViewRef}
                style={tailwind`flex-1`}
                contentContainerStyle={tailwind`pb-2`}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* Main Post Card */}
                <View style={tailwind`bg-white border-b-8 border-gray-100`}>
                    {/* User Info */}
                    <Pressable
                        style={tailwind`flex-row items-center px-4 pt-4 pb-3`}
                        onPress={() => handleUser({profilePublicID: item.profile.public_id, navigation})}
                    >
                        {item.profile?.avatar_url ? (
                            <Image
                                source={{uri: item.profile.avatar_url}}
                                style={tailwind`w-12 h-12 rounded-full`}
                            />
                        ) : (
                            <View style={tailwind`w-12 h-12 rounded-full bg-red-400 items-center justify-center`}>
                                <Text style={tailwind`text-white text-lg font-bold`}>
                                    {item.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                </Text>
                            </View>
                        )}
                        <View style={tailwind`ml-3 flex-1`}>
                            <Text style={tailwind`font-semibold text-gray-900 text-base`}>
                                {item?.profile?.full_name}
                            </Text>
                            <Text style={tailwind`text-gray-500 text-sm`}>
                                @{item.profile?.username}
                            </Text>
                        </View>
                    </Pressable>

                    {/* Post Content */}
                    <View style={tailwind`px-4 pb-3`}>
                        <Text style={tailwind`text-gray-900 text-base leading-6`}>
                            {item.content}
                        </Text>
                    </View>

                    {/* Media */}
                    {item.media_type === 'image' && item.media_url && (
                        <Image
                            style={tailwind`w-full h-80 bg-gray-100`}
                            source={{uri: item.media_url}}
                            resizeMode="cover"
                        />
                    )}
                    {(item.media_type === "video/mp4" || item.media_type === "video/quicktime" || item.media_type === "video/mkv") && item.media_url && (
                        <Video
                            style={tailwind`w-full h-80 bg-gray-900`}
                            source={{uri: item.media_url}}
                            controls={true}
                            resizeMode="contain"
                        />
                    )}

                    <View style={tailwind`px-3 py-2`}>
                        <Text style={tailwind`text-gray-700 text-sm font-medium`}>
                            {likeCount || 0} {likeCount === 1 ? 'Like' : 'Likes'}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={tailwind`flex-row border-t border-gray-100`}>
                        <Pressable
                            style={tailwind`flex-1 flex-row items-center justify-center py-3 active:bg-gray-50`}
                            onPress={() => handleLikes({threadPublicID: item.public_id, setError, dispatch})}
                        >
                            <FontAwesome name="thumbs-o-up" color="#6B7280" size={18} />
                            <Text style={tailwind`text-gray-700 ml-2 font-medium`}>Like</Text>
                        </Pressable>
                        <View style={tailwind`w-px bg-gray-100`} />
                        <Pressable
                            style={tailwind`flex-1 flex-row items-center justify-center py-3 active:bg-gray-50`}
                            onPress={handleComment}
                        >
                            <FontAwesome name="comment-o" color="#6B7280" size={18} />
                            <Text style={tailwind`text-gray-700 ml-2 font-medium`}>Comment</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Comments Section */}
                <View style={tailwind`bg-white mt-2`}>
                    <View style={tailwind`px-4 py-3 border-b border-gray-100`}>
                        <Text style={tailwind`text-gray-900 font-semibold text-base`}>Comments</Text>
                    </View>
                    <Comment thread={item} />
                </View>
            </ScrollView>

            {/* Error Display */}
            {error?.fields?.comment_text && (
                <View style={tailwind`mx-4 mb-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg`}>
                    <View style={tailwind`flex-row items-center`}>
                        <MaterialIcons name="error-outline" size={18} color="#dc2626" />
                        <Text style={tailwind`text-red-700 text-sm ml-2 flex-1`}>
                            {error?.fields.comment_text}
                        </Text>
                    </View>
                </View>
            )}

            {/* Comment Input */}
            <View style={tailwind`bg-white border-t border-gray-200 px-3 py-2 shadow-lg`}>
                <View style={tailwind`flex-row items-center`}>
                    <TextInput
                        ref={commentInputRef}
                        style={tailwind`flex-1 px-4 py-2 mr-2 rounded-full bg-gray-100 text-gray-900 text-base`}
                        value={commentText}
                        onChangeText={(text) => dispatch(setCommentText(text))}
                        placeholder="Write a comment..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        maxLength={500}
                    />
                    <Pressable
                        disabled={!isValidComment || loading}
                        style={[
                            tailwind`px-5 py-2.5 rounded-full items-center justify-center min-w-20`,
                            isValidComment && !loading ? tailwind`bg-red-400` : tailwind`bg-gray-300`
                        ]}
                        onPress={handleReduxSubmit}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={tailwind`font-semibold text-white text-sm`}>POST</Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
  };

export default ThreadComment;
