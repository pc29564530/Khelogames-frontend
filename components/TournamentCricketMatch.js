import React, {useState} from 'react';
import {View, Text, Pressable, ScrollView, Image, Dimensions} from 'react-native';
import tailwind from 'twrnc';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getCricketMatchScore, getMatch, getMatches } from '../redux/actions/actions';
import { formatToDDMMYY, formattedDate, formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
const filePath = require('../assets/status_code.json');
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import Animated, {useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolation} from 'react-native-reanimated';
import { displayMatchStatus } from '../utils/MatchStatus';

export const renderInningScore = (scores) => {
    return scores?.map((score, index) => (
      <View key={index} style={tailwind`flex-row items-center`}>
        <Text style={{ color: '#f1f5f9', fontSize: 14, fontWeight: '700' }}>
          {score.score}/{score.wickets}
        </Text>
        {score.is_inning_completed === false && (
            <Text style={{ color: '#64748b', fontSize: 11, marginLeft: 4 }}>({convertBallToOvers(score.overs)})</Text>
        )}
      </View>
    ));
};


const TournamentCricketMatch = ({tournament, AsyncStorage, axiosInstance, BASE_URL, parentScrollY, collapsedHeader}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const matches = useSelector((state) => state.matches.matches);
    const game = useSelector(state => state.sportReducers.game);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    })
    const {height: sHeight, width: sWidth} = Dimensions.get("window")

    const currentScrollY = useSharedValue(0);
    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeader){
                parentScrollY.value = currentScrollY.value
            } else {
                parentScrollY.value = event.contentOffset.y
            }
        }
    });

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

    useFocusEffect(
        React.useCallback(() => {
                fetchTournamentMatchs();
        }, [dispatch])
    );

    const fetchTournamentMatchs = async () => {
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getAllTournamentMatch/${tournament.public_id}`, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data;
            if(item.success && item.data.length === 0) {
                dispatch(getMatches([]));
            }
            dispatch(getMatches(item.data))
        } catch (err) {
            if(matches?.length === 0) {
                setError({
                    global: 'Unable to get match by tournament',
                    fields: {},
                })
            }
            console.error("Unable to fetch tournament matches: ", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Animated.ScrollView
            onScroll={handlerScroll}
            scrollEventThrottle={16}
            style={tailwind`flex-1`}
            contentContainerStyle={{paddintTop: 20, paddingBottom:100, minHeight: sHeight+100}}
            showsVerticalScrollIndicator={false}
        >
                <Animated.View style={[{ padding: 16, backgroundColor: '#0f172a' }, contentStyle]}>
                    {matches?.length === 0 && error?.global && (
                        <View style={[tailwind`mx-3 mb-3 p-3 rounded-lg`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                            <Text style={{ color: '#fca5a5', fontSize: 13 }}>
                                {error.global}
                            </Text>
                        </View>
                    )}
                    {matches?.length > 0 ? (
                        matches.map((stage, index) => (
                            <View key={index} style={{ backgroundColor: '#0f172a' }}>
                                {Object?.keys(stage?.group_stage).length > 0 &&
                                    Object.entries(stage.group_stage).map(([stageName, matchs]) => (
                                        matchesData(matchs, stageName, navigation)
                                    ))
                                }
                                {Object.keys(stage.league_stage).length > 0 &&
                                    Object.entries(stage.league_stage).map(([stageName, matchs]) => (
                                        matchesData(matchs, stageName, navigation)
                                    ))
                                }
                                {Object.keys(stage?.knockout_stage).length > 0 &&
                                    Object.entries(stage.knockout_stage).map(([stageName, matchs]) => (
                                        matches.length > 0 && (
                                            <View key={stageName}>
                                                {matchs.length>0 && (
                                                    <Text style={{ color: '#f1f5f9', fontSize: 17, marginBottom: 8 }}>{stageName.replace('_', ' ').toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('')}</Text>
                                                )}
                                                {matchs.map((item, ind) => (
                                                    matchesData(item, ind, navigation)
                                                ))}
                                            </View>
                                        )
                                    ))
                                }
                            </View>
                        ))
                    ) : (
                        <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 16 }}>Loading matches...</Text>
                    )}
                </Animated.View>
            </Animated.ScrollView>
    );
}

const matchesData = (item, ind, navigation) => {
    const handleCricketMatchPage = (item) => {
        navigation.navigate("CricketMatchPage", {matchPublicID: item.public_id})
    }
    const isLive = item?.status === "live";
    const isFinished = item?.status === "finished";
    const homeTeamName = item?.homeTeam?.name || 'TBA';
    const awayTeamName = item?.awayTeam?.name || 'TBA';
    return (
        <Pressable
            key={ind}
            style={[
                tailwind`mb-2 rounded-xl overflow-hidden`,
                { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }
            ]}
            onPress={() => handleCricketMatchPage(item)}
        >
            {/* Live accent bar */}
            {isLive && <View style={tailwind`h-0.5 bg-red-400`} />}

            <View style={tailwind`flex-row`}>
                {/* Teams + Scores */}
                <View style={tailwind`flex-1 py-3 pl-4 pr-3`}>
                    {/* Home team row */}
                    <View style={tailwind`flex-row items-center mb-2.5`}>
                        {item?.homeTeam?.media_url ? (
                            <Image
                                source={{ uri: item.homeTeam.media_url }}
                                style={[tailwind`w-7 h-7 rounded-full`, { backgroundColor: '#334155' }]}
                            />
                        ) : (
                            <View style={[tailwind`w-7 h-7 rounded-full items-center justify-center`, { backgroundColor: '#334155' }]}>
                                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700' }}>
                                    {homeTeamName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <Text style={[tailwind`ml-2.5 text-sm flex-1`, { color: '#f1f5f9' }]} numberOfLines={1}>
                            {item.homeTeam?.name}
                        </Text>
                        {item?.homeScore && (
                            <View style={tailwind`ml-2`}>
                                {renderInningScore(item.homeScore)}
                            </View>
                        )}
                    </View>

                    {/* Away team row */}
                    <View style={tailwind`flex-row items-center`}>
                        {item?.awayTeam?.media_url ? (
                            <Image
                                source={{ uri: item.awayTeam.media_url }}
                                style={[tailwind`w-7 h-7 rounded-full`, { backgroundColor: '#334155' }]}
                            />
                        ) : (
                            <View style={[tailwind`w-7 h-7 rounded-full items-center justify-center`, { backgroundColor: '#334155' }]}>
                                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700' }}>
                                    {awayTeamName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <Text style={[tailwind`ml-2.5 text-sm flex-1`, { color: '#f1f5f9' }]} numberOfLines={1}>
                            {item.awayTeam?.name}
                        </Text>
                        {item?.awayScore && (
                            <View style={tailwind`ml-2`}>
                                {renderInningScore(item.awayScore)}
                            </View>
                        )}
                    </View>
                </View>

                {/* Vertical divider */}
                <View style={[tailwind`w-px my-3`, { backgroundColor: '#334155' }]} />

                {/* Date + Status */}
                <View style={tailwind`w-20 items-center justify-center py-3`}>
                    <Text style={{ color: '#64748b', fontSize: 11 }}>
                        {formatToDDMMYY(convertToISOString(item?.start_timestamp))}
                    </Text>
                    {item?.status_code !== "not_started" && item?.status_code !== "finished" ? (
                        <Text style={[
                            tailwind`text-xs font-semibold mt-1 capitalize`,
                            isLive ? tailwind`text-red-400` : { color: '#64748b' }
                        ]}>
                            {displayMatchStatus(item?.status_code)}
                        </Text>
                    ) : (
                        <Text style={{ color: '#cbd5e1', fontSize: 11, fontWeight: '500', marginTop: 4 }}>
                            {formattedTime(convertToISOString(item?.start_timestamp))}
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    )
}

export default TournamentCricketMatch;
