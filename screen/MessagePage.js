import React, { useRef, useState, useLayoutEffect } from 'react';
import { View, Text, Image, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../constants/ApiConstants';
import AntDesign from 'react-native-vector-icons/AntDesign';

function MessagePage() {
    const navigation = useNavigation();

    const [previousContacts, setPreviousContacts] = useState([]);

    const [communities, setCommunities] = useState([]);

    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredCommunities, setFilteredCommunities] = useState([]);

    const [searchUser, setSearchUser] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
     const [error, setError] = useState({
        global: null,
        fields: {},
    });

    // Debounce timer ref
    const searchTimer = useRef(null);

    // Fetch previously messaged users
    const fetchMessageReceiver = async () => {
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getMessagedUser`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const items = response?.data?.data;
            if (!items || items.length === 0) {
                setPreviousContacts([]);
                setFilteredUsers([]);
            } else {
                setPreviousContacts(items);
                setFilteredUsers(items);
            }
        } catch (err) {
            setError({
                global: "Unable to fetch message receiver",
                fields: err?.response.data?.error || {},
            })
            console.error('Unable to fetch message error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch communities
    const fetchCommunity = async () => {
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getCommunityByMessage`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const items = response?.data.data;
            if (!items || items.length === 0) {
                setCommunities([]);
                setFilteredCommunities([]);
            } else {
                setCommunities(items);
                setFilteredCommunities(items);
            }
        } catch (err) {
            setError({
                global: "Unable to get community message",
                fields: err?.response.data?.error || {},
            })
            console.error('Unable to get community message:', err);
        } finally {
            setLoading(false);
        }
    };

    // Search ALL
    const searchByUser = async (text) => {
        if (!text || text.trim() === '') return;
        try {
            setSearchLoading(true);
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(
                `${BASE_URL}/search-user`,
                { name: text.trim() },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const results = response?.data?.data;
            setFilteredUsers(results || []);
        } catch (err) {
            setError({
                global: "Unable to search by user",
                fields: err?.response?.data?.error || {},
            })
            console.error('Unable to search by user:', err);
            setFilteredUsers([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Load on screen focus
    useFocusEffect(
        React.useCallback(() => {
            fetchMessageReceiver();
            fetchCommunity();
            setSearchUser('');
        }, [])
    );

    // Handle search input
    const handleSearch = (text) => {
        setSearchUser(text);

        // Clear existing debounce timer
        if (searchTimer.current) {
            clearTimeout(searchTimer.current);
        }

        if (text.trim() === '') {
            setFilteredUsers(previousContacts);
            setFilteredCommunities(communities);
            return;
        }

        // Filter communities locally (instant, no API)
        const searchTerm = text.toLowerCase().trim();
        const filteredComm = communities?.filter((item) => {
            const name = (item.name || '').toLowerCase();
            const description = (item.description || item.discription || '').toLowerCase();
            return name.includes(searchTerm) || description.includes(searchTerm);
        });
        setFilteredCommunities(filteredComm);

        // Debounce user search API call (300ms)
        searchTimer.current = setTimeout(() => {
            searchByUser(text);
        }, 300);
    };

    // Clear search revert to previous contacts
    const clearSearch = () => {
        setSearchUser('');
        setFilteredUsers(previousContacts);
        setFilteredCommunities(communities);
    };

    // Navigation
    const handleMessage = (item) => {
        navigation.navigate('Message', { profileData: item });
    };

    const handleMessageCommunity = (item) => {
        navigation.navigate('CommunityMessage', { communityPageData: item });
    };

    // Avatar helpers
    const getUserInitials = (item) => {
        const name = item?.full_name || item?.username || '';
        return name.charAt(0).toUpperCase() || '?';
    };

    const getCommunityInitials = (item) => {
        return (item?.name || '?').charAt(0).toUpperCase();
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: '',
            headerStyle: tailwind`bg-red-400`,
            headerLeft: () => (
                <View style={tailwind`flex-row items-center gap-35 p-2`}>
                    <AntDesign name="arrowleft" onPress={() => navigation.goBack()} size={24} color="white" />
                    <Text style={tailwind`text-white text-xl`}>Messages</Text>
                </View>
            ),
        });
    }, [navigation]);

    const isSearching = searchUser.trim() !== '';
    const showNoResults =
        isSearching && !searchLoading && filteredUsers.length === 0 && filteredCommunities.length === 0;
    const showEmptyState =
        !isSearching && !loading && previousContacts.length === 0 && communities.length === 0;

    return (
        <ScrollView style={tailwind`bg-white flex-1`}>

            <View style={tailwind`bg-white p-4`}>
                <View style={tailwind`flex-row items-center border border-gray-300 rounded-lg px-3 py-2`}>
                    <AntDesign name="search1" size={18} color="#666" style={tailwind`mr-2`} />
                    <TextInput
                        value={searchUser}
                        onChangeText={handleSearch}
                        placeholder="Search users or communities"
                        style={tailwind`flex-1 text-base`}
                        placeholderTextColor="#999"
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    {searchLoading && (
                        <ActivityIndicator size="small" color="#999" style={tailwind`mr-2`} />
                    )}
                    {searchUser.length > 0 && !searchLoading && (
                        <Pressable onPress={clearSearch}>
                            <AntDesign name="close" size={18} color="#666" />
                        </Pressable>
                    )}
                </View>
            </View>

            <View style={tailwind`flex-1 bg-white px-4`}>
                {loading && (
                    <View style={tailwind`items-center py-8`}>
                        <ActivityIndicator size="large" color="#f87171" />
                    </View>
                )}
                {error.global && !loading && (
                    <View style={tailwind`mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                        <Text style={tailwind`text-red-700 text-sm`}>{error.global}</Text>
                    </View>
                )}
                {showNoResults && (
                    <View style={tailwind`items-center py-8`}>
                        <Text style={tailwind`text-lg text-gray-500`}>No results found</Text>
                        <Text style={tailwind`text-sm text-gray-400 mt-1`}>Try a different name</Text>
                    </View>
                )}
                {showEmptyState && (
                    <View style={tailwind`items-center py-12`}>
                        <AntDesign name="message1" size={48} color="#d1d5db" />
                        <Text style={tailwind`text-lg text-gray-400 mt-4`}>No messages yet</Text>
                        <Text style={tailwind`text-sm text-gray-400 mt-1`}>
                            Search for a user above to start chatting
                        </Text>
                    </View>
                )}

                {filteredCommunities.length > 0 && (
                    <View style={tailwind`mb-4`}>
                        {isSearching && (
                            <Text style={tailwind`text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide`}>
                                Communities
                            </Text>
                        )}
                        {filteredCommunities.map((item, index) => (
                            <Pressable
                                key={`community-${index}`}
                                style={tailwind`flex-row items-center py-3 border-b border-gray-100`}
                                onPress={() => handleMessageCommunity(item)}
                            >
                                <View style={tailwind`w-12 h-12 rounded-full bg-red-400 items-center justify-center mr-3`}>
                                    <Text style={tailwind`text-white text-lg font-semibold`}>
                                        {getCommunityInitials(item)}
                                    </Text>
                                </View>
                                <View style={tailwind`flex-1`}>
                                    <Text style={tailwind`text-black font-semibold text-base`}>{item.name}</Text>
                                    <Text style={tailwind`text-gray-500 text-sm mt-0.5`} numberOfLines={1}>
                                        {item.description || item.discription || ''}
                                    </Text>
                                </View>
                                <AntDesign name="right" size={14} color="#ccc" />
                            </Pressable>
                        ))}
                    </View>
                )}

                {filteredUsers.length > 0 && (
                    <View>
                        {isSearching && filteredCommunities.length > 0 && (
                            <Text style={tailwind`text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide`}>
                                People
                            </Text>
                        )}
                        {filteredUsers.map((item, i) => (
                            <Pressable
                                key={`user-${i}`}
                                style={tailwind`flex-row items-center py-3 border-b border-gray-100`}
                                onPress={() => handleMessage(item)}
                            >
                                {item?.avatar_url ? (
                                    <Image
                                        style={tailwind`w-12 h-12 rounded-full mr-3`}
                                        source={{ uri: item.avatar_url }}
                                    />
                                ) : (
                                    <View style={tailwind`w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-3`}>
                                        <Text style={tailwind`text-gray-600 text-lg font-semibold`}>
                                            {getUserInitials(item)}
                                        </Text>
                                    </View>
                                )}
                                <View style={tailwind`flex-1`}>
                                    <Text style={tailwind`text-black font-semibold text-base`}>
                                        {item?.full_name || item?.name || 'Unknown'}
                                    </Text>
                                    <Text style={tailwind`text-gray-500 text-sm mt-0.5`}>
                                        @{item?.username || 'unknown'}
                                    </Text>
                                </View>
                                <AntDesign name="right" size={14} color="#ccc" />
                            </Pressable>
                        ))}
                    </View>
                )}

            </View>
        </ScrollView>
    );
}

export default MessagePage;
