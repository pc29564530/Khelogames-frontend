import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Image, Pressable, ScrollView, Modal } from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';

const TournamentTeam = ({ route }) => {
    const { tournament, currentRole } = route.params;
    const navigation = useNavigation();
    const axiosInstance = useAxiosInterceptor();
    const [teams, setTeams] = useState([]);
    const [teamDisplay, setTeamDisplay] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchTeams();
        fetchTeamBySport();
    }, []);

    const fetchTeams = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            // use global state for sport
            const tournamentID = tournament.tournament_id;
            const response = await axiosInstance.get(`${BASE_URL}/${tournament.sport_type}/getTeams/${tournamentID}`, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            setTeams(response.data || []);
        } catch (err) {
            console.error("unable to fetch the tournament teams: ", err);
        }
    };

    const fetchTeamBySport = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getClubsBySport/${tournament.sport_type}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            setTeamDisplay(response.data || []);
        } catch (err) {
            console.error("unable to fetch the team by sport: ", err);
        }
    };

    const handleTeam = (item) => {
        navigation.navigate('ClubPage', { item });
    };

    const handleAddTeam = async (item) => {
        try {
            const addTeam = {
                tournament_id: tournament.tournament_id,
                team_id: item
            };
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/addTeam`, addTeam, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (err) {
            console.error("unable to add the tournament teams: ", err);
        }
    };

    const handleCloseTeam = () => {
        setIsModalVisible(false);
    };

    const handleTeamModal = () => {
        setIsModalVisible(true);
    };

    return (
            <ScrollView style={tailwind`mt-4`}>
                <ScrollView>
                    {currentRole==="admin" && (
                        <View style={tailwind`mt-2`}>
                            <Pressable onPress={handleTeamModal} style={tailwind`p-4 rounded-lg shadow-lg w-40 items-center pb-2 justify-center ml-60 `}>
                                <Text style={tailwind`text-md p-2`}>Select Team</Text>
                            </Pressable>
                        </View>
                    )}
                    <View>
                        {teams.map((item, index) => (
                            <TeamItem key={index} item={item} onPress={() => handleTeam(item)} />
                        ))}
                    </View>
                </ScrollView>
                {isModalVisible && (
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={isModalVisible}
                        onRequestClose={handleCloseTeam}
                        style={tailwind`mt-4`}
                    >
                        <Pressable  onPress={() => handleCloseTeam()}style={tailwind`flex-1 justify-end bg-black   rounded-lg bg-black justify-end`}>
                            <View style={tailwind`bg-white h-100 rounded-t-md p-4`}>
                                <ScrollView style={tailwind`flex-1`}>
                                    <Text style={tailwind`text-xl font-bold mt-4 `}>Teams List</Text>
                                    {teamDisplay.map((item, index) => (
                                        <Pressable key={index} onPress={() => handleAddTeam(item.id)} style={tailwind`mt-2 p-1`}>
                                            <Text style={tailwind`text-black text-lg`}>{item.club_name}</Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </View>
                        </Pressable>
                    </Modal>
                )}
            </ScrollView>
            
    );
};

const TeamItem = ({ item, onPress }) => (
    <Pressable onPress={onPress} style={tailwind`mt-2 rounded-lg shadow-lg bg-white p-2 flex-row justify-between`}>
        <View style={tailwind`flex-row items-center`}>
            <Image source='/users/home/pawan' style={tailwind`rounded-full shadow-lg h-14 w-14 bg-pink-200`} />
            <Text style={tailwind`text-black text-lg ml-2`}>{item.club_name}</Text>
        </View>
        <View style={tailwind`flex-row`}>
            <Text style={tailwind`rounded-lg bg-blue-300 p-2 items-center aspect-auto h-10 m-4`}>A1</Text>
        </View>
    </Pressable>
);

export default TournamentTeam;
