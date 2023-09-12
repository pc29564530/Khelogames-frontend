import React, {useState, useEffect} from 'react';
import {View, Text, Image, Input, TextInput, Button} from 'react-native';
import axios from 'axios';
import AsyncStorage  from '@react-native-async-storage/async-storage';



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
            <Text>Create a New Community</Text>
            <Text>This is place where a people with similar thought connect with each other.</Text>
            {/* <Image src=""/> */}
            <input  type="file" palceholder="Upload Image"/>
            <TextInput type="input" value={communityName} onChangeText={setCommunityName} placeholder="Community Name"/>
            <TextInput type="input" value={description} onChangeText={setDescription} placeholder="Description" />
            <TextInput type="input" value={communityType} onChangeText={setCommunityType} placeholder="Community Type" />
            <Button type="button" onPress={handleCreateCommunity}>Create Community</Button>
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
        if(data.length > 0) {
            fetchData();
        }
    },[]);

    return (
        <View >
            
            <CreateCommunity /> 
            <View >
                {data.map((item,i) => (
                    <View key={i}>
                        <Text>{item.communities_name}</Text>
                        <Text>{item.description}</Text>
                        <Text>{item.community_type}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}



export default Community;