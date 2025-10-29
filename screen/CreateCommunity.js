import React, {useState, useEffect} from 'react';
import {Pressable, View, TextInput, Text } from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BASE_URL } from '../constants/ApiConstants';
import { useSelector, useDispatch } from 'react-redux';
import { addCommunity } from '../redux/actions/actions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function CreateCommunity () {
    const navigation = useNavigation();
    
    const [communityName, setCommunityName] = useState('');
    const [description, setDescription] = useState('');
    const dispatch = useDispatch();
    const community = useSelector((state) => state.community.community);

    const handleCreateCommunity = async () => {
        try {
            if(!communityName.trim()){
                alert('Please fill fields before creating the community.');
                return;
            }
            const community = {communityName, description};
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response  = await axiosInstance.post(`${BASE_URL}/createCommunity`, community, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            dispatch(addCommunity(response.data));
            setCommunityName('');
            setDescription('');
            navigation.goBack();
        } catch (err) {
            console.error(err);
        }
    }

    navigation.setOptions({
        headerTitle: '',
        headerStyle:{
            backgroundColor:tailwind.color('bg-red-400')
        },
        headerTintColor: tailwind.color('bg-white'),
        headerLeft: ()=> (
            <View style={tailwind`flex-row items-center gap-35 p-2`}>
                <AntDesign name="arrowleft" onPress={()=>navigation.goBack()} size={24} color="white" />
            </View>
        ),
        headerRight:() => (
            <View style={tailwind`flex-row items-center mr-2 gap-18`}>
                <Pressable style={tailwind`p-2`} onPress={handleCreateCommunity}>
                    <MaterialIcons name="send" size={24} color="white" />
                </Pressable>
            </View>
        ),
    });

    
    return (
        <View style={tailwind`flex-1 bg-white`}>
            <View>
                <View style={tailwind`m-5 p-6`}>
                    <Text style={tailwind`text-xl text-black`} >Create a New Community</Text>
                    <Text style={tailwind`mb-5 text-black`}>This is place where a people with similar field area connect with each other.</Text>
                </View>
                <View style={tailwind`m-1 `}>
                    <TextInput  style={tailwind`p-2 m-3 w-full font-bold text-xl text-black bg-white`} type="input" value={communityName} onChangeText={setCommunityName} placeholder="Give the name to community" placeholderTextColor="black" />
                    <TextInput style={tailwind`p-2 m-3 bg-gray-300 w-full text-black text-lg bg-white`} type="input" value={description} onChangeText={setDescription} placeholder="Write something about the community" placeholderTextColor="black" />
                </View>
            </View>
        </View>
    );
}

export default CreateCommunity;