import React, { useState, useEffect, useRef } from 'react';
import {View, Text, Pressable, ScrollView, Image} from 'react-native';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { BASE_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
const defaultImage = require('/Users/pawan/project/Khelogames-frontend/assets/gradient_trophy_silver.jpg');

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
                    const dataWithDisplayText = item.map((it, index) => {
                        let displayText = '';
                        const usernameInitial = it.tournament_name ? it.tournament_name.charAt(0) : '';
                        displayText = usernameInitial.toUpperCase();
                        return {...it, displayText: displayText}
                    });
                    const tournamentWithDisplayText = await Promise.all(dataWithDisplayText)
                    // console.log("Tournament: ", tournamentWithDisplayText)
                    setTournaments(tournamentWithDisplayText);
                }
            } catch (err) {
                console.error("unable to fetch tournament ", err)
            }
        }
        fetchTournament();
    }, []);

    // console.log("tournament ", tournaments)

    return (
        <View style={tailwind`flex-1 mt-4`}>
            <ScrollView style={tailwind`flex-row ml-4 mr-2 flex-row`}
                horizontal
                showsHorizontalScrollIndicator={false}
                ref={scrollViewRef}
                contentContainerStyle={tailwind`flex-row justify-between ml-2 mr-2`}
            >
                {tournaments.map((item,index) => (
                    <Pressable key={index} style={tailwind`border rounded-md w-41 h-52 p-2 mr-2 relative bg-gray-200 `} onPress={() => handleTournamentPage({item})}>
                        {/* <View style={tailwind`absolute top-0 left-0 right-0 bottom-0 w-full h-full rounded-md bg-no-repeat bg-cover bg-center`}>
                            <Image source={defaultImage} style={tailwind`w-full h-full rounded-md ` } resizeMode='cover' />
                        </View> */}
                        <View style={tailwind`bg-purple-500  rounded-lg absolute top-2 right-1 p-1`}>
                            <Text style={tailwind`text-black text-sm`}>{item.format}</Text>
                        </View>
                        <View style={tailwind`top-30`}>
                            <Text style={tailwind`text-black text-lg`}>{item.tournament_name}</Text>
                        </View>
                        <View style={tailwind`top-34 flex-row justify-between`}>
                            <View style={tailwind``}>
                                <Text style={tailwind`text-black text-sm`}>{item.sport_type}</Text>
                            </View>
                            <View style={tailwind`flex-row gap-1`}>
                                <Text style={tailwind`text-sm text-black`}>Teams</Text>
                                <Text style={tailwind`text-black text-sm`}>{item.teams_joined}</Text>
                            </View>
                        </View>
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