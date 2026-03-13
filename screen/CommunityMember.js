import React, { useState, useEffect } from 'react';
import { Text, View, Image, Pressable, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getCommunityMember } from '../services/communityServices';

const DARK_BG = "#020617";
const CARD_BG = "#0f172a";
const BORDER = "#1e293b";

function CommunityMember({ item, parentScrollY }) {

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

            const response = await getCommunityMember({
                communityPublicID: item?.public_id
            });

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

    /* Loading */

    if (loading) {
        return (
            <View style={[tailwind`flex-1 items-center justify-center`, { backgroundColor: DARK_BG }]}>
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    /* Error */

    if (error.global) {
        return (
            <View style={[tailwind`flex-1 items-center justify-center px-6`, { backgroundColor: DARK_BG }]}>

                <View style={tailwind`w-14 h-14 rounded-full bg-red-900 items-center justify-center mb-3`}>
                    <MaterialIcons name="error-outline" size={28} color="#f87171" />
                </View>

                <Text style={tailwind`text-slate-200 font-semibold text-sm mb-1`}>
                    Something went wrong
                </Text>

                <Text style={tailwind`text-slate-400 text-xs text-center mb-4`}>
                    {error.global}
                </Text>

                <Pressable
                    onPress={fetchCommunityMember}
                    style={tailwind`bg-red-500 px-5 py-2.5 rounded-xl`}
                >
                    <Text style={tailwind`text-white font-semibold text-sm`}>
                        Retry
                    </Text>
                </Pressable>

            </View>
        );
    }

    /* Empty */

    const ListEmpty = () => (
        <View style={[tailwind`flex-1 items-center justify-center px-6 mt-16`, { backgroundColor: DARK_BG }]}>

            <View style={tailwind`w-16 h-16 rounded-full bg-slate-800 items-center justify-center mb-3`}>
                <MaterialIcons name="people-outline" size={32} color="#94a3b8" />
            </View>

            <Text style={tailwind`text-slate-200 font-semibold text-sm mb-1`}>
                No Members Yet
            </Text>

            <Text style={tailwind`text-slate-400 text-xs text-center`}>
                Be the first to join this community!
            </Text>

        </View>
    );

    /* Member Card */

    const renderMemberItem = ({ item: member }) => (

        <Pressable
            onPress={() => handleProfile(member)}
            style={[
                tailwind`flex-row items-center mx-4 mb-3 px-4 py-3 rounded-2xl`,
                {
                    backgroundColor: CARD_BG,
                    borderWidth: 1,
                    borderColor: BORDER
                }
            ]}
        >

            {/* Avatar */}

            {member?.avatar_url ? (

                <Image
                    source={{ uri: member.avatar_url }}
                    style={tailwind`w-12 h-12 rounded-full`}
                />

            ) : (

            <View
                style={[
                    tailwind`w-12 h-12 rounded-full items-center justify-center`,
                    { backgroundColor: "#f87171" }
                ]}
            >
                <Text style={tailwind`text-white text-lg font-bold`}>
                    {member?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
            </View>

            )}

            {/* Info */}

            <View style={tailwind`flex-1 ml-3`}>

                <Text
                    style={tailwind`text-sm font-semibold text-slate-100`}
                    numberOfLines={1}
                >
                    {member?.full_name}
                </Text>

                <Text
                    style={tailwind`text-xs text-slate-400 mt-0.5`}
                    numberOfLines={1}
                >
                    @{member?.username}
                </Text>

            </View>

            <MaterialIcons
                name="chevron-right"
                size={20}
                color="#64748b"
            />

        </Pressable>

    );

    return (

        <Animated.FlatList
            data={members}
            keyExtractor={(member, index) =>
                member?.public_id
                    ? member.public_id.toString()
                    : index.toString()
            }
            renderItem={renderMemberItem}
            ListEmptyComponent={ListEmpty}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingTop: 12,
                paddingBottom: 80,
                flexGrow: 1,
                backgroundColor: DARK_BG
            }}
        />

    );

}

export default CommunityMember;