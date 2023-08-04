import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Pressable, TouchableOpacity, Image} from 'react-native';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import {launchImageLibrary} from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import axios from 'axios';


function CreateThread({navigation}) {

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [mediaURL,setMediaURL] = useState('');

    const selectMedia =  async () => {

        // const response = await ImagePicker.launchImageLibraryAsync({
        //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
        //     allowsEditing: false,
        //   });
    
        //   if (!response.canceled) {
        //     setMediaType('image');
        //     setMediaURL(response.uri);
        //   }

        // console.log("line no 19")
        let options = {
            noData: true,
            mediaType: 'photo',
        }
        launchImageLibrary(options, res => {
            if (res.didCancel) {
                console.log('User cancelled photo picker');
              } else if (res.error) {
                console.log('ImagePicker Error: ', response.error);
              } else {
                let source = { uri: res.assets[0].uri };
                console.log("india and the world ")
                console.log(source.uri)
                setMediaType('image');
                setMediaURL(source.uri);
              }
            // if (!res.didCancel && !res.errorCode) {
            //   if (res.assets.length > 0) {
            //     console.log("image already");
            //     // console.log(res.type);
            //     const mediaType = res.assets[0].type;
            //     const mediaURL = res.assets[0].uri;
            //     console.log(mediaURL);
            //     setMediaType(mediaType);
            //     setMediaURL(mediaURL);
            //  }
            // }
          });
    };
    const handleSubmit = async () => {
        try {
            const thread = {
                title: title,
                content: content,
                mediaType: mediaType,
                mediaURL: mediaURL,
            };

            const authToken = await AsyncStorage.getItem('AccessToken');
            const response  = await axios.post('http://localhost:8080/create_thread', thread, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(response.data)
        } catch (e) {
            console.error(e);
        }
        
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.navigate('Home')}><HomeIcon  /></Pressable>
                <Pressable><SearchIcon /></Pressable>
            </View>
            <View style={styles.bodybox}>   
                <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter Title..."/>
                <TextInput
                    style={[styles.input, styles.bodyInput]}
                    multiline 
                    value={content} 
                    onChangeText={setContent} 
                    placeholder="Enter body..."
                />
            </View>
            
            {mediaType === 'image' && <Image source={{uri: mediaURL}} />}
            {/* {mediaType === 'video' && <Video source={{uri: mediaURL}} controls={true} />} */}
            
            <Text  onPress={selectMedia} ><FileUploadIcon /> </Text>
            <Button onPress={handleSubmit} >Submit</Button>
            
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        padding:16
    },
    header:{
        flexDirection: 'row',
        justifyContent:'space-between'
    },
    bodybox:{
        borderwidth: 1,
        padding: 16,
        marginBotton: 10, 
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginBottom: 16,
      },
    bodyInput:{
        height:100,
    },
    threadBtn:{
        width: 20,
        padding:10
    }

});

export default CreateThread;