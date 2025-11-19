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

        let data = response.data || [];

        // Generate thumbnail only once
            const withThumbnails = await Promise.all(
                data.map(async (item) => {
                    try {
                        const thumb = await createThumbnail({
                            url: item.media_url,
                            timeStamp: 1000,
                        });

                        return {
                            ...item,
                            thumbnail: thumb.path,
                        };
                    } catch (error) {
                        console.log("Thumbnail Error:", error);
                        return {
                            ...item,
                            thumbnail: null,
                        };
                    }
                })
            );
        setHighlights(withThumbnails);

    } catch (err) {
        console.error("Error fetching highlights: ", err);
    } finally {
        setLoading(false);
    }
};


    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeight){
                parentScrollY.value = currentScrollY.value
            } else {
                parentScrollY.value = event.contentOffset.y
            }
        }
    });

    const createMatchMedia = async () => {
        if (!mediaURL || !title.trim()) {
            console.log("Missing required fields");
            return;
        }

        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                title: title.trim(),
                description: description.trim(),
                media_url: mediaURL
            }
            const response = await axiosInstance.post(`${BASE_URL}/uploadMatchMedia/${match.public_id}`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            
            // await fetchHighlights();
            setAddMediaModalVisible(false);
            setMediaURL('');
            setMediaType('');
            setTitle('');
            setDescription('');
        } catch (err) {
            console.error("Failed to create match media: ", err)
        }
    }

    const handleMediaSelection = async () => {
        try {
            const {mediaURL, mediaType} = await SelectMedia(axiosInstance);
            setMediaURL(mediaURL);
            setMediaType(mediaType);
        } catch (err) {
            console.error("Error selecting media ", err);
        }
    }

    const renderHighlightItem = ({ item, index }) => {
        const isLarge = index === 0 && highlights.length > 1;
        return (
            <TouchableOpacity 
                onPress={() => navigation.navigate("VideoPlayer", { item: item })}
                style={tailwind`mb-3 overflow-hidden border items-center justify-center`}
            >
                <ImageBackground
                    source={{ uri: item.thumbnail || item.media_url }}
                    style={tailwind`w-full h-60 rounded-xl overflow-hidden`}
                    imageStyle={tailwind`rounded-xl`}
                    resizeMode="cover"
                >
                    <View style={tailwind`flex-1 justify-end p-3 `}>
                        {/* Bottom Section - Title */}
                        <View>
                            <Text style={tailwind`text-white font-bold ${isLarge ? 'text-base' : 'text-sm'}`} numberOfLines={2}>
                                {item.title}
                            </Text>
                        </View>
                    </View>
                </ImageBackground>
                <View style={tailwind`flex-row flex-wrap`}>
                    <Text style={tailwind`text-gray-300 text-xs mt-1`} numberOfLines={2}>
                        {item.description}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };



    const UploadModal = () => (
        <Modal
            transparent={true}
            animationType="slide"
            visible={addMediaModalVisible}
            onRequestClose={() => setAddMediaModalVisible(false)}
        >
            <View style={tailwind`flex-1 bg-black bg-opacity-70`}>
                <Pressable 
                    style={tailwind`flex-1`}
                    onPress={() => setAddMediaModalVisible(false)}
                />
                
                <View style={tailwind`bg-[#1a1a1a] rounded-t-3xl`}>
                    {/* Header */}
                    <View style={tailwind`flex-row items-center justify-between p-5 border-b border-gray-800`}>
                        <Text style={tailwind`text-white text-xl font-bold`}>Add Highlight</Text>
                        <Pressable onPress={() => setAddMediaModalVisible(false)}>
                            <MaterialIcons name="close" size={24} color="#fff" />
                        </Pressable>
                    </View>

                    <ScrollView style={tailwind`max-h-[70%]`}>
                        <View style={tailwind`p-5`}>
                            {/* Media Preview */}
                            {mediaURL ? (
                                <View style={tailwind`mb-5 relative`}>
                                    <View style={tailwind`h-48 bg-gray-800 rounded-2xl overflow-hidden`}>
                                        <Video 
                                            style={tailwind`w-full h-full`} 
                                            source={{ uri: mediaURL }} 
                                            paused={true}
                                            resizeMode='cover'
                                        />
                                    </View>
                                    <Pressable 
                                        style={tailwind`absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-2`}
                                        onPress={() => {setMediaURL(''); setMediaType('');}}
                                    >
                                        <MaterialIcons name="close" size={20} color="#fff" />
                                    </Pressable>
                                </View>
                            ) : (
                                <Pressable 
                                    style={tailwind`mb-5 h-48 bg-gray-800 rounded-2xl items-center justify-center border-2 border-dashed border-gray-600`}
                                    onPress={handleMediaSelection}
                                >
                                    <MaterialIcons name="videocam" size={48} color="#666" />
                                    <Text style={tailwind`text-gray-400 mt-3 font-semibold`}>
                                        Tap to select video
                                    </Text>
                                </Pressable>
                            )}

                            {/* Title Input */}
                            <View style={tailwind`mb-4`}>
                                <Text style={tailwind`text-gray-400 text-sm mb-2 font-semibold`}>
                                    Title *
                                </Text>
                                <TextInput
                                    style={tailwind`bg-gray-800 text-white text-base px-4 py-3 rounded-xl`}
                                    value={title} 
                                    onChangeText={setTitle} 
                                    placeholder="e.g., Amazing Goal in 90th minute"
                                    placeholderTextColor="#666"
                                />
                            </View>

                            {/* Description Input */}
                            <View style={tailwind`mb-6`}>
                                <Text style={tailwind`text-gray-400 text-sm mb-2 font-semibold`}>
                                    Description (Optional)
                                </Text>
                                <TextInput
                                    style={tailwind`bg-gray-800 text-white text-base px-4 py-3 rounded-xl h-24`}
                                    multiline={true}
                                    value={description} 
                                    onChangeText={setDescription} 
                                    placeholder="Add details about this highlight..."
                                    placeholderTextColor="#666"
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Upload Button */}
                            <Pressable 
                                style={tailwind`bg-red-500 py-4 rounded-xl items-center ${(!mediaURL || !title.trim() || uploading) ? 'opacity-50' : ''}`}
                                onPress={createMatchMedia}
                                disabled={!mediaURL || !title.trim() || uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={tailwind`text-white text-base font-bold`}>
                                        Upload Highlight
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const HighlightViewerModal = () => (
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
                        style={tailwind`bg-black bg-opacity-70 rounded-full p-3`}
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
                            resizeMode='contain'
                        />
                        
                        {/* Info Section */}
                        <View style={tailwind`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6`}>
                            <Text style={tailwind`text-white text-xl font-bold mb-2`}>
                                {selectedHighlight.title}
                            </Text>
                            {selectedHighlight.description && (
                                <Text style={tailwind`text-gray-300 text-sm mb-3`}>
                                    {selectedHighlight.description}
                                </Text>
                            )}
                            <Text style={tailwind`text-gray-400 text-xs`}>
                                {selectedHighlight.timestamp || 'Match Highlight'}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
    
    return (
        <>
            <Animated.ScrollView 
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                style={tailwind`bg-white`}
                contentContainerStyle={{
                    paddingTop: 20,
                    paddingBottom: 100,
                    minHeight: sHeight + 100
                }}
            >
                <View style={tailwind`px-4`}>
                    {/* Header Section */}
                    <View style={tailwind``}>
                        <Text style={tailwind`text-xl font-bold text-black`}>
                            Match Videos
                        </Text>
                    </View>
                    <View style={tailwind`bg-red-400 w-full h-0.5 rounded-full mr-2 mb-4`} />
                    {/* Highlights List */}
                    {loading ? (
                        <View style={tailwind`py-32 items-center`}>
                            <ActivityIndicator size="large" color="#EF4444" />
                            <Text style={tailwind`text-gray-500 mt-4 text-base`}>Loading highlights...</Text>
                        </View>
                    ) : highlights.length > 0 ? (
                            <FlatList
                                data={highlights}
                                renderItem={renderHighlightItem}
                                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                                scrollEnabled={false}
                            />
                    ) : (
                        <View style={tailwind`py-32 items-center px-8`}>
                            <View style={tailwind`bg-gray-900 rounded-full p-6 mb-4`}>
                                <MaterialIcons name="videocam-off" size={48} color="#444" />
                            </View>
                            <Text style={tailwind`text-white text-lg font-bold mb-2`}>
                                No highlights yet
                            </Text>
                            <Text style={tailwind`text-gray-500 text-center text-sm`}>
                                Be the first to share this match's{'\n'}best moments!
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
            <UploadModal />
            <HighlightViewerModal />
        </>
    );
}

export default MediaScreen;