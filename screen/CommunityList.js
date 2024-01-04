import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Image} from 'react-native';
import useAxiosInterceptor from './axios_config';
import { useNavigation } from '@react-navigation/native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function CommunityList() {
    const [communityList, setCommunityList] = useState([]);
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const fetchCommunity = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`http://10.0.2.2:8080/get_all_communities`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            const item = await response.data;
            if(item === null) {
                setCommunityList([]);
            } else {
                setCommunityList(item);
            }

        } catch(e) {
            console.error('error unable to get community list', err)
        }
    }

    const handleSelectCommunity = (item) => {
        navigation.navigate('CreateThread', {communityType: item});
    }

    useEffect(()=> {
        fetchCommunity();
    }, []);

    return (
        <View style={tailwind`flex-1 bg-white `}>
            {communityList.map((item,index)=> (
                <Pressable key={index} onPress={()=>handleSelectCommunity(item.communities_name)} style={tailwind`bg-black border rounded-md p-2 gap-3 flex-row`}>
                    <Image source={logoPath} style={tailwind`h-20 w-20 rounded-2xl`}/>
                    <View>
                        <Text style={tailwind`text-white text-2xl`}>{item.communities_name}</Text>
                        <Text style={tailwind`text-white`}>{item.description}</Text>
                    </View>
                </Pressable>
            ))}
        </View>
    );
}

export default CommunityList;

