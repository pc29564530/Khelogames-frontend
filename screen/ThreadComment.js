import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, KeyboardAvoidingView, TextInput, Platform, ActivityIndicator } from 'react-native';
import { addComments, setComments, setCommentText, setLikes } from '../redux/actions/actions';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector, useDispatch } from 'react-redux';
import Comment from '../components/Comment';
import InlineVideoPlayer from '../components/InlineVideoPlayer';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import { useNavigation } from '@react-navigation/native';
import { handleUser, handleLikes  } from '../utils/ThreadUtils';
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
            <Text style={{ color: '#f1f5f9', fontSize: 20, fontWeight: '700' }}>Thread</Text>
        ),
        headerStyle: {
            backgroundColor: '#1e293b',
            elevation: 0,
            shadowOpacity: 0,
        },
        headerTintColor: '#e2e8f0',
        headerTitleAlign: 'center',
        headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
                <AntDesign name="arrowleft" size={24} color="#e2e8f0" />
            </Pressable>
        ),
    });

    const isValidComment = commentText.trim().length > 0;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#0f172a' }}
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
                <View style={{ backgroundColor: '#1e293b', borderBottomWidth: 4, borderBottomColor: '#0f172a' }}>
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
                            <View style={[tailwind`w-12 h-12 rounded-full items-center justify-center`, { backgroundColor: '#f87171' }]}>
                                <Text style={tailwind`text-white text-lg font-bold`}>
                                    {item.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                </Text>
                            </View>
                        )}
                        <View style={tailwind`ml-3 flex-1`}>
                            <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>
                                {item?.profile?.full_name}
                            </Text>
                            <Text style={{ color: '#64748b', fontSize: 13 }}>
                                @{item.profile?.username}
                            </Text>
                        </View>
                    </Pressable>

                    {/* Post Content */}
                    <View style={tailwind`px-4 pb-3`}>
                        <Text style={{ color: '#e2e8f0', fontSize: 15, lineHeight: 22 }}>
                            {item.content}
                        </Text>
                    </View>

                    {/* Media */}
                    {item.media_type === 'image' && item.media_url ? (
                        <Image
                            style={[tailwind`w-full h-80`, { backgroundColor: '#334155' }]}
                            source={{uri: item.media_url}}
                            resizeMode="cover"
                        />
                    ) : null}
                    {item.media_type === 'video' && item.media_url ? (
                        <InlineVideoPlayer item={item} navigation={navigation} />
                    ) : null}

                    <View style={tailwind`px-3 py-2`}>
                        <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>
                            {likeCount || 0} {likeCount === 1 ? 'Like' : 'Likes'}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={[tailwind`flex-row`, { borderTopWidth: 1, borderTopColor: '#334155' }]}>
                        <Pressable
                            style={tailwind`flex-1 flex-row items-center justify-center py-3`}
                            onPress={() => handleLikes({threadPublicID: item.public_id, setError, dispatch})}
                        >
                            <FontAwesome name="thumbs-o-up" color="#94a3b8" size={18} />
                            <Text style={{ color: '#94a3b8', marginLeft: 8, fontWeight: '500' }}>Like</Text>
                        </Pressable>
                        <View style={{ width: 1, backgroundColor: '#334155' }} />
                        <Pressable
                            style={tailwind`flex-1 flex-row items-center justify-center py-3`}
                            onPress={handleComment}
                        >
                            <FontAwesome name="comment-o" color="#94a3b8" size={18} />
                            <Text style={{ color: '#94a3b8', marginLeft: 8, fontWeight: '500' }}>Comment</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Comments Section */}
                <View style={{ backgroundColor: '#1e293b', marginTop: 8 }}>
                    <View style={[tailwind`px-4 py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                        <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>Comments</Text>
                    </View>
                    <Comment thread={item} />
                </View>
            </ScrollView>

            {/* Error Display */}
            {error?.fields?.comment_text && (
                <View style={[tailwind`mx-4 mb-2 px-4 py-3 rounded-lg`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                    <View style={tailwind`flex-row items-center`}>
                        <MaterialIcons name="error-outline" size={18} color="#f87171" />
                        <Text style={{ color: '#fca5a5', fontSize: 13, marginLeft: 8, flex: 1 }}>
                            {error?.fields.comment_text}
                        </Text>
                    </View>
                </View>
            )}

            {/* Comment Input */}
            <View style={{ backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155', paddingHorizontal: 12, paddingVertical: 8 }}>
                <View style={tailwind`flex-row items-center`}>
                    <TextInput
                        ref={commentInputRef}
                        style={[tailwind`flex-1 px-4 py-2 mr-2 rounded-full text-base`, { backgroundColor: '#0f172a', color: '#f1f5f9' }]}
                        value={commentText}
                        onChangeText={(text) => dispatch(setCommentText(text))}
                        placeholder="Write a comment..."
                        placeholderTextColor="#475569"
                        multiline
                        maxLength={500}
                    />
                    <Pressable
                        disabled={!isValidComment || loading}
                        style={[
                            tailwind`px-5 py-2.5 rounded-full items-center justify-center min-w-20`,
                            { backgroundColor: isValidComment && !loading ? '#f87171' : '#334155' }
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
