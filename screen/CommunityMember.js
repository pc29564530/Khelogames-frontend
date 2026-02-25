import React, { useState, useEffect } from 'react';
import { Text, View, Image, Pressable, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getCommunityMember } from '../services/communityServices';

function CommunityMember({ item, parentScrollY, headerHeight, collapsedHeader }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ global: null, fields: {} });
    const navigation = useNavigation();

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            parentScrollY.value = event.contentOffset.y;
        },
    });

    useEffect(() => {
        fetchCommunityMember();
    }, []);

    const fetchCommunityMember = async () => {
        try {
            setLoading(true);
            setError({ global: null, fields: {} });
            const response = await getCommunityMember({ communityPublicID: item?.public_id });
            setMembers(response.data || []);
        } catch (err) {
            setError({ global: 'Unable to load members', fields: {} });
            console.error('unable to fetch community member list', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfile = (member) => {
        navigation.navigate('Profile', { profilePublicID: member?.public_id });
    };

    // ── Loading state ──
    if (loading) {
        return (
            <View style={tailwind`flex-1 items-center justify-center`}>
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    // ── Error state ──
    if (error.global) {
        return (
            <View style={tailwind`flex-1 items-center justify-center px-6`}>
                <View style={tailwind`w-14 h-14 rounded-full bg-red-50 items-center justify-center mb-3`}>
                    <MaterialIcons name="error-outline" size={28} color="#ef4444" />
                </View>
                <Text style={tailwind`text-gray-800 font-semibold text-sm mb-1`}>Something went wrong</Text>
                <Text style={tailwind`text-gray-400 text-xs text-center mb-4`}>{error.global}</Text>
                <Pressable
                    onPress={fetchCommunityMember}
                    style={tailwind`bg-red-400 px-5 py-2.5 rounded-xl`}
                >
                    <Text style={tailwind`text-white font-semibold text-sm`}>Retry</Text>
                </Pressable>
            </View>
        );
    }

    // ── Empty state ──
    const ListEmpty = () => (
        <View style={tailwind`flex-1 items-center justify-center px-6 mt-16`}>
            <View style={tailwind`w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3`}>
                <MaterialIcons name="people-outline" size={32} color="#9ca3af" />
            </View>
            <Text style={tailwind`text-gray-700 font-semibold text-sm mb-1`}>No Members Yet</Text>
            <Text style={tailwind`text-gray-400 text-xs text-center`}>
                Be the first to join this community!
            </Text>
        </View>
    );

    // ── Member card ──
    const renderMemberItem = ({ item: member }) => (
        <Pressable
            onPress={() => handleProfile(member)}
            style={[
                tailwind`flex-row items-center bg-white mx-4 mb-3 px-4 py-3 rounded-2xl`,
                { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
            ]}
        >
            {/* Avatar */}
            {member?.avatar_url ? (
                <Image
                    source={{ uri: member.avatar_url }}
                    style={tailwind`w-12 h-12 rounded-full bg-gray-100`}
                />
            ) : (
                <View style={tailwind`w-12 h-12 rounded-full bg-red-100 items-center justify-center`}>
                    <Text style={tailwind`text-red-500 text-lg font-bold`}>
                        {member?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                    </Text>
                </View>
            )}

            {/* Info */}
            <View style={tailwind`flex-1 ml-3`}>
                <Text style={tailwind`text-sm font-semibold text-gray-900`} numberOfLines={1}>
                    {member?.full_name}
                </Text>
                <Text style={tailwind`text-xs text-gray-400 mt-0.5`} numberOfLines={1}>
                    @{member?.username}
                </Text>
            </View>

            {/* Chevron */}
            <MaterialIcons name="chevron-right" size={20} color="#d1d5db" />
        </Pressable>
    );

    return (
        <Animated.FlatList
            data={members}
            keyExtractor={(member, index) =>
                member?.public_id ? member.public_id.toString() : index.toString()
            }
            renderItem={renderMemberItem}
            ListEmptyComponent={ListEmpty}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingTop: 12,
                paddingBottom: 60,
                flexGrow: 1,
            }}
        />
    );
}

export default CommunityMember;
