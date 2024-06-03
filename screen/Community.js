import React, { useState, useEffect } from 'react';
import { Pressable, View, Text, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import CreateCommunity from './CreateCommunity';
import { BASE_URL } from '../constants/ApiConstants';
import { useSelector, useDispatch } from 'react-redux';
import { getAllCommunities, getJoinedCommunity, addJoinedCommunity } from '../redux/actions/actions';

function Community() {
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [createCommunityScreen, setCreateCommunityScreen] = useState(false);
    const joinedCommunity = useSelector((state) => state.joinedCommunity.joinedCommunity || []);
    const community = useSelector((state) => state.community.community || []);

    useEffect(() => {
        fetchCommunityJoinedByUser();
        fetchData();
    }, []);

    const fetchCommunityJoinedByUser = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getCommunityByUser`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            dispatch(getJoinedCommunity(response.data || []));
        } catch (e) {
            console.error('Unable to get the joined communities', e);
        }
    };

    const fetchData = async () => {
        try {

            const authToken = await AsyncStorage.getItem('AccessToken');
            
            const response = await axiosInstance.get(`${BASE_URL}/get_all_communities`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                
            });
            const communities = response.data.map(item => ({
                communities_name: item.communities_name,
                community_type: item.community_type,
                description: item.description,
                displayText: item.communities_name.charAt(0).toUpperCase(),
            }));
            dispatch(getAllCommunities(communities || []));
        } catch (err) {
            console.error(err);
        }
    };

    const handleJoinCommunity = async (itemName) => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/addJoinCommunity`, { community_name: itemName }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            dispatch(addJoinedCommunity(response.data));
        } catch (err) {
            console.error("Error joining community: ", err);
        }
    };

    const handleCommunityPage = (item, id) => {
        navigation.navigate('CommunityPage', { item: item, itemId: id });
    };

    return (
        <ScrollView style={tailwind`flex-1 bg-black`}>
            {createCommunityScreen ? (
                <CreateCommunity />
            ) : (
                <>
                    <View style={tailwind`mt-1 mb-5 bg-gray-800 rounded-md h-70`}>
                        <View style={tailwind`m-5`}>
                            <Text style={tailwind`text-xl text-white`}>Create a New Community</Text>
                            <Text style={tailwind`mb-5 text-white`}>This is place where people with similar field area connect with each other.</Text>
                        </View>
                        <Pressable onPress={() => navigation.navigate('CreateCommunity')} style={tailwind`bg-blue-500 h-10 items-center ml-10 mr-10 rounded-md pt-2`}>
                            <Text style={tailwind`font-bold text-white`}>Getting Start</Text>
                        </Pressable>
                    </View>
                    <View>
                        <Text style={tailwind`text-white font-bold p-2`}>Communities For You</Text>
                    </View>
                    <View style={tailwind`w-full rounded-md pb-12 pl-2 pr-2`}>
                        {community?.map((item, i) => (
                            <View style={tailwind`flex-row bg-gray-800 mb-1 p-3 rounded-md h-20`} key={i}>
                                <View style={tailwind`w-12 h-12 rounded-12 bg-red-100 items-center justify-center`}>
                                    <Text style={tailwind`text-red-500 text-6x3`}>{item.displayText}</Text>
                                </View>
                                <View style={tailwind`w-3/5 pl-3`}>
                                    <Pressable onPress={() => handleCommunityPage(item, item.id)}>
                                        <Text style={tailwind`font-bold text-base text-white`}>{item.communities_name}</Text>
                                        <Text style={tailwind`text-white`}>{item.description}</Text>
                                        <Text style={tailwind`text-base text-gray-400`}>{item.community_type}</Text>
                                    </Pressable>
                                </View>
                                <Pressable
                                    style={tailwind`w-1/5 h-9 rounded-md ${joinedCommunity?.some(c => c.community_name === item.communities_name) ? 'bg-gray-500' : 'bg-blue-500'} p-2 m-3 justify-center`}
                                    onPress={() => handleJoinCommunity(item.communities_name)}
                                >
                                    <Text style={tailwind`text-white pl-2`}>
                                        {joinedCommunity?.some(c => c.community_name === item.communities_name) ? 'Joined' : 'Join'}
                                    </Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </ScrollView>
    );
}

export default Community;
