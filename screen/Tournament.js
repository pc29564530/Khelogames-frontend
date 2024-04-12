import React, { useState, useEffect, useRef } from 'react';
import {View, Text, Pressable, ScrollView, Image} from 'react-native';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import AntDesign from 'react-native-vector-icons/AntDesign';
import { BASE_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
const defaultImage = require('/Users/pawan/project/Khelogames-frontend/assets/gradient_trophy_silver.jpg');

const Tournament = () => {
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const [tournaments, setTournaments] = useState({live:[],upcomming:[],previous:[]});
    const scrollViewRef = useRef(null)
    const handleTournamentPage = (item) => {
        //console.log("Long : ", item)
        navigation.navigate("TournamentPage" , {item:item})
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

                        //currentStatus
                        const startDate = new Date(it.start_on);
                        const endDate = new Date(it.end_on);
                        const currentDate = new Date();
                        const remainingStartTime = startDate.getTime()-currentDate.getTime();
                        const remainingEndTime = endDate.getTime()-currentDate.getTime();
                        const days = Math.ceil(remainingStartTime/(100*3600*24));
                        const endDays = Math.ceil(remainingEndTime/(1000*3600*24));
                        let currentStatus;
                        if(days>0){
                            currentStatus = "upcoming";
                        } else if(endDays<0) {
                            currentStatus = "ended";
                        } else {
                            currentStatus = "live";
                        }

                        //set the date 
                        const dateStartStr = it.start_on;
                        const dateEndStr = it.end_on;
                        const timeStampStartOn = new Date(dateStartStr);
                        const timeStampEndOn = new Date(dateEndStr);
                        const options = {weekday: 'long', month:'long', day:'2-digit'}
                        const formattedStartOn = timeStampStartOn.toLocaleString('en-US', options);
                        const formattedEndOn = timeStampEndOn.toLocaleString('en-US', options);
                        it.start_on = formattedStartOn;
                        it.end_on = formattedEndOn;

                        //set the display text
                        let displayText = '';
                        const usernameInitial = it.tournament_name ? it.tournament_name.charAt(0) : '';
                        displayText = usernameInitial.toUpperCase();
                        return {...it, displayText: displayText, currentStatus:currentStatus}
                    });
                    const tournamentWithDisplayText = await Promise.all(dataWithDisplayText)
                    const categarizedTournament = {live:[], upcoming:[], previous:[]};
                    tournamentWithDisplayText.forEach((item) => {
                        let category;
                        if(item.currentStatus === "live"){
                            category = "live";
                        } else if(item.currentStatus === "ended") {
                            category = "previous";
                        } else {
                            category = "upcoming"
                        }
                        categarizedTournament[category].push(item);
                    })
                    setTournaments(categarizedTournament);
                }
            } catch (err) {
                console.error("unable to fetch tournament ", err)
            }
        }
        fetchTournament();
    }, []);
    
    navigation.setOptions({
        headerTitle:'',
        headerLeft:()=>(
            <Pressable onPress={()=>navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="black" style={tailwind`ml-4`} />
            </Pressable>
        ),
        headerRight:() => (
            <Pressable style={tailwind`relative p-2 bg-white items-center justify-center rounded-lg shadow-lg mr-4`} onPress={() => navigation.navigate("CreateTournament")}>
                <MaterialIcons name="add" size={24} color="black"/>
            </Pressable>
        )
    })

    return (
        <View style={tailwind`flex-1 mt-1 mb-2`}>
            <ScrollView
                nestedScrollEnabled={true}
            >
                {Object.keys(tournaments).map((tournamentItem, index) => (
                    <View key={index}>
                        <Text style={tailwind`text-xl font-bold mb-2 p-2 ml-4`}>{tournamentItem.charAt(0).toUpperCase() + tournamentItem.slice(1)}</Text>
                        <ScrollView
                            style={tailwind`ml-4 mr-2 flex-row`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            ref={scrollViewRef}
                            contentContainerStyle={tailwind`ml-2 mr-2`}
                        >
                            {tournaments[tournamentItem].map((item, idx) => (
                                <Pressable
                                    key={idx}
                                    style={tailwind`border rounded-md w-40 h-52 p-2 mr-4 relative bg-gray-200`}
                                    onPress={() => handleTournamentPage(item)}
                                >
                                    <View style={tailwind`rounded-lg p-1 flex-row justify-between`}>
                                        <View style={tailwind`flex-row items-center bg-yellow-300 rounded-lg p-1`}>
                                            <Text style={tailwind`text-black text-sm`}>{item.currentStatus}</Text>
                                        </View>
                                        <View style={tailwind`flex-row items-center bg-purple-200 p-1 rounded-lg p-1`}>
                                            <Text style={tailwind`text-black text-sm`}>{item.format}</Text>
                                        </View>
                                    </View>
                                    <View style={tailwind`mt-auto`}>
                                        <Text style={tailwind`text-black text-lg`} numberOfLines={1}>{item.tournament_name}</Text>
                                        <View style={tailwind`flex-row justify-between items-center mt-1`}>
                                            <View style={tailwind`flex-row items-center`}>
                                                <AntDesign name="team" size={14} color="black" />
                                                <Text style={tailwind`text-sm text-black ml-1`}>{item.teams_joined}</Text>
                                            </View>
                                            <Text style={tailwind`text-black text-sm`}>{item.sport_type}</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
        
}

export default Tournament;