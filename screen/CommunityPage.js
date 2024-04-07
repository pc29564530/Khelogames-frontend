import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ScrollView} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import { TopTabCommunityPage } from '../navigation/TopTabCommunityPage';
import { BASE_URL } from '../constants/ApiConstants';
import {useSelector, useDispatch} from 'react-redux';
import { getJoinedCommunity, addJoinedCommunity } from '../redux/actions/actions';

function CommunityPage({route}) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const joinedCommunity = useSelector((state) => state.joinedCommunity.joinedCommunity)
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
            dispatch(getJoinedCommunity(response.data))

        } catch (e) {
            console.error('Unable to get the joined communities', e);
        }
    };
    
    const handleAnnouncement = (communityPageData) => {
        navigation.navigate('CommunityMessage', {communityPageData:communityPageData})
    }

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
            const response = await axiosInstance.post(`${BASE_URL}/joinUserCommunity/${item}`, null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            dispatch(addJoinedCommunity(response.data));
            
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
            <View style={tailwind`bg-black flex-1 pl-2 pt-2`}>
                <View style={tailwind`flex-row`}>
                    <View style={tailwind`w-15 h-15 rounded bg-red-100 items-center justify-center`}>
                        <Text style={tailwind`text-red-500 text-8x3`}>
                            {communityPageData.displayText}
                        </Text>
                    </View>
                    <View style={tailwind`ml-4`}>
                        <Text style={tailwind`text-white font-bold text-2xl`}>{communityPageData.communities_name}</Text>
                        {/* <Text style={tailwind`text-white text-`}>{communityPageData.description}</Text> */}
                        <Text style={tailwind`text-white text-sm mt-1`}>Community - {memberCount} member</Text>
                    </View>
                    <Pressable
                        style={tailwind` w-1/5 h-9 rounded-md  ${
                            joinedCommunity?.some(c => c.community_name === communityPageData.communities_name)
                                ? 'bg-gray-500'
                                : 'bg-blue-500'
                        } p-2 m-3 ml-20`}
                        onPress={() => handleJoinCommunity(communityPageData.communities_name)}
                    >
                        <Text style={tailwind`text-white pl-1.5`}>
                            {joinedCommunity?.some(c => c.community_name === communityPageData.communities_name) ? 'Joined' : 'Join'}
                        </Text>
                    </Pressable>
                </View>
                <Pressable style={tailwind`h-20 items-start mt-8 ml-4 flex-row rounded h-12 w-full bg-gray-900 items-center`} onPress={() => handleAnnouncement(communityPageData)}>
                    <AntDesign name="sound" size={20} color="white" style={tailwind` rounded bg-red-500 w-8 h-8 items-center p-1.6 ml-2`} />
                    <Text style={tailwind`text-white text-2xl ml-2`}>Announcements</Text>
                </Pressable>
                <View style={tailwind`flex-1`}>
                    <TopTabCommunityPage communityPageData={communityPageData}/>
                </View>
            </View>
        </ScrollView>
    )
}

export default CommunityPage;
