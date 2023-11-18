import React, {useState, useEffect} from 'react';
import {Pressable, View, TextInput, Text } from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

function CreateCommunity () {
    const navigation = useNavigation();
    const route= useRoute();
    const axiosInstance = useAxiosInterceptor();
    const [communityName, setCommunityName] = useState('');
    const [description, setDescription] = useState('');
    const [communityType, setCommunityType] = useState(route.params?.communityType || 'Community Type');
    const [community, setCommunity] = useState();

    const handleCreateCommunity = async () => {
        try {
            const community = {communityName, description, communityType};
            console.log("Community:", community)
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response  = await axiosInstance.post('http://192.168.0.103:8080/communities', community, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log("Response: ", response.data);
            setCommunity(response.data);
        } catch (err) {
            console.error(err);
        }
    }

    const handleSelectCommunity = () => {
        navigation.navigate("CommunityType");
    }

    const handleClose = () => {
        navigation.navigate("Community")
    }
    useEffect(() => {
        if(route.params?.communityType) {
            setCommunityType(route.params?.communityType);
        }
    })
    
    return (
        <View style={tailwind`flex-1 bg-black`}>
            <View style={tailwind`h-20 flex-row items-center p-2 justify-between`}>
                <Pressable onPress={handleClose}>
                    <FontAwesome name="close" color="white" size={24} />
                </Pressable>
                <Pressable onPress={handleSelectCommunity} style={tailwind`rounded-md w-2/5 bg-yellow-400 p-3`}>
                    <Text style={tailwind`text-white`}>{communityType}</Text>
                </Pressable>
            </View> 
            <View>
                <View style={tailwind`m-5 p-6`}>
                    <Text style={tailwind`text-xl text-white`} >Create a New Community</Text>
                    <Text style={tailwind`mb-5 text-white`}>This is place where a people with similar field area connect with each other.</Text>
                </View>
            
                <View style={tailwind`m-1 pl-6`}>
                    <TextInput  style={tailwind`p-3 m-6 bg-gray-300 border rounded-md w-4/5 border-gray-500 font-bold text-white bg-black`} type="input" value={communityName} onChangeText={setCommunityName} placeholder="Community Name" placeholderTextColor="white" />
                    <TextInput style={tailwind`p-3 m-6 bg-gray-300 border border-gray-500 rounded-md w-4/5 font-bold text-white bg-black`} type="input" value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="white" />
                    <Pressable style={tailwind`p-3 m-6 bg-yellow-400 rounded-md w-3/5`} onPress={handleCreateCommunity}>
                        <Text>Create Community</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

export default CreateCommunity;