import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {Text, View, Image, ScrollView, Pressable} from 'react-native';
import tailwind from 'twrnc';
import axiosInstance from './axios_config';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import { useNavigation } from '@react-navigation/native';

function  CommunityMember({route}) {
    
    const [communityWithProfile, setCommunityWithProfile] = useState([]);
    const navigation = useNavigation();
    const communityData = route.params?.item;

    const handleProfile = (item) => {
        navigation.navigate("Profile", {profilePublicID: item.profile.public_id})
    }

    const fetchCommunityMember = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/get_communities_member/${communityData.public_id}`,null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const item = response.data;
            setCommunityWithProfile(item)
        } catch (e) {
            console.error("unable to fetch community member list", e);
        }
    };

    useEffect(() => {
        fetchCommunityMember()
    }, []);

    return (
        <ScrollView nestedScrollEnabled={true} contentContainerStyle={{ height: 1070 }} style={tailwind`bg-white`}>
            <View style={tailwind`h-12`}>
                <Text style={tailwind`text-2xl p-2 text-black`}>Active Member</Text>
            </View>
            <View style={tailwind` p-3`}>
                {communityWithProfile?.map((item, index) => (
                    <View key={index} style={tailwind`h-10 flex-row gap-5 mt-5`}>
                        <Pressable style={tailwind`flex-row items-center p-2`} onPress={() => handleProfile(iten)}>
                            {item.profile?.avatar_url ? (
                                <Image source={{ uri: item.profile.avatar_url }} style={tailwind`w-12 h-12 aspect-w-1 aspect-h-1 rounded-full bg-red-500`} />
                            ) : (
                                <View style={tailwind`w-12 h-12 rounded-12 items-center bg-yellow-200 justify-center`}>
                                <Text style={tailwind`text-red-500 text-6x3`}>
                                    N/A
                                </Text>
                                </View>
                            )}
                            <View style={tailwind`ml-3`}>
                                <Text style={tailwind`font-bold text-black`}>{item.profile && item.profile.full_name ? item.profile.full_name : ''}</Text>
                                <Text style={tailwind`text-black`}>@{item.profile.username}</Text>
                            </View>
                        </Pressable>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

export default CommunityMember;