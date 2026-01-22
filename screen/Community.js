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
import { handleInlineError } from '../utils/errorHandler';
import { fetchCommunityJoinedByUserService, fetchAllCommunityService, addUserToCommunity } from '../services/communityServices';

function Community() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [createCommunityScreen, setCreateCommunityScreen] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [loading, setLoading] = useState(false);
    const joinedCommunity = useSelector((state) => state.joinedCommunity.joinedCommunity || []);
    const community = useSelector((state) => state.community.community || []);

    useEffect(() => {
        fetchCommunityJoinedByUser();
        fetchData();
    }, []);

    const fetchCommunityJoinedByUser = async () => {
        try {
            setLoading(true);
            const response = await fetchCommunityJoinedByUserService();
            if(response.success && response.data.length === 0){
                //No community joined by user
                dispatch(getJoinedCommunity([]));
            }
            dispatch(getJoinedCommunity(response.data));
        } catch (err) {
            setError({
                global: 'Unable to load community',
                fields: {},
            })
            console.error('Unable to get the joined communities', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetchAllCommunityService();
            if(response.success && response.data.length === 0){
                //No community exists
                dispatch(getAllCommunities([]));
            }
            dispatch(getAllCommunities(response.data));
        } catch (err) {
            setError({
                global: 'Unable to load community',
                fields: {},
            })
            console.error('Unable to get all communities', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCommunity = async (communityPublicID) => {
        try {
            const response = await addUserToCommunity({communityPublicID: communityPublicID});
            if(response.success && response.data.length === 0){
                dispatch(addJoinedCommunity({}));
                //No community exists
            }
            dispatch(addJoinedCommunity(response.data));
        } catch (err) {
            const errorMessage = handleInlineError(err);
            setError({
                global: 'Unable to add user to community',
                fields: {errorMessage},
            })
            console.error('Unable to add user to  community', err);
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
                    {error.global && (
                        <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                            <Text style={tailwind`text-red-700 text-sm`}>
                                {error.global}
                            </Text>
                        </View>
                    )}
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
