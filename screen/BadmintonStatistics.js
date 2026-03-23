import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
} from 'react-native-reanimated';

const StatRow = ({ label, homeValue, awayValue, homeColor = '#22c55e', awayColor = '#ef4444' }) => {
    const homeNum = Number(homeValue) || 0;
    const awayNum = Number(awayValue) || 0;
    const total = homeNum + awayNum;
    const homePercent = total > 0 ? (homeNum / total) * 100 : 50;
    const awayPercent = total > 0 ? (awayNum / total) * 100 : 50;

    return (
        <View style={tailwind`mb-4`}>
            <View style={tailwind`flex-row justify-between mb-1`}>
                <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                    {homeValue}
                </Text>
                <Text style={[tailwind`text-xs font-medium`, { color: '#94a3b8' }]}>
                    {label}
                </Text>
                <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                    {awayValue}
                </Text>
            </View>
            <View style={tailwind`flex-row h-1.5 rounded-full overflow-hidden`}>
                <View
                    style={[
                        tailwind`rounded-l-full`,
                        {
                            width: `${homePercent}%`,
                            backgroundColor: homeColor,
                        },
                    ]}
                />
                <View style={{ width: 2 }} />
                <View
                    style={[
                        tailwind`rounded-r-full`,
                        {
                            width: `${awayPercent}%`,
                            backgroundColor: awayColor,
                        },
                    ]}
                />
            </View>
        </View>
    );
};

