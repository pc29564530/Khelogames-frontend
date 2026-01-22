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
                const backendErrors = err?.response?.data?.error?.fields || {};
                setError({
                    global: err?.response?.data?.error?.message || "Unable to add substitution. Please try again.",
                    fields: backendErrors,
                });
                console.error("Unable to add substitution:", err);
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
                                setSelectedPlayerIn(null);
                                setSelectedPlayerOut(null);
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
                                setSelectedPlayerIn(null);
                                setSelectedPlayerOut(null);
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

                {/* Player In Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-lg font-semibold mb-3 text-gray-700`}>
                        Player In ({playersIn?.length || 0} substitutes available)
                    </Text>

                    {error?.fields?.player_in_public_id && (
                        <View style={tailwind`mb-2 p-2 bg-red-50 rounded-lg border border-red-200`}>
                            <Text style={tailwind`text-red-600 text-xs`}>
                                {error.fields.player_in_public_id}
                            </Text>
                        </View>
                    )}

                    {playersIn?.length === 0 ? (
                        <View style={tailwind`p-4 bg-yellow-50 rounded-xl border border-yellow-200`}>
                            <MaterialIcons name="warning" size={24} color="#d97706" style={tailwind`self-center mb-2`} />
                            <Text style={tailwind`text-yellow-800 text-center font-medium`}>
                                No substitute players available
                            </Text>
                            <Text style={tailwind`text-yellow-700 text-center text-xs mt-1`}>
                                Please ensure the squad is set up properly
                            </Text>
                        </View>
                    ) : (
                        <Dropdown
                            style={tailwind`bg-white rounded-xl shadow-sm border ${error?.fields?.player_in_public_id ? 'border-red-400' : 'border-gray-300'}`}
                            options={playersIn}
                            onSelect={(index, item) => {
                                setSelectedPlayerIn(item);
                                setError({ ...error, fields: { ...error.fields, player_in_public_id: null } });
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
                                        <View style={tailwind`rounded-full h-12 w-12 mr-3 bg-green-300 items-center justify-center`}>
                                            <Text style={tailwind`text-white font-bold text-lg`}>
                                                {item.player?.name?.charAt(0)?.toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                    <View>
                                        <Text style={tailwind`text-base font-semibold text-gray-800`}>
                                            {item.player?.name || item.player_name || "Unknown"}
                                        </Text>
                                        <Text style={tailwind`text-sm text-gray-500`}>Substitute</Text>
                                    </View>
                                </View>
                            )}
                        >
                            <View style={tailwind`flex-row items-center justify-between p-4 rounded-xl bg-white border border-gray-300`}>
                                <Text style={tailwind`text-base font-medium text-gray-800`}>
                                    {selectedPlayerIn ? (selectedPlayerIn.player?.name || selectedPlayerIn.player_name) : 'Select player coming in'}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
                            </View>
                        </Dropdown>
                    )}
                </View>

                {/* Player Out Selector */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-lg font-semibold mb-3 text-gray-700`}>
                        Player Out ({playersOut?.length || 0} active players)
                    </Text>

                    {error?.fields?.player_out_public_id && (
                        <View style={tailwind`mb-2 p-2 bg-red-50 rounded-lg border border-red-200`}>
                            <Text style={tailwind`text-red-600 text-xs`}>
                                {error.fields.player_out_public_id}
                            </Text>
                        </View>
                    )}

                    {playersOut?.length === 0 ? (
                        <View style={tailwind`p-4 bg-yellow-50 rounded-xl border border-yellow-200`}>
                            <MaterialIcons name="warning" size={24} color="#d97706" style={tailwind`self-center mb-2`} />
                            <Text style={tailwind`text-yellow-800 text-center font-medium`}>
                                No active players available
                            </Text>
                            <Text style={tailwind`text-yellow-700 text-center text-xs mt-1`}>
                                Please ensure the lineup is set up properly
                            </Text>
                        </View>
                    ) : (
                        <Dropdown
                            style={tailwind`bg-white rounded-xl shadow-sm border ${error?.fields?.player_out_public_id ? 'border-red-400' : 'border-gray-300'}`}
                            options={playersOut}
                            onSelect={(index, item) => {
                                setSelectedPlayerOut(item);
                                setError({ ...error, fields: { ...error.fields, player_out_public_id: null } });
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
                                            {item.player?.name || item.player_name || "Unknown"}
                                        </Text>
                                        <Text style={tailwind`text-sm text-gray-500`}>Active</Text>
                                    </View>
                                </View>
                            )}
                        >
                            <View style={tailwind`flex-row items-center justify-between p-4 rounded-xl bg-white border border-gray-300`}>
                                <Text style={tailwind`text-base font-medium text-gray-800`}>
                                    {selectedPlayerOut ? (selectedPlayerOut.player?.name || selectedPlayerOut.player_name) : 'Select player going out'}
                                </Text>
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
                        placeholder="Add details about the substitution..."
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
                        loading || playersIn?.length === 0 || playersOut?.length === 0 || !selectedPlayerIn || !selectedPlayerOut
                            ? tailwind`bg-gray-300`
                            : tailwind`bg-red-400`
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
                    <View style={tailwind`mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200`}>
                        <Text style={tailwind`text-blue-900 font-semibold mb-2`}>Summary:</Text>
                        <Text style={tailwind`text-blue-800 text-sm`}>
                            Player In: {selectedPlayerIn?.player?.name || selectedPlayerIn?.player_name}
                        </Text>
                        <Text style={tailwind`text-blue-800 text-sm`}>
                            Player Out: {selectedPlayerOut?.player?.name || selectedPlayerOut?.player_name}
                        </Text>
                        <Text style={tailwind`text-blue-800 text-sm`}>
                            Team: {teamPublicID === homeTeam?.public_id ? homeTeam?.name : awayTeam?.name}
                        </Text>
                        <Text style={tailwind`text-blue-800 text-sm`}>
                            Period: {selectedHalf === 'first_half' ? '1st Half' : '2nd Half'} - {selectedMinute}'
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <View style={tailwind`absolute inset-0 bg-black bg-opacity-50 items-center justify-center`}>
                    <View style={tailwind`bg-white rounded-2xl p-6 mx-6 w-80`}>
                        <MaterialIcons name="swap-horiz" size={48} color="#ef4444" style={tailwind`self-center mb-4`} />
                        <Text style={tailwind`text-xl font-bold text-gray-800 text-center mb-2`}>
                            Confirm Substitution
                        </Text>
                        <Text style={tailwind`text-gray-600 text-center mb-2`}>
                            <Text style={tailwind`font-semibold text-green-600`}>
                                {selectedPlayerIn?.player?.name || selectedPlayerIn?.player_name}
                            </Text>
                            {' '} replacing {' '}
                            <Text style={tailwind`font-semibold text-red-600`}>
                                {selectedPlayerOut?.player?.name || selectedPlayerOut?.player_name}
                            </Text>
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
                                onPress={confirmAddSubstitution}
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

export default SubstitutionIncidentForm;