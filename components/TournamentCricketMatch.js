import React from 'react';
import {View, Text, Pressable, ScrollView, Image} from 'react-native';
import tailwind from 'twrnc';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getCricketMatchScore } from '../redux/actions/actions';
import { formatToDDMMYY, formattedDate, formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
const filePath = require('../assets/status_code.json');
import { convertBallToOvers } from '../utils/ConvertBallToOvers';

export const renderInningScore = (scores) => {
    return scores?.map((score, index) => (
      <View key={index} style={tailwind`flex-row`}>
        <Text style={tailwind`ml-2 text-lg text-gray-800`}>
          {score.score}/{score.wickets}
        </Text>
        {score.is_inning_completed === false && (
            <Text style={tailwind`ml-2 text-lg text-gray-800`}>({convertBallToOvers(score.overs)})</Text>
        )}
      </View>
    ));
  };
  

const TournamentCricketMatch = ({tournament, AsyncStorage, axiosInstance, BASE_URL}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const matches = useSelector((state) => state.cricketMatchScore.cricketMatchScore);
    const game = useSelector(state => state.sportReducers.game);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss)
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
            dispatch(getCricketMatchScore(item || []))
        } catch (err) {
            console.error("Unable to fetch tournament matches: ", err);
        }
    };

    return (
        <ScrollView>
            <View style={tailwind`p-4`}>
            {matches[0]?.knockout_stage &&
            Object.entries(matches[0].knockout_stage).map(([stageName, knockoutMatches]) => (
                <View key={stageName}>
                    <Text style={tailwind`text-lg font-bold mt-4 mb-2`}>{knockoutMatches["round"]}</Text>
                    {knockoutMatches["matches"].map((item, index) => {
                        return <MatchesData item={item} ind={index} key={index}/>
                    })}
                </View>
            ))}
            {matches[0]?.group_stage &&
            Object.entries(matches[0].group_stage).map(([stageName, groupMatches]) => (
                <View key={stageName}>
                    <Text style={tailwind`text-lg font-bold mt-4 mb-2`}>{groupMatches["round"]}</Text>
                    {groupMatches["matches"]?.map((item, index) => {
                        return <MatchesData item={item} ind={index} key={index}/>
                    })}
                </View>
            ))}
            </View>
        </ScrollView>
    );
}

const MatchesData = ({item, ind}) => {
    const navigation = useNavigation()
    const handleCricketMatchPage = (item) => {
        navigation.navigate("CricketMatchPage", {item: item.id})
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
                            source={{ uri: item.teams.home_team?.media_url }} 
                            style={tailwind`w-6 h-6 bg-violet-200 rounded-full mb-2`} 
                        />
                        <Image 
                            source={{ uri: item.teams.away_team?.media_url }} 
                            style={tailwind`w-6 h-6 bg-violet-200 rounded-full mb-2`} 
                        />
                    </View>
                    <View style={tailwind``}>
                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                            {item.teams.home_team?.name}
                        </Text>
                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                            {item.teams.away_team?.name}
                        </Text>
                    </View>
                </View>
                <View style={tailwind`items-center justify-center flex-row right-4`}>
                    <View style={tailwind`mb-2 flex-row`}>
                        
                        {item.status !== "not_started" && (
                            <View>
                            <View style={tailwind``}>
                                {item.scores.home_score  && (
                                    <View style={tailwind``}>
                                        {renderInningScore(item.scores.home_score)}
                                    </View>
                                )}
                                {item.scores.away_score && (
                                    <View style={tailwind``}>
                                        {renderInningScore(item.scores.away_score)}
                                    </View>
                                )}
                            </View>
                            </View>
                        )}
                        <View style={tailwind`w-0.4 h-10 bg-gray-200 left-2`}/>
                        <View style={tailwind`mb-2 ml-4 items-center justify-evenly`}>
                            <Text style={tailwind`text-md text-gray-800`}>
                                {formatToDDMMYY(convertToISOString(item.start_timestamp))}
                            </Text>
                            {item.status !== "not_started" ? (
                                <Text style={tailwind`text-md text-gray-800`}>{item.status}</Text>
                            ) : (
                                <Text style={tailwind`text-md text-gray-800`}>
                                    {formattedTime(convertToISOString(item.start_timestamp))}
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