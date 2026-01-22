import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Image} from 'react-native';
import axiosInstance from './axios_config';
import { useNavigation } from '@react-navigation/native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { BASE_URL } from '../constants/ApiConstants';
const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function CommunityList() {
    const [communityList, setCommunityList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const navigation = useNavigation();
    const fetchCommunity = async () => {
        try {
            setLoading(true);
            setError({
                global: null,
                fields: {},
            })
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/get_all_communities`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const item = response.data;

            if(item.data === null) {
                setCommunityList([]);
            } else {
                const communityWithDisplayText = item.data.map((itm, index) => {
                    let displayText = '';
                    const words = itm.communities_name.split(' ');
                    displayText = words[0].charAt(0).toUpperCase();
                    if(words.length>1){
                        displayText += words[1].charAt(0).toUpperCase()
                    }
                    return {...itm, displayText, displayText}
                })
                setCommunityList(communityWithDisplayText);
            }
        } catch(err) {
            const backendError = err?.response?.data?.error?.fields;
            setError({
                global: "Unable to get community list",
                fields: backendError,
            });
            console.error('error unable to get community list', err)
        } finally {
            setLoading(false);
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
            {error?.global && communityList.length === 0 && (
                <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                    <Text style={tailwind`text-red-700 text-sm`}>
                        {error?.global}
                    </Text>
                </View>
            )}
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

