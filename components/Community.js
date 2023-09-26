import React, {useState, useEffect} from 'react';
import {View, Text, Image, Input, TextInput, Button, StyleSheet, Touchable, ScrollView} from 'react-native';
import axios from 'axios';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';



function CreateCommunity () {
    const [communityName, setCommunityName] = useState('');
    const [description, setDescription] = useState('');
    const [communityType, setCommunityType] = useState('');
  
    const [community, setCommunity] = useState();

    const handleCreateCommunity = async () => {
        try {
            const community = {communityName, description, communityType};
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response  = await axios.post('http://localhost:8080/communities', community, {
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
            <View style={styles.description}>
                <Text>Create a New Community</Text>
                <Text>This is place where a people with similar field area connect with each other.</Text>
            </View>
            
            {/* <Image src=""/> */}
            {/* <input  type="file" palceholder="Upload Image"/> */}
            <View style={styles.inputBoxContainer}>
                <TextInput  style={styles.textInputBox} type="input" value={communityName} onChangeText={setCommunityName} placeholder="Community Name"/>
                <TextInput style={styles.textInputBox} type="input" value={description} onChangeText={setDescription} placeholder="Description" />
                <TextInput style={styles.textInputBox} type="input" value={communityType} onChangeText={setCommunityType} placeholder="Community Type" />
                <TouchableOpacity style={styles.inputButton} onPress={handleCreateCommunity}>
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
            const response = await fetch(`http://localhost:8080/get_all_communities/${user}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            const item = await response.json();
            // const item = await response.data;
            setData(item)
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
        <ScrollView  style={styles.container}>
            <View style={styles.inputContainer}>
                <CreateCommunity /> 
            </View>
            <View style={styles.viewContainer}>
                {data.map((item,i) => (
                    <View style={styles.subViewBox} key={i}>
                        <Image style={styles.displayImage} src='/home/pawan/' />
                        <View style={styles.viewBox}>
                            <Text style={styles.communityName}>{item.communities_name}</Text>
                            <Text style={styles.communityDescription}>{item.description}</Text>
                            <Text style={styles.communityTypeBox}>{item.community_type}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        
    },
    inputContainer: {
        marginTop: 10,
        marginBottom: 10,
        alignContent: 'center',
        alignSelf: 'center',
        backgroundColor: 'white',
        gap: 10
    },
    viewContainer:{
        alignContent: 'center',
        alignSelf: 'center',
        width: '100%',
        backgroundColor: 'white',
        padding: 10,
        gap: 10
    },
    description: {
        gap: 10,
        margin: 10,
    },
    inputBoxContainer: {
        alignContent: 'center',
        alignItems: 'center', 
        backgroundColor: 'white',
        gap: 20,  
    },
    textInputBox: {
        padding: 10,
        marign: 10,
        backgroundColor: 'whitesmoke',
        width: '60%',
        fontSize: '15',
        borderRadius: '5px',
        gap: 40,
        justifyContent: 'space-between',
    },
    inputButton: {
        padding: 10,
        backgroundColor: "whitesmoke",
        marginBottom: 10,

    },
    subViewBox: {
        backgroundColor: 'whitesmoke',
        padding: 10,
        flexDirection: 'row'
    },
    displayImage: {
        marginRight: 10,
        width: 50,
        height: 50,
        borderRadius: 5,
        backgroundColor: 'red',
        color: 'red',
    },
    viewBox: {
        flexDirection: 'column'
    },
    communityName: {

    }
})

export default Community;