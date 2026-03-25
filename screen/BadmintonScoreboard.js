import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Animated, {
    useAnimatedScrollHandler,
    interpolate,
    useSharedValue,
    useAnimatedStyle,
    Extrapolation,
} from 'react-native-reanimated';
import { addBadmintonScore, setBadmintonScore, addBadmintonSet, setBadmintonSets, addBadmintonNewSet, setMatchStatus } from '../redux/actions/actions';

const PointBubble = ({ point, homeTeamId }) => {
    const isHome = point.scoring_team_id === homeTeamId;
    return (
        <View style={tailwind`flex-row items-center justify-center mb-1`}>
            {/* Home Score */}
            <Text
                style={{
                    color: isHome ? '#22c55e' : '#cbd5f5',
                    fontSize: 11,
                    fontWeight: isHome ? '700' : '500',
                    minWidth: 20,
                    textAlign: 'right',
                }}
            >
                {point.home_score}
            </Text>
            {/* Separator */}
            <Text style={{ color: '#64748b', marginHorizontal: 6 }}>
                -
            </Text>
            {/* Away Score */}
            <Text
                style={{
                    color: !isHome ? '#ef4444' : '#cbd5f5',
                    fontSize: 11,
                    fontWeight: !isHome ? '700' : '500',
                    minWidth: 20,
                }}
            >
                {point.away_score}
            </Text>
        </View>
    );
};

const PointsTimeline = ({ points, homeTeamId, homeTeamName, awayTeamName }) => {
    if (!points || points.length === 0) {
        return (
            <View style={tailwind`items-center py-3`}>
                <Text style={{ color: '#64748b', fontSize: 12 }}>No points recorded</Text>
            </View>
        );
    }

    return (
        <View style={tailwind`px-3 py-3`}>
            {/* Legend */}
            <View style={tailwind`flex-row justify-center mb-3`}>
                <View style={tailwind`flex-row items-center mr-4`}>
                    <View
                        style={[
                            tailwind`w-3 h-3 rounded-full mr-1.5`,
                            { backgroundColor: '#22c55e' },
                        ]}
                    />
                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>
                        {homeTeamName || 'Home'}
                    </Text>
                </View>
                <View style={tailwind`flex-row items-center`}>
                    <View
                        style={[
                            tailwind`w-3 h-3 rounded-full mr-1.5`,
                            { backgroundColor: '#ef4444' },
                        ]}
                    />
                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>
                        {awayTeamName || 'Away'}
                    </Text>
                </View>
            </View>

            {/* Points grid */}
            <View style={tailwind`flex-row flex-wrap justify-center`}>
                {points.map((point, idx) => (
                    <PointBubble
                        key={point.id || point.point_number || idx}
                        point={point}
                        homeTeamId={homeTeamId}
                    />
                ))}
            </View>
        </View>
    );
};

