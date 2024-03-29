import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text, Image, Pressable, ScrollView} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import Tournament from './Tournament';
import { useNavigation } from '@react-navigation/native';

const TournamentTeam = ({route}) => {
    const tournament = route.params.tournament;
    const navigation = useNavigation();
    const axiosInstance = useAxiosInterceptor();
    const [teams, setTeams] = useState([]);
    useEffect( () => {
        const fetchTeams = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken')
                const response = await axiosInstance.get(`${BASE_URL}/getTeams/${tournament.tournament_id}`,null,{
                    headers:{
                        'Authorization':`bearer ${authToken}`,
                        'Content-Type': 'content-type'
                    }
                })
                console.log("Temas: ", response.data)
                setTeams(response.data)
    
            } catch (err) {
                console.error("unable to fetch the tournament teams: ", err)
            }
        }
        fetchTeams();
    }, []);
    const handleTeam = (item) => {
        navigation.navigate('ClubPage', {item:item})
    }
    return (
        <ScrollView style={tailwind`flex-1 mt-2`}>
            {teams.map((item, index) => (
                <Pressable key={index} style={tailwind`mt-2 rounded-lg shadow-lg bg-white p-2 flex-row justify-between`} onPress={() => {handleTeam(item)}}>
                    <View style={tailwind`flex-row items-center`}>
                        <Image src="/home/users/pawan" style={tailwind`rounded-full shadow-lg h-14 w-14 bg-pink-200`} />
                        <Text style={tailwind`text-black text-lg ml-2`}>{item.club_name}</Text>
                    </View>
                    <View style={tailwind`flex-row`}>
                        <Text style={tailwind`rounded-lg bg-blue-300 p-2 items-center aspect-auto h-10 m-4`}>A1</Text>
                    </View>
                </Pressable>
            ))}
        </ScrollView>
    );
}

export default TournamentTeam;