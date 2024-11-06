import React ,{useState, useEffect} from 'react';
import {View, Text, Pressable, ScrollView, Image} from 'react-native';
import tailwind from 'twrnc';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { getFootballMatches } from '../services/footballMatchServices';
import { useDispatch, useSelector } from 'react-redux';
import { getFootballMatchScore, getMatch } from '../redux/actions/actions';
import { formattedDate } from '../utils/FormattedDateTime';
import { formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';

const TournamentFootballMatch = ({ tournament, AsyncStorage, axiosInstance, BASE_URL}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const matches = useSelector((state)=> state.matchScore.matchScore ) || [];
    const game = useSelector(state => state.sportReducers.game);
    //const [matchData, setMatchData] = useState();
    const match = useSelector((state) => state.matches.match);

    useFocusEffect(
        React.useCallback(() => {
                fetchTournamentMatchs();
        }, [dispatch])
    );

    useEffect(() => {
        console.log("Match : ", match)
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


    const handleFootballMatchPage = (item) => {
        // setMatchData(item)
        dispatch(getMatch(item))
        navigation.navigate("FootballMatchPage", {matchID: item.id});
    }

    return (
        <ScrollView>
            <View style={tailwind`p-4`}>
                {matches?.length > 0 ? (
                    matches.map((item, index) => (
                        <Pressable key={index} style={tailwind`mb-1 p-1 bg-white rounded-lg shadow-md flex-row  justify-between`} onPress={() => {handleFootballMatchPage(item)}}>
                            <View>
                                <View style={tailwind`justify-between items-center mb-1 gap-1 p-1 flex-row`}>
                                    <View style={tailwind`flex-row`}>
                                        {/* //<Image source={{ uri: item.team1_avatar_url }} style={tailwind`w-6 h-6 bg-violet-200 rounded-full `} /> */}
                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>{item?.awayTeam.name}</Text>
                                    </View>
                                    {(item.status !== "not_started") && (
                                        <View>
                                            <Text>{item.awayScore.score}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={tailwind`justify-between items-center mb-1 gap-1 p-1 flex-row`}>
                                    <View style={tailwind`flex-row`}>
                                        {/* <Image source={{ uri: item.home_team_name }} style={tailwind`w-6 h-6 bg-violet-200 rounded-full `} /> */}
                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>{item?.homeTeam.name}</Text>
                                    </View>
                                    {item.status !== "not_started"  && (
                                        <View>
                                            <Text>{item.homeScore.score}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View style={tailwind`h-16 items-center justify-center w-0.2 bg-black`}></View>
                            {item.status === "not_started" ? (
                                <View style={tailwind`items-center justify-evenly`}>
                                    <View style={tailwind`justify-center items-start`}>
                                        <Text style={tailwind`text-gray-600`}>{formattedDate(convertToISOString(item.startTimeStamp))}</Text>
                                    </View>
                                    
                                    <View style={tailwind`justify-center items-start`}>
                                        <Text style={tailwind`text-gray-600`}>{formattedTime(convertToISOString(item.startTimeStamp))}</Text>
                                    </View>
                                </View>
                            ):(
                                <View style={tailwind`justify-center items-start`}>
                                    <Text style={tailwind`text-gray-600`}>{item.status}</Text>
                                </View>
                            )}
                        </Pressable>
                    ))
                ) : (
                    <Text style={tailwind`text-center mt-4 text-gray-600`}>Loading matches...</Text>
                )}
            </View>
        </ScrollView>
    );
}

export default TournamentFootballMatch;