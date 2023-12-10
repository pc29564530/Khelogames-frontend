import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {Text, View, Image, ScrollView} from 'react-native';
import tailwind from 'twrnc';
import axios from 'axios';
import useAxiosInterceptor from './axios_config';

function CommunityMember({route}) {
    const axiosInstance = useAxiosInterceptor();
    const [communityWithProfile, setCommunityWithProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');

    const communityPageData = route.params?.communityPageData;
    const fetchCommunityMember = async () => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const communities_name = communityPageData.communities_name;

        const response = await axiosInstance.get(`http://192.168.0.101:8080/getUserByCommunity/${communities_name}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            }
        });

        const item = response.data;
        console.log("Item: ", item);

        const communityMemberPromises = item.map(async (user) => {
            const profileResponse = await axiosInstance.get(`http://192.168.0.101:8080/getProfile/${user.username}`);
            if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
                const usernameInitial = profileResponse.data.owner ? profileResponse.data.owner.charAt(0) : '';
                setDisplayText(usernameInitial.toUpperCase());
            } else {
                setDisplayText('');
            }
            return { ...user, profile: profileResponse.data };
        });

        const communityMember = await Promise.all(communityMemberPromises);

        setCommunityWithProfile(communityMember);
    } catch (e) {
        console.error("Error: Unable to fetch community member list", e);
    }
};

    
    useEffect(() => {
        fetchCommunityMember()
    }, [])
    console.log("CommunityWithProfile: ", communityWithProfile)
    return (
        <ScrollView nestedScrollEnabled={true} contentContainerStyle={{ height: 1070 }}>
            <View style={tailwind`h-15 bg-blue-200`}>
                <Text style={tailwind`text-2xl p-2 text-black`}>Active Member</Text>
            </View>
            <View style={tailwind`bg-red-200 p-3`}>
                {communityWithProfile?.map((item, index) => (
                    <View key={index} style={tailwind`h-10 flex-row gap-5`}>
                        <Image source={item.profile.avatar_url} style={tailwind`h-10 w-10 rounded-full bg-green-500`}/>
                        <View>
                            <Text style={tailwind`text-white text-xl`}>{item.profile.full_name}</Text>
                            <Text style={tailwind`text-white`}>@{item.profile.owner}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

export default CommunityMember;