const BadmintonStatistics = ({ item, parentScrollY, headerHeight, collapsedHeader }) => {
    const [activeTab, setActiveTab] = useState('overall');
    const [homeStats, setHomeStats] = useState(null);
    const [awayStats, setAwayStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ global: null, fields: {} });

    const game = useSelector((state) => state.sportReducers.game);
    const { height: sHeight } = Dimensions.get('window');

    const matchPublicID = item?.public_id;
    const homeTeam = item?.homeTeam;
    const awayTeam = item?.awayTeam;

    const currentScrollY = useSharedValue(0);

    const handlerScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            if (parentScrollY.value === collapsedHeader) {
                parentScrollY.value = currentScrollY.value;
            } else {
                parentScrollY.value = event.contentOffset.y;
            }
        },
    });

    const fetchStats = async () => {
        if (!matchPublicID || !homeTeam?.public_id || !awayTeam?.public_id) return;
        try {
            setLoading(true);
            setError({ global: null, fields: {} });
            const authToken = await AsyncStorage.getItem('AccessToken');
            const headers = {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            };

            const [homeRes, awayRes] = await Promise.all([
                axiosInstance.get(
                    `${BASE_URL}/${game.name}/get-badminton-match-team-stats/${matchPublicID}/${homeTeam.public_id}`,
                    { headers }
                ),
                axiosInstance.get(
                    `${BASE_URL}/${game.name}/get-badminton-match-team-stats/${matchPublicID}/${awayTeam.public_id}`,
                    { headers }
                ),
            ]);

            setHomeStats(homeRes.data?.data || null);
            setAwayStats(awayRes.data?.data || null);
        } catch (err) {
            setError({ global: 'Unable to load statistics', fields: {} });
            console.error('Failed to fetch badminton stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [matchPublicID, homeTeam?.public_id, awayTeam?.public_id])
    );

    const getTabs = () => {
        const tabs = [{ key: 'overall', label: 'Match' }];
        const setCount = homeStats?.sets?.length || awayStats?.sets?.length || 0;
        for (let i = 1; i <= setCount; i++) {
            tabs.push({ key: `set_${i}`, label: `Set ${i}` });
        }
        return tabs;
    };

    const getStatsForTab = () => {
        if (!homeStats || !awayStats) return null;

        if (activeTab === 'overall') {
            return {
                home: homeStats.overall,
                away: awayStats.overall,
            };
        }

        const setIndex = parseInt(activeTab.split('_')[1], 10) - 1;
        const homeSet = homeStats.sets?.[setIndex];
        const awaySet = awayStats.sets?.[setIndex];
        if (!homeSet || !awaySet) return null;

        return { home: homeSet, away: awaySet };
    };

    const tabs = getTabs();
    const currentStats = getStatsForTab();

    const renderTeamHeader = () => (
        <View style={tailwind`flex-row justify-between items-center mb-5 px-2`}>
            <View style={tailwind`items-center flex-1`}>
                <Text
                    style={[tailwind`text-sm font-bold`, { color: '#22c55e' }]}
                    numberOfLines={1}
                >
                    {homeTeam?.short_name || homeTeam?.name || 'Home'}
                </Text>
            </View>
            <View style={{ width: 60 }} />
            <View style={tailwind`items-center flex-1`}>
                <Text
                    style={[tailwind`text-sm font-bold`, { color: '#ef4444' }]}
                    numberOfLines={1}
                >
                    {awayTeam?.short_name || awayTeam?.name || 'Away'}
                </Text>
            </View>
        </View>
    );

    const renderStats = () => {
        if (!currentStats) {
            return (
                <View
                    style={[
                        tailwind`rounded-lg items-center justify-center p-6`,
                        { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
                    ]}
                >
                    <Text style={[tailwind`text-base`, { color: '#94a3b8' }]}>
                        No Stats Available
                    </Text>
                </View>
            );
        }

        const isOverall = activeTab === 'overall';
        const homeData = currentStats.home;
        const awayData = currentStats.away;

        return (
            <View
                style={[
                    tailwind`rounded-2xl p-4`,
                    { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
                ]}
            >
                {renderTeamHeader()}

                {isOverall ? (
                    <>
                        <StatRow
                            label="Total Points Won"
                            homeValue={homeData?.total_points_won ?? 0}
                            awayValue={awayData?.total_points_won ?? 0}
                        />
                        <StatRow
                            label="Best Streak"
                            homeValue={homeData?.max_streak ?? 0}
                            awayValue={awayData?.max_streak ?? 0}
                        />
                        <StatRow
                            label="Biggest Lead"
                            homeValue={homeData?.max_lead ?? 0}
                            awayValue={awayData?.max_lead ?? 0}
                        />
                        <StatRow
                            label="Biggest Comeback"
                            homeValue={homeData?.biggest_comeback ?? 0}
                            awayValue={awayData?.biggest_comeback ?? 0}
                        />
                    </>
                ) : (
                    <>
                        {homeData?.is_team_won !== undefined && (
                            <View style={tailwind`flex-row justify-between mb-4`}>
                                <View
                                    style={[
                                        tailwind`px-3 py-1 rounded-full`,
                                        {
                                            backgroundColor: homeData.is_team_won
                                                ? 'rgba(34,197,94,0.15)'
                                                : 'rgba(239,68,68,0.15)',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            tailwind`text-xs font-semibold`,
                                            {
                                                color: homeData.is_team_won
                                                    ? '#22c55e'
                                                    : '#ef4444',
                                            },
                                        ]}
                                    >
                                        {homeData.is_team_won ? 'WON' : 'LOST'}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        tailwind`px-3 py-1 rounded-full`,
                                        {
                                            backgroundColor: awayData.is_team_won
                                                ? 'rgba(34,197,94,0.15)'
                                                : 'rgba(239,68,68,0.15)',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            tailwind`text-xs font-semibold`,
                                            {
                                                color: awayData.is_team_won
                                                    ? '#22c55e'
                                                    : '#ef4444',
                                            },
                                        ]}
                                    >
                                        {awayData.is_team_won ? 'WON' : 'LOST'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <StatRow
                            label="Points Won"
                            homeValue={homeData?.point_won ?? 0}
                            awayValue={awayData?.point_won ?? 0}
                        />
                        <StatRow
                            label="Best Streak"
                            homeValue={homeData?.max_streak ?? 0}
                            awayValue={awayData?.max_streak ?? 0}
                        />
                        <StatRow
                            label="Biggest Lead"
                            homeValue={homeData?.max_lead ?? 0}
                            awayValue={awayData?.max_lead ?? 0}
                        />
                        <StatRow
                            label="Biggest Comeback"
                            homeValue={homeData?.biggest_comeback ?? 0}
                            awayValue={awayData?.biggest_comeback ?? 0}
                        />
                    </>
                )}
            </View>
        );
    };

    return (
        <Animated.ScrollView
            style={[tailwind`flex-1`, { backgroundColor: '#0f172a' }]}
            onScroll={handlerScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingTop: 20,
                paddingBottom: 100,
                minHeight: sHeight,
            }}
        >
            {/* Tab Selector */}
            <View style={tailwind`flex-row mx-4 mb-6`}>
                {tabs.map((tab, index) => (
                    <Pressable
                        key={tab.key}
                        onPress={() => setActiveTab(tab.key)}
                        style={[
                            tailwind`flex-1 py-3 rounded-lg`,
                            index < tabs.length - 1 ? tailwind`mr-2` : {},
                            activeTab === tab.key
                                ? { backgroundColor: '#ef4444' }
                                : {
                                      backgroundColor: '#1e293b',
                                      borderWidth: 1,
                                      borderColor: '#334155',
                                  },
                        ]}
                    >
                        <Text
                            style={[
                                tailwind`text-center font-semibold text-sm`,
                                activeTab === tab.key
                                    ? { color: '#f1f5f9' }
                                    : { color: '#94a3b8' },
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Content */}
            <View style={tailwind`px-4`}>
                {loading ? (
                    <View style={tailwind`items-center justify-center py-12`}>
                        <ActivityIndicator size="large" color="#f87171" />
                    </View>
                ) : error.global ? (
                    <View
                        style={[
                            tailwind`rounded-lg items-center justify-center p-6`,
                            { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
                        ]}
                    >
                        <Text style={[tailwind`text-base mb-3`, { color: '#fca5a5' }]}>
                            {error.global}
                        </Text>
                        <Pressable
                            onPress={fetchStats}
                            style={[tailwind`px-4 py-2 rounded-lg`, { backgroundColor: '#ef4444' }]}
                        >
                            <Text style={[tailwind`font-semibold`, { color: '#f1f5f9' }]}>
                                Retry
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    renderStats()
                )}
            </View>
        </Animated.ScrollView>
    );
};

export default BadmintonStatistics;
