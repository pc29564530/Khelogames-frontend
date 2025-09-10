import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import TournamentFootballMatch from '../components/TournamentFootballMatch';
import TournamentCricketMatch from '../components/TournamentCricketMatch';
import { useSelector } from 'react-redux';

const TournamentMatches = ({ tournament, currentRole, parentScrollY, headerHeight, collapsedHeight, navigation }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const entities = useSelector(state => state.tournamentEntities.tournamentEntities)

    
    const game = useSelector(state => state.sportReducers.game);

    const tournamentMatchBySport = () => {
        switch (game.name) {
            case "cricket":
                return (
                    <TournamentCricketMatch
                        tournament={tournament}
                        AsyncStorage={AsyncStorage}
                        axiosInstance={axiosInstance}
                        BASE_URL={BASE_URL}
                        parentScrollY={parentScrollY}
                        collapsedHeight={collapsedHeight}
                    />
                );
            default:
                return (
                    <TournamentFootballMatch
                        tournament={tournament}
                        AsyncStorage={AsyncStorage}
                        axiosInstance={axiosInstance}
                        BASE_URL={BASE_URL}
                        parentScrollY={parentScrollY}
                        collapsedHeight={collapsedHeight}
                    />
                );
        }
    };

    useEffect(() => {
        console.log("TournamentMatches teams updated: ", entities);
    }, [entities]);

    return (
        <View style={tailwind`flex-1 bg-gray-100`}>
                <View style={tailwind`bg-white p-4 py-4`}>
                    <Pressable
                        onPress={() => navigation.navigate("CreateMatch", {tournament:tournament, entities:entities})}
                        style={tailwind` bg-white rounded-lg shadow-lg p-2 items-center w-full`}
                    >
                        <Text style={tailwind`text-lg text-black mr-2`}>Create Match</Text>
                    </Pressable>
                </View>
                {tournamentMatchBySport()}
        </View>
    );
};

export default TournamentMatches;