import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Pressable, ScrollView, Image, Modal} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {launchImageLibrary} from 'react-native-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import  RFNS from 'react-native-fs';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import Video from 'react-native-video';
import useAxiosInterceptor from './axios_config';
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
    const axiosInstance = useAxiosInterceptor();
    const route = useRoute();
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [mediaURL,setMediaURL] = useState('');
    const [likeCount, setLikeCount] = useState(0);
    const [communityList, setCommunityList] = useState([]);
    const [isCommunityListModal, setIsCommunityListModal] = useState(false);
    const [communityType, setCommunityType] = useState(route.params?.communityType || 'Select Community')
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
                      const words = item.communities_name.split(' ');
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
          communities_name: communityType,
          title: title,
          content: content,
          mediaType: mediaType,
          mediaURL: mediaURL,
          likeCount: likeCount,
        };
        addNewThreadServices({dispatch: dispatch, axiosInstance: axiosInstance, thread: thread, navigation: navigation});
    }

    const handleSelectCommunity = () => {
      setIsCommunityListModal(true);
      fetchCommunity()
    }
    
    useEffect(() => {
      let isMount = true; 
      const fetchData = async () => {
          try {
            if (isMount) {
              if (isFocused && route.params?.communityType) {
                setCommunityType(route.params.communityType);
              }
            }
          } catch (e) {
            console.error("unable to set the community type: ", err)
          }
      }
      fetchData();
      return () => {
        isMount= false;
      };
    }, [isFocused, route.params?.communityType]);
    

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
        <View style={tailwind`flex-1 p-4 bg-white`}>
            <View style={tailwind`mb-5`}>
              <TextInput
                    style={tailwind` font-bold text-2xl h-24 text-black-400`}
                    value={title} 
                    onChangeText={setTitle} 
                    placeholder="Write the title here..."
                    placeholderTextColor="black"
                />
                <ScrollView style={tailwind`h-100`}>
                  <TextInput
                      style={tailwind` text-lg text-black-400`}
                      multiline 
                      value={content} 
                      onChangeText={setContent} 
                      placeholder="Write something here..."
                      placeholderTextColor="black"
                  />
                </ScrollView>
            </View>
            
            {mediaType === 'image' && <Image source={{uri: mediaURL}} />}
            {mediaType === 'video' && <Video source={{uri: mediaURL}} controls={true} />}
            <View style={tailwind`flex-1 justify-end items-end p-4`}>
              <Pressable style={tailwind`bg-red-400 rounded-full p-4`} onPress={handleMediaSelection}>
                  <MaterialIcons name="perm-media" size={25} color="white" />
                  <Text style={tailwind`text-white`}>Upload</Text>
              </Pressable>
            </View>
            {isCommunityListModal && (
              <Modal
                transparent={true}
                animationType="slide"
                visible={isCommunityListModal}
                onRequestClose={() => setIsCommunityListModal(false)}
              >
                <Pressable onPress={() => setIsCommunityListModal(false)} style={tailwind`h-300 justify-end top-30 bg-red-400 bg-opacity-50 `}>
                <ScrollView style={tailwind`bg-white rounded-md shadow-md pt-14`}>
                  <Text style={tailwind`text-3xl text-gray-400`}>Select Community</Text>
                  {communityList.map((item,index)=> (
                      <Pressable key={index} onPress={()=>handleSelectCommunity(item.communities_name)} style={tailwind`bg-white shadow-md mb-2 rounded-md p-2 gap-3 flex-row`}>
                          <View style={tailwind`w-12 h-12 rounded-12 bg-red-400 items-center justify-center`}>
                              <Text style={tailwind`text-white text-xl`}>
                                  {item.displayText}
                              </Text>
                          </View>
                          <View>
                              <Text style={tailwind`text-black text-2xl`}>{item.communities_name}</Text>
                              <Text style={tailwind`text-black`}>{item.description}</Text>
                          </View>
                      </Pressable>
                  ))}
                  </ScrollView>
                </Pressable>
              </Modal>
            )}
        </View>
    );
}

export default CreateThread;
