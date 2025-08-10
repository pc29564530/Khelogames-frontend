import React, {useState, useEffect} from 'react';
import {View, Text, Pressable} from 'react-native'
import tailwind from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import { formattedDate } from '../utils/FormattedDateTime';
import { formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';
import { useSelector } from 'react-redux';

const FootballDetails = ({route}) => {
    const matchData = route.params.matchData;
    const tournament = useSelector((state) => state.tournamentsReducers.tournament)
    const game = useSelector((state) => state.sportsReducers.game)
    const navigation = useNavigation();
    
    const handleTournamentPage = async (tournamentPublicID) => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken')
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTournament/${tournamentPublicID}`, null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data || [];
            navigation.navigate("TournamentPage", {tournament:item, currentRole: 'admin'})
        } catch (err) {
            console.error("unable to fetch the tournament data: ", err)
        }
        
    }

    useEffect(() => {

        const addFootballScore = async () => {
            const authToken = await AsyncStorage.getItem('AccessToken')
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTournament/${tournamentPublicID}`, null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
        }

        if (matchData.status_code === "started") {
            addFootballScore()
        }
    }, []);

    return (
        <View style={tailwind`flex-1 bg-white`}>
            <Pressable style={tailwind`flex-row items-start shadow-lg p-6 bg-white mt-2 justify-between`} onPress={() => handleTournamentPage(tournament.public_id)}>
                <Text style={tailwind` text-2xl`}>{tournament.name}</Text>
                <MaterialCommunityIcons name="greater-than" size={24} color="black" />
            </Pressable>
           <View style={tailwind`mt-2`}>
                <Text style={tailwind`text-lg ml-2`}>Teams</Text>
                <View style={tailwind`flex-row justify-between items-center gap-2 ml-2 mr-2 `}>
                    <Pressable style={tailwind`flex-1 items-center shadow-lg rounded-lg p-4 bg-white mt-2 justify-between`}>
                        <Text >{matchData.homeTeam.name}</Text>
                    </Pressable>
                    <Pressable style={tailwind`flex-1 items-center shadow-lg rounded-lg p-4 bg-white mt-2 justify-between`}>
                        <Text>{matchData.awayTeam.name}</Text>
                    </Pressable>
                </View>
           </View>
           <View style={tailwind`mt-2`}>
                <Text style={tailwind`text-2xl ml-2`}>Details</Text>
                <View style={tailwind`flex-row justify-between ml-2 mr-2`}>
                    <Text>Date</Text>
                    <Text>{formattedDate(convertToISOString(matchData.startTimeStamp))}</Text>
                </View>
                <View style={tailwind`flex-row justify-between ml-2 mr-2`}>
                    <Text>Time</Text>
                    <Text>{formattedTime(convertToISOString(matchData.startTimeStamp))}</Text>
                </View>
           </View>
        </View>
    );
}

export default FootballDetails;