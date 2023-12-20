import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable} from 'react-native';
import useAxiosInterceptor from './axios_config';
import { useNavigation } from '@react-navigation/native';
import tailwind from 'twrnc';

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
            console.log("CommunityList: ", item)
        } catch(e) {
            console.error('error unable to get community list', err)
        }
    }

    const handleSelectCommunity = (item) => {
        console.log("Item in line 34: ", item)
        navigation.navigate('CreateThread', {communityType: item});
    }

    useEffect(()=> {
        fetchCommunity();
    }, []);
    console.log("List: ", communityList)
    return (
        <View >
            
                {communityList.map((item,index)=> (
                    <Pressable key={index} onPress={()=>handleSelectCommunity(item.communities_name)} style={tailwind`h-25 bg-red-300 p-2 mb-2`}>
                        <Text style={tailwind`text-black`}>{item.communities_name}</Text>
                        <Text style={tailwind`text-black`}>{item.communities_description}</Text>
                    </Pressable>
                ))}
        </View>
    );
}

export default CommunityList;

