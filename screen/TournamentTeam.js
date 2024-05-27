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
            const response = await axiosInstance.get(`${BASE_URL}/${tournament.sport_type}/getClubsBySport`, {
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
        navigation.navigate('ClubPage', { clubData: item, sport: item.sports });
    };

    const handleAddTeam = async (item) => {
        try {
            const addTeam = {
                tournament_id: tournament.tournament_id,
                team_id: item
            };
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/${tournament.sport_type}/addTeam`, addTeam, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                fetchTeams(); // Refresh the team list after adding
            }
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
        <ScrollView style={tailwind`mt-4 px-4 bg-gray-100`}>
            {currentRole === "admin" && (
                <View style={tailwind`mt-2 flex items-end`}>
                    <Pressable onPress={handleTeamModal} style={tailwind`px-4 py-2 rounded-lg shadow-lg bg-blue-600 items-center`}>
                        <Text style={tailwind`text-md text-white font-semibold`}>Select Team</Text>
                    </Pressable>
                </View>
            )}
            <View style={tailwind`mt-4`}>
                {teams.map((item, index) => (
                    <TeamItem key={index} item={item} onPress={() => handleTeam(item)} />
                ))}
            </View>
            {isModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isModalVisible}
                    onRequestClose={handleCloseTeam}
                >
                    <Pressable onPress={handleCloseTeam} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-t-lg p-4 max-h-3/4`}>
                            <Text style={tailwind`text-xl font-bold mb-4`}>Teams List</Text>
                            <ScrollView>
                                {teamDisplay.map((item, index) => (
                                    <Pressable key={index} onPress={() => handleAddTeam(item.id)} style={tailwind`py-2 border-b border-gray-200`}>
                                        <Text style={tailwind`text-lg text-gray-700`}>{item.club_name}</Text>
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
    <Pressable onPress={onPress} style={tailwind`mt-2 rounded-lg shadow-lg bg-white p-4 flex-row justify-between items-center`}>
        <View style={tailwind`flex-row items-center`}>
            <Image source={{ uri: item.logo_url || 'default_logo_url' }} style={tailwind`w-14 h-14 rounded-full bg-gray-200`} />
            <Text style={tailwind`ml-4 text-lg text-gray-800 font-semibold`}>{item.club_name}</Text>
        </View>
        <Text style={tailwind`rounded-lg bg-blue-500 text-white px-4 py-2`}>A1</Text>
    </Pressable>
);

export default TournamentTeam;
