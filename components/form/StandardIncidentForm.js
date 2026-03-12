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
import { background } from 'native-base/lib/typescript/theme/styled-system';

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
            <View style={[tailwind`flex-1 items-center justify-center p-6`, {backgroundColor: '#0f172a'}]}>
                <MaterialIcons name="error-outline" size={64} color="#cbd5e1" />
                <Text style={[tailwind`text-lg font-semibold mt-4 text-center`, {color: '#fca5a5'}]}>
                    Invalid match data
                </Text>
                <Text style={[tailwind`text-center mt-2`, {color: '#94a3b8'}]}>
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
            style={[tailwind`flex-1 w-full`, { backgroundColor: "#020617" }]}
        >
            <ScrollView
                contentContainerStyle={tailwind`p-4`}
                nestedScrollEnabled={true}
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
                            <Pressable
                                onPress={() => setError({ global: null, fields: {} })}
                                style={tailwind`ml-2`}
                            >
                                <MaterialIcons name="close" size={18} color="#f87171" />
                            </Pressable>
                        </View>
                    </View>
                )}
                {/* Select Period */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: "#f1f5f9"}]}>Select Period</Text>
                    <View style={[tailwind`flex-row items-center gap-3`]}>
                        <Pressable 
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center shadow-sm`, {borderWidth:1, borderColor:"#334155"},
                                selectedHalf !== 'first_half' ? {backgroundColor: "#0f172a"} : {backgroundColor:"#f87171"},
                            ]} 
                            onPress={() => setSelectedHalf('first_half')}
                        >
                            <Text style={[
                                tailwind`font-semibold text-base`,
                                selectedHalf === 'first_half' ? tailwind`text-white` : {color: "#94a3b8"}
                            ]}>
                                1st Half
                            </Text>
                        </Pressable>
                        
                        <Pressable 
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center shadow-sm`, {borderWidth:1, borderColor:"#334155"},
                                selectedHalf !== 'second_half' ? {backgroundColor: "#0f172a"} : {backgroundColor:"#f87171"},
                            ]} 
                            onPress={() => setSelectedHalf('second_half')}
                        >
                            <Text style={[
                                tailwind`font-semibold text-base`,
                                selectedHalf === 'second_half' ? tailwind`text-white font-semibold` : {color: "#94a3b8"}
                            ]}>
                                2nd Half
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Minute Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3 text-gray-700`, {color: "#f1f5f9"}]}>
                        Incident Time (Minute)
                    </Text>
                    <TextInput
                        style={[tailwind`p-4 rounded-xl text-lg`, {backgroundColor: "#0f172a", borderWidth:1, borderColor:"#334155", color: "#f1f5f9"}]}
                        keyboardType="number-pad"
                        value={selectedMinute}
                        placeholder="Enter minute"
                        placeholderTextColor="#94a3b8"
                        onChangeText={(text) => setSelectedMinute(text)}
                        maxLength={3} 
                    />
                </View>

                {/* Team Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3 text-gray-700`, {color: "#f1f5f9"}]}>Select Team</Text>
                    <View style={tailwind`flex-row gap-3`}>
                        <Pressable 
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center shadow-sm`, {borderWidth:1, borderColor:"#334155"},
                                teamPublicID !== homeTeam.public_id ? {backgroundColor: "#0f172a"} : {backgroundColor:"#f87171"},
                            ]}
                            onPress={() => {
                                setTeamPublicID(homeTeam.public_id);
                                setSelectedPlayer(null);
                            }}
                        >
                            <Text style={[
                                tailwind`font-semibold text-center`,
                                teamPublicID === homeTeam.public_id ? tailwind`text-white` : {color: '#94a3b8'}
                            ]} numberOfLines={2}>
                                {homeTeam.name}
                            </Text>
                        </Pressable>
                        
                        <Pressable 
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center shadow-sm`, {borderWidth:1, borderColor:"#334155"},
                                teamPublicID !== awayTeam.public_id ? {backgroundColor: "#0f172a"} : {backgroundColor:"#f87171"},
                            ]}
                            onPress={() => {
                                setTeamPublicID(awayTeam.public_id);
                                setSelectedPlayer(null);
                            }}
                        >
                            <Text style={[
                                tailwind`font-semibold text-center`,
                                teamPublicID === awayTeam.public_id ? tailwind`text-white` : {color: '#94a3b8'}
                            ]} numberOfLines={2}>
                                {awayTeam.name}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Player Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: "#f1f5f9"}]}>
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
                        <View style={[tailwind`p-4 rounded-xl border`, {backgroundColor:"#0f172a", borderWidth:1, borderColor:"#334155"}]}>
                            <MaterialIcons name="warning" size={24} color="#f87171" style={tailwind`self-center mb-2`} />
                            <Text style={[tailwind`text-yellow-800 text-center font-medium`, {color:"#f1f5f9"}]}>
                                No players available
                            </Text>
                            <Text style={[tailwind`text-yellow-700 text-center text-xs mt-1`, {color:"#f1f5f9"}]}>
                                Please add lineup first
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
                                <View style={[tailwind`flex-row items-center p-3`, {borderBottomWidth:1, borderColor:"#334155"}]}>
                                    {item.player?.media_url ? (
                                        <Image
                                            source={{ uri: item.player.media_url }}
                                            style={tailwind`rounded-full h-12 w-12 mr-3`}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[tailwind`rounded-full h-12 w-12 mr-3 items-center justify-center`, {backgroundColor: '#f8717120'}]}>
                                            <Text style={tailwind`text-white font-bold text-lg`}>
                                                {item.player?.name?.charAt(0)?.toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                    <View>
                                        <Text style={[tailwind`text-base font-semibold`, {color:"#f1f5f9"}]}>
                                            {item.player?.name || "Unknown Player"}
                                        </Text>
                                        <Text style={{color:"#94a3b8"}}>
                                            {item.player.positions}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        >
                            <View style={[tailwind`flex-row items-center justify-between p-4 rounded-xl`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}>
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
                                                <View style={[tailwind`rounded-full h-10 w-10 mr-3 items-center justify-center`, {backgroundColor: '#f8717120'}]}>
                                                    <Text style={tailwind`text-white font-bold`}>
                                                        {selectedPlayer.player?.name?.charAt(0)?.toUpperCase()}
                                                    </Text>
                                                </View>
                                            )}
                                            <Text style={[tailwind`text-base font-medium`, {color: '#f1f5f9'}]}>
                                                {selectedPlayer.player?.name || selectedPlayer.name}
                                            </Text>
                                        </>
                                    ) : (
                                        <Text style={[tailwind`text-base`, {color: '#64748b'}]}>
                                            Select a player
                                        </Text>
                                    )}
                                </View>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
                            </View>
                        </Dropdown>
                    )}
                </View>

                {/* Description Input */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: "#f1f5f9"}]}>
                        Description
                    </Text>
                    <TextInput
                        style={[tailwind`p-4 rounded-xl text-base`, {backgroundColor: "#0f172a", borderWidth:1, borderColor:"#334155", color: "#f1f5f9"}]}
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
                            ? {backgroundColor: '#334155'}
                            : {backgroundColor: '#f87171'}
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
                    <View style={[tailwind`mt-4 p-4 rounded-xl`, {backgroundColor: '#3b82f615', borderWidth: 1, borderColor: '#3b82f630'}]}>
                        <Text style={[tailwind`font-semibold mb-2`, {color: '#93c5fd'}]}>Summary:</Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Incident: {formatIncidentType(incidentType)}
                        </Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Player: {selectedPlayer?.player?.name || selectedPlayer?.name}
                        </Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Team: {teamPublicID === homeTeam?.public_id ? homeTeam?.name : awayTeam?.name}
                        </Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Time: {selectedHalf === 'first_half' ? '1st Half' : '2nd Half'} - {selectedMinute}'
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
                            Confirm {formatIncidentType(incidentType)}
                        </Text>
                        <Text style={[tailwind`text-center mb-2`, {color: '#e2e8f0'}]}>
                            <Text style={tailwind`font-semibold`}>
                                {selectedPlayer?.player?.name || selectedPlayer?.name}
                            </Text>
                        </Text>
                        <Text style={[tailwind`text-center text-sm mb-2`, {color: '#94a3b8'}]}>
                            {teamPublicID === homeTeam?.public_id ? homeTeam?.name : awayTeam?.name}
                        </Text>
                        <Text style={[tailwind`text-center text-sm mb-4`, {color: '#94a3b8'}]}>
                            {selectedHalf === 'first_half' ? '1st Half' : '2nd Half'} - {selectedMinute}'
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
                                onPress={confirmAddIncident}
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

export default StandardIncidentForm;