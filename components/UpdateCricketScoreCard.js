import React, {useEffect} from 'react'
import {View, Text, Pressable} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import useAxiosInterceptor from '../screen/axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';

export const UpdateCricketScoreCard  = ({currentScoreEvent, isWicketModalVisible, setIsWicketModalVisible, addCurrentScoreEvent, setAddCurrentScoreEvent, runsCount, wicketTypes, game, wicketType, setWicketType, selectedFielder }) => {
    
    const axiosInstance = useAxiosInterceptor();
    const handleCurrentScoreEvent = (item) => {
        const eventItem = item.toLowerCase().replace(/\s+/g, '_');
        setAddCurrentScoreEvent((prevEvent) => {
            if(!prevEvent.includes(eventItem)){
                return [...prevEvent, eventItem];
            } else {
                return prevEvent.filter((it) => it !== eventItem)
            }
        })

        if (eventItem === "wicket" ){
            setIsWicketModalVisible(true);
        }
    }

    const handleScorecard = async (temp) => {
        const currentBowler = bowlingData?.innings.find((item) => item.is_current_bowler === true );
        const currentBatsman = battingData?.innings.find((item) => (item.is_currently_batting === true && item.is_striker === true));
        if(addCurrentScoreEvent.length === 0){
            try {
                
                const data = {
                    batsman_id: currentBatsman.player.id,
                    bowler_id: currentBowler.player.id,
                    match_id: matchData.matchId,
                    runs_scored: temp,
                    bowler_balls: currentBowler.ball,
                }

                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketRegularScore`, data, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            } catch (err) {
                console.error("Failed to add the runs and balls: ", err)
            }
        } else if(addCurrentScoreEvent[0] === "no_ball"){
            try {
                const data = {
                    runs_scored: temp,
                    match_id: matchData.matchId,
                    bowler_id: currentBowler.player.id,
                    batting_team_id: batTeam
                }
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketNoBall`, data, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            } catch (err) {
                console.error("Failed to add the runs and balls: ", err)
            }
        } else if(addCurrentScoreEvent[0] === "wide") {
            try {
                const data = {
                    match_id: matchData.matchId,
                    bowler_id: currentBowler.player.id,
                    batting_team_id: batTeam
                }
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketWide`, data, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            } catch (err) {
                console.error("Failed to add the runs and balls: ", err)
            }
        } else if(addCurrentScoreEvent[0] === "wicket") {
            try {
                const data = {
                    match_id: matchData.matchId,
                    batting_team_id: batTeam,
                    bowling_team_id: matchData.homeTeamID === batTeam?matchData.awayTeamID: matchData.homeTeamID,
                    Batsman_id: currentBatsman.player.id,
                    bowler_id: currentBowler.player.id,
                    wicket_type: wicketType,
                    fielder_id: null
                }
                if (wicketType === "Run Out" || wicketType === "Caught") {
                    data.fielder_id = selectedFielder.id
                }
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.post(`${BASE_URL}/${game.name}/wickets`, data, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            } catch (err) {
                console.error("Failed to add the runs and balls: ", err)
            }
        }
    }

    const handleWicketType = (item) => {
        if(item === "Run Out"){
            setWicketType(item);
            setIsFielder(true);
        } else {
            setWicketType(item)
        }
    }

    return (
        <View>
            <View style={tailwind`p-10 bg-white rounded-xl`}>
                <Text style={tailwind`text-lg font-bold`}>Event</Text>
                <View style={tailwind`flex-row justify-between py-2`}>
                    {currentScoreEvent.map((item, index) => (
                        <Pressable key={index} onPress={() => { handleCurrentScoreEvent(item)}} style={tailwind`flex-row rounded-lg shadow-md bg-white p-2`}>
                            <MaterialIcon name={addCurrentScoreEvent.includes(item.toLowerCase().replace(/\s+/g, '_'))?"check-box": "check-box-outline-blank"} size={24} color={addCurrentScoreEvent.includes(item.toLowerCase().replace(/\s+/g, '_'))?"green":"gray"}/>
                            <Text>{item}</Text>
                        </Pressable>
                    ))}
                </View>
                {isWicketModalVisible && (
                    <View style={tailwind`mt-4`}>
                        <Text style={tailwind`text-base font-semibold text-gray-700 mb-2`}>Wicket Types</Text>
                        <View style={tailwind`flex-row flex-wrap`}>
                            {wicketTypes.map((item, index) => (
                                <Pressable 
                                    key={index} 
                                    onPress={() => {handleWicketType(item)}}
                                    style={tailwind`rounded-lg shadow-md bg-gray-100 px-4 py-2 mr-2 mb-2`}
                                >
                                    <Text style={tailwind`text-gray-800`}>{item}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                <View style={tailwind`flex-row justify-between py-2`}>
                    <Text style={tailwind`text-lg font-bold`}>Runs/Ball</Text>
                    {runsCount.map((item, index) => (
                        <Pressable onPress={() => {handleScorecard(item)}} style={tailwind`rounded-lg shadow-md bg-white p-2`} key={index}>
                            <Text>{item}</Text>
                        </Pressable>
                    ))}
                    
                </View>
            </View>
        </View>
    );
}