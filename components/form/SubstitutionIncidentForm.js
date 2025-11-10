import React, {useState, useEffect, useCallback} from 'react';
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

const SubstitutionIncidentForm = ({
    match,
    tournament,
    awayTeam,
    homeTeam,
    homeSquad,
    awaySquad,
    navigation
}) => {
    const [selectedPlayerIn, setSelectedPlayerIn] = useState(null);
    const [selectedPlayerOut, setSelectedPlayerOut] = useState(null);
    const [selectedHalf, setSelectedHalf] = useState("first_half");
    const [selectedMinute, setSelectedMinute] = useState('45');
    const [description, setDescription] = useState('');
    const [teamPublicID, setTeamPublicID] = useState(homeTeam?.public_id);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const {wsRef} = useWebSocket();
    const game = useSelector((state) => state.sportReducers.game);

    const handleAddSubstitution = async () => {
        if (!selectedPlayerIn) {
            Alert.alert('Error', 'Please select player coming in');
            return;
        }
        if (!selectedPlayerOut) {
            Alert.alert('Error', 'Please select player going out');
            return;
        }

        setLoading(true);
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                "match_public_id": match.public_id,
                "team_public_id": teamPublicID,
                "tournament_public_id": tournament?.public_id,
                "periods": selectedHalf,
                "incident_type": "substitution",
                "incident_time": parseInt(selectedMinute),
                "description": description || `Substitution: ${selectedPlayerIn.player?.name || selectedPlayerIn.player_name} in for ${selectedPlayerOut.player?.name || selectedPlayerOut.player_name}`,
                "player_in_public_id": selectedPlayerIn.player?.public_id || selectedPlayerIn.public_id,
                "player_out_public_id": selectedPlayerOut.player?.public_id || selectedPlayerOut.public_id
            };

            const response = await axiosInstance.post(
                `${BASE_URL}/${game.name}/addFootballIncidentsSubs`, 
                data, 
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data) {
                dispatch(addFootballIncidents(response.data));
                Alert.alert('Success', 'Substitution added successfully!');
                navigation.goBack();
            }
        } catch (err) {
            console.error("Unable to add substitution:", err);
            Alert.alert('Error', err.response?.data?.message || 'Failed to add substitution. Please try again.');
        } finally {
            setLoading(false);
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
                        Player In ({playersIn.length} substitutes available)
                    </Text>
                    
                    {playersIn.length === 0 ? (
                        <View style={tailwind`p-4 bg-yellow-50 rounded-xl border border-yellow-200`}>
                            <Text style={tailwind`text-yellow-800 text-center`}>
                                No substitute players available
                            </Text>
                        </View>
                    ) : (
                        <Dropdown
                            style={tailwind`bg-white rounded-xl shadow-sm border border-gray-300`}
                            options={playersIn}
                            onSelect={(index, item) => setSelectedPlayerIn(item)}
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
                        Player Out ({playersOut.length} active players)
                    </Text>
                    
                    {playersOut.length === 0 ? (
                        <View style={tailwind`p-4 bg-yellow-50 rounded-xl border border-yellow-200`}>
                            <Text style={tailwind`text-yellow-800 text-center`}>
                                No active players available
                            </Text>
                        </View>
                    ) : (
                        <Dropdown
                            style={tailwind`bg-white rounded-xl shadow-sm border border-gray-300`}
                            options={playersOut}
                            onSelect={(index, item) => setSelectedPlayerOut(item)}
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
                        loading || playersIn.length === 0 || playersOut.length === 0
                            ? tailwind`bg-gray-300` 
                            : tailwind`bg-red-400`
                    ]}
                    onPress={handleAddSubstitution}
                    disabled={loading || playersIn.length === 0 || playersOut.length === 0}
                >
                    {loading ? (
                        <>
                            <ActivityIndicator size="small" color="white" />
                            <Text style={tailwind`text-white font-semibold text-lg ml-2`}>
                                Adding...
                            </Text>
                        </>
                    ) : (
                        <>
                            <MaterialIcons name="check-circle" size={24} color="white" />
                            <Text style={tailwind`text-white font-semibold text-lg ml-2`}>
                                Confirm Substitution
                            </Text>
                        </>
                    )}
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SubstitutionIncidentForm;