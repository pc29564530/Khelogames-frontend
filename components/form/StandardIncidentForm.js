import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../screen/axios_config';
import { BASE_URL } from '../../constants/ApiConstants';
import {View, Text, TextInput, Pressable, Image, ScrollView, Alert, ActivityIndicator, Platform} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';
import { useSelector } from 'react-redux';
import { KeyboardAvoidingView } from 'native-base';

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
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectedHalf, setSelectedHalf] = useState("first_half");
    const [selectedMinute, setSelectedMinute] = useState('45');
    const [teamPublicID, setTeamPublicID] = useState(homeTeam?.public_id);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const game = useSelector((state) => state.sportReducers.game);

    const handleAddIncident = async () => {
        if (!selectedPlayer) {
            Alert.alert('Error', 'Please select a player');
            return;
        }

        if (!selectedMinute) {
            Alert.alert('Error', 'Please select incident time');
            return;
        }

        setLoading(true);
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            
            const data = {
                "match_public_id": match.public_id,
                "team_public_id": teamPublicID,
                "tournament_public_id": tournament?.public_id,
                "player_public_id": selectedPlayer.player?.public_id || selectedPlayer.public_id,
                "periods": selectedHalf,
                "incident_type": incidentType,
                "incident_time": parseInt(selectedMinute),
                "description": description || `${formatIncidentType(incidentType)} by ${selectedPlayer.player?.name || selectedPlayer.name}`,
                "penalty_shootout_scored": false
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
                Alert.alert('Success', 'Incident added successfully!');
                setSelectedPlayer(null);
                setDescription('');
                setSelectedMinute('');
                navigation.goBack();
            }

        } catch (err) {
            console.error("Unable to add the incident:", err);
            Alert.alert('Error', err.response?.data?.message || 'Failed to add incident. Please try again.');
        } finally {
            setLoading(false);
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
                        Select Player ({currentPlayers.length} available)
                    </Text>
                    
                    {currentPlayers.length === 0 ? (
                        <View style={tailwind`p-4 bg-yellow-50 rounded-xl border border-yellow-200`}>
                            <Text style={tailwind`text-yellow-800 text-center`}>
                                No players available. Please add lineup first.
                            </Text>
                        </View>
                    ) : (
                        <Dropdown
                            style={tailwind`bg-white rounded-xl shadow-sm border border-gray-300`}
                            options={currentPlayers}
                            onSelect={(index, item) => {
                                setSelectedPlayer(item);
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
                        loading || currentPlayers.length === 0 
                            ? tailwind`bg-gray-300` 
                            : tailwind`bg-red-400`
                    ]}
                    onPress={handleAddIncident}
                    disabled={loading || currentPlayers.length === 0}
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
                                Confirm Incident
                            </Text>
                        </>
                    )}
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default StandardIncidentForm;