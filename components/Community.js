import React, {useState, useEffect} from 'react';
import {View, Text, Image, Input, TextInput, Button, StyleSheet, Touchable, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import logoPath from '~/Khelogames/assets/images/Khelogames.png';



function CreateCommunity () {
    const [communityName, setCommunityName] = useState('');
    const [description, setDescription] = useState('');
    const [communityType, setCommunityType] = useState('');
  
    const [community, setCommunity] = useState();

    const handleCreateCommunity = async () => {
        try {
            const community = {communityName, description, communityType};
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response  = await axios.post('http://192.168.0.105:8080/communities', community, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(response.data)
            setCommunity(response.data);
        } catch (err) {
            console.error(err);
        }
    }
    
    return (
        <View>
            <View style={styles.Description}>
                <Text>Create a New Community</Text>
                <Text>This is place where a people with similar field area connect with each other.</Text>
            </View>
            
            {/* <Image src=""/> */}
            {/* <input  type="file" palceholder="Upload Image"/> */}
            <View style={styles.InputBoxContainer}>
                <TextInput  style={styles.TextInputBox} type="input" value={communityName} onChangeText={setCommunityName} placeholder="Community Name"/>
                <TextInput style={styles.TextInputBox} type="input" value={description} onChangeText={setDescription} placeholder="Description" />
                <TextInput style={styles.TextInputBox} type="input" value={communityType} onChangeText={setCommunityType} placeholder="Community Type" />
                <TouchableOpacity style={styles.InputButton} onPress={handleCreateCommunity}>
                    <Text>Create Community</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


function Community () {

    const [data, setData] = useState([]);

    const fetchData = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            console.log(user);
            const response = await fetch(`http://192.168.0.105:8080/get_all_communities/${user}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            const item = await response.json();
            if(item == null) {
                setData([]);
            } else {
                setData(item);
            }
            console.log(item);
        } catch (err) {
            console.error(err);
        }
        
    }
    useEffect(() => {
        // if(data.length > 0) {
            fetchData();
        // }
    },[]);

    return (
        <ScrollView  style={styles.Container}>
            <View style={styles.InputContainer}>
                <CreateCommunity /> 
            </View>
            <View style={styles.ViewContainer}>
                {data.map((item,i) => (
                    <View style={styles.SubViewBox} key={i}>
                        <Image style={styles.DisplayImage} source={logoPath} />
                        <View style={styles.ViewBox}>
                            <Text style={styles.CommunityName}>{item.communities_name}</Text>
                            <Text style={styles.CommunityDescription}>{item.description}</Text>
                            <Text style={styles.CommunityTypeBox}>{item.community_type}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        
    },
    InputContainer: {
        marginTop: 10,
        marginBottom: 10,
        alignContent: 'center',
        alignSelf: 'center',
        backgroundColor: 'white',
        gap: 10
    },
    ViewContainer:{
        alignContent: 'center',
        alignSelf: 'center',
        width: '100%',
        backgroundColor: 'white',
        padding: 10,
        gap: 10
    },
    Description: {
        gap: 10,
        margin: 10,
    },
    InputBoxContainer: {
        alignContent: 'center',
        alignItems: 'center', 
        backgroundColor: 'white',
        gap: 20,  
    },
    TextInputBox: {
        padding: 10,
        margin: 10,
        backgroundColor: 'whitesmoke',
        width: '60%',
        fontSize: 15,
        borderRadius: 5,
        gap: 40,
        textAlign: 'justify',
    },
    InputButton: {
        padding: 10,
        backgroundColor: "whitesmoke",
        marginBottom: 10,

    },
    SubViewBox: {
        backgroundColor: 'whitesmoke',
        padding: 10,
        flexDirection: 'row'
    },
    DisplayImage: {
        marginRight: 10,
        width: 50,
        height: 50,
        borderRadius: 5,
        backgroundColor: 'red',
    },
    ViewBox: {
        flexDirection: 'column'
    },
    CommunityName: {

    }
})

export default Community;