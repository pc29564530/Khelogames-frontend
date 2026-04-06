import React, {useState, useEffect} from 'react'
import {View, Text, Dimensions, Pressable, Image, ActivityIndicator, FlatList, Modal, TextInput, ScrollView, StatusBar, TouchableOpacity, ImageBackground} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { SelectMedia } from '../services/SelectMedia';
import Animated, {useSharedValue, useAnimatedScrollHandler, Extrapolation, interpolate, useAnimatedStyle} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { createThumbnail } from "react-native-create-thumbnail";

const MediaScreen = ({item, parentScrollY, headerHeight, collapsedHeight}) => {
    const match = item;
    const navigation = useNavigation();
    const [mediaURL, setMediaURL] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [addMediaModalVisible, setAddMediaModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedHighlight, setSelectedHighlight] = useState(null);
    const [error, setError] = useState({global: null, fields: {}});

    const {height: sHeight, width: sWidth} = Dimensions.get("window");
    const currentScrollY = useSharedValue(0);

    useEffect(() => {
        fetchHighlights();
    }, []);

    const fetchHighlights = async () => {
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem("AccessToken");

            const response = await axiosInstance.get(`${BASE_URL}/getMatchMedia/${match.public_id}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });


            const item = response.data;
            if (item?.success && Array.isArray(item?.data) && item.data.length > 0) {
                // Generate thumbnails safely
                const withThumbnails = await Promise.all(
                    item.data.map(async (highlight) => {
                        if (!highlight.media_url || typeof highlight.media_url !== 'string' || highlight.media_url.trim() === '') {
                            return { ...highlight, thumbnail: null };
                        }

                        try {
                            const headResponse = await fetch(highlight.media_url, { method: 'HEAD' });
                            if (!headResponse.ok) {
                                console.log("Media URL not reachable:", highlight.media_url);
                                return { ...highlight, thumbnail: null };
                            }

                            const thumb = await createThumbnail({
                                url: highlight.media_url,
                                timeStamp: 1000,
                            });

                            return {
                                ...highlight,
                                thumbnail: thumb.path,
                            };
                        } catch (error) {
                            console.log("Thumbnail Error:", error);
                            return {
                                ...highlight,
                                thumbnail: null,
                            };
                        }
                    })
                );
                setHighlights(withThumbnails);
            }
            
        } catch (err) {
            setError({
                global: "Unable to fetch highlights",
                fields: err?.response?.data?.error?.fields || {},
            });
            console.log("Unable to fetch highlights: ", err);
        } finally {
            setLoading(false);
        }
    };

    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeight){
                parentScrollY.value = currentScrollY.value;
            } else {
                parentScrollY.value = event.contentOffset.y;
            }
        }
    });

    const createMatchMedia = async () => {
        if (!mediaURL || !title.trim()) {
            console.log("Missing required fields");
            return;
        }

        try {
            setUploading(true);
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                title: title.trim(),
                description: description.trim(),
                media_url: mediaURL
            };
            const response = await axiosInstance.post(`${BASE_URL}/uploadMatchMedia/${match.public_id}`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            setAddMediaModalVisible(false);
            setMediaURL('');
            setMediaType('');
            setTitle('');
            setDescription('');
            fetchHighlights();
        } catch (err) {
            if(err?.response?.data?.error?.code === "FORBIDDEN"){
                setError({
                    global: err?.response?.data?.error?.message,
                    fields: {},
                })
            } else {
                setError({
                    global: 'Failed to upload highlight',
                    fields: err?.response?.data?.error?.fields || {},
                });
            }
            console.log("Failed to create match media: ", err);
        } finally {
            setUploading(false);
        }
    };

    const handleMediaSelection = async () => {
        try {
            const {mediaURL, mediaType} = await SelectMedia(axiosInstance);
            setMediaURL(mediaURL);
            setMediaType(mediaType);
        } catch (err) {
            console.error("Error selecting media ", err);
        }
    };

    const renderHighlightItem = ({ item, index }) => {
        const isLarge = index === 0 && highlights.length > 1;
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate("VideoPlayer", { item: item })}
                style={tailwind`mb-3 overflow-hidden rounded-xl`}
            >
                <ImageBackground
                    source={{ uri: item.thumbnail || item.media_url }}
                    style={tailwind`w-full h-52 rounded-xl overflow-hidden`}
                    imageStyle={tailwind`rounded-xl`}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.75)']}
                        style={tailwind`flex-1 justify-end p-3 rounded-xl`}
                    >
                        <View style={tailwind`flex-row items-center mb-1`}>
                            <View style={[tailwind`rounded-full p-1 mr-2`, { backgroundColor: 'rgba(239,68,68,0.85)' }]}>
                                <MaterialIcons name="play-arrow" size={14} color="white" />
                            </View>
                            <Text
                                style={tailwind`text-white font-bold ${isLarge ? 'text-base' : 'text-sm'} flex-1`}
                                numberOfLines={2}
                            >
                                {item.title}
                            </Text>
                        </View>
                        {item.description ? (
                            <Text style={tailwind`text-gray-300 text-xs`} numberOfLines={1}>
                                {item.description}
                            </Text>
                        ) : null}
                    </LinearGradient>
                </ImageBackground>
            </TouchableOpacity>
        );
    };

    return (
        <>
            <Animated.ScrollView
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                style={{ backgroundColor: "#0f172a" }}
                contentContainerStyle={{
                    paddingTop: 20,
                    paddingBottom: 100,
                    minHeight: sHeight + 100
                }}
            >
                <View style={tailwind`px-4`}>
                    {/* Header Section */}
                    <Text style={{ fontSize: 20, fontWeight: "700", color: "#f1f5f9" }}>
                        Highlights
                    </Text>
                    <View style={tailwind`bg-red-500 w-full h-0.5 rounded-full mt-1 mb-4`} />

                    {error?.global && (
                        <View style={[tailwind`mb-3 p-3 rounded-xl flex-row items-center`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                            <MaterialIcons name="error-outline" size={16} color="#fca5a5" />
                            <Text style={[tailwind`text-sm ml-2 flex-1`, { color: '#fca5a5' }]}>
                                {error?.global}
                            </Text>
                        </View>
                    )}

                    {/* Highlights List */}
                    { highlights.length > 0 ? (
                        <FlatList
                            data={highlights}
                            renderItem={renderHighlightItem}
                            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={tailwind`py-32 items-center px-8`}>
                            <View style={[tailwind`w-20 h-20 rounded-full items-center justify-center mb-4`, {backgroundColor:"#1e293b"}]}>
                                <MaterialIcons name="videocam-off" size={36} color="#9ca3af" />
                            </View>
                            <Text style={[tailwind`text-base font-semibold mb-1`, {color: "#f1f5f9"}]}>
                                No highlights yet
                            </Text>
                            <Text style={[tailwind`text-center text-sm`, {color: "#94a3b8"}]}>
                                Upload the first match highlight video.
                            </Text>
                        </View>
                    )}
                </View>
            </Animated.ScrollView>

            {/* Floating Action Button */}
            <View style={tailwind`absolute bottom-8 right-6`}>
                <Pressable
                    style={tailwind`bg-red-500 rounded-full px-6 py-4 shadow-2xl items-center justify-center flex-row`}
                    onPress={() => setAddMediaModalVisible(true)}
                >
                    <MaterialIcons name="add" size={24} color="white" />
                    <Text style={tailwind`text-white text-base font-bold ml-2`}>Add Highlight</Text>
                </Pressable>
            </View>

            {/* Modals */}
            <UploadModal
                addMediaModalVisible={addMediaModalVisible}
                setAddMediaModalVisible={setAddMediaModalVisible}
                mediaURL={mediaURL}
                setMediaURL={setMediaURL}
                mediaType={mediaType}
                setMediaType={setMediaType}
                handleMediaSelection={handleMediaSelection}
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                uploading={uploading}
                createMatchMedia={createMatchMedia}
            />
            <HighlightViewerModal
                selectedHighlight={selectedHighlight}
                setSelectedHighlight={setSelectedHighlight}
            />
        </>
    );
};

const UploadModal = ({
    addMediaModalVisible,
    setAddMediaModalVisible,
    mediaURL,
    setMediaURL,
    mediaType,
    setMediaType,
    handleMediaSelection,
    title,
    setTitle,
    description,
    setDescription,
    uploading,
    createMatchMedia,
}) => {
    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={addMediaModalVisible}
            onRequestClose={() => setAddMediaModalVisible(false)}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <Pressable
                    style={tailwind`flex-1`}
                    onPress={() => setAddMediaModalVisible(false)}
                />

                <View style={[tailwind`rounded-t-3xl`, { backgroundColor: '#1e293b' }]}>
                    {/* Handle bar */}
                    <View style={tailwind`items-center pt-3 pb-1`}>
                        <View style={[tailwind`w-10 h-1 rounded-full`, { backgroundColor: '#475569' }]} />
                    </View>

                    {/* Header */}
                    <View style={[tailwind`flex-row items-center justify-between px-5 py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                        <Text style={[tailwind`text-lg font-bold`, { color: '#f1f5f9' }]}>Add Highlight</Text>
                        <Pressable onPress={() => setAddMediaModalVisible(false)} hitSlop={8}>
                            <MaterialIcons name="close" size={22} color="#94a3b8" />
                        </Pressable>
                    </View>

                    <ScrollView style={tailwind`max-h-[90%]`} keyboardShouldPersistTaps="handled">
                        <View style={tailwind`p-5`}>
                            {/* Media Preview / Picker */}
                            {mediaURL ? (
                                <View style={tailwind`mb-5`}>
                                    <View style={[tailwind`h-48 rounded-2xl overflow-hidden`, { backgroundColor: '#0f172a' }]}>
                                        <Video
                                            style={tailwind`w-full h-full`}
                                            source={{ uri: mediaURL }}
                                            paused={true}
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <Pressable
                                        style={[tailwind`absolute top-2 right-2 rounded-full p-1.5`, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
                                        onPress={() => { setMediaURL(''); setMediaType(''); }}
                                    >
                                        <MaterialIcons name="close" size={18} color="#fff" />
                                    </Pressable>
                                </View>
                            ) : (
                                <Pressable
                                    style={[tailwind`mb-5 h-48 rounded-2xl items-center justify-center`, { backgroundColor: '#0f172a', borderWidth: 2, borderStyle: 'dashed', borderColor: '#334155' }]}
                                    onPress={handleMediaSelection}
                                >
                                    <View style={[tailwind`w-14 h-14 rounded-full items-center justify-center mb-2`, { backgroundColor: '#f8717120' }]}>
                                        <MaterialIcons name="videocam" size={30} color="#f87171" />
                                    </View>
                                    <Text style={[tailwind`font-semibold text-sm`, { color: '#cbd5e1' }]}>
                                        Tap to select video
                                    </Text>
                                    <Text style={[tailwind`text-xs mt-1`, { color: '#64748b' }]}>MP4, MOV supported</Text>
                                </Pressable>
                            )}

                            {/* Title Input */}
                            <View style={tailwind`mb-4`}>
                                <Text style={[tailwind`text-xs font-semibold uppercase tracking-wide mb-2`, { color: '#64748b' }]}>
                                    Title *
                                </Text>
                                <TextInput
                                    style={[tailwind`text-sm px-4 py-3 rounded-xl`, { backgroundColor: '#0f172a', color: '#f1f5f9', borderWidth: 1, borderColor: '#334155' }]}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="e.g., Amazing Goal in 90th minute"
                                    placeholderTextColor="#475569"
                                />
                            </View>

                            {/* Description Input */}
                            <View style={tailwind`mb-6`}>
                                <Text style={[tailwind`text-xs font-semibold uppercase tracking-wide mb-2`, { color: '#64748b' }]}>
                                    Description (Optional)
                                </Text>
                                <TextInput
                                    style={[tailwind`text-sm px-4 py-3 rounded-xl`, { backgroundColor: '#0f172a', color: '#f1f5f9', borderWidth: 1, borderColor: '#334155', height: 88, textAlignVertical: 'top' }]}
                                    multiline={true}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Add details about this highlight..."
                                    placeholderTextColor="#475569"
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Upload Button */}
                            <Pressable
                                style={[
                                    tailwind`py-4 rounded-xl items-center flex-row justify-center`,
                                    (!mediaURL || !title.trim() || uploading)
                                        ? { backgroundColor: '#334155' }
                                        : { backgroundColor: '#f87171' },
                                ]}
                                onPress={createMatchMedia}
                                disabled={!mediaURL || !title.trim() || uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <MaterialIcons
                                            name="cloud-upload"
                                            size={18}
                                            color={!mediaURL || !title.trim() ? '#64748b' : 'white'}
                                        />
                                        <Text style={[tailwind`font-bold text-sm ml-2`, (!mediaURL || !title.trim()) ? { color: '#64748b' } : { color: '#ffffff' }]}>
                                            Upload Highlight
                                        </Text>
                                    </>
                                )}
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const HighlightViewerModal = ({selectedHighlight, setSelectedHighlight}) => {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={!!selectedHighlight}
            onRequestClose={() => setSelectedHighlight(null)}
        >
            <View style={tailwind`flex-1 bg-black`}>
                <StatusBar barStyle="light-content" />

                {/* Close Button */}
                <View style={tailwind`absolute top-12 right-5 z-10`}>
                    <Pressable
                        style={[tailwind`rounded-full p-3`, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
                        onPress={() => setSelectedHighlight(null)}
                    >
                        <MaterialIcons name="close" size={24} color="#fff" />
                    </Pressable>
                </View>

                {/* Video Player */}
                {selectedHighlight && (
                    <View style={tailwind`flex-1 justify-center`}>
                        <Video
                            style={tailwind`w-full h-80`}
                            source={{ uri: selectedHighlight.media_url }}
                            controls={true}
                            resizeMode="contain"
                        />

                        {/* Info Section with LinearGradient */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.85)']}
                            style={tailwind`absolute bottom-0 left-0 right-0 p-6`}
                        >
                            <Text style={tailwind`text-white text-xl font-bold mb-2`}>
                                {selectedHighlight.title}
                            </Text>
                            {selectedHighlight.description ? (
                                <Text style={tailwind`text-gray-300 text-sm mb-3`}>
                                    {selectedHighlight.description}
                                </Text>
                            ) : null}
                            <Text style={tailwind`text-gray-400 text-xs`}>
                                {selectedHighlight.timestamp || 'Match Highlight'}
                            </Text>
                        </LinearGradient>
                    </View>
                )}
            </View>
        </Modal>
    );
};

export default MediaScreen;
