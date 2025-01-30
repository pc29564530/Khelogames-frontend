import React from 'react';
import {View, Text, Pressable, ScrollView, Image} from 'react-native';
import tailwind from 'twrnc';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getCricketMatchScore, getMatch } from '../redux/actions/actions';
import { formatToDDMMYY, formattedDate, formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
const filePath = require('../assets/status_code.json');
import { convertBallToOvers } from '../utils/ConvertBallToOvers';

const TournamentCricketMatch = ({tournament, AsyncStorage, axiosInstance, BASE_URL}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const matches = useSelector((state) => state.cricketMatchScore.cricketMatchScore);
    const game = useSelector(state => state.sportReducers.game);
    useFocusEffect(
        React.useCallback(() => {
                fetchTournamentMatchs();
        }, [])
    );

    const fetchTournamentMatchs = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getAllTournamentMatch`, {
                params: {
                    tournament_id: tournament.id,
                },
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const item = response.data;
            dispatch(getCricketMatchScore(item || {}))
        } catch (err) {
            console.error("Unable to fetch tournament matches: ", err);
        }
    };

    

    return (
        <ScrollView>
            <View style={tailwind`p-4`}>
            {matches?.length > 0 ? (
                    matches?.map((stage, index) => (
                        <View key={index} style={tailwind`bg-white`}>
                            {Object?.keys(stage.group_stage).length > 0 && 
                                Object?.entries(stage.group_stage).map(([stageName, matchs]) => (
                                    matchs.length > 0 && (
                                        <View key={stageName}>
                                            {matchs.length>0 && (
                                                <Text style={tailwind`text-lg mb-2`}>{stageName.replace('_', ' ').toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('')}</Text>
                                            )}
                                            {matchs?.map((item, ind) => (
                                                MatchesData(item, ind, dispatch )
                                            ))}
                                        </View>
                                    )
                                ))
                            }
                            {Object?.keys(stage.knockout_stage).length > 0 &&
                                Object?.entries(stage.knockout_stage).map(([stageName, matchs]) => (
                                    matchs.length > 0 && (
                                        <View key={stageName}>
                                            {matchs.length>0 && (
                                                <Text style={tailwind`text-lg mb-2`}>{stageName.replace('_', ' ').toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('')}</Text>
                                            )}
                                            {matchs.map((item, ind) => (
                                                MatchesData(item, ind, dispatch)
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
            </View>
        </ScrollView>
    );
}

const MatchesData = (item, ind, dispatch) => {
    const navigation = useNavigation()
    const handleCricketMatchPage = (item) => {
        navigation.navigate("CricketMatchPage", {item: item.matchId, dispatch})
    }
    return (
        <Pressable key={ind} 
            style={tailwind`mb-1 p-1 bg-white rounded-lg shadow-md`} 
            onPress={() => handleCricketMatchPage(item)}
        >
            <View style={tailwind`flex-row items-center justify-between `}>
                <View style={tailwind`flex-row`}>
                    <View style={tailwind``}>
                        <Image 
                            source={{ uri: item.awayTeam?.media_url }} 
                            style={tailwind`w-6 h-6 bg-violet-200 rounded-full mb-2`} 
                        />
                        <Image 
                            source={{ uri: item.homeTeam?.media_url }} 
                            style={tailwind`w-6 h-6 bg-violet-200 rounded-full mb-2`} 
                        />
                    </View>
                    <View style={tailwind``}>
                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                            {item.homeTeam?.name}
                        </Text>
                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                            {item.awayTeam?.name}
                        </Text>
                    </View>
                </View>
                <View style={tailwind`items-center justify-center flex-row right-4`}>
                    <View style={tailwind`mb-2 flex-row`}>
                        
                        {item.status !== "not_started" && (
                            <View style={tailwind`flex-row`}>
                                {item.homeScore  && item.homeScore.inning === "inning1" && (
                                    <View style={tailwind`flex-row`}>
                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>({convertBallToOvers(item.homeScore.overs)})</Text>
                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                                            {item.homeScore.score}/{item.homeScore.wickets}
                                        </Text>
                                    </View>
                                )}
                                {item.awayScore && item.awayScore.inning === "inning1" && (
                                    <View style={tailwind`flex-row`}>
                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>({convertBallToOvers(item.awayScore.overs)})</Text>
                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                                            {item.awayScore.score}/{item.awayScore.wickets}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                        <View style={tailwind`w-0.4 h-10 bg-gray-200 left-2`}/>
                        <View style={tailwind`mb-2 ml-4 items-center justify-evenly`}>
                            <Text style={tailwind`text-md text-gray-800`}>
                                {formatToDDMMYY(convertToISOString(item.startTimeStamp))}
                            </Text>
                            {item.status !== "not_started" ? (
                                <Text style={tailwind`text-md text-gray-800`}>{item.status}</Text>
                            ) : (
                                <Text style={tailwind`text-md text-gray-800`}>
                                    {formattedTime(convertToISOString(item.startTimeStamp))}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

export default TournamentCricketMatch;