import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Image } from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { useDispatch, useSelector } from 'react-redux';
import {setGames, setGame, getTeams, getTeamsBySport } from '../redux/actions/actions';
import { sportsServices } from '../services/sportsServices';

const Club = () => {
    const navigation = useNavigation();
    const scrollViewRef = useRef(null);
    
    const [currentRole, setCurrentRole] = useState('');
    const [selectedSport, setSelectedSport] = useState("football");
    const dispatch = useDispatch();
    const games = useSelector(state => state.sportReducers.games);
    const game = useSelector(state => state.sportReducers.game);
    const teams = useSelector((state) => state.teams.teamsBySports);

    useEffect(() => {
        const defaultSport = { id: 1, name: 'football', min_players: 11 };
        dispatch(setGame(defaultSport));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await sportsServices({ axiosInstance });
                dispatch(setGames(data));
            } catch (error) {
                console.error("Unable to fetch games data: ", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const roleStatus = async () => {
            const checkRole = await AsyncStorage.getItem('Role');
            setCurrentRole(checkRole);
        }
        roleStatus();
    }, []);

    useEffect(() => {
        const getClubData = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsBySport/${game.id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                const item = response.data;
                if (!item || item === null) {
                    dispatch(getTeamsBySport([]));
                } else {
                    dispatch(getTeamsBySport(item));
                }
            } catch (err) {
                console.error("Unable to fetch all team or club: ", err);
            }
        }

        if (game?.name) {
            getClubData();
        }
    }, [axiosInstance, game]);

    navigation.setOptions({
        headerTitle: 'Teams',
        headerStyle: {
            backgroundColor: tailwind.color('bg-red-400'),
        },
        headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="black" style={tailwind`ml-4`} />
            </Pressable>
        ),
        headerRight: () => (
            <View>
                <Pressable style={tailwind`relative p-2 items-center justify-center mr-1`} onPress={() => handleAddClub()}>
                    <MaterialIcons name="add" size={24} color="black" />
                </Pressable>
            </View>
        )
    });

    const handleAddClub = () => {
        navigation.navigate('CreateClub');
    }

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({ x: 100, animated: true });
    }

    const handleClub = (item) => {
        navigation.navigate('ClubPage', { teamData: item, game: game });
    }

    const handleSport = (item) => {
        setSelectedSport(item.name);
        dispatch(setGame(item));
    }

    return (
        <View style={tailwind`flex-1 bg-gray-100`}>
            <View style={tailwind`flex-row shadow-lg bg-white p-2`}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ref={scrollViewRef}
                    contentContainerStyle={tailwind`flex-row flex-wrap justify-center`}
                >
                    {games?.map((item, index) => (
                        <Pressable key={index} style={[tailwind`border rounded-md p-2 mr-2 ml-2`, selectedSport === item.name ? tailwind`bg-orange-500` : tailwind`bg-orange-300`]} onPress={() => handleSport(item)}>
                            <Text style={tailwind`text-white font-semibold`}>{item.name}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
                <Pressable onPress={scrollRight} style={tailwind`justify-center ml-2`}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} color="black" />
                </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 10 }}>
                {teams.map((item, index) => (
                    <View key={index} style={tailwind`mb-4`}>
                        <Pressable onPress={() => handleClub(item)} style={tailwind`rounded-md w-full h-20 bg-white shadow-lg p-4 flex-row items-center`}>
                            <View style={tailwind`rounded-full h-16 w-16 bg-gray-200 overflow-hidden`}>
                                {item.media_url ? (
                                    <Image source={{ uri: item.media_url }} style={tailwind`h-full w-full`} />
                                ) : (
                                    <Text style={tailwind`text-black text-2xl py-4 font-bold text-center`}>{item?.name?.charAt(0).toUpperCase()}</Text>
                                )}
                            </View>
                            <View style={tailwind`ml-4`}>
                                <Text style={tailwind`text-lg font-bold text-black`}>{item.name}</Text>
                                <View style={tailwind`flex-row gap-2`}>
                                    <Text style={tailwind`text-gray-600`}>{item.country}</Text>
                                    <Text style={tailwind`text-gray-600`}>{game.name}</Text>
                                </View>
                            </View>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

export default Club;