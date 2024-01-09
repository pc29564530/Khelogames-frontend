import React, {useState, useEffect} from 'react';
import {Pressable, View, TextInput, Text } from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BASE_URL } from '../constants/ApiConstants';

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
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response  = await axiosInstance.post(`${BASE_URL}/communities`, community, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setCommunity(response.data);
            setCommunityName('');
            setCommunityType('Communtiy Type');
            setDescription('');
            navigation.goBack();
        } catch (err) {
            console.error(err);
        }
    }

    const handleSelectCommunity = () => {
        navigation.navigate("CommunityType");
    }

    useEffect(() => {
        if(route.params?.communityType) {
            setCommunityType(route.params?.communityType);
        }
    }, [route.params?.communityType])

    navigation.setOptions({
        headerTitle: '',
        headerStyle:{
            backgroundColor:'black'
        },
        headerTintColor:'white',
        headerRight:() => (
            <Pressable onPress={handleSelectCommunity} style={tailwind`rounded-md w-2/5 bg-gray-400 p-2 mr-34`}>
                <Text style={tailwind`text-white`}>{communityType}</Text>
            </Pressable>
        ),
    });
    
    return (
        <View style={tailwind`flex-1 bg-black`}>
            <View>
                <View style={tailwind`m-5 p-6`}>
                    <Text style={tailwind`text-xl text-white`} >Create a New Community</Text>
                    <Text style={tailwind`mb-5 text-white`}>This is place where a people with similar field area connect with each other.</Text>
                </View>
                <View style={tailwind`m-1 pl-6`}>
                    <TextInput  style={tailwind`p-3 m-6 bg-gray-300 border rounded-md w-4/5 border-gray-500 font-bold text-white bg-black`} type="input" value={communityName} onChangeText={setCommunityName} placeholder="Community Name" placeholderTextColor="white" />
                    <TextInput style={tailwind`p-3 m-6 bg-gray-300 border border-gray-500 rounded-md w-4/5 font-bold text-white bg-black`} type="input" value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="white" />
                    <Pressable style={tailwind`p-3 ml-24 mt-5 bg-gray-400 rounded-md w-2/5`} onPress={handleCreateCommunity}>
                        <Text style={tailwind`text-white`}>Create Community</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

export default CreateCommunity;