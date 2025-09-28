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
            style={tailwind`flex-1 bg-gray-50`}
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
                        style={tailwind`flex-row items-center justify-between shadow-lg p-4 bg-white rounded-xl mb-4`} 
                        onPress={() => handleTournamentPage(matchData?.tournament.public_id)}
                        disabled={loading}
                    >
                        <View style={tailwind`flex-1`}>
                            <Text style={tailwind`text-sm text-gray-500 mb-1`}>Tournament</Text>
                            <Text style={tailwind`text-xl font-semibold text-gray-900`}>
                                {matchData?.tournament.name}
                            </Text>
                        </View>
                        <MaterialCommunityIcons 
                            name="chevron-right" 
                            size={24} 
                            color="#6b7280" 
                        />
                    </Pressable>
                )}

                {/* Teams Section */}
                <View style={tailwind`mb-4`}>
                    <Text style={tailwind`text-lg font-semibold text-gray-900 mb-3 px-1`}>
                        Teams
                    </Text>
                    <View style={tailwind`flex-row gap-3`}>
                        {/* Home Team */}
                        <Pressable 
                            style={tailwind`flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100`}
                        >
                            <View style={tailwind`items-center`}>
                                <Text style={tailwind`text-lg font-semibold text-gray-900 text-center`}>
                                    {matchData?.homeTeam?.name || 'Home Team'}
                                </Text>
                                {matchData?.homeTeam?.city && (
                                    <Text style={tailwind`text-sm text-gray-500 mt-1`}>
                                        {matchData.homeTeam.city}
                                    </Text>
                                )}
                            </View>
                        </Pressable>

                        {/* VS Separator */}
                        <View style={tailwind`justify-center items-center px-2`}>
                            <Text style={tailwind`text-gray-400 font-bold text-lg`}>VS</Text>
                        </View>

                        {/* Away Team */}
                        <Pressable 
                            style={tailwind`flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100`}
                        >
                            <View style={tailwind`items-center`}>
                                <Text style={tailwind`text-lg font-semibold text-gray-900 text-center`}>
                                    {matchData?.awayTeam?.name || 'Away Team'}
                                </Text>
                                {matchData?.awayTeam?.city && (
                                    <Text style={tailwind`text-sm text-gray-500 mt-1`}>
                                        {matchData.awayTeam.city}
                                    </Text>
                                )}
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* Match Details Section */}
                <View style={tailwind`bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4`}>
                    <Text style={tailwind`text-lg font-semibold text-gray-900 mb-4`}>
                        Match Details
                    </Text>
                    {/* Status */}
                    <View style={tailwind`flex-row justify-between items-center py-3 border-b border-gray-100`}>
                        <Text style={tailwind`text-gray-600`}>Status</Text>
                        <Text style={tailwind`font-semibold text-gray-900 capitalize`}>
                            {matchData?.status_code || 'Not Started'}
                        </Text>
                    </View>

                    {/* Date and Time */}
                    {matchData?.start_timestamp && (
                        <>
                            <View style={tailwind`flex-row justify-between items-center py-3 border-b border-gray-100`}>
                                <Text style={tailwind`text-gray-600`}>Date</Text>
                                <Text style={tailwind`font-semibold text-gray-900`}>
                                    {formattedDate(convertToISOString(matchData.start_timestamp))}
                                </Text>
                            </View>
                            <View style={tailwind`flex-row justify-between items-center py-3 border-b border-gray-100`}>
                                <Text style={tailwind`text-gray-600`}>Time</Text>
                                <Text style={tailwind`font-semibold text-gray-900`}>
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