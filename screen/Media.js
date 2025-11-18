import React, {useState, useEffect} from 'react'
import {View, Text, Dimensions, Pressable, Image, ActivityIndicator, FlatList, Modal, TextInput} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { SelectMedia } from '../services/SelectMedia';
import Animated, {useSharedValue, useAnimatedScrollHandler, Extrapolation, interpolate, useAnimatedStyle} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import Video from 'react-native-video';

const MediaScreen = ({item, parentScrollY, headerHeight, collapsedHeight}) => {
    const match = item;
    console.log("match line no 13: ", match)
    const [mediaURL, setMediaURL] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [addMediaModalVisible, setAddMediaModalVisible] = useState(false);
    const [title, setTitle] = useState(null);
    const [description, setDescription] = useState(null)

    const {height: sHeight, width: sWidth} = Dimensions.get("window");

    const currentScrollY = useSharedValue(0);

    useEffect(() => {
        fetchHighlights();
    }, []);

    // Fetch existing highlights
    const fetchHighlights = async () => {
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.get(`${BASE_URL}/getMatchMedia/${match.public_id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            console.log("Highlights: ", response.data)
            setHighlights(response.data || []);
        } catch (err) {
            console.error("Error fetching highlights: ", err);
        } finally {
            setLoading(false);
        }
    };

    // scroll handler for header animation
    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeight){
                parentScrollY.value = currentScrollY.value
            } else {
                parentScrollY.value = event.contentOffset.y
            }
        }
    })
    
    // Content animation style
    const contentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            parentScrollY.value,
            [0, 50],
            [1, 1],
            Extrapolation.CLAMP
        );

        return {
            opacity
        };
    });

    const createMatchMedia = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                title: title,
                description: description,
                media_url: mediaURL
            }
            const response = await axiosInstance.post(`${BASE_URL}/uploadMatchMedia/${match.public_id}`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log("Message : ", response.data)
        } catch (err) {
            console.error("Failed to create match media: ", err)
        }
    }

    const handleMediaSelection = async () => {
        try {
            console.log("Line no 71: entering media")
            const {mediaURL, mediaType} = await SelectMedia(axiosInstance);
            console.log("media url: ", mediaURL)
            console.log("Media type: ", mediaType)
            setMediaURL(mediaURL);
            setMediaType(mediaType);
        } catch (err) {
            console.error("Error selecting media ", err);
        }
    }

    const handleMediaUpload = async () => {
        if (!mediaURL) {
            console.log("No media selected");
            return;
        }

        try {
            setUploading(true);
            
            
            // Refresh highlights after upload
            await fetchHighlights();
            
            // Clear selection
            setMediaURL('');
            setMediaType('');
        } catch (err) {
            console.error("Failed to upload match media: ", err);
        } finally {
            setUploading(false);
        }
    }

    console.log("Modal: ", addMediaModalVisible)

    const renderHighlightItem = ({item, index}) => {
        const isVideo = item.media_type === 'video';
        
        return (
            <Pressable 
                style={tailwind`mb-4 bg-white rounded-xl overflow-hidden shadow-sm`}
                onPress={() => {/* Open full screen media viewer */}}
            >
                <Video style={tailwind`w-full h-80 aspect-w-16 aspect-h-9`} source={{ uri: item.media_url }} controls={true} onFullscreenPlayerWillPresent={() => {handleFullScreen()}} onVolumeChange={()=>{handleVolume()}} resizeMode='cover'/>
                
                <View style={tailwind`p-3`}>
                    <Text style={tailwind`text-gray-800 font-semibold mb-1`}>
                        {item.title || `Highlight ${index + 1}`}
                    </Text>
                    <Text style={tailwind`text-gray-500 text-xs`}>
                        {item.timestamp || 'Match Highlight'}
                    </Text>
                </View>
            </Pressable>
        );
    };
    
    return (
        <Animated.ScrollView 
            onScroll={handlerScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingTop: 20,
                paddingBottom: 100,
                minHeight: sHeight + 100
            }}
        >
            <View style={tailwind`px-4`}>
                {/* Header Section */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-2xl font-bold text-gray-800 mb-1`}>
                        Match Highlights
                    </Text>
                    <Text style={tailwind`text-gray-500 text-sm`}>
                        {highlights.length} {highlights.length === 1 ? 'highlight' : 'highlights'}
                    </Text>
                </View>

                {/* Media Preview Section (if media selected) */}
                {mediaURL && (
                    <View style={tailwind`mb-6 bg-blue-50 rounded-xl p-4 border border-blue-200`}>
                        <View style={tailwind`flex-row items-center justify-between mb-3`}>
                            <Text style={tailwind`text-blue-800 font-semibold`}>
                                Selected Media
                            </Text>
                            <Pressable onPress={() => {setMediaURL(''); setMediaType('');}}>
                                <MaterialIcons name="close" size={20} color="#1E40AF" />
                            </Pressable>
                        </View>
                        <View style={tailwind`w-full h-40 bg-gray-300 rounded-lg mb-3 items-center justify-center`}>
                                <MaterialIcons name="videocam" size={40} color="#6B7280" />
                        </View>
                        <View>
                            
                        </View>
                        <Pressable 
                            style={tailwind`bg-blue-600 py-3 rounded-lg items-center ${uploading ? 'opacity-50' : ''}`}
                            onPress={handleMediaUpload}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={tailwind`text-white font-semibold`}>Upload Highlight</Text>
                            )}
                        </Pressable>
                    </View>
                )}

                {/* Highlights Grid */}
                {loading ? (
                    <View style={tailwind`py-20 items-center`}>
                        <ActivityIndicator size="large" color="#EF4444" />
                        <Text style={tailwind`text-gray-500 mt-4`}>Loading highlights...</Text>
                    </View>
                ) : highlights.length > 0 ? (
                    <FlatList
                        data={highlights}
                        renderItem={renderHighlightItem}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={tailwind`py-20 items-center`}>
                        <MaterialIcons name="photo-library" size={60} color="#D1D5DB" />
                        <Text style={tailwind`text-gray-500 mt-4 text-center`}>
                            No highlights yet{'\n'}Upload the first one!
                        </Text>
                    </View>
                )}
            </View>

            {/* Floating Upload Button */}
            <View style={tailwind`absolute bottom-6 right-6`}>
                <Pressable 
                    style={tailwind`bg-red-500 rounded-full p-4 shadow-lg items-center justify-center flex-row`} 
                    onPress={() => setAddMediaModalVisible(true)}
                >
                    <MaterialIcons name="add-a-photo" size={25} color="white" />
                    <Text style={tailwind`text-white text-sm font-semibold ml-2`}>Add Media</Text>
                </Pressable>
            </View>
            {addMediaModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={addMediaModalVisible}
                    onRequestClose={() => setAddMediaModalVisible(false)}
                >
                    <Pressable onPress={() => setAddMediaModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4 mb-4`}>
                            <View style={tailwind`p-4`}>
                                <TextInput
                                    style={tailwind`font-bold text-2xl text-black-400 mb-4`}
                                    value={title} 
                                    onChangeText={setTitle} 
                                    placeholder="Write the title here..."
                                    placeholderTextColor="black"
                                    multiline={true}
                                />
                                <TextInput
                                    style={tailwind`text-lg text-black-400 textAlignVertical-top`}
                                    multiline={true}
                                    value={description} 
                                    onChangeText={setDescription} 
                                    placeholder="Write something here..."
                                    placeholderTextColor="black"
                                />
                            </View>
                            <View style={tailwind`mb-4`}>
                                <Pressable 
                                    style={tailwind`bg-red-400 rounded-full p-4 shadow-lg items-center justify-center flex-row`} 
                                    onPress={() => handleMediaSelection()}
                                >
                                    <MaterialIcons name="add-a-photo" size={25} color="white" />
                                    <Text style={tailwind`text-white text-sm font-semibold ml-2`}>Add Media</Text>
                                </Pressable>
                            </View>
                            <View style={tailwind`mb-4`}>
                                <Pressable onPress={() => createMatchMedia()}
                                    style={tailwind`bg-red-400 rounded-full p-4 shadow-lg items-center justify-center flex-row`}     
                                >
                                    <Text style={tailwind`text-white text-sm font-semibold ml-2`}>Submit</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </Animated.ScrollView>
    );
}

export default MediaScreen;