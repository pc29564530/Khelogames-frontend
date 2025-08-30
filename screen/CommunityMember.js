import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {Text, View, Image, ScrollView, Pressable} from 'react-native';
import tailwind from 'twrnc';
import axiosInstance from './axios_config';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import { useNavigation } from '@react-navigation/native';
import Animated,{useAnimatedScrollHandler} from 'react-native-reanimated'

function  CommunityMember({item, parentScrollY, headerHeight, collapsedHeader}) {
    
    const [communityWithProfile, setCommunityWithProfile] = useState([]);
    const navigation = useNavigation();
    const community = item;
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            parentScrollY.value = event.contentOffset.y;
        },
    });

    const handleProfile = (item) => {
        navigation.navigate("Profile", {profilePublicID: item.profile.public_id})
    }

    const fetchCommunityMember = async () => {
        try {
            //change the url name getCommunityMember
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

    const renderMemberItem = ({item}) => {
            <View style={tailwind`h-10 flex-row gap-5 mt-5`}>
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
    }
    return (
        <Animated.FlatList 
            data={communityWithProfile || []}
            keyExtractor={(item, index) => item.public_id ? item.public_id.toString() : index.toString()}
            renderItem={renderMemberItem}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={{
                paddingTop: 10, // push down so content starts below header
                paddingBottom: 50,
            }}
            showsVerticalScrollIndicator={false}

        />
    )
}

export default CommunityMember;