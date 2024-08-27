import React, {useState} from 'react';
import {View, Text, Pressable} from 'react-native'
import tailwind from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import { formattedDate } from '../utils/FormattedDateTime';
import { formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';

const FootballDetails = ({route}) => {
    const matchData = route.params.matchData;
    const navigation = useNavigation();
    const axiosInstance = useAxiosInterceptor();
    const handleTournamentPage = async (tournamentID) => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken')
            const response = await axiosInstance.get(`${BASE_URL}/${matchData.sports}/getTournament/${tournamentID}`, null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data || [];
            navigation.navigate("TournamentPage", {tournament:item, currentRole: 'admin', sport:item?.sports})
        } catch (err) {
            console.error("unable to fetch the tournament data: ", err)
        }
        
    }
    return (
        <View style={tailwind`flex-1`}>
            <Pressable style={tailwind`flex-row items-start shadow-lg p-6 bg-white mt-2 justify-between`} onPress={() => handleTournamentPage(matchData.tournament.id)}>
                <Text style={tailwind` text-2xl`}>{matchData.tournament.name}</Text>
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