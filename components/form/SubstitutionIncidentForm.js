import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View, Text, TextInput, Pressable, Image, ScrollView, Alert, ActivityIndicator, Platform} from 'react-native';
import axiosInstance from "../../screen/axios_config";
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/ApiConstants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { addFootballIncidents } from '../../redux/actions/actions';
import { useWebSocket } from '../../context/WebSocketContext';
import { KeyboardAvoidingView } from 'native-base';
import { validateFootballIncidentForm } from '../../utils/validation/footballIncidentValidation';

const SubstitutionIncidentForm = ({
    match,
    tournament,
    awayTeam,
    homeTeam,
    homeSquad,
    awaySquad,
    navigation
}) => {
    // Props validation
    if (!match || !homeTeam || !awayTeam) {
        return (
            <View style={[tailwind`flex-1 items-center justify-center p-6`, {backgroundColor: '#0f172a'}]}>
                <MaterialIcons name="error-outline" size={64} color="#ef4444" />
                <Text style={[tailwind`text-lg font-semibold mt-4 text-center`, {color: '#fca5a5'}]}>
                    Invalid match data
                </Text>
                <Text style={[tailwind`text-center mt-2`, {color: '#94a3b8'}]}>
                    Required information is missing. Please go back and try again.
                </Text>
                <Pressable
                    onPress={() => navigation?.goBack()}
                    style={[tailwind`mt-6 px-6 py-3 rounded-xl`, {backgroundColor: '#f87171'}]}
                >
                    <Text style={tailwind`text-white font-semibold`}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const [selectedPlayerIn, setSelectedPlayerIn] = useState(null);
    const [selectedPlayerOut, setSelectedPlayerOut] = useState(null);
    const [selectedHalf, setSelectedHalf] = useState("first_half");
    const [selectedMinute, setSelectedMinute] = useState('45');
    const [description, setDescription] = useState('');
    const [teamPublicID, setTeamPublicID] = useState(homeTeam?.public_id);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [loading, setLoading] = useState(false);
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

    const handleAddSubstitution = async () => {
        // Validate required fields
        if (!selectedPlayerIn) {
            setError({
                global: "Please select a player coming in",
                fields: { player_in_public_id: "Player in is required" },
            });
            return;
        }

        if (!selectedPlayerOut) {
            setError({
                global: "Please select a player going out",
                fields: { player_out_public_id: "Player out is required" },
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

    const confirmAddSubstitution = async () => {
        setShowConfirmation(false);
        setLoading(true);
        setError({ global: null, fields: {} });

        try {
            const formData = {
                "match_public_id": match?.public_id,
                "team_public_id": teamPublicID,
                "tournament_public_id": tournament?.public_id,
                "periods": selectedHalf,
                "incident_type": "substitution",
                "incident_time": parseInt(selectedMinute),
                "description": description || `Substitution: ${selectedPlayerIn?.player?.name || selectedPlayerIn?.player_name} in for ${selectedPlayerOut?.player?.name || selectedPlayerOut?.player_name}`,
                "player_in_public_id": selectedPlayerIn?.player?.public_id || selectedPlayerIn?.public_id,
                "player_out_public_id": selectedPlayerOut?.player?.public_id || selectedPlayerOut?.public_id,
                "event_type": "substitution",
            }

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
                "team_public_id": teamPublicID,
                "tournament_public_id": tournament?.public_id,
                "periods": selectedHalf,
                "incident_type": "substitution",
                "incident_time": parseInt(selectedMinute),
                "description": description || `Substitution: ${selectedPlayerIn?.player?.name || selectedPlayerIn?.player_name} in for ${selectedPlayerOut?.player?.name || selectedPlayerOut?.player_name}`,
                "player_in_public_id": selectedPlayerIn?.player?.public_id || selectedPlayerIn?.public_id,
                "player_out_public_id": selectedPlayerOut?.player?.public_id || selectedPlayerOut?.public_id
            };

            const response = await axiosInstance.post(
                `${BASE_URL}/${game?.name}/addFootballIncidentsSubs`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const item = response?.data;

            if (item?.data && isMountedRef.current) {
                // Send WebSocket update
                if (wsRef?.current && wsRef.current.readyState === WebSocket.OPEN) {
                    try {
                        wsRef.current.send(JSON.stringify({
                            type: "MATCH_UPDATE",
                            payload: {
                                match_public_id: match?.public_id,
                                incident_type: "substitution",
                            }
                        }));
                    } catch (wsErr) {
                        console.error("WebSocket send failed:", wsErr);
                    }
                }

                dispatch(addFootballIncidents(item.data));
                Alert.alert('Success', 'Substitution recorded successfully!', [
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
                console.error("Unable to do substitution:", err);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    const handleWebSocketMessage = useCallback((event) => {
        const rawData = event.data;
        if (!rawData) {
            console.error("raw data is undefined");
            return;
        }

        const message = JSON.parse(rawData);
        if (message.type === "ADD_FOOTBALL_SUB_INCIDENT") {
            dispatch(addFootballIncidents(message.payload));
        }
    }, [dispatch]);

    useEffect(() => {
        if (!wsRef.current) return;
        wsRef.current.onmessage = handleWebSocketMessage;
    }, [handleWebSocketMessage]);

    // Get substitute players (for player in)
    const getSubstitutePlayers = (squad) => {
        if (!Array.isArray(squad)) return [];
        return squad.filter(player =>
            player &&
            player.is_substitute === true &&
            player.player
        );
    };

    // Get active players (for player out)
    const getActivePlayers = (squad) => {
        if (!Array.isArray(squad)) return [];
        return squad.filter(player =>
            player &&
            player.is_substitute === false &&
            player.player
        );
    };

    const homeSubstitutes = getSubstitutePlayers(homeSquad);
    const awaySubstitutes = getSubstitutePlayers(awaySquad);
    const homeActive = getActivePlayers(homeSquad);
    const awayActive = getActivePlayers(awaySquad);

    const playersIn = teamPublicID === homeTeam.public_id ? homeSubstitutes : awaySubstitutes;
    const playersOut = teamPublicID === homeTeam.public_id ? homeActive : awayActive;

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
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: '#f1f5f9'}]}>Select Period</Text>
                    <View style={tailwind`flex-row items-center gap-3`}>
                        <Pressable
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center`, {borderWidth: 1, borderColor: '#334155'},
                                selectedHalf !== 'first_half' ? {backgroundColor: '#0f172a'} : {backgroundColor: '#f87171'},
                            ]}
                            onPress={() => setSelectedHalf('first_half')}
                        >
                            <Text style={[
                                tailwind`font-semibold text-base`,
                                selectedHalf === 'first_half' ? tailwind`text-white` : {color: '#94a3b8'}
                            ]}>
                                1st Half
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center`, {borderWidth: 1, borderColor: '#334155'},
                                selectedHalf !== 'second_half' ? {backgroundColor: '#0f172a'} : {backgroundColor: '#f87171'},
                            ]}
                            onPress={() => setSelectedHalf('second_half')}
                        >
                            <Text style={[
                                tailwind`font-semibold text-base`,
                                selectedHalf === 'second_half' ? tailwind`text-white` : {color: '#94a3b8'}
                            ]}>
                                2nd Half
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Minute Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: '#f1f5f9'}]}>
                        Incident Time (Minute)
                    </Text>
                    <TextInput
                        style={[tailwind`p-4 rounded-xl text-lg`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', color: '#f1f5f9'}]}
                        keyboardType="number-pad"
                        value={selectedMinute}
                        placeholder="Enter minute"
                        placeholderTextColor="#64748b"
                        onChangeText={(text) => setSelectedMinute(text)}
                        maxLength={3}
                    />
                </View>

                {/* Team Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: '#f1f5f9'}]}>Select Team</Text>
                    <View style={tailwind`flex-row gap-3`}>
                        <Pressable
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center`, {borderWidth: 1, borderColor: '#334155'},
                                teamPublicID !== homeTeam.public_id ? {backgroundColor: '#0f172a'} : {backgroundColor: '#f87171'},
                            ]}
                            onPress={() => {
                                setTeamPublicID(homeTeam.public_id);
                                setSelectedPlayerIn(null);
                                setSelectedPlayerOut(null);
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
                                tailwind`flex-1 p-4 rounded-xl items-center`, {borderWidth: 1, borderColor: '#334155'},
                                teamPublicID !== awayTeam.public_id ? {backgroundColor: '#0f172a'} : {backgroundColor: '#f87171'},
                            ]}
                            onPress={() => {
                                setTeamPublicID(awayTeam.public_id);
                                setSelectedPlayerIn(null);
                                setSelectedPlayerOut(null);
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

                {/* Player In Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: '#f1f5f9'}]}>
                        Player In ({playersIn?.length || 0} substitutes available)
                    </Text>

                    {error?.fields?.player_in_public_id && (
                        <View style={[tailwind`mb-2 p-2 rounded-lg`, {backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130'}]}>
                            <Text style={[tailwind`text-xs`, {color: '#fca5a5'}]}>
                                {error.fields.player_in_public_id}
                            </Text>
                        </View>
                    )}

                    {playersIn?.length === 0 ? (
                        <View style={[tailwind`p-4 rounded-xl`, {backgroundColor: '#f59e0b15', borderWidth: 1, borderColor: '#f59e0b30'}]}>
                            <MaterialIcons name="warning" size={24} color="#fbbf24" style={tailwind`self-center mb-2`} />
                            <Text style={[tailwind`text-center font-medium`, {color: '#fbbf24'}]}>
                                No substitute players available
                            </Text>
                            <Text style={[tailwind`text-center text-xs mt-1`, {color: '#94a3b8'}]}>
                                Please ensure the squad is set up properly
                            </Text>
                        </View>
                    ) : (
                        <Dropdown
                            style={[tailwind`rounded-xl`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: error?.fields?.player_in_public_id ? '#f87171' : '#334155'}]}
                            options={playersIn}
                            onSelect={(index, item) => {
                                setSelectedPlayerIn(item);
                                setError({ ...error, fields: { ...error.fields, player_in_public_id: null } });
                            }}
                            renderRow={(item) => (
                                <View style={[tailwind`flex-row items-center p-3`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
                                    {item.player?.media_url ? (
                                        <Image
                                            source={{ uri: item.player.media_url }}
                                            style={tailwind`rounded-full h-12 w-12 mr-3`}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[tailwind`rounded-full h-12 w-12 mr-3 items-center justify-center`, {backgroundColor: '#10b98120'}]}>
                                            <Text style={tailwind`text-white font-bold text-lg`}>
                                                {item.player?.name?.charAt(0)?.toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                    <View>
                                        <Text style={[tailwind`text-base font-semibold`, {color: '#f1f5f9'}]}>
                                            {item.player?.name || item.player_name || "Unknown"}
                                        </Text>
                                        <Text style={[tailwind`text-sm`, {color: '#4ade80'}]}>Substitute</Text>
                                    </View>
                                </View>
                            )}
                        >
                            <View style={[tailwind`flex-row items-center justify-between p-4 rounded-xl`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}>
                                <Text style={[tailwind`text-base font-medium`, {color: selectedPlayerIn ? '#f1f5f9' : '#64748b'}]}>
                                    {selectedPlayerIn ? (selectedPlayerIn.player?.name || selectedPlayerIn.player_name) : 'Select player coming in'}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
                            </View>
                        </Dropdown>
                    )}
                </View>

                {/* Player Out Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: '#f1f5f9'}]}>
                        Player Out ({playersOut?.length || 0} active players)
                    </Text>

                    {error?.fields?.player_out_public_id && (
                        <View style={[tailwind`mb-2 p-2 rounded-lg`, {backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130'}]}>
                            <Text style={[tailwind`text-xs`, {color: '#fca5a5'}]}>
                                {error.fields.player_out_public_id}
                            </Text>
                        </View>
                    )}

                    {playersOut?.length === 0 ? (
                        <View style={[tailwind`p-4 rounded-xl`, {backgroundColor: '#f59e0b15', borderWidth: 1, borderColor: '#f59e0b30'}]}>
                            <MaterialIcons name="warning" size={24} color="#fbbf24" style={tailwind`self-center mb-2`} />
                            <Text style={[tailwind`text-center font-medium`, {color: '#fbbf24'}]}>
                                No active players available
                            </Text>
                            <Text style={[tailwind`text-center text-xs mt-1`, {color: '#94a3b8'}]}>
                                Please ensure the lineup is set up properly
                            </Text>
                        </View>
                    ) : (
                        <Dropdown
                            style={[tailwind`rounded-xl`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: error?.fields?.player_out_public_id ? '#f87171' : '#334155'}]}
                            options={playersOut}
                            onSelect={(index, item) => {
                                setSelectedPlayerOut(item);
                                setError({ ...error, fields: { ...error.fields, player_out_public_id: null } });
                            }}
                            renderRow={(item) => (
                                <View style={[tailwind`flex-row items-center p-3`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
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
                                        <Text style={[tailwind`text-base font-semibold`, {color: '#f1f5f9'}]}>
                                            {item.player?.name || item.player_name || "Unknown"}
                                        </Text>
                                        <Text style={[tailwind`text-sm`, {color: '#f87171'}]}>Active</Text>
                                    </View>
                                </View>
                            )}
                        >
                            <View style={[tailwind`flex-row items-center justify-between p-4 rounded-xl`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}>
                                <Text style={[tailwind`text-base font-medium`, {color: selectedPlayerOut ? '#f1f5f9' : '#64748b'}]}>
                                    {selectedPlayerOut ? (selectedPlayerOut.player?.name || selectedPlayerOut.player_name) : 'Select player going out'}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
                            </View>
                        </Dropdown>
                    )}
                </View>

                {/* Description Input */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: '#f1f5f9'}]}>
                        Description (Optional)
                    </Text>
                    <TextInput
                        style={[tailwind`p-4 rounded-xl text-base`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', color: '#f1f5f9'}]}
                        placeholder="Add details about the substitution..."
                        placeholderTextColor="#64748b"
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
                        tailwind`p-4 rounded-xl flex-row items-center justify-center`,
                        loading || playersIn?.length === 0 || playersOut?.length === 0 || !selectedPlayerIn || !selectedPlayerOut
                            ? {backgroundColor: '#334155'}
                            : {backgroundColor: '#f87171'}
                    ]}
                    onPress={handleAddSubstitution}
                    disabled={loading || playersIn?.length === 0 || playersOut?.length === 0 || !selectedPlayerIn || !selectedPlayerOut}
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
                                Record Substitution
                            </Text>
                        </>
                    )}
                </Pressable>

                {/* Summary Card */}
                {selectedPlayerIn && selectedPlayerOut && (
                    <View style={[tailwind`mt-4 p-4 rounded-xl`, {backgroundColor: '#3b82f615', borderWidth: 1, borderColor: '#3b82f630'}]}>
                        <Text style={[tailwind`font-semibold mb-2`, {color: '#93c5fd'}]}>Summary:</Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Player In: {selectedPlayerIn?.player?.name || selectedPlayerIn?.player_name}
                        </Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Player Out: {selectedPlayerOut?.player?.name || selectedPlayerOut?.player_name}
                        </Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Team: {teamPublicID === homeTeam?.public_id ? homeTeam?.name : awayTeam?.name}
                        </Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Period: {selectedHalf === 'first_half' ? '1st Half' : '2nd Half'} - {selectedMinute}'
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <View style={tailwind`absolute inset-0 bg-black bg-opacity-50 items-center justify-center`}>
                    <View style={[tailwind`rounded-2xl p-6 mx-6 w-80`, {backgroundColor: '#1e293b'}]}>
                        <MaterialIcons name="swap-horiz" size={48} color="#f87171" style={tailwind`self-center mb-4`} />
                        <Text style={[tailwind`text-xl font-bold text-center mb-2`, {color: '#f1f5f9'}]}>
                            Confirm Substitution
                        </Text>
                        <Text style={[tailwind`text-center mb-2`, {color: '#e2e8f0'}]}>
                            <Text style={[tailwind`font-semibold`, {color: '#4ade80'}]}>
                                {selectedPlayerIn?.player?.name || selectedPlayerIn?.player_name}
                            </Text>
                            {' '} replacing {' '}
                            <Text style={[tailwind`font-semibold`, {color: '#f87171'}]}>
                                {selectedPlayerOut?.player?.name || selectedPlayerOut?.player_name}
                            </Text>
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
                                onPress={confirmAddSubstitution}
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

export default SubstitutionIncidentForm;