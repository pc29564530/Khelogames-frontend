import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Image} from 'react-native';
import useAxiosInterceptor from './axios_config';
import { useNavigation } from '@react-navigation/native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { BASE_URL } from '../constants/ApiConstants';
const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function CommunityList() {
    const [communityList, setCommunityList] = useState([]);
    // const [dispayText, setDisplayText] = useState('')
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const fetchCommunity = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/get_all_communities`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            const item = await response.data;

            if(item === null) {
                setCommunityList([]);
            } else {
                const communityWithDisplayText = item.map((item, index) => {
                    let displayText = '';
                    const words = item.communities_name.split(' ');
                    displayText = words[0].charAt(0).toUpperCase();
                    if(words.length>1){
                        displayText += words[1].charAt(0).toUpperCase()
                    }
                    return {...item, displayText, displayText}
                })

                setCommunityList(communityWithDisplayText);
            }

        } catch(err) {
            console.error('error unable to get community list', err)
        }
    }

    const handleSelectCommunity = (item) => {
        navigation.navigate('CreateThread', {communityType: item});
    }

    useEffect(()=> {
        fetchCommunity();
    }, []);

    navigation.setOptions({
        headerTitle:'',
        headerLeft:()=>(
            <Pressable onPress={()=>navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="white" style={tailwind`ml-4`} />
            </Pressable>
        ),
        headerStyle:tailwind`bg-black`
    })

    return (
        <View style={tailwind`flex-1 bg-black `}>
            {communityList.map((item,index)=> (
                <Pressable key={index} onPress={()=>handleSelectCommunity(item.communities_name)} style={tailwind`bg-black border rounded-md p-2 gap-3 flex-row`}>
                    <View style={tailwind`w-12 h-12 rounded-12 bg-red-100 items-center justify-center`}>
                        <Text style={tailwind`text-red-500 text-6x3`}>
                            {item.displayText}
                        </Text>
                    </View>
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

