import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {Text, View, Image, ScrollView, Pressable} from 'react-native';
import tailwind from 'twrnc';
import axiosInstance from './axios_config';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import { useNavigation } from '@react-navigation/native';
import Animated,{useAnimatedScrollHandler} from 'react-native-reanimated'
import { handleInlineError } from '../utils/errorHandler';
import { getCommunityMember } from '../services/communityServices';

function  CommunityMember({item, parentScrollY, headerHeight, collapsedHeader}) {
    const [communityWithProfile, setCommunityWithProfile] = useState([]);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const community = item;
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            parentScrollY.value = event.contentOffset.y;
        },
    });

    const handleProfile = (item) => {
        navigation.navigate("Profile", {profilePublicID: item?.public_id});
    }

    const fetchCommunityMember = async () => {
        try {
            setLoading(true);
            const response = await getCommunityMember({communityPublicID: community?.public_id});
            const item = response.data;
            setCommunityWithProfile(item || [])
        } catch (err) {
            setError({
                global: "Unable to get community member",
                fields: {},
            });
            console.error("unable to fetch community member list", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunityMember()
    }, []);

    const renderMemberItem = ({item}) => {
        return (    
            <View style={tailwind`flex-1 shadow-lg rounded-lg bg-white m-2`}>
                <Pressable style={tailwind`flex-row items-center p-2`} onPress={() => handleProfile(item)}>
                    {item?.avatar_url ? (
                        <Image source={{ uri: item.avatar_url }} style={tailwind`w-12 h-12 aspect-w-1 aspect-h-1 rounded-full bg-red-500`} />
                    ) : (
                        <View style={tailwind`w-12 h-12 rounded-12 items-center bg-yellow-200 justify-center`}>
                        <Text style={tailwind`text-red-500 text-6x3`}>
                            {item.full_name && item.full_name.charAt(0).toUpperCase()}
                        </Text>
                        </View>
                    )}
                    <View style={tailwind`ml-3`}>
                        <Text style={tailwind`font-bold text-black`}>{ item.full_name}</Text>
                        <Text style={tailwind`text-black`}>@{item.username}</Text>
                    </View>
                </Pressable>
            </View>
    )}
    return (
        <>
            {error.global && communityWithProfile.length === 0 && (
                <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                    <Text style={tailwind`text-red-700 text-sm`}>
                        {error.global}
                    </Text>
                </View>
            )}
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
        </>
    )
}

export default CommunityMember;