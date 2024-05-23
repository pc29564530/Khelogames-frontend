import React, { useState, useEffect, useRef, useContext } from 'react';
import {View, Text, Pressable, ScrollView, Image} from 'react-native';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import AntDesign from 'react-native-vector-icons/AntDesign';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { getTournamentByID, getTournamentBySport } from '../services/tournamentServices';
import { getTournamentBySportAction, getTournamentByIdAction, setSport } from '../redux/actions/actions';
import { useDispatch, useSelector } from 'react-redux';

let sports = ["Football", "Cricket", "Chess", "VolleyBall", "Hockey", "Athletics", "Car Racing"];

const Tournament = () => {
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const [currentRole, setCurrentRole] = useState('');
    const dispatch = useDispatch();
    const tournaments = useSelector(state => state.tournamentsReducers.tournaments);
    const sport = useSelector(state => state.sportReducers.sport);
    const scrollViewRef = useRef(null);
    const handleTournamentPage = (item) => {
        dispatch(getTournamentByIdAction(item));
        navigation.navigate("TournamentPage" , {tournament: item, currentRole: currentRole, sport: sport})
    }
    useEffect(() => {
        const checkRole = async () => {
            const role = await AsyncStorage.getItem('Role');
            setCurrentRole(role);
        }
        checkRole();
    }, []);
    useEffect(() => {
        const fetchTournament = async () => {
            const tournamentData = await getTournamentBySport({axiosInstance: axiosInstance, sport: sport});
            dispatch(getTournamentBySportAction(tournamentData));
        }
        fetchTournament();
    }, [sport]);
    
    navigation.setOptions({
        headerTitle:'',
        headerLeft:()=>(
            <Pressable onPress={()=>navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="black" style={tailwind`ml-4`} />
            </Pressable>
        ),
        headerRight:() => (
            <View>
                {currentRole === 'admin' && (
                     <Pressable style={tailwind`relative p-2 bg-white items-center justify-center rounded-lg shadow-lg mr-4`} onPress={() => navigation.navigate("CreateTournament")}>
                        <MaterialIcons name="add" size={24} color="black"/>
                    </Pressable>
                )}
            </View>
        )
    })

    const handleSport = (item) => {
        dispatch(setSport(item));
    } 

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }

    return (
        <View style={tailwind`flex-1 mt-1 mb-2`}>
            <ScrollView
                nestedScrollEnabled={true}
            >
                <View style={tailwind`flex-row mt-5`}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ref={scrollViewRef}
                        contentContainerStyle={tailwind`flex-row flex-wrap justify-center`}
                    >
                        {sports.map((item, index) => (
                            <Pressable key={index} style={tailwind`border rounded-md bg-orange-200 p-1.5 mr-2 ml-2`} onPress={() => handleSport(item)}>
                                <Text style={tailwind`text-black`}>{item}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                    <Pressable onPress={scrollRight} style={tailwind`justify-center ml-2`}>
                        <MaterialIcons name="keyboard-arrow-right" size={30} color="black" />
                    </Pressable>
                </View>
                {Object.keys(tournaments).map((tournamentItem, index) => (
                    <View key={index}>
                        <Text style={tailwind`text-xl font-bold mb-2 p-2 ml-4`}>{tournamentItem.charAt(0).toUpperCase() + tournamentItem.slice(1)}</Text>
                        {tournaments[tournamentItem] && tournaments[tournamentItem].length>0?(
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
                        ):(
                            <View style={tailwind`items-center justify-center h-30 w-50 shadow-lg bg-white`}>
                                <Text style={tailwind`text-black`}>There is no tournament {tournamentItem}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
        
}

export default Tournament;