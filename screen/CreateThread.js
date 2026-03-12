import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image, Modal, ActivityIndicator, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import axiosInstance from './axios_config';
import AntDesign from 'react-native-vector-icons/AntDesign';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { addNewThreadServices } from '../services/threadsServices';
import { SelectMedia } from '../services/SelectMedia';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import { addThreads } from '../redux/actions/actions';
import { validateThreadForm } from '../utils/validation/threadValidation';

function CreateThread() {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [communityLoading, setCommunityLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [mediaURL, setMediaURL] = useState('');
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [communityList, setCommunityList] = useState([]);
    const [isCommunityModalVisible, setIsCommunityModalVisible] = useState(false);
    const [error, setError] = useState({ global: null, fields: {} });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle');

    const communityLabel = selectedCommunity?.name || 'Community';

    const handleMediaSelection = async () => {
        try {
            setUploadProgress(0);
            setUploadStatus('uploading');

            const result = await SelectMedia(axiosInstance, (percent) => {
                setUploadProgress(percent);
                setUploadStatus(percent < 100 && percent > 0 ? 'uploading' : 'Media');
            });

            if (result) {
                setMediaURL(result.mediaUrl);
                setMediaType(result.mediaType);
                setUploadStatus('done');
            }
        } catch (err) {
            setError({ global: 'Unable to select media', fields: {} });
            console.error('Unable to select media: ', err);
            setUploadStatus('idle');
        } finally {
            // Reset after a short delay so user sees "Done"
            setTimeout(() => {
                setUploadStatus('idle');
                setUploadProgress(0);
            }, 1500);
        }
    };

    const removeMedia = () => {
        setMediaURL('');
        setMediaType('');
    };

    const fetchCommunity = async () => {
        try {
            setCommunityLoading(true);
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getAllCommunities`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.data.success === true) {
                setCommunityList(response.data.data || []);
            }
        } catch (err) {
            setError({
                global: 'Unable to load communities',
                fields: err.response?.data?.error?.fields || {},
            });
            console.error('Unable to get community: ', err);
        } finally {
            setCommunityLoading(false);
        }
    };

    // Convert MIME type to backend-accepted short type: image | video | gif | link
    const getShortMediaType = (mimeType) => {
        if (!mimeType) return '';
        if (mimeType.startsWith('image/gif')) return 'gif';
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        return '';
    };

    const HandleSubmit = async () => {
        try {
            setLoading(true);
            setError({ global: null, fields: {} });

            const formData = { title, content, mediaURL };
            const validation = validateThreadForm(formData);
            if (!validation.isValid) {
                setError({
                    global: validation.errors.global || null,
                    fields: validation.errors.global ? {} : validation.errors,
                });
                return;
            }

            const thread = {
                community_public_id: selectedCommunity?.public_id,
                title,
                content,
                media_type: getShortMediaType(mediaType),
                media_url: mediaURL,
            };

            const threadCreated = await addNewThreadServices({ thread });
            if(threadCreated.success === true) {
                dispatch(addThreads(threadCreated.data || []));
            }
            navigation.goBack();
        } catch (err) {
            const backendErrors = err.response?.data?.error?.fields || {};
            setError({
                global: backendErrors.global || 'Unable to create thread',
                fields: backendErrors.global ? {} : backendErrors,
            });
            console.error('Unable to create thread: ', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCommunityModal = () => {
        setIsCommunityModalVisible(true);
        fetchCommunity();
    };

    const selectCommunity = (item) => {
        setSelectedCommunity(item);
        setIsCommunityModalVisible(false);
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'New Thread',
            headerStyle: {
                backgroundColor: '#1e293b',
                elevation: 0,
                shadowOpacity: 0,
            },
            headerTintColor: '#e2e8f0',
            headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#f1f5f9' },
            headerTitleAlign: 'center',
            headerLeft: () => (
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={tailwind`ml-4 p-2`}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <AntDesign name="arrowleft" size={22} color="#e2e8f0" />
                </Pressable>
            ),
            headerRight: () => (
                <Pressable
                    onPress={HandleSubmit}
                    disabled={loading}
                    style={[tailwind`mr-4 px-4 py-1.5 rounded-full`, { backgroundColor: '#f87171' }]}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>POST</Text>
                    )}
                </Pressable>
            ),
        });
    }, [navigation, loading, title, content, mediaURL, mediaType]);

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>

            {/* Global Error */}
            {error?.global && (
                <View style={[tailwind`mx-4 mt-3 px-4 py-3 rounded-lg flex-row items-center`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                    <MaterialIcons name="error-outline" size={18} color="#f87171" />
                    <Text style={{ color: '#fca5a5', fontSize: 13, marginLeft: 8, flex: 1 }}>{error.global}</Text>
                </View>
            )}

            <ScrollView style={tailwind`flex-1`} contentContainerStyle={tailwind`pb-32`} keyboardShouldPersistTaps="handled">

                {/* Community Selector */}
                <View style={tailwind`px-4 pt-4`}>
                    <TouchableOpacity
                        onPress={handleOpenCommunityModal}
                        style={[tailwind`flex-row items-center self-start px-3 py-1.5 rounded-full`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}
                    >
                        <MaterialIcons name="group" size={16} color="#94a3b8" />
                        <Text style={{ color: '#cbd5e1', fontSize: 13, marginLeft: 6, marginRight: 4 }}>{communityLabel}</Text>
                        <AntDesign name="down" size={12} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Title Input */}
                <View style={tailwind`px-4 pt-3`}>
                    <TextInput
                        style={[tailwind`text-2xl font-bold`, { color: '#f1f5f9' }]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Title"
                        placeholderTextColor="#475569"
                        multiline
                    />
                    {error?.fields?.title && (
                        <Text style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>* {error.fields.title}</Text>
                    )}
                </View>

                {/* Divider */}
                <View style={[tailwind`mx-4 my-3`, { height: 1, backgroundColor: '#334155' }]} />

                {/* Content Input */}
                <View style={tailwind`px-4`}>
                    <TextInput
                        style={[tailwind`text-base leading-6`, { color: '#e2e8f0' }]}
                        multiline
                        value={content}
                        onChangeText={setContent}
                        placeholder="What's on your mind?"
                        placeholderTextColor="#475569"
                        textAlignVertical="top"
                        minHeight={120}
                    />
                    {error?.fields?.content && (
                        <Text style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>* {error.fields.content}</Text>
                    )}
                </View>

                {/* Media Preview */}
                {mediaURL ? (
                    <View style={[tailwind`mx-4 mt-4 rounded-xl overflow-hidden`, { borderWidth: 1, borderColor: '#334155' }]}>
                        {mediaType === 'image' && (
                            <Image
                                source={{ uri: mediaURL }}
                                style={tailwind`w-full h-64`}
                                resizeMode="cover"
                            />
                        )}
                        {mediaType === 'video' && (
                            <Video
                                source={{ uri: mediaURL }}
                                controls
                                style={tailwind`w-full h-64`}
                                resizeMode="contain"
                            />
                        )}
                        {/* Remove media button */}
                        <Pressable
                            onPress={removeMedia}
                            style={[tailwind`absolute top-2 right-2 rounded-full p-1`, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                        >
                            <MaterialIcons name="close" size={18} color="white" />
                        </Pressable>
                    </View>
                ) : null}
            </ScrollView>

            {/* Bottom Toolbar */}
            <View style={[tailwind`absolute bottom-0 left-0 right-0 px-4 py-3`, { backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155' }]}>

                {/* Progress bar — visible while compressing / uploading */}
                {uploadStatus !== 'idle' && uploadStatus !== 'done' && (
                    <View style={tailwind`mb-2`}>
                        <View style={{
                            height: 4, backgroundColor: '#334155',
                            borderRadius: 2, overflow: 'hidden',
                        }}>
                            <View style={{
                                width: `${uploadProgress}%`, height: '100%',
                                backgroundColor: uploadStatus === 'uploading' ? '#fb923c' : '#f87171',
                                borderRadius: 2,
                            }} />
                        </View>
                        <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2, textAlign: 'right' }}>
                            {uploadStatus === 'uploading'
                            && `Uploading ${Math.min(uploadProgress * 2, 100)}%`}
                        </Text>
                    </View>
                )}

                {/* Media button */}
                <TouchableOpacity
                    onPress={handleMediaSelection}
                    disabled={uploadStatus !== 'idle'}
                    style={[
                        tailwind`flex-row items-center px-3 py-2 rounded-full mr-3 self-start`,
                        { backgroundColor:
                            uploadStatus === 'done'
                                ? '#22c55e20'
                                : uploadStatus !== 'idle'
                                    ? '#f8717120'
                                    : '#334155'
                        },
                    ]}
                >
                    {/* Icon */}
                    {uploadStatus === 'done' ? (
                        <MaterialIcons name="check-circle" size={20} color="#22c55e" />
                    ) : uploadStatus !== 'idle' ? (
                        <ActivityIndicator size="small" color="#f87171" />
                    ) : (
                        <MaterialIcons name="perm-media" size={20} color="#94a3b8" />
                    )}

                    {/* Label */}
                    <Text style={{
                        fontSize: 13, marginLeft: 6, fontWeight: '500',
                        color: uploadStatus === 'done'
                            ? '#22c55e'
                            : uploadStatus !== 'idle'
                                ? '#f87171'
                                : '#94a3b8',
                    }}>
                        {uploadStatus === 'idle'         ? 'Media'
                        : uploadStatus === 'uploading' && `Uploading ${Math.min(uploadProgress * 2, 100)}%`}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Community Selection Modal */}
            <Modal
                transparent
                animationType="slide"
                visible={isCommunityModalVisible}
                onRequestClose={() => setIsCommunityModalVisible(false)}
            >
                <Pressable
                    onPress={() => setIsCommunityModalVisible(false)}
                    style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                >
                    <Pressable style={[tailwind`rounded-t-3xl max-h-120`, { backgroundColor: '#1e293b' }]}>

                        {/* Modal Handle */}
                        <View style={tailwind`items-center pt-3 pb-2`}>
                            <View style={[tailwind`w-10 h-1 rounded-full`, { backgroundColor: '#475569' }]} />
                        </View>

                        {/* Modal Header */}
                        <View style={[tailwind`px-4 pb-3 flex-row items-center justify-between`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                            <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700' }}>Select Community</Text>
                            <Pressable onPress={() => setIsCommunityModalVisible(false)}>
                                <MaterialIcons name="close" size={22} color="#94a3b8" />
                            </Pressable>
                        </View>

                        {/* Community List */}
                        {communityLoading ? (
                            <View style={tailwind`py-12 items-center`}>
                                <ActivityIndicator size="large" color="#f87171" />
                                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 12 }}>Loading communities...</Text>
                            </View>
                        ) : communityList.length === 0 ? (
                            <View style={tailwind`py-12 items-center`}>
                                <MaterialIcons name="group-off" size={40} color="#475569" />
                                <Text style={{ color: '#64748b', fontSize: 13, marginTop: 12 }}>No communities found</Text>
                            </View>
                        ) : (
                            <ScrollView style={tailwind`px-4 py-2`} showsVerticalScrollIndicator={false}>
                                {communityList.map((item, index) => (
                                    <Pressable
                                        key={item.public_id || index}
                                        onPress={() => selectCommunity(item)}
                                        style={[
                                            tailwind`flex-row items-center py-3 px-3 mb-2 rounded-xl`,
                                            {
                                                backgroundColor: selectedCommunity?.public_id === item.public_id ? '#f8717115' : '#0f172a',
                                                borderWidth: 1,
                                                borderColor: selectedCommunity?.public_id === item.public_id ? '#f8717140' : '#334155',
                                            },
                                        ]}
                                    >
                                        <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center mr-3`, { backgroundColor: '#f87171' }]}>
                                            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>
                                                {item.name?.charAt(0)?.toUpperCase() || '?'}
                                            </Text>
                                        </View>
                                        <View style={tailwind`flex-1`}>
                                            <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 14 }}>{item.name}</Text>
                                            {item.description ? (
                                                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                                                    {item.description}
                                                </Text>
                                            ) : null}
                                        </View>
                                        {selectedCommunity?.public_id === item.public_id && (
                                            <MaterialIcons name="check-circle" size={20} color="#f87171" />
                                        )}
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

export default CreateThread;
