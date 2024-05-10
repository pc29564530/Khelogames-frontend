import React, {useState} from 'react';
import {View, Text, Pressable} from 'react-native'
import tailwind from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import { formattedTime } from '../utils/FormattedDateTime';
import { formattedDate } from '../utils/FormattedDateTime';

const FootballDetails = ({route}) => {
    const matchData = route.params.matchData;
    const navigation = useNavigation();
    const axiosInstance = useAxiosInterceptor();
    const handleTournamentPage = async (tournamentID) => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken')
            const response = await axiosInstance.get(`${BASE_URL}/getTournament/${tournamentID}`, null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data || [];
            navigation.navigate("TournamentPage", {item:item, currentRole: 'admin'})
        } catch (err) {
            console.error("unable to fetch the tournament data: ", err)
        }
        
    }
    return (
        <View style={tailwind`flex-1`}>
            <Pressable style={tailwind`flex-row items-start shadow-lg p-6 bg-white mt-2 justify-between`} onPress={() => handleTournamentPage(matchData.tournament_id)}>
                <Text>{matchData.tournament_name}</Text>
                <MaterialCommunityIcons name="greater-than" size={24} color="black" />
            </Pressable>
           <View style={tailwind`mt-2`}>
                <Text style={tailwind`text-lg ml-2`}>Teams</Text>
                <View style={tailwind`flex-row justify-between items-center gap-2 ml-2 mr-2 `}>
                   
                    <Pressable style={tailwind`flex-1 items-center shadow-lg rounded-lg p-4 bg-white mt-2 justify-between`}>
                        <Text >{matchData.team1_name}</Text>
                    </Pressable>
                    <Pressable style={tailwind`flex-1 items-center shadow-lg rounded-lg p-4 bg-white mt-2 justify-between`}>
                        <Text>{matchData.team2_name}</Text>
                    </Pressable>
                </View>
           </View>
           <View style={tailwind``}>
                <Text>Details</Text>
                <View>
                    <Text>Date</Text>
                    <Text>{formattedDate(matchData.date_on)}</Text>
                </View>
                <View>
                    <Text>Time</Text>
                    <Text>{formattedTime(matchData.time_at)}</Text>
                </View>
           </View>
        </View>
    );
}

export default FootballDetails;