import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Pressable, TouchableOpacity, Image} from 'react-native';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import axios from 'axios';


function Thread({navigation}) {

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [mediaURL,setMediaURL] = useState('');

    const selectMedia = async () => {
        
        await launchImageLibrary({ mediaType: 'photo'}, (res) => {
            if (!res.didCancel && !res.errorCode) {
                setMediaType('image');
                setMediaURL(res.uri);
            }
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
            {mediaType === 'video' && <Video source={{uri: mediaURL}} controls={true} />}
            
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

export default Thread;