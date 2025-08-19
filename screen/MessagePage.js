import React, { useEffect, useState, useLayoutEffect } from 'react';
import {View, Text, Image, ScrollView, Pressable, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { setUnFollowUser, getFollowingUser } from '../redux/actions/actions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import AntDesign from 'react-native-vector-icons/AntDesign';

function MessagePage() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [followingWithProfile, setFollowingWithProfile] = useState([]);
    const [searchPlayer, setSearchPlayer] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [communities, setCommunities] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredCommunities, setFilteredCommunities] = useState([]);
    const following = useSelector((state) => state.user.following)

    const fetchFollowing = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const currentUser = await AsyncStorage.getItem('UserPublicID');
            const response = await axiosInstance.get(`${BASE_URL}/getFollowing`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const item = response.data;
            if(item === null || !item) {
                setFollowingWithProfile([]);
                dispatch(getFollowingUser([]));
            } else {
                const followingProfile = item.map(async (itm, index) => {                  
                    const profileResponse = await axiosInstance.get(`${AUTH_URL}/getProfile/${itm.user_public_id}`);
                    if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
                        const usernameInitial = profileResponse.data.username ? profileResponse.data.username.charAt(0) : '';
                        setDisplayText(usernameInitial.toUpperCase());
                    } else {
                        setDisplayText('');
                    }
                    return {...itm, profile: profileResponse.data}
                })
                const followingData = await Promise.all(followingProfile);
                setFollowingWithProfile(followingData);
                setFilteredUsers(followingData); // Initialize filtered users
                dispatch(getFollowingUser(followingData));
            }
        } catch (e) {
            console.error(e);
        }
    }

    const fetchCommunity = async () => {
        try {
            const currentUser = await AsyncStorage.getItem('UserPublicID');
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getCommunityByMessage`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if(!response.data || response.data === null) {
                setCommunities([]);
                setFilteredCommunities([]);
            } else {
                setCommunities(response.data);
                setFilteredCommunities(response.data); // Initialize filtered communities
            }

        } catch(err) {
            console.error('error not able fetch all community: ', err);
        }
    }

    const fetchMessageReceiver = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getMessagedUser`, null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data;
            if(item === null || !item) {
                setFollowingWithProfile([]);
                setFilteredUsers([]);
            } else {
                setFilteredUsers(item); // Initialize filtered users
            }

        } catch(err) {
            console.error('unable to get user: ', err);
        }
    }
    
    useFocusEffect(
        React.useCallback(() => {
            fetchCommunity();
            fetchMessageReceiver();
        },[])
    );

    const handleMessage = ({item}) => {
        navigation.navigate("Message", {profileData: item})
    }

    const handleMessageCommunity = ({item}) => {
        navigation.navigate("CommunityMessage", {communityPageData: item})
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "",
            headerStyle: tailwind`bg-red-400`,
            headerLeft: ()=> (
                <View style={tailwind`flex-row items-center gap-35 p-2`}>
                    <AntDesign name="arrowleft" onPress={()=>navigation.goBack()} size={24} color="white" />
                    <Text style={tailwind`text-white text-xl`}>Message</Text>
                </View>
            )
        })
    },[navigation]);

    //  search function
    const handleSearch = (text) => {
        setSearchPlayer(text);
        
        if (text.trim() === '') {
            // If search is empty, show all data
            setFilteredUsers(followingWithProfile);
            setFilteredCommunities(communities);
            return;
        }

        const searchTerm = text.toLowerCase().trim();

        // Filter users by name, username, or full name
        const filteredUserResults = followingWithProfile.filter((item) => {
            const profile = item.profile || {};
            const fullName = profile.full_name || '';
            const username = profile.owner || profile.username || '';
            const name = profile.name || '';
            
            return (
                fullName.toLowerCase().includes(searchTerm) ||
                username.toLowerCase().includes(searchTerm) ||
                name.toLowerCase().includes(searchTerm)
            );
        });

        // Filter communities by name or description
        const filteredCommunityResults = communities.filter((item) => {
            const name = item.name || '';
            const description = item.discription || item.description || '';
            
            return (
                name.toLowerCase().includes(searchTerm) ||
                description.toLowerCase().includes(searchTerm)
            );
        });

        setFilteredUsers(filteredUserResults);
        setFilteredCommunities(filteredCommunityResults);
    }

    // Get user initials for avatar placeholder
    const getUserInitials = (profile) => {
        if (profile?.full_name) {
            return profile.full_name.charAt(0).toUpperCase();
        } else if (profile?.username) {
            return profile.username.charAt(0).toUpperCase();
        } else if (profile?.owner) {
            return profile.owner.charAt(0).toUpperCase();
        }
        return '?';
    }

    // Get community initials for avatar placeholder  
    const getCommunityInitials = (community) => {
        return community.name ? community.name.charAt(0).toUpperCase() : '?';
    }

    const renderNoResults = () => {
        if (searchPlayer.trim() !== '' && filteredUsers.length === 0 && filteredCommunities.length === 0) {
            return (
                <View style={tailwind`items-center py-8`}>
                    <Text style={tailwind`text-lg text-gray-500`}>No results found</Text>
                    <Text style={tailwind`text-sm text-gray-400 mt-1`}>Try searching for something else</Text>
                </View>
            );
        }
        return null;
    }

    return (
        <ScrollView style={tailwind`bg-white flex-1`}>
            {/* Search Input */}
            <View style={tailwind`bg-white p-4`}>
                <View style={tailwind`flex-row items-center border border-gray-300 rounded-lg px-3 py-2`}>
                    <AntDesign name="search1" size={18} color="#666" style={tailwind`mr-2`} />
                    <TextInput 
                        value={searchPlayer} 
                        onChangeText={handleSearch}
                        placeholder='Search' 
                        style={tailwind`flex-1 text-base`}
                        placeholderTextColor="#999"
                    />
                    {searchPlayer.length > 0 && (
                        <Pressable onPress={() => handleSearch('')}>
                            <AntDesign name="close" size={18} color="#666" />
                        </Pressable>
                    )}
                </View>
            </View>

            <View style={tailwind`flex-1 bg-white px-4`}>
                {renderNoResults()}
                
                {/* Communities Section */}
                {filteredCommunities.length > 0 && (
                    <View style={tailwind`mb-4`}>
                        {searchPlayer.trim() !== '' && (
                            <Text style={tailwind`text-lg font-semibold text-gray-700 mb-2`}>Communities</Text>
                        )}
                        {filteredCommunities.map((item, index) => (
                            <Pressable 
                                key={`community-${index}`} 
                                style={tailwind`flex-row items-center py-3 border-b border-gray-100`} 
                                onPress={() => handleMessageCommunity({ item: item })}
                            >
                                <View style={tailwind`w-12 h-12 rounded-full bg-red-400 items-center justify-center mr-3`}>
                                    <Text style={tailwind`text-white text-lg font-semibold`}>
                                        {getCommunityInitials(item)}
                                    </Text>
                                </View>
                                <View style={tailwind`flex-1`}>
                                    <Text style={tailwind`text-black font-semibold text-base`}>{item.name}</Text>
                                    <Text style={tailwind`text-gray-600 text-sm mt-1`} numberOfLines={1}>
                                        {item.discription || item.description}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Users Section */}
                {filteredUsers.length > 0 && (
                    <View>
                        {searchPlayer.trim() !== '' && filteredCommunities.length > 0 && (
                            <Text style={tailwind`text-lg font-semibold text-gray-700 mb-2`}>Contacts</Text>
                        )}
                        {filteredUsers.map((item, i) => (
                            <Pressable 
                                key={`user-${i}`} 
                                style={tailwind`flex-row items-center py-3 border-b border-gray-100`} 
                                onPress={() => handleMessage({ item: item })}
                            >
                                {!item.profile?.avatar_url ? (
                                    <View style={tailwind`w-12 h-12 rounded-full bg-gray-300 items-center justify-center mr-3`}>
                                        <Text style={tailwind`text-gray-700 text-lg font-semibold`}>
                                           {displayText}
                                        </Text>
                                    </View>
                                ) : (
                                    <Image 
                                        style={tailwind`w-12 h-12 rounded-full mr-3`} 
                                        source={{uri: item?.avatar_url}}  
                                    />
                                )}
                                <View style={tailwind`flex-1`}>
                                    <Text style={tailwind`text-black font-semibold text-base`}>
                                        {item?.full_name || item?.name || 'Unknown'}
                                    </Text>
                                    <Text style={tailwind`text-gray-600 text-sm mt-1`}>
                                        @{item?.username || item?.username || 'unknown'}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

export default MessagePage;