import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, Pressable, Image, ScrollView, Alert, ActivityIndicator, Platform} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../screen/axios_config';
import { BASE_URL } from '../../constants/ApiConstants';
import { useDispatch, useSelector } from 'react-redux';
import { useWebSocket } from '../../context/WebSocketContext';
import { KeyboardAvoidingView } from 'native-base';

const ShootoutIncidentForm = ({
    match,
    tournament,
    awayTeam,
    homeTeam,
    homeSquad,
    awaySquad,
    navigation
}) => {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [goalScore, setGoalScore] = useState(null);
    const [teamID, setTeamID] = useState(homeTeam?.public_id);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const {wsRef} = useWebSocket();
    const game = useSelector((state) => state.sportReducers.game);
    
    const handleAddShootout = async () => {
        if (!selectedPlayer) {
            Alert.alert('Error', 'Please select a player');
            return;
        }
        if (goalScore === null) {
            Alert.alert('Error', 'Please select if goal was scored');
            return;
        }

        setLoading(true);
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                "match_public_id": match.public_id,
                "team_public_id": teamID,
                "tournament_public_id": tournament?.public_id,
                "periods": '',
                "incident_type": "penalty_shootout",
                "incident_time": 0,
                "player_public_id": selectedPlayer.player?.public_id || selectedPlayer.public_id,
                "description": `Penalty shootout: ${goalScore ? 'Scored' : 'Missed'} by ${selectedPlayer.player?.name || selectedPlayer.player_name}`,
                "penalty_shootout_scored": goalScore
            };

            const response = await axiosInstance.post(
                `${BASE_URL}/${game.name}/addFootballIncidents`, 
                data, 
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data) {
                Alert.alert('Success', 'Penalty shootout recorded successfully!');
                navigation.goBack();
            }
        } catch (err) {
            console.error("Unable to add penalty shootout:", err);
            Alert.alert('Error', err.response?.data?.message || 'Failed to record penalty shootout.');
        } finally {
            setLoading(false);
        }
    };

    const getActivePlayers = (squad) => {
        if (!Array.isArray(squad)) return [];
        return squad.filter(player => 
            player && 
            (player.is_substitute === false || player.is_substitute === undefined) &&
            player.player
        );
    };

    const homeActive = getActivePlayers(homeSquad);
    const awayActive = getActivePlayers(awaySquad);
    const currentPlayers = teamID === homeTeam.public_id ? homeActive : awayActive;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={tailwind`flex-1 w-full`}
        >
            <ScrollView 
                contentContainerStyle={tailwind`p-4`}
                showsVerticalScrollIndicator={false}
            >
                {/* Team Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-lg font-semibold mb-3 text-gray-700`}>Select Team</Text>
                    <View style={tailwind`flex-row gap-3`}>
                        <Pressable 
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center shadow-sm`,
                                teamID === homeTeam.public_id ? tailwind`bg-red-400` : tailwind`bg-gray-100`
                            ]}
                            onPress={() => {
                                setTeamID(homeTeam.public_id);
                                setSelectedPlayer(null);
                            }}
                        >
                            <Text style={[
                                tailwind`font-semibold text-center`,
                                teamID === homeTeam.public_id ? tailwind`text-white` : tailwind`text-gray-700`
                            ]} numberOfLines={2}>
                                {homeTeam.name}
                            </Text>
                        </Pressable>
                        
                        <Pressable 
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center shadow-sm`,
                                teamID === awayTeam.public_id ? tailwind`bg-red-400` : tailwind`bg-gray-100`
                            ]}
                            onPress={() => {
                                setTeamID(awayTeam.public_id);
                                setSelectedPlayer(null);
                            }}
                        >
                            <Text style={[
                                tailwind`font-semibold text-center`,
                                teamID === awayTeam.public_id ? tailwind`text-white` : tailwind`text-gray-700`
                            ]} numberOfLines={2}>
                                {awayTeam.name}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Player Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-lg font-semibold mb-3 text-gray-700`}>
                        Select Player ({currentPlayers.length} available)
                    </Text>
                    
                    {currentPlayers.length === 0 ? (
                        <View style={tailwind`p-4 bg-yellow-50 rounded-xl border border-yellow-200`}>
                            <Text style={tailwind`text-yellow-800 text-center`}>
                                No players available
                            </Text>
                        </View>
                    ) : (
                        <Dropdown
                            style={tailwind`bg-white rounded-xl shadow-sm border border-gray-300`}
                            options={currentPlayers}
                            onSelect={(index, item) => setSelectedPlayer(item)}
                            renderRow={(item) => (
                                <View style={tailwind`flex-row items-center p-3 border-b border-gray-100`}>
                                    {item.player?.media_url ? (
                                        <Image
                                            source={{ uri: item.player.media_url }}
                                            style={tailwind`rounded-full h-12 w-12 mr-3`}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={tailwind`rounded-full h-12 w-12 mr-3 bg-red-300 items-center justify-center`}>
                                            <Text style={tailwind`text-white font-bold text-lg`}>
                                                {item.player?.name?.charAt(0)?.toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                    <View>
                                        <Text style={tailwind`text-base font-semibold text-gray-800`}>
                                            {item.player?.name || item.player_name || "Unknown"}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        >
                            <View style={tailwind`flex-row items-center justify-between p-4 rounded-xl bg-white border border-gray-300`}>
                                <Text style={tailwind`text-base font-medium text-gray-800`}>
                                    {selectedPlayer ? (selectedPlayer.player?.name || selectedPlayer.player_name) : 'Select player'}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
                            </View>
                        </Dropdown>
                    )}
                </View>

                {/* Goal Scored Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-xl font-bold text-gray-800 mb-4`}>Goal Scored?</Text>
                    <View style={tailwind`flex-row gap-4`}>
                        <Pressable
                            onPress={() => setGoalScore(true)}
                            style={[
                                tailwind`flex-1 px-4 py-3 rounded-2xl border shadow-md items-center`,
                                goalScore === true
                                    ? tailwind`bg-green-600 border-green-700`
                                    : tailwind`bg-white border-gray-300`,
                            ]}
                        >
                            <Text style={goalScore === true
                                ? tailwind`text-white text-lg font-semibold`
                                : tailwind`text-gray-800 text-lg font-medium`}>
                                ✅ Yes
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setGoalScore(false)}
                            style={[
                                tailwind`flex-1 px-4 py-3 rounded-2xl border shadow-md items-center`,
                                goalScore === false
                                    ? tailwind`bg-red-600 border-red-700`
                                    : tailwind`bg-white border-gray-300`,
                            ]}
                        >
                            <Text style={goalScore === false
                                ? tailwind`text-white text-lg font-semibold`
                                : tailwind`text-gray-800 text-lg font-medium`}>
                                ❌ No
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Confirm Button */}
                <Pressable 
                    style={[
                        tailwind`p-4 rounded-xl shadow-lg flex-row items-center justify-center`,
                        loading || currentPlayers.length === 0
                            ? tailwind`bg-gray-300` 
                            : tailwind`bg-red-400`
                    ]}
                    onPress={handleAddShootout}
                    disabled={loading || currentPlayers.length === 0}
                >
                    {loading ? (
                        <>
                            <ActivityIndicator size="small" color="white" />
                            <Text style={tailwind`text-white font-semibold text-lg ml-2`}>
                                Recording...
                            </Text>
                        </>
                    ) : (
                        <>
                            <MaterialIcons name="check-circle" size={24} color="white" />
                            <Text style={tailwind`text-white font-semibold text-lg ml-2`}>
                                Confirm Penalty Shootout
                            </Text>
                        </>
                    )}
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ShootoutIncidentForm;