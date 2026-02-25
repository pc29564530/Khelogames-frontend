import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, TextInput, Pressable,
    FlatList, Image, KeyboardAvoidingView,
    Platform, ActivityIndicator,
} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import RFNS from 'react-native-fs';
import axiosInstance from './axios_config';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';

// ── helpers ──────────────────────────────────────────────────────────────────
function getMediaTypeFromURL(url) {
    const ext = url.match(/\.([0-9a-z]+)$/i)?.[1]?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return 'image';
    if (['mp4', 'avi', 'mkv', 'mov'].includes(ext)) return 'video';
    return null;
}

const fileToBase64 = async (filePath) => {
    try {
        return await RFNS.readFile(filePath, 'base64');
    } catch (err) {
        console.error('Error converting to base64:', err);
        return null;
    }
};

// ── component — works as a TopTab screen ─────────────────────────────────────
function CommunityMessage({ item, parentScrollY, headerHeight, collapsedHeader }) {
    const community = item;
    const flatListRef = useRef(null);

    const [content, setContent] = useState('');
    const [mediaURL, setMediaURL] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [mediaId, setMediaId] = useState(null);
    const [contentId, setContentId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    // Sync scroll with collapsing header
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            parentScrollY.value = event.contentOffset.y;
        },
    });

    useEffect(() => {
        loadCurrentUser();
        fetchMessages();
        checkIsAdmin();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const user = await AsyncStorage.getItem('User');
            if (user) setCurrentUser(JSON.parse(user)?.username || '');
        } catch (err) {
            console.error('Failed to load current user:', err);
        }
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getCommunityMessage`, {
                params: { community_name: community?.name },
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setMessages(response.data?.data || []);
        } catch (err) {
            setError('Unable to load announcements');
            console.error('Unable to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkIsAdmin = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const parsedUser = user ? JSON.parse(user) : null;
            const response = await axiosInstance.get(
                `${BASE_URL}/getCommunityByCommunityName/${community?.name}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (response.data?.owner === parsedUser?.username) {
                setIsAdmin(true);
            }
        } catch (err) {
            console.error('Unable to check admin status:', err);
        }
    };

    const handleUpload = () => {
        launchImageLibrary({ noData: false, mediaType: 'mixed' }, async (res) => {
            if (res.didCancel || res.error) return;
            const uri = res.assets?.[0]?.uri;
            if (!uri) return;
            const type = getMediaTypeFromURL(uri);
            if (type !== 'image' && type !== 'video') return;

            const base64File = await fileToBase64(uri);
            if (!base64File) return;
            setMediaURL(base64File);
            setMediaType(type);

            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const formData = new FormData();
                formData.append('media_url', base64File);
                formData.append('media_type', type);
                const response = await axiosInstance.post(`${BASE_URL}/createUploadMedia`, formData, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setMediaId(response.data?.id);
            } catch (err) {
                console.error('Failed to upload media:', err);
            }
        });
    };

    const handleSend = async () => {
        if (!content.trim() && !mediaId) return;
        try {
            setSending(true);
            const user = await AsyncStorage.getItem('User');
            const parsedUser = user ? JSON.parse(user) : null;
            const authToken = await AsyncStorage.getItem('AccessToken');

            // 1 — create message
            const msgResponse = await axiosInstance.post(
                `${BASE_URL}/createCommunityMessage`,
                {
                    name: community?.name,
                    sender_username: parsedUser?.username,
                    content: content.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const newContentId = msgResponse.data?.id;
            setContentId(newContentId);

            // 2 — attach media if any
            if (mediaId && newContentId) {
                await axiosInstance.post(
                    `${BASE_URL}/createMessageMedia`,
                    { message_id: newContentId, media_id: mediaId },
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }

            setContent('');
            setMediaURL('');
            setMediaType('');
            setMediaId(null);
            fetchMessages(); // refresh
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send announcement');
        } finally {
            setSending(false);
        }
    };

    // ── render one message bubble ─────────────────────────────────────────────
    const renderMessage = ({ item: msg }) => {
        const isMine = msg.sender_username === currentUser;
        return (
            <View style={[
                tailwind`flex-row mb-3`,
                isMine ? tailwind`justify-end` : tailwind`justify-start`,
            ]}>
                <View style={[
                    tailwind`max-w-4/5 px-4 py-3 rounded-2xl`,
                    isMine
                        ? tailwind`bg-red-400 rounded-tr-sm`
                        : tailwind`bg-white rounded-tl-sm`,
                    { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
                ]}>
                    {!isMine && (
                        <Text style={tailwind`text-xs font-semibold text-red-400 mb-1`}>
                            {msg.sender_username}
                        </Text>
                    )}
                    {msg.media_type === 'image' && msg.media_url && (
                        <Image
                            source={{ uri: msg.media_url }}
                            style={tailwind`w-48 h-48 rounded-xl mb-2`}
                            resizeMode="cover"
                        />
                    )}
                    {msg.content ? (
                        <Text style={[
                            tailwind`text-sm`,
                            isMine ? tailwind`text-white` : tailwind`text-gray-800`,
                        ]}>
                            {msg.content}
                        </Text>
                    ) : null}
                    <Text style={[
                        tailwind`text-xs mt-1`,
                        isMine ? tailwind`text-red-100` : tailwind`text-gray-400`,
                    ]}>
                        {msg.sent_at}
                    </Text>
                </View>
            </View>
        );
    };

    // ── empty state ───────────────────────────────────────────────────────────
    const ListEmpty = () => (
        <View style={tailwind`flex-1 items-center justify-center mt-16`}>
            <View style={tailwind`w-14 h-14 rounded-full bg-gray-100 items-center justify-center mb-3`}>
                <MaterialIcons name="campaign" size={28} color="#9ca3af" />
            </View>
            <Text style={tailwind`text-gray-700 font-semibold text-sm mb-1`}>No Announcements Yet</Text>
            <Text style={tailwind`text-gray-400 text-xs text-center px-8`}>
                {isAdmin
                    ? 'Send the first announcement to your community.'
                    : 'The admin hasn\'t posted any announcements yet.'}
            </Text>
        </View>
    );

    // ── main render ───────────────────────────────────────────────────────────
    return (
        <KeyboardAvoidingView
            style={tailwind`flex-1 bg-gray-50`}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Error banner */}
            {error && (
                <View style={tailwind`mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex-row items-center`}>
                    <MaterialIcons name="error-outline" size={16} color="#ef4444" />
                    <Text style={tailwind`text-red-600 text-xs ml-2 flex-1`}>{error}</Text>
                    <Pressable onPress={() => setError(null)}>
                        <MaterialIcons name="close" size={16} color="#ef4444" />
                    </Pressable>
                </View>
            )}

            {/* Message list */}
            {loading ? (
                <View style={tailwind`flex-1 items-center justify-center`}>
                    <ActivityIndicator size="large" color="#ef4444" />
                </View>
            ) : (
                <Animated.FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(msg, idx) => msg?.id?.toString() ?? idx.toString()}
                    renderItem={renderMessage}
                    ListEmptyComponent={ListEmpty}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop: 12,
                        paddingHorizontal: 16,
                        paddingBottom: 16,
                        flexGrow: 1,
                    }}
                    onContentSizeChange={() =>
                        messages.length > 0 && flatListRef.current?.scrollToEnd({ animated: true })
                    }
                />
            )}

            {/* Preview of selected media */}
            {mediaURL ? (
                <View style={tailwind`mx-4 mb-2 flex-row items-center bg-white rounded-xl p-2`}>
                    <Image
                        source={{ uri: `data:image/${mediaType};base64,${mediaURL}` }}
                        style={tailwind`w-12 h-12 rounded-lg mr-2`}
                        resizeMode="cover"
                    />
                    <Text style={tailwind`flex-1 text-xs text-gray-500`}>Media attached</Text>
                    <Pressable onPress={() => { setMediaURL(''); setMediaType(''); setMediaId(null); }}>
                        <MaterialIcons name="close" size={18} color="#9ca3af" />
                    </Pressable>
                </View>
            ) : null}

            {/* Input bar — only admin can send */}
            {isAdmin ? (
                <View style={[
                    tailwind`flex-row items-end px-3 py-2 bg-white border-t border-gray-100`,
                    { shadowColor: '#000', shadowOffset: { width: 0, height: -1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 4 },
                ]}>
                    <Pressable onPress={handleUpload} style={tailwind`p-2 mr-1`}>
                        <FontAwesome name="camera" size={22} color="#9ca3af" />
                    </Pressable>
                    <TextInput
                        style={[
                            tailwind`flex-1 bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-900`,
                            { maxHeight: 100 },
                        ]}
                        multiline
                        value={content}
                        onChangeText={setContent}
                        placeholder="Write an announcement..."
                        placeholderTextColor="#9ca3af"
                    />
                    <Pressable
                        onPress={handleSend}
                        disabled={sending || (!content.trim() && !mediaId)}
                        style={[
                            tailwind`ml-2 p-2 rounded-full`,
                            content.trim() || mediaId ? tailwind`bg-red-400` : tailwind`bg-gray-200`,
                        ]}
                    >
                        {sending
                            ? <ActivityIndicator size="small" color="white" />
                            : <MaterialIcons name="send" size={20} color={content.trim() || mediaId ? 'white' : '#9ca3af'} />
                        }
                    </Pressable>
                </View>
            ) : (
                <View style={tailwind`px-4 py-3 bg-white border-t border-gray-100 items-center`}>
                    <Text style={tailwind`text-gray-400 text-xs`}>
                        Only the community admin can post announcements.
                    </Text>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

export default CommunityMessage;
