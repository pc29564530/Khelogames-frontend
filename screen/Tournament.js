import React, { useState, useEffect, useRef } from 'react';
import {View, Text, Pressable, ScrollView} from 'react-native';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { BASE_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';

const Tournament = () => {
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const [tournaments, setTournaments] = useState([]);
    const scrollViewRef = useRef(null)
    const handleTournamentPage = (item) => {
        navigation.navigate("TournamentPage" ,item={item})
    }
    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AcessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getTournaments`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                      },
                })
                const item = response.data;
                if (!item || item === null) {
                    setTournaments([]);
                } else {

                }
                const dataWithDisplayText = item.map((it, index) => {
                    let displayText = '';
                    const usernameInitial = it.tournament_name ? it.tournament_name.charAt(0) : '';
                    displayText = usernameInitial.toUpperCase();
                    return {...it, displayText: displayText}
                });
                const tournamentWithDisplayText = await Promise.all(dataWithDisplayText)
                console.log("Tournament: ", tournamentWithDisplayText)
                setTournaments(tournamentWithDisplayText);
            } catch (err) {
                console.error("unable to fetch tournament ", err)
            }
        }
        fetchTournament();
    }, []);

    console.log("tournament ", tournaments)

    return (
        <View style={tailwind`flex-1 mt-4`}>
            <ScrollView style={tailwind`flex-row ml-4 mr-2 flex-row`}
                horizontal
                showsHorizontalScrollIndicator={false}
                ref={scrollViewRef}
                contentContainerStyle={tailwind`flex-row justify-between ml-2 mr-2`}
            >
                {tournaments.map((item,index) => (
                    <Pressable key={index} style={tailwind`border rounded-md w-37 h-50 p-2 mr-2 `} onPress={() => handleTournamentPage({item})}>
                        <Text style={tailwind`text-black text-lg`}>{item.tournament_name}</Text>
                        <Text style={tailwind`text-black text-sm`}>{item.format}</Text>
                        <Text style={tailwind`text-black text-sm`}>{item.sport_type}</Text>
                        <Text style={tailwind`text-black text-sm`}>{item.teams_joined}</Text>
                    </Pressable>
                ))}
            </ScrollView>
            <Pressable style={tailwind`absolute bottom-5 right-5 p-4 border rounded-full w-20 h-20 bg-white items-center justify-center`} onPress={() => navigation.navigate("CreateTournament")}>
                <MaterialIcons name="add" size={40} color="black"/>
            </Pressable>
        </View>
    );
}

export default Tournament;