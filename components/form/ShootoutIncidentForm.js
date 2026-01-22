import React, {useState, useEffect, useCallback, useRef} from 'react';
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
import { validateFootballIncidentForm } from '../../utils/validation/footballIncidentValidation';

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
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const isMountedRef = useRef(true);
    const dispatch = useDispatch();
    const {wsRef} = useWebSocket();
    const game = useSelector((state) => state.sportReducers.game);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);
    
    const handleAddShootout = async () => {
        // Validate required fields before proceeding
        if (!selectedPlayer) {
            setError({
                global: "Please select a player",
                fields: { player_public_id: "Player is required" },
            });
            return;
        }

        if (goalScore === null) {
            setError({
                global: "Please select if goal was scored",
                fields: { penalty_shootout_scored: "Goal status is required" },
            });
            return;
        }

        // Show confirmation dialog
        setShowConfirmation(true);
    };

    const confirmAddShootout = async () => {
        setShowConfirmation(false);
        setLoading(true);
        setError({ global: null, fields: {} });

        try {
            const formData = {
                "match_public_id": match?.public_id,
                "team_public_id": teamID,
                "tournament_public_id": tournament?.public_id || null,
                "periods": '',
                "incident_type": "penalty_shootout",
                "incident_time": 0,
                "player_public_id": selectedPlayer?.player?.public_id || selectedPlayer?.public_id,
                "penalty_shootout_scored": goalScore,
                "event_type": "penalty_shootout",
            };

            // Frontend validation
            const validation = validateFootballIncidentForm(formData);
            if (!validation.isValid) {
                if (isMountedRef.current) {
                    setError({
                        global: "Please fix the errors below",
                        fields: validation.errors,
                    });
                }
                return;
            }

            const authToken = await AsyncStorage.getItem("AccessToken");

            if (!authToken) {
                throw new Error("Authentication required");
            }

            const data = {
                "match_public_id": match?.public_id,
                "team_public_id": teamID,
                "tournament_public_id": tournament?.public_id,
                "periods": '',
                "incident_type": "penalty_shootout",
                "incident_time": 0,
                "player_public_id": selectedPlayer?.player?.public_id || selectedPlayer?.public_id,
                "description": '',
                "penalty_shootout_scored": goalScore
            };

            const response = await axiosInstance.post(
                `${BASE_URL}/${game?.name}/addFootballIncidents`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response?.data && isMountedRef.current) {
                // Send WebSocket update if available
                if (wsRef?.current && wsRef.current.readyState === WebSocket.OPEN) {
                    try {
                        wsRef.current.send(JSON.stringify({
                            type: "MATCH_UPDATE",
                            payload: {
                                match_public_id: match?.public_id,
                                incident_type: "penalty_shootout",
                            }
                        }));
                    } catch (wsErr) {
                        console.error("WebSocket send failed:", wsErr);
                    }
                }

                Alert.alert('Success', 'Penalty shootout recorded successfully!', [
                    {
                        text: 'OK',
                        onPress: () => navigation?.goBack()
                    }
                ]);
            }
        } catch (err) {
            if (isMountedRef.current) {
                const backendErrors = err?.response?.data?.error?.fields || {};
                setError({
                    global: err?.response?.data?.error?.message || "Unable to add incident. Please try again.",
                    fields: backendErrors
                });
                console.error("Unable to add penalty shootout:", err);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
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
                {/* Global Error Banner */}
                {error?.global && (
                    <View style={tailwind`mb-4 bg-red-50 border border-red-200 rounded-xl p-4`}>
                        <View style={tailwind`flex-row items-start`}>
                            <MaterialIcons name="error-outline" size={20} color="#DC2626" />
                            <View style={tailwind`flex-1 ml-2`}>
                                <Text style={tailwind`text-red-700 font-semibold text-sm`}>
                                    {error.global}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Team Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-lg font-semibold mb-3 text-gray-700`}>Select Team</Text>
                    <View style={tailwind`flex-row gap-3`}>
                        <Pressable
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center shadow-sm`,
                                teamID === homeTeam?.public_id ? tailwind`bg-red-400` : tailwind`bg-gray-100`
                            ]}
                            onPress={() => {
                                setTeamID(homeTeam?.public_id);
                                setSelectedPlayer(null);
                                setError({ global: null, fields: {} });
                            }}
                        >
                            <Text style={[
                                tailwind`font-semibold text-center`,
                                teamID === homeTeam?.public_id ? tailwind`text-white` : tailwind`text-gray-700`
                            ]} numberOfLines={2}>
                                {homeTeam?.name || 'Home Team'}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center shadow-sm`,
                                teamID === awayTeam?.public_id ? tailwind`bg-red-400` : tailwind`bg-gray-100`
                            ]}
                            onPress={() => {
                                setTeamID(awayTeam?.public_id);
                                setSelectedPlayer(null);
                                setError({ global: null, fields: {} });
                            }}
                        >
                            <Text style={[
                                tailwind`font-semibold text-center`,
                                teamID === awayTeam?.public_id ? tailwind`text-white` : tailwind`text-gray-700`
                            ]} numberOfLines={2}>
                                {awayTeam?.name || 'Away Team'}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Player Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-lg font-semibold mb-3 text-gray-700`}>
                        Select Player ({currentPlayers?.length || 0} available)
                    </Text>

                    {error?.fields?.player_public_id && (
                        <View style={tailwind`mb-2 p-2 bg-red-50 rounded-lg border border-red-200`}>
                            <Text style={tailwind`text-red-600 text-xs`}>
                                {error.fields.player_public_id}
                            </Text>
                        </View>
                    )}

                    {currentPlayers?.length === 0 ? (
                        <View style={tailwind`p-4 bg-yellow-50 rounded-xl border border-yellow-200`}>
                            <MaterialIcons name="warning" size={24} color="#d97706" style={tailwind`self-center mb-2`} />
                            <Text style={tailwind`text-yellow-800 text-center font-medium`}>
                                No players available
                            </Text>
                            <Text style={tailwind`text-yellow-700 text-center text-xs mt-1`}>
                                Please ensure the squad is set up properly
                            </Text>
                        </View>
                    ) : (
                        <Dropdown
                            style={tailwind`bg-white rounded-xl shadow-sm border ${error?.fields?.player_public_id ? 'border-red-400' : 'border-gray-300'}`}
                            options={currentPlayers}
                            onSelect={(index, item) => {
                                setSelectedPlayer(item);
                                setError({ ...error, fields: { ...error.fields, player_public_id: null } });
                            }}
                            renderRow={(item) => (
                                <View style={tailwind`flex-row items-center p-3 border-b border-gray-100`}>
                                    {item?.player?.media_url ? (
                                        <Image
                                            source={{ uri: item.player.media_url }}
                                            style={tailwind`rounded-full h-12 w-12 mr-3`}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={tailwind`rounded-full h-12 w-12 mr-3 bg-red-300 items-center justify-center`}>
                                            <Text style={tailwind`text-white font-bold text-lg`}>
                                                {item?.player?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </Text>
                                        </View>
                                    )}
                                    <View>
                                        <Text style={tailwind`text-base font-semibold text-gray-800`}>
                                            {item?.player?.name || item?.player_name || "Unknown"}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        >
                            <View style={tailwind`flex-row items-center justify-between p-4 rounded-xl bg-white border ${error?.fields?.player_public_id ? 'border-red-400' : 'border-gray-300'}`}>
                                <Text style={tailwind`text-base font-medium ${selectedPlayer ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {selectedPlayer ? (selectedPlayer?.player?.name || selectedPlayer?.player_name) : 'Select player'}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
                            </View>
                        </Dropdown>
                    )}
                </View>

                {/* Goal Scored Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-xl font-bold text-gray-800 mb-4`}>Goal Scored?</Text>

                    {error?.fields?.penalty_shootout_scored && (
                        <View style={tailwind`mb-2 p-2 bg-red-50 rounded-lg border border-red-200`}>
                            <Text style={tailwind`text-red-600 text-xs`}>
                                {error.fields.penalty_shootout_scored}
                            </Text>
                        </View>
                    )}

                    <View style={tailwind`flex-row gap-4`}>
                        <Pressable
                            onPress={() => {
                                setGoalScore(true);
                                setError({ ...error, fields: { ...error.fields, penalty_shootout_scored: null } });
                            }}
                            style={[
                                tailwind`flex-1 px-4 py-4 rounded-2xl border shadow-md items-center`,
                                goalScore === true
                                    ? tailwind`bg-green-600 border-green-700`
                                    : tailwind`bg-white border-gray-300`,
                            ]}
                        >
                            <MaterialIcons
                                name="check-circle"
                                size={28}
                                color={goalScore === true ? 'white' : '#16a34a'}
                            />
                            <Text style={[
                                tailwind`text-lg font-semibold mt-1`,
                                goalScore === true ? tailwind`text-white` : tailwind`text-gray-800`
                            ]}>
                                Scored
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                setGoalScore(false);
                                setError({ ...error, fields: { ...error.fields, penalty_shootout_scored: null } });
                            }}
                            style={[
                                tailwind`flex-1 px-4 py-4 rounded-2xl border shadow-md items-center`,
                                goalScore === false
                                    ? tailwind`bg-red-600 border-red-700`
                                    : tailwind`bg-white border-gray-300`,
                            ]}
                        >
                            <MaterialIcons
                                name="cancel"
                                size={28}
                                color={goalScore === false ? 'white' : '#dc2626'}
                            />
                            <Text style={[
                                tailwind`text-lg font-semibold mt-1`,
                                goalScore === false ? tailwind`text-white` : tailwind`text-gray-800`
                            ]}>
                                Missed
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Confirm Button */}
                <Pressable
                    style={[
                        tailwind`p-4 rounded-xl shadow-lg flex-row items-center justify-center`,
                        loading || currentPlayers?.length === 0 || !selectedPlayer || goalScore === null
                            ? tailwind`bg-gray-300`
                            : tailwind`bg-red-400`
                    ]}
                    onPress={handleAddShootout}
                    disabled={loading || currentPlayers?.length === 0 || !selectedPlayer || goalScore === null}
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
                                Record Penalty Shootout
                            </Text>
                        </>
                    )}
                </Pressable>

                {/* Summary Card */}
                {selectedPlayer && goalScore !== null && (
                    <View style={tailwind`mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200`}>
                        <Text style={tailwind`text-blue-900 font-semibold mb-2`}>Summary:</Text>
                        <Text style={tailwind`text-blue-800 text-sm`}>
                            Player: {selectedPlayer?.player?.name || selectedPlayer?.player_name}
                        </Text>
                        <Text style={tailwind`text-blue-800 text-sm`}>
                            Team: {teamID === homeTeam?.public_id ? homeTeam?.name : awayTeam?.name}
                        </Text>
                        <Text style={tailwind`text-blue-800 text-sm`}>
                            Result: {goalScore ? '✓ Scored' : '✗ Missed'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <View style={tailwind`absolute inset-0 bg-black bg-opacity-50 items-center justify-center`}>
                    <View style={tailwind`bg-white rounded-2xl p-6 mx-6 w-80`}>
                        <MaterialIcons name="help-outline" size={48} color="#ef4444" style={tailwind`self-center mb-4`} />
                        <Text style={tailwind`text-xl font-bold text-gray-800 text-center mb-2`}>
                            Confirm Penalty
                        </Text>
                        <Text style={tailwind`text-gray-600 text-center mb-4`}>
                            {selectedPlayer?.player?.name || selectedPlayer?.player_name} from {teamID === homeTeam?.public_id ? homeTeam?.name : awayTeam?.name}
                        </Text>
                        <Text style={tailwind`text-gray-800 text-center font-semibold mb-6`}>
                            {goalScore ? 'Scored ✓' : 'Missed ✗'}
                        </Text>

                        <View style={tailwind`flex-row gap-3`}>
                            <Pressable
                                onPress={() => setShowConfirmation(false)}
                                style={tailwind`flex-1 p-3 rounded-xl bg-gray-200`}
                            >
                                <Text style={tailwind`text-gray-800 font-semibold text-center`}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={confirmAddShootout}
                                style={tailwind`flex-1 p-3 rounded-xl bg-red-400`}
                            >
                                <Text style={tailwind`text-white font-semibold text-center`}>
                                    Confirm
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

export default ShootoutIncidentForm;