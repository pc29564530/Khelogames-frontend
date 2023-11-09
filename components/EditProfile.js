import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Image, StyleSheet, Pressable, TouchableOpacity} from 'react-native';
import useAxiosInterceptor from './axios_config'
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import  RFNS from 'react-native-fs';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from '@react-navigation/native';

function getMediaTypeFromURL(url) {
    const fileExtensionMatch = url.match(/\.([0-9a-z]+)$/i);
    if (fileExtensionMatch) {
      const fileExtension = fileExtensionMatch[1].toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp']; // Add more image extensions if needed
  
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
    const [profile, setProfile] = useState()
    const axiosInstance = useAxiosInterceptor();

    const navigation = useNavigation();
    //to create the username for personal use no one can change the user after creation
    const handleSaveButton = async () => {
        
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const profileData = {
                ...profile,
                full_name: fullName,
                bio: bio,
                avatar_url: avatarUrl
            }
            
            const response = await axiosInstance.post('http://192.168.0.100:8080/createProfile', profileData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(response.data)
            setProfile(response.data);

        } catch (e) {
            console.error("unable to update username: ", e)
        }
    }


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
                    console.log('base64File:', base64File); 
                    setAvatarUrl(base64File);
                } else {
                    console.log('unsupported media type:', type);
                }
            }
        } catch (e) {
            console.error("unable to load image", e);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');

            const response = await axiosInstance.get(`http://192.168.0.100:8080/getProfile/${user}`, {
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
        fetchUserProfile();
    }, []);
    
    return (
        <View style={tailwind`flex-1 bg-black`} >
            <View style={tailwind`flex-row h-15  gap-30 p-5`}>
            <FontAwesome
                name="close"
                size={24}
                color="white"
                style={{ marginLeft: 5 }}
                onPress={() => navigation.goBack()}
              />
              <Text style={tailwind`text-white font-bold text-lg`}>Edit Profile</Text>
            </View>
            <View style={tailwind`w-full h-60`}>
                <Image
                    style={tailwind`h-60 object-cover bg-yellow-500`}
                    source={{
                        uri: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fnature%2F&psig=AOvVaw0xJxtlDRiuk48-qM28maZ7&ust=1699540828195000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCLD2vozRtIIDFQAAAAAdAAAAABAE',
                    }}
                />
                <Pressable style={tailwind`-mt-16 ml-70 bg-red-500 w-20 h-15 rounded-md p-4 items-center`}>
                    <FontAwesome  name="upload" size={24} color="white" />
                </Pressable>
            </View>
            <View style={tailwind`flex-1 p-4`}>
                <Image
                    style={tailwind`h-24 w-24 rounded-full border-2 bg-white -mt-12`}
                    source={{
                        uri: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fnature%2F&psig=AOvVaw0xJxtlDRiuk48-qM28maZ7&ust=1699540828195000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCLD2vozRtIIDFQAAAAAdAAAAABAE',
                    }}
                />
                <Pressable  style={tailwind` -mt-12 ml-18 rounded-full bg-red-500 w-8 h-8 p-1 items-center` } onPress={uploadAvatarimage}>
                    <FontAwesome name="upload" size={20} color="white" />
                </Pressable>

                {/* {profileData.avatar_url ? (
                    <Image
                        style={tailwind`h-24 w-24 rounded-full border-2 border-white -mt-12`}
                        source={profileData.avatar_url}
                    />
                ) : (
                <View style={tailwind`w-24 h-24 rounded-12 bg-white items-center justify-cente -mt-12`}>
                    <Text style={tailwind`text-red-500 text-12x2`}>
                    {displayText}
                    </Text>
                </View>
                )} */}
            </View>
            {/* <View style = {tailwind`flex flex-row justify-between p-4 h-60 bg-blue-200`}>
                <Pressable style={tailwind`p-4 w-36 bg-green-500`} onPress={uploadAvatarimage}>
                    <Text style={tailwind`font-bold text-lg text-center pt-10`}>Upload Image</Text>
                </Pressable>
            </View> */}
            <View style={tailwind`flex-1 -mt-20 flex-column gap-10 p-4`}>
                <TextInput style={tailwind`p-4 bg-whitesmoke rounded border m-2 text-white border-white`}  value={fullName}  onChangeText={setFullName} placeholder='Enter the Full Name' placeholderTextColor="white"/>
                <TextInput style={tailwind`p-4 bg-whitesmoke rounded border m-2 text-white border-white`}  value={bio} onChangeText={setBio} placeholder='Enter About you' placeholderTextColor="white" />
            </View>
            <View style={tailwind`items-center mb-8 mt-10`} >
                <Pressable style={tailwind`justify-center items-center bg-gray-500 w-1/2 rounded p-4`} onPress={handleSaveButton}>
                    <Text style={tailwind`text-lg text-white`}>Save</Text>
                </Pressable>
            </View>
        </View>
    );
};