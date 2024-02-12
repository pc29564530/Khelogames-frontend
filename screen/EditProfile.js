import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Image, StyleSheet, Pressable, TouchableOpacity, KeyboardAvoidingView} from 'react-native';
import useAxiosInterceptor from './axios_config'
import {launchImageLibrary} from 'react-native-image-picker';
import  RFNS from 'react-native-fs';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../constants/ApiConstants';

function getMediaTypeFromURL(url) {
    const fileExtensionMatch = url.match(/\.([0-9a-z]+)$/i);
    if (fileExtensionMatch) {
      const fileExtension = fileExtensionMatch[1].toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
  
      if (imageExtensions.includes(fileExtension)) {
        return 'image';
      }
    }
  }

  const fileToBase64 = async (filePath) => {
    try {
      const fileContent = await RFNS.readFile(filePath, 'base64');
      return fileContent;
    } catch (error) {
      console.error('Error converting image to Base64:', error);
      return null;
    }
  };

export default function EditProfile() {
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [profile, setProfile] = useState();
    const [coverUrl, setCoverUrl] = useState('');
    const [avatarType, setAvatarType] = useState('');
    
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();

    //to create the username for personal use no one can change the user after creation
    const handleAvatar = async (base64, type) => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.put(`${BASE_URL}/updateAvatar`,{avatar_url: base64, avatar_type: type}, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            } );
            console.log("response of avatar: ", response.data)
            setAvatarUrl(response.data.avatar_url);
            setAvatarType(response.data.avatar_type);

        } catch (e) {
            console.error("unable to update the avatar: ", err)
        }
    }

    const handleCover = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.put(`${BASE_URL}/updateCover`,{cover_url: coverUrl, cover_type: coverType}, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            } );
            console.log(response.data)
            setCoverUrl(response.data.cover_url);
            setCoverType(response.data.cover_type)
        } catch (e) {
            console.error("unable to update the cover: ", err)
        }
    }

    const handleFullName = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
    
            const profileData = {
                full_name: fullName,
            };
    
            const response = await axiosInstance.put(`${BASE_URL}/updateFullName`, profileData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            setFullName(response.data);
        } catch (e) {
            console.error("Unable to update full name: ", e);
        }
    };

    const handleBio = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
    
            const profileData = {
                bio: bio,
            };
    
            const response = await axiosInstance.put(`${BASE_URL}/updateBio`, profileData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
    
            setBio(response.data);
        } catch (e) {
            console.error("Unable to update Bio: ", e);
        }
    };

    const uploadAvatarimage =  async () => {
        try {
            let options = { 
                noData: true,
                mediaType: 'image',
            };
    
            const res = await launchImageLibrary(options);
    
            if (res.didCancel) {
                console.log('User cancelled photo picker');
            } else if (res.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const type = getMediaTypeFromURL(res.assets[0].uri);
                if(type === 'image') {
                    const base64File = await fileToBase64(res.assets[0].uri);
                    setAvatarUrl(base64File);
                    setAvatarType(type)
                    handleAvatar(base64File, type);
                } else {
                    console.log('unsupported media type: ', type);
                }
            }
        } catch (e) {
            console.error("unable to load avatar image", e);
        }
    };

    const uploadCoverimage =  async () => {
        try {
            let options = { 
                noData: true,
                mediaType: 'image',
            };
    
            const res = await launchImageLibrary(options);
    
            if (res.didCancel) {
                console.log('User cancelled photo picker');
            } else if (res.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const type = getMediaTypeFromURL(res.assets[0].uri);
                
                if(type === 'image') {
                    const base64File = await fileToBase64(res.assets[0].uri);
                    setCoverUrl(base64File);
                    setCoverType(type)
                    handleCover();
                } else {
                    console.log('unsupported media type: ', type);
                }
            }
        } catch (e) {
            console.error("unable to load cover image", e);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');

            const response = await axiosInstance.get(`${BASE_URL}/getProfile/${user}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            setProfile(response.data);
            setFullName(response.data.full_name);
            setBio(response.data.bio);
            setAvatarUrl(response.data.avatar_url);
        } catch (e) {
            console.error("Unable to fetch user profile: ", e);
        }
    };

    useEffect(() => {
        const fetchDataAndUpload = async () => {
            await fetchUserProfile();
            if (avatarUrl !== '') {
                await handleAvatar();
            }
            if (coverUrl !== '') {
                await handleCover();
            }
        };
    
        fetchDataAndUpload();
    }, [])

    navigation.setOptions({
        headerTitle: '',
        headerStyle:{
            backgroundColor:'black'
        },
        headerTintColor:'white'
    });
    
    return (
        <KeyboardAvoidingView style={tailwind`flex-1 bg-black`} >
            <View style={tailwind`flex-2/5 w-full h-60`}>
                <Image
                    style={tailwind`h-60 object-cover bg-yellow-500`}
                    source={{uri: coverUrl||'https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fnature%2F&psig=AOvVaw0xJxtlDRiuk48-qM28maZ7&ust=1699540828195000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCLD2vozRtIIDFQAAAAAdAAAAABAE',}}
                />
                <Pressable style={tailwind`-mt-16 ml-70 bg-red-500 w-20 h-15 rounded-md p-4 items-center`} onPress={uploadCoverimage}>
                    <FontAwesome  name="upload" size={24} color="white" />
                </Pressable>
            </View>
            <View style={tailwind`flex-2/5 p-4`}>
                <Image
                    style={tailwind`h-24 w-24 rounded-full border-2 bg-white -mt-12`}
                    source={{
                        uri: avatarUrl||'https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fnature%2F&psig=AOvVaw0xJxtlDRiuk48-qM28maZ7&ust=1699540828195000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCLD2vozRtIIDFQAAAAAdAAAAABAE',
                    }}
                />
                <Pressable  style={tailwind` -mt-12 ml-18 rounded-full bg-red-500 w-8 h-8 p-1 items-center` } onPress={uploadAvatarimage}>
                    <FontAwesome name="upload" size={20} color="white" />
                </Pressable>
            </View>
            <View style={tailwind`mt-20 flex-2/5 gap-10`}>
                <TextInput style={tailwind`p-4 bg-whitesmoke rounded border m-2 text-white border-white`}  value={fullName}  onChangeText={setFullName} placeholder='Enter the Full Name' placeholderTextColor="white" onEndEditing={handleFullName}/>
                <TextInput style={tailwind`p-4 bg-whitesmoke rounded border m-2 text-white border-white`}  value={bio} onChangeText={setBio} placeholder='Enter About you' placeholderTextColor="white" onEndEditing={handleBio}/>
            </View>
        </KeyboardAvoidingView>
    );
};
