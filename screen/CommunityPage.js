import React, {useState, useEffect} from 'react';
import {View, Text, Image, Pressable, ScrollView} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');
import { TopTabCommunityPage } from '../navigation/TopTabCommunityPage';
import { BASE_URL } from '../constants/ApiConstants';

function CommunityPage({route}) {
    const navigation = useNavigation();
    const [joinedCommunity, setJoinedCommunity] = useState([]);
    const [memberCount, setMemeberCount] = useState(1);
    const axiosInstance = useAxiosInterceptor();
    const communityPageData = route.params?.item;
    
    const fetchCommunityJoinedByUser = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getCommunityByUser`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            setJoinedCommunity(response.data);
        } catch (e) {
            console.error('Unable to get the joined communities', e);
        }
    };

    //community member length
    const fetchCommunityLength = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            console.log('CommunityPage: ',communityPageData)
            const communities_name = communityPageData.communities_name;
            const response = await axiosInstance.get(`${BASE_URL}/getUserByCommunity/${communities_name}`,null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            setMemeberCount(response.data.length);
        } catch (err) {
            console.error('Unable to get the length of the user', err);
        }
    }

    //to join any community from the community list
    const handleJoinCommunity = async (item) => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            await axiosInstance.post(`${BASE_URL}/joinUserCommunity/${item}`, null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            setJoinedCommunity(((prevCommunities)=> [...prevCommunities, item]));
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchCommunityJoinedByUser();
        fetchCommunityLength();
    },[])

    navigation.setOptions({
        headerTitle: '',
        headerStyle:{
            backgroundColor:'black'
        },
        headerTintColor:'white'
    });

    return (
        <ScrollView contentContainerStyle={{height:1070}}>
            <View style={tailwind`bg-black flex-1`}>
                <View style={tailwind`bg-gray-500 h-50 p-4`}></View>
                <Image source={logoPath} style={tailwind`bg-white h-20 w-20 rounded-md pl-2 ml-2 -mt-8 `}/>
                
                <View style={tailwind`p-5 gap-4 flex-row`}>
                    <View>
                        <Text style={tailwind`text-white font-bold text-2xl`}>{communityPageData.communities_name}</Text>
                        <Text style={tailwind`text-white text-`}>{communityPageData.description}</Text>
                    </View>
                    <Pressable
                        style={tailwind`w-1/5 h-9 rounded-md ${
                            joinedCommunity.some(c => c.community_name === communityPageData.communities_name)
                                ? 'bg-gray-500'
                                : 'bg-blue-500'
                        } p-2 m-3 justify-evenly`}
                        onPress={() => handleJoinCommunity(communityPageData.communities_name)}
                    >
                        <Text style={tailwind`text-white pl-1.5`}>
                            {joinedCommunity.some(c => c.community_name === communityPageData.communities_name) ? 'Joined' : 'Join'}
                        </Text>
                    </Pressable>
                </View>
                <View style={tailwind`flex-row gap-3`}>
                    <FontAwesome name="user" color="white" size={14} style={tailwind`pl-4`}/>
                    {/* implement the follow button */}
                    <Text style={tailwind`text-white text-sm -mt-1`}>{memberCount}</Text>
                </View>
                <View style={tailwind`flex-1`}>
                    <TopTabCommunityPage communityPageData={communityPageData}/>
                </View>
            </View>
        </ScrollView>
    )
}

export default CommunityPage;
