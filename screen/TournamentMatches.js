import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import TournamentFootballMatch from '../components/TournamentFootballMatch';
import TournamentCricketMatch from '../components/TournamentCricketMatch';
import { useSelector } from 'react-redux';

const TournamentMatches = ({ route, navigation }) => {
    const { tournament, currentRole } = route.params;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const axiosInstance = useAxiosInterceptor();
    const teams = useSelector((state) => state.teams.teams);
    const game = useSelector(state => state.sportReducers.game);
    
    const handleCloseFixtureModal = () => {
        setIsModalVisible(false);
    };

    const tournamentMatchBySport = () => {
        switch (game.name) {
            case "cricket":
                return (
                    <TournamentCricketMatch
                        tournament={tournament}
                        AsyncStorage={AsyncStorage}
                        axiosInstance={axiosInstance}
                        BASE_URL={BASE_URL}
                    />
                );
            default:
                return (
                    <TournamentFootballMatch
                        tournament={tournament}
                        AsyncStorage={AsyncStorage}
                        axiosInstance={axiosInstance}
                        BASE_URL={BASE_URL}
                    />
                );
        }
    };

    return (
        <View style={tailwind`flex-1 bg-gray-100`}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} nestedScrollEnabled={true}>
                <View style={tailwind`bg-white p-4 py-4`}>
                    <Pressable
                        onPress={() => navigation.navigate("CreateMatch", {tournament: tournament, teams: teams})}
                        style={tailwind` bg-white rounded-lg shadow-lg p-2 items-center w-full`}
                    >
                        <Text style={tailwind`text-lg text-black mr-2`}>Create Match</Text>
                    </Pressable>
                </View>
                {tournamentMatchBySport()}
            </ScrollView>
        </View>
    );
};

export default TournamentMatches;