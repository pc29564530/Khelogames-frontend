import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Image, StyleSheet, Pressable, TouchableOpacity} from 'react-native';
import useAxiosInterceptor from './axios_config'
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import  RFNS from 'react-native-fs';


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
            
            const response = await axiosInstance.post('http://192.168.0.102:8080/createProfile', profileData, {
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

            const response = await axiosInstance.get(`http://192.168.0.102:8080/getProfile/${user}`, {
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
        <View style={styles.Container} >
            <View style = {styles.UploadContainer}>
                <Pressable style={styles.UpdateAvatar} onPress={uploadAvatarimage}>
                    <Text>Upload Image</Text>
                </Pressable>
            </View>
                <TextInput style={styles.EditTextInput}  value={fullName}  onChangeText={setFullName} placeholder='Enter the Full Name'/>
                <TextInput style={styles.EditTextInput}  value={bio} onChangeText={setBio} placeholder='Enter About you' />
            <View style={styles.SubmitButtonContainer} >
                <Pressable style={styles.ButtonIcon} onPress={handleSaveButton}>
                    <Text style={styles.TextContainer}>Save</Text>
                </Pressable>
            </View>
        </View>
    );
}



const styles = StyleSheet.create({
    Container: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between'
    },
    UploadContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        height: 200,
        backgroundColor: 'lightblue'
    },
    EditDetails:{
        padding: 20,
        gap: 20

    },
    UpdateAvatar: {
        padding: 20,
        backgroundColor: 'green',
        width: 150
    },
    EditTextInput: {
        padding:10,
        backgroundColor: 'whitesmoke',
        borderRadius: 5,
        borderWidth: 1,
    },
    SubmitButtonContainer: {
        alignContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    ButtonIcon:{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'grey',
        width: '50%',
        borderRadius: 5,
        padding: 20
    },
    TextContainer: {
        fontSize: 20,
    }
})