const BadmintonScoreboard = ({ item, parentScrollY, headerHeight, collapsedHeader }) => {
    const game = useSelector((state) => state.sportReducers.game);
    const setsScore = useSelector((state) => state.badmintonMatchSet.sets);
    const currentSet = useSelector((state) => state.badmintonMatchSet.currentSet);
    const currentSetScore = useSelector((state) => state.badmintonMatchSet.currentSetScore);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(null);
    const [expandedSets, setExpandedSets] = useState({});
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const dispatch = useDispatch();
    const { height: sHeight } = Dimensions.get('window');

    const matchPublicID = item?.public_id;
    const homeTeam = item?.homeTeam;
    const awayTeam = item?.awayTeam;
    const homeScore = item?.homeScore;
    const awayScore = item?.awayScore;

    const fetchSetScores = async () => {
        if (!matchPublicID) return;
        try {
            setLoading(true);
            setError({ global: null, fields: {} });
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(
                `${BASE_URL}/${game.name}/get-badminton-sets-score/${matchPublicID}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const data = response.data;
            dispatch(setBadmintonSets(data.data.sets || []));
        } catch (err) {
            setError({ global: 'Unable to get sets scores', fields: {} });
            console.error('Failed to get set scores:', err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSetScores();
        }, [matchPublicID, game.name, dispatch])
    );

    const handleUpdateScore = async (teamPublicID, setNumber) => {
        if (!matchPublicID || !teamPublicID) return;
        const key = `${teamPublicID}_${setNumber}`;
        try {
            setUpdating(key);
            setError({ global: null, fields: {} });
            const authToken = await AsyncStorage.getItem('AccessToken');
            const res = await axiosInstance.post(
                `${BASE_URL}/${game.name}/update-badminton-score`,
                {
                    match_public_id: matchPublicID,
                    team_public_id: teamPublicID,
                    set_number: setNumber,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const item = res.data.data;
            dispatch(addBadmintonSet(item.score, item.point, item.new_set ));
            dispatch(setBadmintonScore(item.match_score))
            if(item.new_set) {
                dispatch(addBadmintonNewSet(item.new_set));
            }
            if(item.match_result) {
                dispatch(setMatchStatus(item.match_result))
            }
        } catch (err) {
            console.error('Failed to update score:', err);
            setError({
                global: 'Unable to update score',
                fields: err?.response?.data?.error?.fields,
            });
        } finally {
            setUpdating(null);
        }
    };

    const toggleSetPoints = (setNumber) => {
        setExpandedSets((prev) => ({
            ...prev,
            [setNumber]: !prev[setNumber],
        }));
    };

    // Scroll handler
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

    const contentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            parentScrollY.value,
            [0, 50],
            [1, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    const isMatchLive =
        item?.status_code === 'in_progress' ||
        item?.status_code === 'first_set' ||
        item?.status_code === 'second_set' ||
        item?.status_code === 'third_set';

    return (
        <View style={[tailwind`flex-1`, { backgroundColor: '#0f172a' }]}>
            <Animated.ScrollView
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                style={tailwind`flex-1`}
                contentContainerStyle={{
                    paddingTop: 0,
                    paddingBottom: 100,
                    minHeight: sHeight + 100,
                }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[{ padding: 8, backgroundColor: '#0f172a' }, contentStyle]}>
                    {/* Error Banner */}
                    {error.global && (
                        <View
                            style={[
                                tailwind`mx-2 mb-3 p-3 rounded-lg`,
                                {
                                    backgroundColor: '#f8717115',
                                    borderWidth: 1,
                                    borderColor: '#f8717130',
                                },
                            ]}
                        >
                            <Text style={{ color: '#fca5a5', fontSize: 13 }}>
                                {error.global}
                            </Text>
                        </View>
                    )}

                    {/* Current Set Score (Live) */}
                    {isMatchLive && (
                        <View
                            style={[
                                tailwind`mx-2 mb-4 p-5 rounded-2xl`,
                                {
                                    backgroundColor: '#0f172a',
                                    borderWidth: 1,
                                    borderColor: '#334155',
                                },
                            ]}
                        >
                            {/* Set Title */}
                            <Text
                                style={{
                                    color: '#64748b',
                                    fontSize: 12,
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1.5,
                                    textAlign: 'center',
                                    marginBottom: 16,
                                }}
                            >
                                {`Set ${currentSet || 1}`}
                            </Text>

                            <View style={tailwind`flex-row items-center justify-center`}>
                                {/* HOME TEAM */}
                                <Pressable
                                    onPress={() =>
                                        handleUpdateScore(homeTeam?.public_id, currentSet)
                                    }
                                    disabled={!!updating}
                                    style={({ pressed }) => [
                                        tailwind`items-center flex-1 py-3 rounded-xl flex-row justify-between px-2`,
                                        {
                                            backgroundColor: pressed
                                                ? '#1e293b'
                                                : 'transparent',
                                            opacity: updating ? 0.6 : 1,
                                        },
                                    ]}
                                >
                                    <MaterialIcon name="add" size={20} color="#22c55e" />

                                    <View style={tailwind`items-center`}>
                                        <Text
                                            style={{
                                                color: '#94a3b8',
                                                fontSize: 13,
                                                marginBottom: 4,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {homeTeam?.short_name || homeTeam?.name || 'Home'}
                                        </Text>

                                        <Text
                                            style={{
                                                color: '#22c55e',
                                                fontSize: 36,
                                                fontWeight: '800',
                                            }}
                                        >
                                            {currentSetScore?.home_score ?? 0}
                                        </Text>
                                    </View>

                                    {updating ===
                                    `${homeTeam?.public_id}_${currentSet}` ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#22c55e"
                                        />
                                    ) : (
                                        <View style={{ width: 20 }} />
                                    )}
                                </Pressable>

                                {/* VS */}
                                <View
                                    style={[
                                        tailwind`mx-3 w-12 h-12 rounded-full items-center justify-center`,
                                        { backgroundColor: '#1e293b' },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color: '#94a3b8',
                                            fontSize: 14,
                                            fontWeight: '700',
                                        }}
                                    >
                                        VS
                                    </Text>
                                </View>

                                {/* AWAY TEAM */}
                                <Pressable
                                    onPress={() =>
                                        handleUpdateScore(awayTeam?.public_id, currentSet)
                                    }
                                    disabled={!!updating}
                                    style={({ pressed }) => [
                                        tailwind`items-center flex-1 py-3 rounded-xl flex-row justify-between px-2`,
                                        {
                                            backgroundColor: pressed
                                                ? '#1e293b'
                                                : 'transparent',
                                            opacity: updating ? 0.6 : 1,
                                        },
                                    ]}
                                >
                                    {updating ===
                                    `${awayTeam?.public_id}_${currentSet}` ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#ef4444"
                                        />
                                    ) : (
                                        <View style={{ width: 20 }} />
                                    )}

                                    <View style={tailwind`items-center`}>
                                        <Text
                                            style={{
                                                color: '#94a3b8',
                                                fontSize: 13,
                                                marginBottom: 4,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {awayTeam?.short_name || awayTeam?.name || 'Away'}
                                        </Text>

                                        <Text
                                            style={{
                                                color: '#ef4444',
                                                fontSize: 36,
                                                fontWeight: '800',
                                            }}
                                        >
                                            {currentSetScore?.away_score ?? 0}
                                        </Text>
                                    </View>

                                    <MaterialIcon name="add" size={20} color="#ef4444" />
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {/* Loading */}
                    {loading && setsScore.length === 0 && (
                        <View style={tailwind`items-center py-8`}>
                            <ActivityIndicator size="large" color="#f87171" />
                            <Text style={{ color: '#94a3b8', marginTop: 8 }}>
                                Loading scores...
                            </Text>
                        </View>
                    )}

                    {/* No Sets */}
                    {!loading && setsScore.length === 0 && (
                        <View style={tailwind`items-center py-8`}>
                            <MaterialIcon
                                name="sports-tennis"
                                size={48}
                                color="#475569"
                            />
                            <Text
                                style={{
                                    color: '#64748b',
                                    marginTop: 8,
                                    fontSize: 14,
                                }}
                            >
                                No sets played yet
                            </Text>
                        </View>
                    )}

                    {/* Set Rows */}
                    {setsScore?.map((set, index) => {
                        const homeWon = set.home_score > set.away_score;
                        const awayWon = set.away_score > set.home_score;
                        const isExpanded = expandedSets[set.set_number] === true;
                        const hasPoints = set.points && set.points.length > 0;

                        return (
                            <View
                                key={set.set_number || index}
                                style={[
                                    tailwind`mx-2 mb-2 rounded-xl overflow-hidden`,
                                    {
                                        backgroundColor: '#1e293b',
                                        borderWidth: 1,
                                        borderColor: '#334155',
                                    },
                                ]}
                            >
                                {/* Set Header */}
                                <Pressable
                                    onPress={() => toggleSetPoints(set.set_number)}
                                    style={[
                                        tailwind`px-4 py-2 flex-row justify-between items-center`,
                                        {
                                            backgroundColor: '#334155',
                                            borderBottomWidth: 1,
                                            borderBottomColor: '#475569',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color: '#94a3b8',
                                            fontSize: 12,
                                            fontWeight: '600',
                                        }}
                                    >
                                        Set {set.set_number}
                                        {set.set_status && set.set_status !== 'in_progress'
                                            ? `  •  ${set.set_status}`
                                            : ''}
                                    </Text>
                                    <View style={tailwind`flex-row items-center`}>
                                        {hasPoints && (
                                            <Text style={{ color: '#64748b', fontSize: 10, marginRight: 6, }}>
                                                {set.points.length} pts
                                            </Text>
                                        )}
                                        <AntDesign name={isExpanded ? 'up' : 'down'} size={14} color="#94a3b8" />
                                    </View>
                                </Pressable>

                                {/* Score Row */}
                                <View style={tailwind`flex-row items-center px-3 py-3`}>
                                    {/* Home Team */}
                                    <View style={tailwind`flex-1`}>
                                        <Text
                                            style={[
                                                {
                                                    fontSize: 14,
                                                    fontWeight: homeWon ? '700' : '400',
                                                },
                                                {
                                                    color: homeWon ? '#f1f5f9' : '#94a3b8',
                                                },
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {homeTeam?.name || 'Home'}
                                        </Text>
                                    </View>

                                    {/* Scores */}
                                    <View style={tailwind`flex-row items-center mx-3`}>
                                        <Text
                                            style={{
                                                color: homeWon ? '#22c55e' : '#94a3b8',
                                                fontSize: 20,
                                                fontWeight: '700',
                                                minWidth: 28,
                                                textAlign: 'right',
                                            }}
                                        >
                                            {set.home_score ?? 0}
                                        </Text>
                                        <Text
                                            style={{
                                                color: '#475569',
                                                fontSize: 16,
                                                marginHorizontal: 6,
                                            }}
                                        >
                                            -
                                        </Text>
                                        <Text
                                            style={{
                                                color: awayWon ? '#ef4444' : '#94a3b8',
                                                fontSize: 20,
                                                fontWeight: '700',
                                                minWidth: 28,
                                                textAlign: 'left',
                                            }}
                                        >
                                            {set.away_score ?? 0}
                                        </Text>
                                    </View>

                                    {/* Away Team */}
                                    <View style={tailwind`flex-1 items-end`}>
                                        <Text
                                            style={[
                                                {
                                                    fontSize: 14,
                                                    fontWeight: awayWon ? '700' : '400',
                                                },
                                                {
                                                    color: awayWon ? '#f1f5f9' : '#94a3b8',
                                                },
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {awayTeam?.name || 'Away'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Points Section (expandable) */}
                                {isExpanded && (
                                    <View
                                        style={[
                                            tailwind`border-t`,
                                            { borderTopColor: '#334155' },
                                        ]}
                                    >
                                        <PointsTimeline
                                            points={set.points}
                                            homeTeamId={item?.home_team_id}
                                            homeTeamName={homeTeam?.short_name || homeTeam?.name}
                                            awayTeamName={awayTeam?.short_name || awayTeam?.name}
                                        />
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </Animated.View>
            </Animated.ScrollView>
        </View>
    );
};

export default BadmintonScoreboard;
