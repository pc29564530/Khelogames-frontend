import React ,{useState, useEffect} from 'react';
import {View, Text, Pressable, ScrollView, Image, Dimensions} from 'react-native';
import tailwind from 'twrnc';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { getFootballMatchesService } from '../services/footballMatchServices';
import { useDispatch, useSelector } from 'react-redux';
import { getFootballMatchScore, getMatch } from '../redux/actions/actions';
import { formatToDDMMYY, formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';
import Animated, {useAnimatedScrollHandler, interpolate, useSharedValue, useAnimatedStyle, Extrapolation} from 'react-native-reanimated';
import { getMatches } from '../redux/actions/actions';

const TournamentFootballMatch = ({ tournament, AsyncStorage, axiosInstance, BASE_URL, parentScrollY, collapsedHeader}) => {
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const matches = useSelector((state)=> state.matches.matches ) || [];
    const game = useSelector(state => state.sportReducers.game);
    const match = useSelector((state) => state.matches.match);
    const {height: sHeight, width: sWidth} = Dimensions.get("window");
    useFocusEffect(
        React.useCallback(() => {
                fetchTournamentMatchs();
        }, [dispatch, tournament.public_id])
    );

    useEffect(() => {
        console.debug("Match : ", match)
    }, [match]);
    
    const fetchTournamentMatchs = async () => {
        try {
            setLoading(true);
            const response = await getFootballMatchesService({ tournamentPublicID: tournament.public_id, game: game});  
            const item = response.data;
            if (response.success && item.length === 0) {
                //TODO: if no match exits show this 
                return (
                    <View>

                    </View>
                )
            }
            dispatch(getMatches(item || []));
        } catch (err) {
            setError({
                global: "Unable to get all matches",
                fields: {},
            })
            console.error("Unable to fetch tournament matches: ", err);
        } finally {
            setLoading(false);
        }
    };

    const currentScrollY = useSharedValue(0);

    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeader){
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

    return (
        <View style={tailwind`flex-1`}
        >   
            <Animated.ScrollView
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                style={tailwind`flex-1`}
                contentContainerStyle={{paddintTop: 20, paddingBottom:100, minHeight: sHeight+100}}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[tailwind`p-1 bg-white`, contentStyle]}>
                    {matches?.length === 0 && error?.global && (
                        <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                            <Text style={tailwind`text-red-700 text-sm`}>
                                {error.global}
                            </Text>
                        </View>
                    )}
                    {matches?.length > 0 ? (
                        matches.map((stage, index) => (
                            <View key={index} style={tailwind`bg-white`}>
                                {Object.keys(stage.group_stage).length > 0 && 
                                    Object.entries(stage.group_stage).map(([stageName, matchs]) => (
                                        matchesData(matchs, stageName, navigation, tournament)
                                    ))
                                }
                                {Object.keys(stage.league_stage).length > 0 && 
                                    Object.entries(stage.league_stage).map(([stageName, matchs]) => (
                                        matchesData(matchs, stageName, navigation, tournament)
                                    ))
                                }
                                {Object.keys(stage.knockout_stage).length > 0 &&
                                    Object.entries(stage.knockout_stage).map(([stageName, matchs]) => (
                                        matches.length > 0 && (
                                            <View key={stageName}>
                                                {matchs.length>0 && (
                                                    <Text style={tailwind`text-lg mb-2`}>{stageName.replace('_', ' ').toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('')}</Text>
                                                )}
                                                {matchs.map((item, ind) => (
                                                    matchesData(item, ind, navigation, tournament)
                                                ))}
                                            </View>
                                        )
                                    ))
                                }
                            </View>
                        ))
                    ) : (
                        <Text style={tailwind`text-center mt-4 text-gray-600`}>Loading matches...</Text>
                    )}
                </Animated.View>
            </Animated.ScrollView>
        </View>
    );
}

const matchesData = (item, ind, navigation, tournament) => {
    const handleFootballMatchPage = (item) => {
        navigation.navigate("FootballMatchPage", {matchPublicID: item.public_id, tournament: tournament});
    }

    const isLive = item?.status === "live";
    const isFinished = item?.status === "finished";
    const homeTeamName = item?.homeTeam?.name || 'TBA';
    const awayTeamName = item?.awayTeam?.name || 'TBA';

    return (
        <Pressable
            key={ind}
            style={[
                tailwind`mb-2 bg-white rounded-xl overflow-hidden`,
                {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1}
            ]}
            onPress={() => handleFootballMatchPage(item)}
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
                                style={tailwind`w-7 h-7 rounded-full bg-gray-100`}
                            />
                        ) : (
                            <View style={tailwind`w-7 h-7 rounded-full bg-gray-100 items-center justify-center`}>
                                <Text style={tailwind`text-xs font-bold text-gray-400`}>
                                    {homeTeamName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <Text style={tailwind`ml-2.5 text-sm text-gray-900 flex-1`} numberOfLines={1}>
                            {homeTeamName}
                        </Text>
                        {item?.homeScore && (
                            <View style={tailwind`ml-2`}>
                                <Text style={tailwind`text-sm font-bold text-gray-900`}>
                                    {item?.homeScore?.goals}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Away team row */}
                    <View style={tailwind`flex-row items-center`}>
                        {item?.awayTeam?.media_url ? (
                            <Image
                                source={{ uri: item.awayTeam.media_url }}
                                style={tailwind`w-7 h-7 rounded-full bg-gray-100`}
                            />
                        ) : (
                            <View style={tailwind`w-7 h-7 rounded-full bg-gray-100 items-center justify-center`}>
                                <Text style={tailwind`text-xs font-bold text-gray-400`}>
                                    {awayTeamName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <Text style={tailwind`ml-2.5 text-sm text-gray-900 flex-1`} numberOfLines={1}>
                            {awayTeamName}
                        </Text>
                        {item?.awayScore && (
                            <View style={tailwind`ml-2`}>
                                <Text style={tailwind`text-sm font-bold text-gray-900`}>
                                    {item?.awayScore?.goals}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Vertical divider */}
                <View style={tailwind`w-px bg-gray-100 my-3`} />

                {/* Date + Status */}
                <View style={tailwind`w-20 items-center justify-center py-3`}>
                    <Text style={tailwind`text-xs text-gray-400`}>
                        {formatToDDMMYY(convertToISOString(item?.start_timestamp))}
                    </Text>
                    {item?.status_code !== "not_started" && item?.status_code !== "finished" ? (
                        <Text style={[
                            tailwind`text-xs font-semibold mt-1 capitalize`,
                            isLive ? tailwind`text-red-400` : tailwind`text-gray-400`
                        ]}>
                            {item?.status_code}
                        </Text>
                    ) : (
                        <Text style={tailwind`text-xs text-gray-900 font-medium mt-1`}>
                            {formattedTime(convertToISOString(item?.start_timestamp))}
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    )
}

export default TournamentFootballMatch;