import React, {useState, useRef, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../screen/axios_config';
import { BASE_URL } from '../../constants/ApiConstants';
import {View, Text, TextInput, Pressable, Image, ScrollView, Alert, ActivityIndicator, Platform} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../../context/WebSocketContext';
import { KeyboardAvoidingView } from 'native-base';
import { validateFootballIncidentForm } from '../../utils/validation/footballIncidentValidation';

const StandardIncidentForm = ({
    match,
    tournament,
    awayTeam,
    homeTeam,
    incidentType,
    homeSquad,
    awaySquad,
    navigation
}) => {
    // Props validation
    if (!match || !homeTeam || !awayTeam || !incidentType) {
        return (
            <View style={tailwind`flex-1 items-center justify-center p-6`}>
                <MaterialIcons name="error-outline" size={64} color="#ef4444" />
                <Text style={tailwind`text-red-600 text-lg font-semibold mt-4 text-center`}>
                    Invalid match data
                </Text>
                <Text style={tailwind`text-gray-600 text-center mt-2`}>
                    Required information is missing. Please go back and try again.
                </Text>
                <Pressable
                    onPress={() => navigation?.goBack()}
                    style={tailwind`mt-6 bg-red-400 px-6 py-3 rounded-xl`}
                >
                    <Text style={tailwind`text-white font-semibold`}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectedHalf, setSelectedHalf] = useState("first_half");
    const [selectedMinute, setSelectedMinute] = useState('45');
    const [teamPublicID, setTeamPublicID] = useState(homeTeam?.public_id);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const isMountedRef = useRef(true);
    const {wsRef} = useWebSocket();
    const game = useSelector((state) => state.sportReducers.game);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleAddIncident = async () => {
        // Validate required fields
        if (!selectedPlayer) {
            setError({
                global: "Please select a player",
                fields: { player_public_id: "Player is required" },
            });
            return;
        }

        if (!selectedMinute || selectedMinute === '') {
            setError({
                global: "Please enter the incident time",
                fields: { incident_time: "Incident time is required" },
            });
            return;
        }

        // Show confirmation
        setShowConfirmation(true);
    };

    const confirmAddIncident = async () => {
        setShowConfirmation(false);
        setLoading(true);
        setError({ global: null, fields: {} });

        try {
            const formData = {
                "match_public_id": match?.public_id,
                "team_public_id": teamPublicID,
                "tournament_public_id": tournament?.public_id,
                "player_public_id": selectedPlayer?.player?.public_id || selectedPlayer?.public_id,
                "periods": selectedHalf,
                "incident_type": incidentType,
                "incident_time": parseInt(selectedMinute),
                "description": description || `${formatIncidentType(incidentType)} by ${selectedPlayer?.player?.name || selectedPlayer?.name}`,
                "penalty_shootout_scored": false,
                "event_type": "normal"
            };

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

            const response = await axiosInstance.post(
                `${BASE_URL}/${game?.name}/addFootballIncidents`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response?.data && isMountedRef.current) {
                // Send WebSocket update
                if (wsRef?.current && wsRef.current.readyState === WebSocket.OPEN) {
                    try {
                        wsRef.current.send(JSON.stringify({
                            type: "MATCH_UPDATE",
                            payload: {
                                match_public_id: match?.public_id,
                                incident_type: incidentType,
                            }
                        }));
                    } catch (wsErr) {
                        console.error("WebSocket send failed:", wsErr);
                    }
                }

                Alert.alert('Success', `${formatIncidentType(incidentType)} recorded successfully!`, [
                    {
                        text: 'OK',
                        onPress: () => {
                            setSelectedPlayer(null);
                            setDescription('');
                            setSelectedMinute('45');
                            navigation?.goBack();
                        }
                    }
                ]);
            }
        } catch (err) {
            if (isMountedRef.current) {
                const backendErrors = err?.response?.data?.error?.fields || {};
                setError({
                    global: err?.response?.data?.error?.message || "Failed to add incident. Please try again.",
                    fields: backendErrors,
                });
                console.error("Unable to add the incident:", err);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    const formatIncidentType = (type) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const getActivePlayers = (squad) => {
        if (!Array.isArray(squad)) return [];
        return squad.filter(player => 
            player && 
            (player.is_substitute === false || player.is_substitute === undefined) &&
            player.player
        );
    };

    const homeActivePlayers = getActivePlayers(homeSquad);
    const awayActivePlayers = getActivePlayers(awaySquad);
    const currentPlayers = teamPublicID === homeTeam.public_id ? homeActivePlayers : awayActivePlayers;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={tailwind`flex-1 w-full`}
        >
            <ScrollView
                contentContainerStyle={tailwind`p-4`}
                nestedScrollEnabled={true}
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
                            <Pressable
                                onPress={() => setError({ global: null, fields: {} })}
                                style={tailwind`ml-2`}
                            >
                                <MaterialIcons name="close" size={18} color="#DC2626" />
                            </Pressable>
                        </View>
                    </View>
                )}
                {/* Select Period */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-lg font-semibold mb-3 text-gray-700`}>Select Period</Text>
                    <View style={tailwind`flex-row items-center gap-3`}>
                        <Pressable 
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center shadow-sm`,
                                selectedHalf === 'first_half' ? tailwind`bg-red-400` : tailwind`bg-gray-100`
                            ]} 
                            onPress={() => setSelectedHalf('first_half')}
                        >
                            <Text style={[
                                tailwind`font-semibold text-base`,
                                selectedHalf === 'first_half' ? tailwind`text-white` : tailwind`text-gray-700`
                            ]}>
                                1st Half
                            </Text>
                        </Pressable>
                        
                        <Pressable 
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center shadow-sm`,
                                selectedHalf === 'second_half' ? tailwind`bg-red-400` : tailwind`bg-gray-100`
                            ]} 
                            onPress={() => setSelectedHalf('second_half')}
                        >
                            <Text style={[
                                tailwind`font-semibold text-base`,
                                selectedHalf === 'second_half' ? tailwind`text-white` : tailwind`text-gray-700`
                            ]}>
                                2nd Half
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Minute Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-lg font-semibold mb-3 text-gray-700`}>
                        Incident Time (Minute)
                    </Text>
                    <TextInput
                        style={tailwind`border border-gray-300 p-4 bg-white rounded-xl shadow-sm text-lg`}
                        keyboardType="number-pad"
                        value={selectedMinute}
                        placeholder="Enter minute"
                        onChangeText={(text) => setSelectedMinute(text)}
                        maxLength={3} 
                    />
                </View>

                {/* Team Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-lg font-semibold mb-3 text-gray-700`}>Select Team</Text>
                    <View style={tailwind`flex-row gap-3`}>
                        <Pressable 
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center shadow-sm`,
                                teamPublicID === homeTeam.public_id ? tailwind`bg-red-400` : tailwind`bg-gray-100`
                            ]}
                            onPress={() => {
                                setTeamPublicID(homeTeam.public_id);
                                setSelectedPlayer(null);
                            }}
                        >
                            <Text style={[
                                tailwind`font-semibold text-center`,
                                teamPublicID === homeTeam.public_id ? tailwind`text-white` : tailwind`text-gray-700`
                            ]} numberOfLines={2}>
                                {homeTeam.name}
                            </Text>
                        </Pressable>
                        
                        <Pressable 
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center shadow-sm`,
                                teamPublicID === awayTeam.public_id ? tailwind`bg-red-400` : tailwind`bg-gray-100`
                            ]}
                            onPress={() => {
                                setTeamPublicID(awayTeam.public_id);
                                setSelectedPlayer(null);
                            }}
                        >
                            <Text style={[
                                tailwind`font-semibold text-center`,
                                teamPublicID === awayTeam.public_id ? tailwind`text-white` : tailwind`text-gray-700`
                            ]} numberOfLines={2}>
                                {awayTeam.name}
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
                                Please add lineup first
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
                                            {item.player?.name || "Unknown Player"}
                                        </Text>
                                        <Text style={tailwind`text-sm text-gray-500`}>
                                            {item.player.positions}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        >
                            <View style={tailwind`flex-row items-center justify-between p-4 rounded-xl bg-white border border-gray-300`}>
                                <View style={tailwind`flex-row items-center flex-1`}>
                                    {selectedPlayer ? (
                                        <>
                                            {selectedPlayer.player?.media_url ? (
                                                <Image
                                                    source={{ uri: selectedPlayer.player.media_url }}
                                                    style={tailwind`rounded-full h-10 w-10 mr-3`}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={tailwind`rounded-full h-10 w-10 mr-3 bg-red-300 items-center justify-center`}>
                                                    <Text style={tailwind`text-white font-bold`}>
                                                        {selectedPlayer.player?.name?.charAt(0)?.toUpperCase()}
                                                    </Text>
                                                </View>
                                            )}
                                            <Text style={tailwind`text-base font-medium text-gray-800`}>
                                                {selectedPlayer.player?.name || selectedPlayer.name}
                                            </Text>
                                        </>
                                    ) : (
                                        <Text style={tailwind`text-base text-gray-400`}>
                                            Select a player
                                        </Text>
                                    )}
                                </View>
                                <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
                            </View>
                        </Dropdown>
                    )}
                </View>

                {/* Description Input */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-lg font-semibold mb-3 text-gray-700`}>
                        Description (Optional)
                    </Text>
                    <TextInput
                        style={tailwind`border border-gray-300 p-4 rounded-xl bg-white shadow-sm text-base`}
                        placeholder={`Add details about the ${formatIncidentType(incidentType).toLowerCase()}...`}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* Confirm Button */}
                <Pressable
                    style={[
                        tailwind`p-4 rounded-xl shadow-lg flex-row items-center justify-center`,
                        loading || currentPlayers?.length === 0 || !selectedPlayer
                            ? tailwind`bg-gray-300`
                            : tailwind`bg-red-400`
                    ]}
                    onPress={handleAddIncident}
                    disabled={loading || currentPlayers?.length === 0 || !selectedPlayer}
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
                                Record {formatIncidentType(incidentType)}
                            </Text>
                        </>
                    )}
                </Pressable>

                {/* Summary Card */}
                {selectedPlayer && (
                    <View style={tailwind`mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200`}>
                        <Text style={tailwind`text-blue-900 font-semibold mb-2`}>Summary:</Text>
                        <Text style={tailwind`text-blue-800 text-sm`}>
                            Incident: {formatIncidentType(incidentType)}
                        </Text>
                        <Text style={tailwind`text-blue-800 text-sm`}>
                            Player: {selectedPlayer?.player?.name || selectedPlayer?.name}
                        </Text>
                        <Text style={tailwind`text-blue-800 text-sm`}>
                            Team: {teamPublicID === homeTeam?.public_id ? homeTeam?.name : awayTeam?.name}
                        </Text>
                        <Text style={tailwind`text-blue-800 text-sm`}>
                            Time: {selectedHalf === 'first_half' ? '1st Half' : '2nd Half'} - {selectedMinute}'
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
                            Confirm {formatIncidentType(incidentType)}
                        </Text>
                        <Text style={tailwind`text-gray-600 text-center mb-2`}>
                            <Text style={tailwind`font-semibold`}>
                                {selectedPlayer?.player?.name || selectedPlayer?.name}
                            </Text>
                        </Text>
                        <Text style={tailwind`text-gray-500 text-center text-sm mb-2`}>
                            {teamPublicID === homeTeam?.public_id ? homeTeam?.name : awayTeam?.name}
                        </Text>
                        <Text style={tailwind`text-gray-500 text-center text-sm mb-4`}>
                            {selectedHalf === 'first_half' ? '1st Half' : '2nd Half'} - {selectedMinute}'
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
                                onPress={confirmAddIncident}
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

export default StandardIncidentForm;