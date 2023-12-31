import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Image, StyleSheet, Pressable, TouchableOpacity, KeyboardAvoidingView} from 'react-native';
import useAxiosInterceptor from './axios_config'
import {launchImageLibrary} from 'react-native-image-picker';
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
    const [profile, setProfile] = useState();
    const [coverUrl, setCoverUrl] = useState('');
    
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();

    //to create the username for personal use no one can change the user after creation
    const handleAvatar = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.put('http://10.0.2.2:8080/updateAvatar',{avatar_url: avatarUrl}, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            } );
            setAvatarUrl(response.data);
        } catch (e) {
            console.error("unable to update the avatar: ", err)
        }
    }

    const handleCover = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.put('http://10.0.2.2:8080/updateCover',{cover_url: coverUrl}, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            } );
            setCoverUrl(response.data);
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
    
            const response = await axiosInstance.put(`http://10.0.2.2:8080/updateFullName`, profileData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
    
            console.log(response.data);
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
    
            const response = await axiosInstance.put(`http://10.0.2.2:8080/updateBio`, profileData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
    
            console.log(response.data);
            setBio(response.data);
        } catch (e) {
            console.error("Unable to update Bio: ", e);
        }
    };

    const handleSaveButton = async () => {
        
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const profileData = {
                ...profile,
                full_name: fullName,
                bio: bio
            }

            if (avatarUrl !== '') {
                console.log(avatarUrl)
                profileData.avatar_url = avatarUrl
            }

            if (coverUrl !== '') {
                profileData.cover_url = coverUrl
            }
            
            const response = await axiosInstance.put('http://10.0.2.2:8080/editProfile', profileData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(response.data)
            setProfile(response.data);

        } catch (e) {
            console.error("unable to update profile: ", e)
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
                    setAvatarUrl(base64File);
                    handleAvatar();
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

            const response = await axiosInstance.get(`http://10.0.2.2:8080/getProfile/${user}`, {
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
            console.log("AvatarUrl: ", avatarUrl)
            if (avatarUrl !== '') {
                await handleAvatar();
            }
            console.log("CoverUrl: ", coverUrl)
            if (coverUrl !== '') {
                await handleCover();
            }
        };
    
        fetchDataAndUpload();
    }, [])

    // useEffect(() => {
    //     fetchUserProfile();
    // }, []);

    navigation.setOptions({
        headerTitle: '',
        headerStyle:{
            backgroundColor:'black'
        },
        headerTintColor:'white'
    });
    
    return (
        <KeyboardAvoidingView style={tailwind`flex-1 bg-black`} >
            <View style={tailwind`w-full h-60`}>
                <Image
                    style={tailwind`h-60 object-cover bg-yellow-500`}
                    source={{uri: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fnature%2F&psig=AOvVaw0xJxtlDRiuk48-qM28maZ7&ust=1699540828195000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCLD2vozRtIIDFQAAAAAdAAAAABAE',}}
                />
                <Pressable style={tailwind`-mt-16 ml-70 bg-red-500 w-20 h-15 rounded-md p-4 items-center`} onPress={uploadCoverimage}>
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
            <View style={tailwind`mt-20 gap-10`}>
                <TextInput style={tailwind`p-4 bg-whitesmoke rounded border m-2 text-white border-white`}  value={fullName}  onChangeText={setFullName} placeholder='Enter the Full Name' placeholderTextColor="white" onEndEditing={handleFullName}/>
                <TextInput style={tailwind`p-4 bg-whitesmoke rounded border m-2 text-white border-white`}  value={bio} onChangeText={setBio} placeholder='Enter About you' placeholderTextColor="white" onEndEditing={handleBio}/>
                <Pressable style={tailwind`justify-center items-center bg-gray-500 w-1/2 rounded p-4`} onPress={handleSaveButton}>
                    <Text style={tailwind`text-lg text-white`}>Save</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
};