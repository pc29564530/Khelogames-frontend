import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Image, Pressable, ScrollView, Modal } from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setTeams, getTeams, getTeamsBySport } from '../redux/actions/actions';
import { getTeamsByTournamentID } from '../services/tournamentServices';
import { Alert } from 'react-native';

const TournamentTeam = ({ route }) => {
    const { tournament, currentRole } = route.params;
    const navigation = useNavigation();
    
    const [teamDisplay, setTeamDisplay] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const dispatch = useDispatch();
    const teams = useSelector((state) => state.teams.teams);
    const teamsBySport = useSelector((state) => state.teams.teamsBySports);
    const game = useSelector(state => state.sportReducers.game);

    useEffect(() => {
        fetchTeamBySport();
    }, []);

    const fetchTeamBySport = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsBySport/${game.id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            dispatch(getTeamsBySport(response.data || []));
        } catch (err) {
            console.error("unable to fetch the team by game: ", err);
        }
    };

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const tournamentTeams =  await getTeamsByTournamentID({tournamentPublicID: tournament.public_id, game:game, AsyncStorage: AsyncStorage, axiosInstance: axiosInstance})
                dispatch(getTeams(tournamentTeams));
            } catch (err) {
                console.error("unable to fetch the tournament teams: ", err);
            }
        };
        fetchTeams();
    }, []);


    const handleTeam = (item) => {
        navigation.navigate('ClubPage', { teamData: item, game: game });
    };

    const handleAddTeam = async (item) => {
        try {
            const addTeam = {
                tournament_id: tournament.id,
                team_id: item
            };
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addTournamentTeam`, addTeam, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const respItem = response.data || [];
            dispatch(setTeams(respItem))
            setIsModalVisible(false);
        } catch (error) {
            if (error.response) {
                Alert.alert('Error', error.response.data.error);
              } else if (error.request) {
                Alert.alert('Error', 'No response from the server. Please try again.');
              } else {
                Alert.alert('Error', 'An unexpected error occurred. Please try again.');
              }
        }
    };

    const handleCloseTeam = () => {
        setIsModalVisible(false);
    };

    const handleTeamModal = () => {
        setIsModalVisible(true);
    };

    return (
        <View style={tailwind` bg-white mb-4`}>
            {/* {currentRole === "admin" && ( */}
                <View style={tailwind`bg-white py-4 p-4`}>
                    <Pressable
                        onPress={() => setIsModalVisible(!isModalVisible)}
                        style={tailwind` bg-white p-2 shadow-lg rounded-lg items-center b`}
                    >
                        <Text style={tailwind`text-lg text-black mr-2`}>Add Team</Text>
                    </Pressable>
                </View>
            {/* )} */}
            <ScrollView contentContainerStyle={{flexGrow:1}} nestedScrollEnabled={true} style={tailwind``}>
                {teams?.map((item, index) => (
                    <TeamItem key={index} item={item} onPress={() => handleTeam(item)} />
                ))}
            </ScrollView>
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
                            <ScrollView style={tailwind`max-h-3/4`}>
                                {teamsBySport?.teams?.map((item, index) => (
                                    <Pressable key={index} onPress={() => handleAddTeam(item.id)} style={tailwind`py-2 border-b border-gray-200`}>
                                        <Text style={tailwind`text-lg text-gray-700`}>{item.name}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
};

const TeamItem = ({ item, onPress }) => (
    <Pressable onPress={onPress} style={tailwind`mt-2 rounded-lg shadow-lg bg-white p-4 flex-row justify-between items-center`}>
        <View style={tailwind`flex-row items-center`}>
            <Image source={{ uri: item.media_url || 'default_logo_url' }} style={tailwind`w-14 h-14 rounded-full bg-gray-200`} />
            <Text style={tailwind`ml-4 text-lg text-gray-800 font-semibold`}>{item.name}</Text>
        </View>
    </Pressable>
);

export default TournamentTeam;
