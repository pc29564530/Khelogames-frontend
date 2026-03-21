import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import TournamentFootballMatch from '../components/TournamentFootballMatch';
import TournamentCricketMatch from '../components/TournamentCricketMatch';
import TournamentBadmintonMatch from './TournamentBadmintonMatch';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const TournamentMatches = ({ tournament, currentRole, parentScrollY, headerHeight, collapsedHeight }) => {
    const entities = useSelector(state => state.tournamentEntities.tournamentEntities)
    const navigation = useNavigation();
    
    const game = useSelector(state => state.sportReducers.game);

    const tournamentMatchBySport = () => {
        switch (game.name) {
            case "badminton":
                return (
                    <TournamentBadmintonMatch
                        tournament={tournament}
                        AsyncStorage={AsyncStorage}
                        axiosInstance={axiosInstance}
                        BASE_URL={BASE_URL}
                        parentScrollY={parentScrollY}
                        collapsedHeight={collapsedHeight}
                    />
                )
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
        console.log("Tournament matches entities updated: ", entities);
    }, [entities]);

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
                <View style={{ backgroundColor: '#0f172a', padding: 16 }}>
                    <Pressable
                        onPress={() => navigation.navigate("CreateMatch", {tournament:tournament, entities:entities})}
                        style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: 10, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#334155' }}
                    >
                        <Text style={{ fontSize: 17, color: '#f1f5f9', fontWeight: '600' }}>Create Match</Text>
                    </Pressable>
                </View>
                {tournamentMatchBySport()}
        </View>
    );
};

export default TournamentMatches;