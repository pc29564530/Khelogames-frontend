import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Image, StyleSheet, Pressable, TouchableOpacity, KeyboardAvoidingView, Modal} from 'react-native';
import axiosInstance from './axios_config'
import {launchImageLibrary} from 'react-native-image-picker';
import  RFNS from 'react-native-fs';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
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
    
    const navigation = useNavigation();
    const [isRolesModalVisible, setIsRolesModalVisible] = useState(false);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken");
                const response = await axiosInstance.get(`${BASE_URL}/getRoles`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                console.log("Roles: ", response.data)
                setRoles(response.data || [])
            } catch (err) {
                console.error("Failed to fetch roles: ", err)
            }
        }
        fetchRoles();
    }, []);

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
            const userPublicID = await AsyncStorage.getItem('UserPublicID');

            const response = await axiosInstance.get(`${AUTH_URL}/getProfile/${userPublicID}`, {
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

    const handleNewRole = async (item) => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken")
            const data = {
                role_id: item.id
            }
            const response  = await axiosInstance.post(`${BASE_URL}/addUserRole`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            setSelectedRole(response.data)
        } catch (err) {
            console.error("unable to add the new role: ", err)
        }
    }
    
    return (
    <KeyboardAvoidingView style={tailwind`flex-1 bg-white gap-10`}>
        <View tyle={tailwind`flex flex-row justify-center items-start mt-4 mr-10`}>
            <Text style={tailwind`text-black text-lg font-bold`}>Edit Profile</Text>
        </View>
        <View style={tailwind`flex flex-row justify-center items-center mt-4`}>
            <View style={tailwind`flex-2/5 p-4`} >
                    <Image
                        style={tailwind`h-24 w-24 rounded-full border-2 bg-red-400 -mt-12`}
                        source={{
                            uri: avatarUrl||'https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fnature%2F&psig=AOvVaw0xJxtlDRiuk48-qM28maZ7&ust=1699540828195000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCLD2vozRtIIDFQAAAAAdAAAAABAE',
                        }}
                    />
                    <Pressable  style={tailwind` -mt-12 ml-18 rounded-full bg-red-500 w-8 h-8 p-1 items-center` } onPress={uploadAvatarimage}>
                        <FontAwesome name="upload" size={20} color="black" />
                    </Pressable>
                    </View>

            </View>
        <View style={tailwind`flex-2/5 gap-10 p-4`}>
            <TextInput
                style={tailwind`p-4 bg-white rounded border m-2 text-black border-black`}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                placeholderTextColor="black"
            />
            <TextInput
                style={tailwind`p-4 bg-white rounded border m-2 text-black border-black`}
                value={bio}
                onChangeText={setBio}
                placeholder="About You"
                placeholderTextColor="black"
            />
            <View>
                <Pressable onPress={() => {setIsRolesModalVisible(true)}} style={tailwind`rounded-md shadow-md p-4 items-center `}>
                    <Text>Select Role</Text>
                </Pressable>
                <View>
                    <Text>Display Roles</Text>
                </View>
            </View>
        </View>
        {isRolesModalVisible && (
            <Modal 
                visible={isRolesModalVisible}
                animationType='fade'
                onRequestClose={() => setIsRolesModalVisible(false)}
                transparent={true}
            >
            <View style={tailwind`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                <View style={tailwind`w-4/5 bg-white rounded-lg p-5 shadow-lg`}>
                    <Pressable onPress={() => setIsRolesModalVisible(false)} style={tailwind`self-end mb-2`}>
                        <AntDesign name="close" size={24} color="black" />
                    </Pressable>
                    <Text style={tailwind`text-lg font-bold text-center mb-4`}>Select a Role</Text>
                    {roles.map((item, i) => (
                        <Pressable 
                            key={i} 
                            onPress={() => {handleNewRole(item)}} 
                            style={[tailwind`p-4 rounded-lg mb-2 shadow`, selectedRole === item.name ? tailwind`bg-red-400` : tailwind`bg-gray-400`]}
                        >
                            <Text style={tailwind`text-gray-800 text-center`}>{item.name}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </Modal>

        )}
        <View style={tailwind`flex-1/5 gap-10 p-4`}>
            <Pressable onPress={() => handleEditProfile()} style={tailwind`items-center p-2 border rounded-md bg-red-500 `} >
                <Text style={tailwind`text-black text-xl font-bold`}>Save</Text>
            </Pressable>
        </View>
    </KeyboardAvoidingView>
    );
};
