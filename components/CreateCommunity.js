import React, {useState, useEffect} from 'react';
import {Pressable, View, Text, Image, Input, TextInput, Button, StyleSheet, Touchable, ScrollView, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');
import ModalDropdown from 'react-native-modal-dropdown';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
const mainCommunities = ["Football", "Chess", "VolleyBall", "Hockey"];

function CreateCommunity () {
    const axiosInstance = useAxiosInterceptor();
    const [communityName, setCommunityName] = useState('');
    const [description, setDescription] = useState('');
    const [communityType, setCommunityType] = useState('Community Type');
    const [community, setCommunity] = useState();


    const handleCreateCommunity = async () => {
        try {
            const community = {communityName, description, communityType};
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response  = await axiosInstance.post('http://192.168.0.101:8080/communities', community, {
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
        <View style={tailwind`flex-1 p-2 bg-black`}>
            <View style={tailwind`m-5`}>
                <Text style={tailwind`text-xl text-white`} >Create a New Community</Text>
                <Text style={tailwind`mb-5 text-white`}>This is place where a people with similar field area connect with each other.</Text>
            </View>
           
            <View style={tailwind`m-1 p-1`}>
                <TextInput  style={tailwind`p-3 m-3 bg-gray-300 border rounded-md w-4/5 border-gray-500 font-bold text-white bg-black`} type="input" value={communityName} onChangeText={setCommunityName} placeholder="Community Name" placeholderTextColor="white" />
                <TextInput style={tailwind`p-3 m-3 bg-gray-300 border border-gray-500 rounded-md w-4/5 font-bold text-white bg-black`} type="input" value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="white" />
                {/* <View style={tailwind`p-3 rounded-md w-3/5`}> */}
                  <ModalDropdown
                    options={mainCommunities}
                    style={tailwind`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`} // Custom style for dropdown text
                  >
                    <Text style={tailwind`bg-black-200 p-1`}>Community Type</Text>
                  </ModalDropdown>
                {/* </View> */}
                <Pressable style={tailwind`p-3 m-3 bg-yellow-400 rounded-md w-3/5`} onPress={handleCreateCommunity}>
                    <Text>Create Community</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default CreateCommunity;