import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Pressable, ScrollView, Image, Modal} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import Video from 'react-native-video';
import axiosInstance from './axios_config';
import AntDesign from 'react-native-vector-icons/AntDesign';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { addNewThreadServices } from '../services/threadsServices';
import { SelectMedia } from '../services/SelectMedia';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';

function CreateThread() {
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [mediaURL,setMediaURL] = useState('');
    const [likeCount, setLikeCount] = useState(0);
    const [selectedCommunityPublicID, setSelectedCommunityPublicID] = useState(null);
    const [communityList, setCommunityList] = useState([]);
    const [isCommunityListModal, setIsCommunityListModal] = useState(false);
    const [communityType, setCommunityType] = useState(communityType || 'Select Community')
    const threads = useSelector(state => state.threads.threads)

    const handleMediaSelection = async () => {
        try {
          // Select media functionality
          const {mediaURL, mediaType} = await SelectMedia(axiosInstance);
          setMediaURL(mediaURL);
          setMediaType(mediaType);
          setLikeCount(0);
        } catch (err) {
          console.error("Error selecting media ", err);
        }
    }

    const fetchCommunity = async () => {
          try {
              const authToken = await AsyncStorage.getItem('AccessToken');
              const response = await axiosInstance.get(`${BASE_URL}/get_all_communities`, {
                  headers: {
                      'Authorization': `Bearer ${authToken}`,
                      'Content-Type': 'application/json',
                  },
              })
              const item = await response.data;

              if(item === null) {
                  setCommunityList([]);
              } else {
                  const communityWithDisplayText = item.map((item, index) => {
                      let displayText = '';
                      const words = item.name.split(' ');
                      displayText = words[0].charAt(0).toUpperCase();
                      if(words.length>1){
                          displayText += words[1].charAt(0).toUpperCase()
                      }
                      return {...item, displayText, displayText}
                  })

                  setCommunityList(communityWithDisplayText);
              }

        } catch(err) {
              console.error('error unable to get community list', err)
        }
    }

    const HandleSubmit = async () => {
        const thread = {
          community_public_id: selectedCommunityPublicID?.public_id,
          title: title,
          content: content,
          mediaURL: mediaURL,
          mediaType: mediaType,
        };
        addNewThreadServices({dispatch: dispatch, thread: thread, navigation: navigation});
    }

    const handleSelectCommunity = () => {
      console.log("Not able to select ")
      setIsCommunityListModal(true);
      fetchCommunity()
    }

    const selectCommunity = (item) => {
        setSelectedCommunityPublicID(item);
        setCommunityType(item.name);
        setIsCommunityListModal(false);
    }
    console.log("Is community Selected")
    navigation.setOptions({
      headerTitle:'',
      headerStyle:tailwind`bg-red-400 shadow-lg`,
      headerTintColor:'white',
      headerLeft: ()=> (
        <View style={tailwind`flex-row items-center gap-35 p-2`}>
            <AntDesign name="arrowleft" onPress={()=>navigation.goBack()} size={24} color="white" />
        </View>
      ),
      headerRight:()=>(
        <View style={tailwind`flex-row items-center mr-2 gap-18`}>
        <Pressable style={tailwind`p-2 flex-row border border-white rounded`} onPress={handleSelectCommunity}>
          <Text style={tailwind`text-white text-lg mr-2`}>{communityType}</Text>
          <AntDesign name="down" size={20} color="white"  style={tailwind`mt-1`}/>
        </Pressable>
        <Pressable style={tailwind`p-2`} onPress={HandleSubmit}>
          <MaterialIcons name="send" size={24} color="white" />
        </Pressable>
      </View>
      )
    })

    return (
        <View style={tailwind`flex-1 bg-white`}>
            <ScrollView style={tailwind`flex-1`} contentContainerStyle={tailwind`pb-20`}>
                {/* Title Input */}
                <View style={tailwind`p-4`}>
                    <TextInput
                        style={tailwind`font-bold text-2xl text-black-400 mb-4`}
                        value={title} 
                        onChangeText={setTitle} 
                        placeholder="Write the title here..."
                        placeholderTextColor="black"
                        multiline={true}
                    />
                    
                    {/* Content Input with fixed height */}
                    <TextInput
                        style={tailwind`text-lg text-black-400 textAlignVertical-top`}
                        multiline={true}
                        value={content} 
                        onChangeText={setContent} 
                        placeholder="Write something here..."
                        placeholderTextColor="black"
                    />
                </View>
                
                {/* Media Display */}
                {mediaType === 'image' && (
                    <View style={tailwind`px-4 mb-4`}>
                        <Image 
                            source={{uri: mediaURL}} 
                            style={tailwind`w-full h-64 rounded-lg`}
                            resizeMode="cover"
                        />
                    </View>
                )}
                
                {mediaType === 'video' && (
                    <View style={tailwind`px-4 mb-4`}>
                        <Video 
                            source={{uri: mediaURL}} 
                            controls={true} 
                            style={tailwind`w-full h-64 rounded-lg`}
                        />
                    </View>
                )}
            </ScrollView>
            
            {/* Fixed Upload Button */}
            <View style={tailwind`absolute bottom-6 right-6`}>
                <Pressable 
                    style={tailwind`bg-red-400 rounded-full p-4 shadow-lg items-center justify-center`} 
                    onPress={handleMediaSelection}
                >
                    <MaterialIcons name="perm-media" size={25} color="white" />
                    <Text style={tailwind`text-white text-xs mt-1`}>Upload</Text>
                </Pressable>
            </View>
            
            {/* Community Selection Modal */}
            {isCommunityListModal && (
              <Modal
                transparent={true}
                animationType="slide"
                visible={isCommunityListModal}
                onRequestClose={() => setIsCommunityListModal(false)}
              >
                <Pressable 
                    onPress={() => setIsCommunityListModal(false)} 
                    style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                >
                    <View style={tailwind`bg-white rounded-t-lg max-h-96`}>
                        <View style={tailwind`p-4 border-b border-gray-200`}>
                            <Text style={tailwind`text-xl font-bold text-gray-800 text-center`}>
                                Select Community
                            </Text>
                        </View>
                        <ScrollView style={tailwind`p-4`}>
                            {communityList.map((item, index) => (
                                <Pressable 
                                    key={index} 
                                    onPress={() => selectCommunity(item)} 
                                    style={tailwind`bg-white shadow-md mb-3 rounded-lg p-3 flex-row items-center border border-gray-100`}
                                >
                                    <View style={tailwind`w-12 h-12 rounded-full bg-red-400 items-center justify-center mr-3`}>
                                        <Text style={tailwind`text-white text-lg font-bold`}>
                                            {item.displayText}
                                        </Text>
                                    </View>
                                    <View style={tailwind`flex-1`}>
                                        <Text style={tailwind`text-black text-lg font-semibold`}>
                                            {item.name}
                                        </Text>
                                        <Text style={tailwind`text-gray-600 text-sm`}>
                                            {item.description}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
              </Modal>
            )}
        </View>
    );
}

export default CreateThread;