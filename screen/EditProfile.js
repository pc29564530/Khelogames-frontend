import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Image, StyleSheet, Pressable, TouchableOpacity, KeyboardAvoidingView} from 'react-native';
import useAxiosInterceptor from './axios_config'
import {launchImageLibrary} from 'react-native-image-picker';
import  RFNS from 'react-native-fs';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from '@react-navigation/native';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import { setEditFullName, setEditDescription, setProfileAvatar } from '../redux/actions/actions';
import { useDispatch } from 'react-redux';

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
    const dispatch = useDispatch();
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();

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


    const fetchUserProfile = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');

            const response = await axiosInstance.get(`${AUTH_URL}/getProfile/${user}`, {
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

    const handleEditProfile = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const data = {
                full_name: fullName,
                bio: bio,
                avatar_url: avatarUrl,
            }
            console.log("data: ", data)

            const response = await axiosInstance.put(`${BASE_URL}/updateProfile`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const item = response.data || [];
            dispatch(setEditFullName(item.full_name))
            dispatch(setProfileAvatar(response.data.avatar_url))
            dispatch(setEditDescription(response.data.bio));

        } catch (err) {
            console.error("unable to update edit the profile ", err)
        }
    }
    
    return (
    <KeyboardAvoidingView style={tailwind`flex-1 bg-black gap-10`}>
        <View tyle={tailwind`flex flex-row justify-center items-start mt-4 mr-10`}>
            <Text style={tailwind`text-white text-lg font-bold`}>Edit Profile</Text>
        </View>
        <View style={tailwind`flex flex-row justify-center items-center mt-4`}>
            <View style={tailwind`flex-2/5 p-4`} >
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

            </View>
        <View style={tailwind`flex-2/5 gap-10 p-4`}>
            <TextInput
            style={tailwind`p-4 bg-whitesmoke rounded border m-2 text-white border-white`}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full Name"
            placeholderTextColor="white"
            />
            <TextInput
            style={tailwind`p-4 bg-whitesmoke rounded border m-2 text-white border-white`}
            value={bio}
            onChangeText={setBio}
            placeholder="About You"
            placeholderTextColor="white"
            />
        </View>
        <View style={tailwind`flex-1/5 gap-10 p-4`}>
            <Pressable onPress={() => handleEditProfile()} style={tailwind`items-center p-2 border rounded-md bg-red-500 `} >
                <Text style={tailwind`text-white text-xl font-bold`}>Save</Text>
            </Pressable>
        </View>
    </KeyboardAvoidingView>
    );
};
