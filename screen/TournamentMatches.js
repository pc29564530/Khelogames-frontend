import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import CreateFixtue from '../components/CreateFixture';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TournamentFootballMatch from '../components/TournamentFootballMatch';
import TournamentCricketMatch from '../components/TournamentCricketMatch';
import { useDispatch, useSelector } from 'react-redux';
import { getTeams } from '../redux/actions/actions';

const TournamentMatches = ({ route }) => {
    const { tournament, currentRole, game } = route.params;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [organizerID, setOrganizerID] = useState(null);
    const axiosInstance = useAxiosInterceptor();
    const teams = useSelector((state) => state.teams.teams);

    const handleCloseFixtureModal = () => {
        setIsModalVisible(false);
    };

    const tournamentMatchBySport = (game) => {
        switch (game.name) {
            case "cricket":
                return (
                    <TournamentCricketMatch
                        tournament={tournament}
                        AsyncStorage={AsyncStorage}
                        axiosInstance={axiosInstance}
                        BASE_URL={BASE_URL}
                        game={game}
                    />
                );
            default:
                return (
                    <TournamentFootballMatch
                        tournament={tournament}
                        AsyncStorage={AsyncStorage}
                        axiosInstance={axiosInstance}
                        BASE_URL={BASE_URL}
                        game={game}
                    />
                );
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} nestedScrollEnabled={true}>
            <View style={tailwind`flex-1 bg-gray-100`}>
                <View style={tailwind`p-4 flex-row justify-between items-center bg-white shadow-md`}>
                    <Text style={tailwind`text-xl font-bold text-gray-800`}>{tournament?.name}</Text>
                    <Pressable
                        onPress={() => setIsModalVisible(!isModalVisible)}
                        style={tailwind`rounded-lg bg-purple-500 p-2 flex-row items-center`}
                    >
                        <Text style={tailwind`text-lg text-white mr-2`}>Set Fixture</Text>
                        <MaterialIcons name="add" size={24} color="white" />
                    </Pressable>
                </View>
                {isModalVisible && (
                    <Modal transparent={true} animationType='slide' visible={isModalVisible} onRequestClose={handleCloseFixtureModal}>
                        <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                            <View style={tailwind`bg-white rounded-t-lg p-6 max-h-3/4`}>
                                <CreateFixtue
                                    tournament={tournament}
                                    teams={teams}
                                    organizerID={organizerID}
                                    handleCloseFixtureModal={handleCloseFixtureModal}
                                    sport={game.name}
                                />
                            </View>
                        </View>
                    </Modal>
                )}
                {tournamentMatchBySport(game)}
            </View>
        </ScrollView>
    );
};

export default TournamentMatches;
