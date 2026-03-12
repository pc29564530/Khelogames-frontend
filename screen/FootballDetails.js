import React, {useState, useEffect} from 'react';
import {View, Text, Pressable} from 'react-native'
import tailwind from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import { formattedDate } from '../utils/FormattedDateTime';
import { formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    runOnJS
} from 'react-native-reanimated';

const FootballDetails = ({item, parentScrollY, headerHeight, collapsedHeight}) => {
    const matchData = item;
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    // Shared value to track the current scroll position of the child scroll view.
    // This is updated on every scroll event of the child.
    // Used to sync with the parent scroll when the parent header is fully collapsed.
    const currentScrollY = useSharedValue(0);
    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeight){
                parentScrollY.value = currentScrollY.value
            } else {
                parentScrollY.value = event.contentOffset.y
            }
        }
    })

    // Content animation style
    const contentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            parentScrollY.value,
            [0, 50],
            [1, 1],
            Extrapolation.CLAMP
        );

        return {
            opacity
        };
    });

    const handleTournamentPage = async (tournamentData) => {
            navigation.navigate("TournamentPage", {
                tournament: tournamentData,
                currentRole: 'user'
            });
    };

    return (
        <Animated.ScrollView
            style={{ flex: 1, backgroundColor: '#0f172a' }}
            onScroll={handlerScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingTop: 20,
                paddingBottom: 100,
                paddingHorizontal: 16
            }}
        >
            <Animated.View style={[contentStyle]}>
                {/* Tournament Section */}
                {matchData?.tournament && (
                    <Pressable
                        style={[
                            tailwind`flex-row items-center justify-between p-4 rounded-xl mb-4`,
                            { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }
                        ]}
                        onPress={() => handleTournamentPage(matchData?.tournament.public_id)}
                        disabled={loading}
                    >
                        <View style={tailwind`flex-1`}>
                            <Text style={[tailwind`text-sm mb-1`, { color: '#64748b' }]}>Tournament</Text>
                            <Text style={[tailwind`text-xl font-semibold`, { color: '#f1f5f9' }]}>
                                {matchData?.tournament.name}
                            </Text>
                        </View>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={24}
                            color="#64748b"
                        />
                    </Pressable>
                )}

                {/* Teams Section */}
                <View style={tailwind`mb-4`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3 px-1`, { color: '#f1f5f9' }]}>
                        Teams
                    </Text>
                    <View style={tailwind`flex-row gap-3`}>
                        {/* Home Team */}
                        <View
                            style={[
                                tailwind`flex-1 rounded-xl p-4`,
                                { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }
                            ]}
                        >
                            <View style={tailwind`items-center`}>
                                <Text style={[tailwind`text-lg font-semibold text-center`, { color: '#f1f5f9' }]}>
                                    {matchData?.homeTeam?.name || 'Home Team'}
                                </Text>
                                {matchData?.homeTeam?.city && (
                                    <Text style={[tailwind`text-sm mt-1`, { color: '#64748b' }]}>
                                        {matchData.homeTeam.city}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* VS Separator */}
                        <View style={tailwind`justify-center items-center px-2`}>
                            <Text style={[tailwind`font-bold text-lg`, { color: '#475569' }]}>VS</Text>
                        </View>

                        {/* Away Team */}
                        <View
                            style={[
                                tailwind`flex-1 rounded-xl p-4`,
                                { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }
                            ]}
                        >
                            <View style={tailwind`items-center`}>
                                <Text style={[tailwind`text-lg font-semibold text-center`, { color: '#f1f5f9' }]}>
                                    {matchData?.awayTeam?.name || 'Away Team'}
                                </Text>
                                {matchData?.awayTeam?.city && (
                                    <Text style={[tailwind`text-sm mt-1`, { color: '#64748b' }]}>
                                        {matchData.awayTeam.city}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Match Details Section */}
                <View style={[tailwind`rounded-xl p-6 mb-4`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                    <Text style={[tailwind`text-lg font-semibold mb-4`, { color: '#f1f5f9' }]}>
                        Match Details
                    </Text>
                    {/* Status */}
                    <View style={[tailwind`flex-row justify-between items-center py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                        <Text style={[tailwind``, { color: '#94a3b8' }]}>Status</Text>
                        <Text style={[tailwind`font-semibold capitalize`, { color: '#f1f5f9' }]}>
                            {matchData?.status_code || 'Not Started'}
                        </Text>
                    </View>

                    {/* Date and Time */}
                    {matchData?.start_timestamp && (
                        <>
                            <View style={[tailwind`flex-row justify-between items-center py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                                <Text style={[tailwind``, { color: '#94a3b8' }]}>Date</Text>
                                <Text style={[tailwind`font-semibold`, { color: '#f1f5f9' }]}>
                                    {formattedDate(convertToISOString(matchData.start_timestamp))}
                                </Text>
                            </View>
                            <View style={[tailwind`flex-row justify-between items-center py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                                <Text style={[tailwind``, { color: '#94a3b8' }]}>Time</Text>
                                <Text style={[tailwind`font-semibold`, { color: '#f1f5f9' }]}>
                                    {formattedTime(convertToISOString(matchData.start_timestamp))}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            </Animated.View>
        </Animated.ScrollView>
    );
};

export default FootballDetails;