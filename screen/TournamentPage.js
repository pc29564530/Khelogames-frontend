import React, { useState, useEffect } from 'react';
import {View, Text, Pressable} from 'react-native';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { BASE_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';

const TournamentPage = ({route}) => {

    const tournament = route.params.item.item;
    console.log("Index: ", tournament)
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const [tournaments, setTournaments] = useState([]);
    
    return (
        <View style={tailwind`flex-1 mt-4`}>
            <View style={tailwind` justify-between ml-2 mr-2 h-100 bg-orange-300`}>
                <Text style={tailwind`text-black text-2xl`}>{tournament.tournament_name}</Text>
                <Text style={tailwind`text-black text-2xl`}>{tournament.format}</Text>
                <Text style={tailwind`text-black text-2xl`}>{tournament.sport_type}</Text>
                <Text style={tailwind`text-black text-2xl`}>{tournament.teams_joined}</Text>
            </View>
            <Pressable style={tailwind`absolute bottom-5 right-5 p-4 border rounded-full w-20 h-20 bg-white items-center justify-center`}>
                <MaterialIcons name="add" size={40} color="black"/>
            </Pressable>
        </View>
    );
}

export default TournamentPage;