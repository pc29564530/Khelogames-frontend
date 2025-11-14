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
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const matches = useSelector((state)=> state.matches.matches ) || [];
    const game = useSelector(state => state.sportReducers.game);
    const match = useSelector((state) => state.matches.match);
    const {height: sHeight, width: sWidth} = Dimensions.get("window");
    useFocusEffect(
        React.useCallback(() => {
                fetchTournamentMatchs();
        }, [dispatch])
    );

    useEffect(() => {
        console.debug("Match : ", match)
    }, [match]);
    const fetchTournamentMatchs = async () => {
        try {
            const item = await getFootballMatchesService({axiosInstance: axiosInstance, tournamentPublicID: tournament.public_id, game: game});  
            if(item === null ){
                return item;
            }
            dispatch(getMatches(item))
        } catch (err) {
            console.error("Unable to fetch tournament matches: ", err);
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
    return (
        <Pressable
            key={ind}
            style={tailwind`mb-4 p-8 bg-white rounded-2xl shadow`}
            onPress={() => handleFootballMatchPage(item)}
        >
            <View style={tailwind`flex-row justify-between items-center`}>
                <View>
                <View style={tailwind`flex-row items-center mb-1`}>
                    {item.homeTeam?.media_url ? (
                        <Image
                            source={{ uri: item.homeTeam?.media_url }}
                            style={tailwind`w-6 h-6 rounded-full bg-gray-200`}
                        />
                    ): (
                        <View style={tailwind`w-6 h-6 rounded-full bg-gray-200`}>
                            <Text>{item.homeTeam?.media_url.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                    <Text
                        style={tailwind`ml-2 text-sm font-semibold text-gray-900`}
                        numberOfLines={1}
                    >
                        {item.homeTeam?.name}
                    </Text>
                </View>
                <View style={tailwind`flex-row items-center`}>
                    {item.homeTeam?.media_url ? (
                        <Image
                            source={{ uri: item.awayTeam?.media_url }}
                            style={tailwind`w-6 h-6 rounded-full bg-gray-200`}
                        />
                    ): (
                        <View style={tailwind`w-6 h-6 rounded-full bg-gray-200`}>
                            <Text>{item.awayTeam?.media_url.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                    <Text
                        style={tailwind`ml-2 text-sm font-semibold text-gray-900`}
                        numberOfLines={1}
                    >
                    {item.awayTeam?.name}
                    </Text>
                </View>
                </View>
                <View style={tailwind`flex-row items-center`}>
                    {/* Score Column */}
                    {item.status_code !== "not_started" && (
                        <View style={tailwind`items-center mr-4`}>
                        <Text style={tailwind`text-lg font-semibold text-gray-900`}>
                            {item?.homeScore?.goals || '0'}
                        </Text>
                        <Text style={tailwind`text-lg font-semibold text-gray-900`}>
                            {item?.awayScore?.goals || '0'}
                        </Text>
                        </View>
                    )}

                    {/* Vertical Divider */}
                    <View style={tailwind`w-px h-12 bg-gray-300 mx-3`} />

                    {/* Match Info Column */}
                    <View style={tailwind`items-start`}>
                        <Text style={tailwind`text-sm text-gray-700`}>
                        {formatToDDMMYY(convertToISOString(item.startTimeStamp))}
                        </Text>
                        {item.status_code !== "not_started" ? (
                        <Text style={tailwind`text-sm font-medium text-gray-800`}>
                            {item.status_code}
                        </Text>
                        ) : (
                        <Text style={tailwind`text-sm font-medium text-gray-800`}>
                            {formattedTime(convertToISOString(item.startTimeStamp))}
                        </Text>
                        )}
                    </View>
                    </View>

                </View> 
        </Pressable>
    )
}

export default TournamentFootballMatch;