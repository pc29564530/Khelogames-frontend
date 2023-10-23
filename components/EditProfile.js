import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {View, Text, TextInput, Image, StyleSheet, Pressable, TouchableOpacity} from 'react-native';
import useAxiosInterceptor from './axios_config'
import {launchImageLibrary} from 'react-native-image-picker';


export default function EditProfile() {
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState();
    const [avatarUrl, setAvatarUrl] = useState('');
    const axiosInstance = useAxiosInterceptor()
    const updateAvatar =  async () => {

        try {
            const authToken = AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.put('http://192.168.0.102:8080/updateAvatarUrl', {avatar_url: avatarUrl}, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })

            let options = { 
                noData: true,
                mediaType: 'image',
            }
        
                launchImageLibrary(options, async (res) => {
                
                    if (res.didCancel) {
                        console.log('User cancelled photo picker');
                    } else if (res.error) {
                        console.log('ImagePicker Error: ', response.error);
                    } else {
                        const type = getMediaTypeFromURL(res.assets[0].uri);
                        
                        if(type === 'image') {
                        const base64File = await fileToBase64(res.assets[0].uri);
                        setMediaURL(base64File)
                        setMediaType(type);
                        } else {
                        console.log('unsupported media type:', type);
                        }
                    }
                });
        } catch (e) {
            console.error("unable to load image");
        }
        
    }
    return (
        <View style={styles.Container} >
            <View style = {styles.UploadContainer}>
                <Pressable style={styles.UpdateAvatar} onPress={() => updateAvatar}>
                    <Text>Upload Image</Text>
                </Pressable>
            </View>
            <View style={styles.EditDetails}>
                <TextInput style={styles.EditTextInput} name="fullName" value={fullName}  onChangeText={setFullName} placeholder='Enter the Full Name'/>
                <TextInput style={styles.EditTextInput} name="bio" value={bio} onChangeText={setBio} placeholder='Enter About you' />
            </View>
            <View style={styles.SubmitButtonContainer} >
                <Pressable style={styles.ButtonIcon}>
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