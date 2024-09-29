import React from 'react';
import {View, Text, Pressable, ScrollView, Image} from 'react-native';
import tailwind from 'twrnc';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getCricketMatchScore } from '../redux/actions/actions';
import { formattedDate, formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
const filePath = require('../assets/status_code.json');

const TournamentCricketMatch = ({tournament, AsyncStorage, axiosInstance, BASE_URL, game}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const matches = useSelector((state) => state.cricketMatchScore.cricketMatchScore);
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
            dispatch(getCricketMatchScore(item))
        } catch (err) {
            console.error("Unable to fetch tournament matches: ", err);
        }
    };

    const handleCricketMatchPage = (item) => {
        navigation.navigate("CricketMatchPage", {item: item, game: game.name})
    }

    return (
        <ScrollView>
            <View style={tailwind`p-4`}>
                {matches?.length > 0 ? (
                    matches.map((item, index) => (
                        <Pressable key={index} style={tailwind`mb-1 p-1 bg-white rounded-lg shadow-md flex-row  justify-between`} onPress={() => handleCricketMatchPage(item)}>
                            <View>
                                <View style={tailwind`justify-between items-center mb-1 gap-1 p-1 flex-row`}>
                                    <View style={tailwind`flex-row`}>
                                        {/* //<Image source={{ uri: item.team1_avatar_url }} style={tailwind`w-6 h-6 bg-violet-200 rounded-full `} /> */}
                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>{item.homeTeam.name}</Text>
                                    </View>

                                    {/* if one team above played and other inning will start letter on then update the  */}
                                    {(item.status !== "not_started")  && (
                                        <View style={tailwind`flex-row`}>
                                            <Text>{item.homeScore?.runs}</Text>
                                            <Text> - </Text>
                                            <Text>{item.homeScore?.wickets}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={tailwind`justify-between items-center mb-1 gap-1 p-1 flex-row`}>
                                    <View style={tailwind`flex-row`}>
                                        {/* <Image source={{ uri: item.home_team_name }} style={tailwind`w-6 h-6 bg-violet-200 rounded-full `} /> */}
                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>{item?.awayTeam.name}</Text>
                                    </View>
                                    {item.status !== "not_started"  &&(
                                        <View style={tailwind`flex-row`}>
                                            <Text>{item.awayScore?.score}</Text>
                                            <Text> - </Text>
                                            <Text>{item.awayScore?.wickets}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View style={tailwind`h-16 items-center justify-center w-0.2 bg-black`}></View>
                            {item.status === "not_started" ? (
                                <View>
                                    <View style={tailwind`justify-center items-start`}>
                                        <Text style={tailwind`text-gray-600`}>{formattedDate(convertToISOString(item.start_time))}</Text>
                                    </View>
                                    <View style={tailwind`justify-center items-start`}>
                                        <Text style={tailwind`text-gray-600`}>{formattedTime(convertToISOString(item.start_time))}</Text>
                                    </View>
                                </View>
                            ):(
                                <View style={tailwind`justify-center items-start`}>
                                    <Text style={tailwind`text-gray-600`}>{item.status}</Text>
                                </View>
                            )}
                            <Pressable onPress={() => handleUpdateStatus()}>
                                <MaterialIcon name="update" size={24}/>
                            </Pressable>
                        </Pressable>
                    ))
                ) : (
                    <Text style={tailwind`text-center mt-4 text-gray-600`}>Loading matches...</Text>
                )}
            </View>
        </ScrollView>
    );
}

export default TournamentCricketMatch;