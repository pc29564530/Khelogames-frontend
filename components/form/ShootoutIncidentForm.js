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
                const backendErrors = err?.response?.data?.error?.fields;
                if(err?.response?.data?.error?.code === "FORBIDDEN") {
                    setError({
                        global: err?.response?.data?.error?.message,
                        fields: {},
                    })
                } else {
                    setError({
                        global: "Unable to add football incident",
                        fields: backendErrors,
                    });
                }
                console.log("Unable to add football shootout incident:", err);
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
            style={[tailwind`flex-1 w-full`, {backgroundColor: '#020617'}]}
        >
            <ScrollView
                contentContainerStyle={tailwind`p-4`}
                showsVerticalScrollIndicator={false}
            >
                {/* Global Error Banner */}
                {error?.global && (
                    <View style={[tailwind`mb-4 rounded-xl p-4`, {backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130'}]}>
                        <View style={tailwind`flex-row items-start`}>
                            <MaterialIcons name="error-outline" size={20} color="#f87171" />
                            <View style={tailwind`flex-1 ml-2`}>
                                <Text style={[tailwind`font-semibold text-sm`, {color: '#fca5a5'}]}>
                                    {error.global}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Team Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: '#f1f5f9'}]}>Select Team</Text>
                    <View style={tailwind`flex-row gap-3`}>
                        <Pressable
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center`, {borderWidth: 1, borderColor: '#334155'},
                                teamID !== homeTeam?.public_id ? {backgroundColor: '#0f172a'} : {backgroundColor: '#f87171'},
                            ]}
                            onPress={() => {
                                setTeamID(homeTeam?.public_id);
                                setSelectedPlayer(null);
                                setError({ global: null, fields: {} });
                            }}
                        >
                            <Text style={[
                                tailwind`font-semibold text-center`,
                                teamID === homeTeam?.public_id ? tailwind`text-white` : {color: '#94a3b8'}
                            ]} numberOfLines={2}>
                                {homeTeam?.name || 'Home Team'}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center`, {borderWidth: 1, borderColor: '#334155'},
                                teamID !== awayTeam?.public_id ? {backgroundColor: '#0f172a'} : {backgroundColor: '#f87171'},
                            ]}
                            onPress={() => {
                                setTeamID(awayTeam?.public_id);
                                setSelectedPlayer(null);
                                setError({ global: null, fields: {} });
                            }}
                        >
                            <Text style={[
                                tailwind`font-semibold text-center`,
                                teamID === awayTeam?.public_id ? tailwind`text-white` : {color: '#94a3b8'}
                            ]} numberOfLines={2}>
                                {awayTeam?.name || 'Away Team'}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Player Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: '#f1f5f9'}]}>
                        Select Player ({currentPlayers?.length || 0} available)
                    </Text>

                    {error?.fields?.player_public_id && (
                        <View style={[tailwind`mb-2 p-2 rounded-lg`, {backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130'}]}>
                            <Text style={[tailwind`text-xs`, {color: '#fca5a5'}]}>
                                {error.fields.player_public_id}
                            </Text>
                        </View>
                    )}

                    {currentPlayers?.length === 0 ? (
                        <View style={[tailwind`p-4 rounded-xl`, {backgroundColor: '#f59e0b15', borderWidth: 1, borderColor: '#f59e0b30'}]}>
                            <MaterialIcons name="warning" size={24} color="#fbbf24" style={tailwind`self-center mb-2`} />
                            <Text style={[tailwind`text-center font-medium`, {color: '#fbbf24'}]}>
                                No players available
                            </Text>
                            <Text style={[tailwind`text-center text-xs mt-1`, {color: '#94a3b8'}]}>
                                Please ensure the squad is set up properly
                            </Text>
                        </View>
                    ) : (
                        <Dropdown
                            style={[tailwind`rounded-xl`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: error?.fields?.player_public_id ? '#f87171' : '#334155'}]}
                            options={currentPlayers}
                            onSelect={(index, item) => {
                                setSelectedPlayer(item);
                                setError({ ...error, fields: { ...error.fields, player_public_id: null } });
                            }}
                            renderRow={(item) => (
                                <View style={[tailwind`flex-row items-center p-3`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
                                    {item?.player?.media_url ? (
                                        <Image
                                            source={{ uri: item.player.media_url }}
                                            style={tailwind`rounded-full h-12 w-12 mr-3`}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[tailwind`rounded-full h-12 w-12 mr-3 items-center justify-center`, {backgroundColor: '#f8717120'}]}>
                                            <Text style={tailwind`text-white font-bold text-lg`}>
                                                {item?.player?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </Text>
                                        </View>
                                    )}
                                    <View>
                                        <Text style={[tailwind`text-base font-semibold`, {color: '#f1f5f9'}]}>
                                            {item?.player?.name || item?.player_name || "Unknown"}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        >
                            <View style={[tailwind`flex-row items-center justify-between p-4 rounded-xl`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: error?.fields?.player_public_id ? '#f87171' : '#334155'}]}>
                                <Text style={[tailwind`text-base font-medium`, {color: selectedPlayer ? '#f1f5f9' : '#64748b'}]}>
                                    {selectedPlayer ? (selectedPlayer?.player?.name || selectedPlayer?.player_name) : 'Select player'}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
                            </View>
                        </Dropdown>
                    )}
                </View>

                {/* Goal Scored Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-xl font-bold mb-4`, {color: '#f1f5f9'}]}>Goal Scored?</Text>

                    {error?.fields?.penalty_shootout_scored && (
                        <View style={[tailwind`mb-2 p-2 rounded-lg`, {backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130'}]}>
                            <Text style={[tailwind`text-xs`, {color: '#fca5a5'}]}>
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
                                tailwind`flex-1 px-4 py-4 rounded-2xl items-center`,
                                goalScore === true
                                    ? {backgroundColor: '#16a34a', borderWidth: 1, borderColor: '#15803d'}
                                    : {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'},
                            ]}
                        >
                            <MaterialIcons
                                name="check-circle"
                                size={28}
                                color={goalScore === true ? 'white' : '#16a34a'}
                            />
                            <Text style={[
                                tailwind`text-lg font-semibold mt-1`,
                                goalScore === true ? tailwind`text-white` : {color: '#94a3b8'}
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
                                tailwind`flex-1 px-4 py-4 rounded-2xl items-center`,
                                goalScore === false
                                    ? {backgroundColor: '#dc2626', borderWidth: 1, borderColor: '#b91c1c'}
                                    : {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'},
                            ]}
                        >
                            <MaterialIcons
                                name="cancel"
                                size={28}
                                color={goalScore === false ? 'white' : '#dc2626'}
                            />
                            <Text style={[
                                tailwind`text-lg font-semibold mt-1`,
                                goalScore === false ? tailwind`text-white` : {color: '#94a3b8'}
                            ]}>
                                Missed
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Confirm Button */}
                <Pressable
                    style={[
                        tailwind`p-4 rounded-xl flex-row items-center justify-center`,
                        loading || currentPlayers?.length === 0 || !selectedPlayer || goalScore === null
                            ? {backgroundColor: '#334155'}
                            : {backgroundColor: '#f87171'}
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
                    <View style={[tailwind`mt-4 p-4 rounded-xl`, {backgroundColor: '#3b82f615', borderWidth: 1, borderColor: '#3b82f630'}]}>
                        <Text style={[tailwind`font-semibold mb-2`, {color: '#93c5fd'}]}>Summary:</Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Player: {selectedPlayer?.player?.name || selectedPlayer?.player_name}
                        </Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Team: {teamID === homeTeam?.public_id ? homeTeam?.name : awayTeam?.name}
                        </Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Result: {goalScore ? '✓ Scored' : '✗ Missed'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <View style={tailwind`absolute inset-0 bg-black bg-opacity-50 items-center justify-center`}>
                    <View style={[tailwind`rounded-2xl p-6 mx-6 w-80`, {backgroundColor: '#1e293b'}]}>
                        <MaterialIcons name="help-outline" size={48} color="#f87171" style={tailwind`self-center mb-4`} />
                        <Text style={[tailwind`text-xl font-bold text-center mb-2`, {color: '#f1f5f9'}]}>
                            Confirm Penalty
                        </Text>
                        <Text style={[tailwind`text-center mb-4`, {color: '#e2e8f0'}]}>
                            {selectedPlayer?.player?.name || selectedPlayer?.player_name} from {teamID === homeTeam?.public_id ? homeTeam?.name : awayTeam?.name}
                        </Text>
                        <Text style={[tailwind`text-center font-semibold mb-6`, {color: '#f1f5f9'}]}>
                            {goalScore ? 'Scored ✓' : 'Missed ✗'}
                        </Text>

                        <View style={tailwind`flex-row gap-3`}>
                            <Pressable
                                onPress={() => setShowConfirmation(false)}
                                style={[tailwind`flex-1 p-3 rounded-xl`, {backgroundColor: '#334155'}]}
                            >
                                <Text style={[tailwind`font-semibold text-center`, {color: '#e2e8f0'}]}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={confirmAddShootout}
                                style={[tailwind`flex-1 p-3 rounded-xl`, {backgroundColor: '#f87171'}]}
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