import React, { useState, useEffect } from 'react';
import { Pressable, View, Text, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import CreateCommunity from './CreateCommunity';
import { BASE_URL } from '../constants/ApiConstants';
import { useSelector, useDispatch } from 'react-redux';
import { getAllCommunities, getJoinedCommunity, addJoinedCommunity } from '../redux/actions/actions';

function Community() {
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
            
            const response = await axiosInstance.get(`${BASE_URL}/getAllCommunities`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                
            });
            dispatch(getAllCommunities(response.data || []));
        } catch (err) {
            console.error(err);
        }
    };

    const handleJoinCommunity = async (communityPublicID) => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/addJoinCommunity/${communityPublicID}`, {
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

    const handleCommunityPage = (item, communityPublicID) => {
        navigation.navigate('CommunityPage', { item: item, communityPublicID: communityPublicID });
    };

    return (
        <ScrollView style={tailwind`flex-1 bg-white`}>
            {createCommunityScreen ? (
                <CreateCommunity />
            ) : (
                <>
                    <View style={tailwind`mt-1 mb-5 bg-white rounded-md h-70 shadow-lg `}>
                        <View style={tailwind`m-5`}>
                            <Text style={tailwind`text-xl text-black`}>Create a New Community</Text>
                            <Text style={tailwind`mb-5 text-black`}>This is place where people with similar field area connect with each other.</Text>
                        </View>
                        <Pressable onPress={() => navigation.navigate('CreateCommunity')} style={tailwind`bg-white h-10 items-center ml-10 mr-10 rounded-md shadow-lg pt-2`}>
                            <Text style={tailwind`font-bold text-black`}>Getting Start</Text>
                        </Pressable>
                    </View>
                    <View>
                        <Text style={tailwind`text-black font-bold p-2`}>Communities For You</Text>
                    </View>
                    <View style={tailwind`w-full rounded-md pb-12 pl-2 pr-2`}>
                        {community?.map((item, i) => (
                            <View style={tailwind`flex-row bg-white mb-1 p-3 rounded-lg h-20 shadow-lg `} key={i}>
                                    <View style={tailwind`w-12 h-12 rounded-12 bg-red-100 items-center justify-center`}>
                                        <Text style={tailwind`text-red-500 text-6x3`}>{item.name.charAt(0).toUpperCase()}</Text>
                                    </View>
                                    <View style={tailwind`w-3/5 pl-3`}>
                                        <Pressable onPress={() => handleCommunityPage(item, item.public_id)}>
                                            <Text style={tailwind`font-bold text-base text-black`}>{item.name}</Text>
                                        </Pressable>
                                    </View>
                                    <Pressable
                                        style={tailwind`w-1/5 h-9 rounded-md shadow-lg ${joinedCommunity?.some(c => c.name === item.name) ? 'bg-red-400' : 'bg-white'} p-2 m-3 justify-center`}
                                        onPress={() => handleJoinCommunity(item.public_id)}
                                    >
                                        <Text style={tailwind`text-black`}>
                                            {joinedCommunity?.some(c => c.public_id === item.public_id) ? 'Joined' : 'Join'}
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
