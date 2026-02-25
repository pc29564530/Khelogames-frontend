import React, { useState, useEffect } from 'react';
import { Pressable, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getAllCommunities, getJoinedCommunity, addJoinedCommunity } from '../redux/actions/actions';
import { handleInlineError } from '../utils/errorHandler';
import { fetchCommunityJoinedByUserService, fetchAllCommunityService, addUserToCommunity } from '../services/communityServices';

function Community() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [error, setError] = useState({ global: null, fields: {} });
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
            dispatch(getJoinedCommunity(response.data || []));
        } catch (err) {
            setError({ global: 'Unable to load joined communities', fields: {} });
            console.error('Unable to get the joined communities', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetchAllCommunityService();
            dispatch(getAllCommunities(response.data || []));
        } catch (err) {
            setError({ global: 'Unable to load communities', fields: {} });
            console.error('Unable to get all communities', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCommunity = async (communityPublicID) => {
        try {
            const response = await addUserToCommunity({ communityPublicID });
            dispatch(addJoinedCommunity(response.data || {}));
        } catch (err) {
            const errorMessage = handleInlineError(err);
            setError({ global: errorMessage || 'Unable to join community', fields: {} });
            console.error('Unable to add user to community', err);
        }
    };

    const handleCommunityPage = (item) => {
        navigation.navigate('CommunityPage', { item, communityPublicID: item.public_id });
    };

    return (
        <ScrollView
            style={tailwind`flex-1 bg-gray-50`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tailwind`pb-10`}
        >
            {/* Create Community Banner */}
            <View style={[tailwind`mx-4 mt-4 mb-4 bg-white rounded-2xl p-5 overflow-hidden`, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }]}>
                <View style={tailwind`flex-row items-center mb-3`}>
                    <View style={tailwind`w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3`}>
                        <MaterialIcons name="group-add" size={22} color="#ef4444" />
                    </View>
                    <Text style={tailwind`text-lg font-bold text-gray-900`}>Create a Community</Text>
                </View>
                <Text style={tailwind`text-sm text-gray-500 mb-4`}>
                    Connect with people who share your passion for sports.
                </Text>
                <Pressable
                    onPress={() => navigation.navigate('CreateCommunity')}
                    style={tailwind`bg-red-400 py-3 rounded-xl items-center`}
                >
                    <Text style={tailwind`text-white font-semibold text-sm`}>Get Started</Text>
                </Pressable>
            </View>

            {/* Section Header */}
            <View style={tailwind`flex-row items-center justify-between px-4 mb-3`}>
                <Text style={tailwind`text-base font-bold text-gray-900`}>Communities For You</Text>
                {loading && <ActivityIndicator size="small" color="#ef4444" />}
            </View>

            {/* Error */}
            {error.global && (
                <View style={tailwind`mx-4 mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex-row items-center`}>
                    <MaterialIcons name="error-outline" size={16} color="#ef4444" />
                    <Text style={tailwind`text-red-600 text-sm ml-2 flex-1`}>{error.global}</Text>
                </View>
            )}

            {/* Empty State */}
            {!loading && community.length === 0 && !error.global && (
                <View style={tailwind`mx-4 mt-6 items-center`}>
                    <View style={tailwind`w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3`}>
                        <MaterialIcons name="people-outline" size={32} color="#9ca3af" />
                    </View>
                    <Text style={tailwind`text-base font-semibold text-gray-700 mb-1`}>No Communities Yet</Text>
                    <Text style={tailwind`text-sm text-gray-400 text-center`}>Be the first to create a community!</Text>
                </View>
            )}

            {/* Community List */}
            <View style={tailwind`px-4 gap-3`}>
                {community.map((item, i) => {
                    const isJoined = joinedCommunity?.some(c => c.public_id === item.public_id);
                    return (
                        <View
                            key={i}
                            style={[tailwind`bg-white rounded-2xl p-4 flex-row items-center`, { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }]}
                        >
                            {/* Avatar */}
                            <View style={tailwind`w-12 h-12 rounded-full bg-red-100 items-center justify-center mr-3`}>
                                <Text style={tailwind`text-red-500 text-lg font-bold`}>
                                    {item.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>

                            {/* Name */}
                            <Pressable style={tailwind`flex-1`} onPress={() => handleCommunityPage(item)}>
                                <Text style={tailwind`font-semibold text-gray-900 text-sm`} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                {item.description ? (
                                    <Text style={tailwind`text-xs text-gray-400 mt-0.5`} numberOfLines={1}>
                                        {item.description}
                                    </Text>
                                ) : null}
                            </Pressable>

                            {/* Join Button */}
                            <Pressable
                                onPress={() => !isJoined && handleJoinCommunity(item.public_id)}
                                style={[
                                    tailwind`px-4 py-2 rounded-xl ml-2`,
                                    isJoined
                                        ? tailwind`bg-red-50 border border-red-200`
                                        : tailwind`bg-red-400`,
                                ]}
                            >
                                <Text style={[
                                    tailwind`text-xs font-semibold`,
                                    isJoined ? tailwind`text-red-400` : tailwind`text-white`,
                                ]}>
                                    {isJoined ? 'Joined' : 'Join'}
                                </Text>
                            </Pressable>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

export default Community;
