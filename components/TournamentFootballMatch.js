import React ,{useState, useEffect} from 'react';
import {View, Text, Pressable, ScrollView, Image} from 'react-native';
import tailwind from 'twrnc';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { getFootballMatches } from '../services/footballMatchServices';
import { useDispatch, useSelector } from 'react-redux';
import { getFootballMatchScore, getMatch } from '../redux/actions/actions';
import { formatToDDMMYY, formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';


const TournamentFootballMatch = ({ tournament, AsyncStorage, axiosInstance, BASE_URL}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const matches = useSelector((state)=> state.matchScore.matchScore ) || [];
    const game = useSelector(state => state.sportReducers.game);
    const match = useSelector((state) => state.matches.match);
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
            const item = await getFootballMatches({axiosInstance: axiosInstance, tournamentId: tournament.id, game: game});  
            if(item === null ){
                return item;
            }
            dispatch(getFootballMatchScore(item))
        } catch (err) {
            console.error("Unable to fetch tournament matches: ", err);
        }
    };

    return (
        <ScrollView>
            <View style={tailwind`p-1 bg-white`}>
                {matches?.length > 0 ? (
                    matches.map((stage, index) => (
                        <View key={index} style={tailwind`bg-white`}>
                            {Object.keys(stage.group_stage).length > 0 && 
                                Object.entries(stage.group_stage).map(([stageName, matchs]) => (
                                    matchesData(matchs, stageName)
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
                                                matchesData(item, ind)
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

const matchesData = (item, ind) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const handleFootballMatchPage = (item) => {
        dispatch(getMatch(item))
        navigation.navigate("FootballMatchPage", {matchID: item.id});
    }
    return (
        <Pressable key={ind} 
            style={tailwind`mb-1 p-1 bg-white rounded-lg shadow-md`} 
            onPress={() => handleFootballMatchPage(item)}
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
                <View style={tailwind`items-center justify-center flex-row`}>
                    <View style={tailwind`mb-2 flex-row items-center gap-4`}>
                            {item.status !== "not_started" && (
                                <View>
                                    <Text style={tailwind`ml-2 text-lg text-gray-800`}>{item.homeScore?.score || '0'}</Text>
                                    <Text style={tailwind`ml-2 text-lg text-gray-800`}>{item.awayScore?.score || '0'}</Text>
                                </View>
                            )}
                            <View style={tailwind`w-0.5 h-10 bg-gray-200`}/>
                            <View style={tailwind`mb-2 right`}>
                                <Text style={tailwind`ml-2 text-lg text-gray-800`}> {formatToDDMMYY(convertToISOString(item.startTimeStamp))}</Text>
                                {item.status !== "not_started" ? (
                                    <Text style={tailwind`ml-2 text-lg text-gray-800`}>{item.status}</Text>
                                ):(
                                    <Text style={tailwind`ml-2 text-lg text-gray-800`}>{formattedTime(convertToISOString(item.startTimeStamp))}</Text>
                                )}
                            </View>
                    </View>
                </View> 
            </View>
        </Pressable>
    )
}

export default TournamentFootballMatch;