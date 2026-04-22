import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View, Text, TextInput, Pressable, Image, ScrollView, Alert, ActivityIndicator, Platform, Modal, Dimensions, useWindowDimensions} from 'react-native';
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

    const { height: SCREEN_HEIGHT } = useWindowDimensions();
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [goalScore, setGoalScore] = useState(null);
    const [teamPublicID, setTeamPublicID] = useState(homeTeam?.public_id);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
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
        setLoading(true);
        setError({ global: null, fields: {} });

        try {
            const formData = {
                "match_public_id": match?.public_id,
                "team_public_id": teamPublicID,
                "tournament_public_id": tournament?.public_id || null,
                "periods": 'penalty_shootout',
                "incident_type": "penalty_shootout",
                "player_public_id": selectedPlayer?.player?.public_id || selectedPlayer?.public_id,
                "penalty_shootout_scored": goalScore,
                "event_type": "penalty_shootout",
            };
            // Verify validation 
            const validation = validateFootballIncidentForm(formData);
            if (!validation.isValid) {
                if (isMountedRef.current) {
                    setError({
                        global: null,
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
                "periods": 'penalty_shootout',
                "incident_type": "penalty_shootout",
                "incident_time": null,
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
            navigation.goBack();
        } catch (err) {
            if (isMountedRef.current) {
                const errorCode = err?.response?.data?.error?.code;
                const errorMessage = err?.response?.data?.error?.message;
                const backendFields = err?.response?.data?.error?.fields;

                if (backendFields && Object.keys(backendFields).length > 0) {
                    setError({ global: errorMessage || "Invalid input", fields: backendFields });
                } else if (errorCode && errorCode !== "INTERNAL_ERROR") {
                    setError({ global: errorMessage, fields: {} });
                } else {
                    setError({ global: "Unable to add football incident", fields: {} });
                }
                console.log("Unable to add football shootout incident:", err?.response?.data?.error);
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
    const currentPlayers = teamPublicID === homeTeam.public_id ? homeActive : awayActive;
    const filteredPlayers = currentPlayers.filter(p =>
        p.player?.name?.toLowerCase().includes(searchText.toLowerCase())
    );

    const teamName = teamPublicID === homeTeam?.public_id ? homeTeam?.name : awayTeam?.name;

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
                                teamPublicID !== homeTeam?.public_id ? {backgroundColor: '#0f172a'} : {backgroundColor: '#f87171'},
                            ]}
                            onPress={() => {
                                setTeamPublicID(homeTeam?.public_id);
                                setSelectedPlayer(null);
                                setError({ global: null, fields: {} });
                            }}
                        >
                            <Text style={[
                                tailwind`font-semibold text-center`,
                                teamPublicID === homeTeam?.public_id ? tailwind`text-white` : {color: '#94a3b8'}
                            ]} numberOfLines={2}>
                                {homeTeam?.name || 'Home Team'}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                tailwind`flex-1 p-4 rounded-xl items-center`, {borderWidth: 1, borderColor: '#334155'},
                                teamPublicID !== awayTeam?.public_id ? {backgroundColor: '#0f172a'} : {backgroundColor: '#f87171'},
                            ]}
                            onPress={() => {
                                setTeamPublicID(awayTeam?.public_id);
                                setSelectedPlayer(null);
                                setError({ global: null, fields: {} });
                            }}
                        >
                            <Text style={[
                                tailwind`font-semibold text-center`,
                                teamPublicID === awayTeam?.public_id ? tailwind`text-white` : {color: '#94a3b8'}
                            ]} numberOfLines={2}>
                                {awayTeam?.name || 'Away Team'}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {currentPlayers?.length === 0 ? (
                        <View style={[tailwind`p-4 rounded-xl items-center`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }]}>
                            <MaterialIcons name="person-off" size={28} color="#475569" />
                            <Text style={[tailwind`text-sm font-medium mt-2`, { color: '#94a3b8' }]}>No players in squad</Text>
                            <Text style={[tailwind`text-xs mt-1`, { color: '#475569' }]}>Add lineup first</Text>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => {
                                setSearchText('');
                                setShowPlayerModal(true);
                            }}
                            style={[
                                tailwind`flex-row items-center p-3 rounded-xl`,
                                {
                                    backgroundColor: '#0f172a',
                                    borderWidth: 1,
                                    borderColor: selectedPlayer ? '#f8717150' : '#334155',
                                },
                            ]}
                        >
                            {selectedPlayer ? (
                                <>
                                    {selectedPlayer.player?.media_url ? (
                                        <Image
                                            source={{ uri: selectedPlayer.player.media_url }}
                                            style={tailwind`w-10 h-10 rounded-full mr-3`}
                                        />
                                    ) : (
                                        <View style={[tailwind`w-10 h-10 rounded-full mr-3 items-center justify-center`, { backgroundColor: '#f8717120' }]}>
                                            <Text style={[tailwind`font-bold`, { color: '#f87171' }]}>
                                                {selectedPlayer.player?.name?.charAt(0)?.toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={tailwind`flex-1`}>
                                        <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                                            {selectedPlayer.player?.name}
                                        </Text>
                                        {selectedPlayer.player?.positions && (
                                            <Text style={{ color: '#64748b', fontSize: 11 }}>{selectedPlayer.player.positions}</Text>
                                        )}
                                    </View>
                                    <Pressable
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setSelectedPlayer(null);
                                        }}
                                        hitSlop={8}
                                    >
                                        <MaterialIcons name="close" size={18} color="#475569" />
                                    </Pressable>
                                </>
                            ) : (
                                <>
                                    <View style={[tailwind`w-10 h-10 rounded-full mr-3 items-center justify-center`, { backgroundColor: '#1e293b' }]}>
                                        <MaterialIcons name="person-add" size={20} color="#475569" />
                                    </View>
                                    <Text style={[tailwind`flex-1 text-sm`, { color: '#475569' }]}>
                                        Tap to select player ({currentPlayers.length})
                                    </Text>
                                    <MaterialIcons name="chevron-right" size={22} color="#475569" />
                                </>
                            )}
                        </Pressable>
                )}

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
            </ScrollView>
            <Modal
                visible={showPlayerModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPlayerModal(false)}
            >
                <View style={tailwind`flex-1 justify-end bg-black/60`}>
                    <Pressable style={tailwind`flex-1`} onPress={() => setShowPlayerModal(false)} />

                    <View style={[tailwind`rounded-t-3xl`, { backgroundColor: '#0f172a', minHeight: SCREEN_HEIGHT * 0.75 }]}>
                        {/* Modal Handle */}
                        <View style={tailwind`items-center pt-3 pb-1`}>
                            <View style={[tailwind`rounded-full`, { width: 36, height: 4, backgroundColor: '#334155' }]} />
                        </View>

                        {/* Modal Header */}
                        <View style={[tailwind`flex-row items-center justify-between px-4 pb-3`, { borderBottomWidth: 1, borderBottomColor: '#1e293b' }]}>
                            <View>
                                <Text style={[tailwind`text-base font-bold`, { color: '#f1f5f9' }]}>Select Player</Text>
                                <Text style={{ color: '#475569', fontSize: 12 }}>{teamName} - {currentPlayers.length} players</Text>
                            </View>
                            <Pressable
                                onPress={() => setShowPlayerModal(false)}
                                style={[tailwind`w-8 h-8 rounded-full items-center justify-center`, { backgroundColor: '#1e293b' }]}
                            >
                                <MaterialIcons name="close" size={18} color="#94a3b8" />
                            </Pressable>
                        </View>

                        {/* Search */}
                        <View style={tailwind`px-4 py-3`}>
                            <View style={[tailwind`flex-row items-center rounded-xl px-3`, { backgroundColor: '#1e293b', height: 42 }]}>
                                <MaterialIcons name="search" size={20} color="#475569" />
                                <TextInput
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    placeholder="Search player..."
                                    placeholderTextColor="#475569"
                                    style={[tailwind`flex-1 ml-2 text-sm`, { color: '#f1f5f9', padding: 0 }]}
                                    autoFocus={false}
                                />
                                {searchText.length > 0 && (
                                    <Pressable onPress={() => setSearchText('')}>
                                        <MaterialIcons name="cancel" size={16} color="#475569" />
                                    </Pressable>
                                )}
                            </View>
                        </View>

                        {/* Player List */}
                        <ScrollView
                            style={tailwind`flex-1`}
                            contentContainerStyle={tailwind`px-4 pb-8`}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {filteredPlayers.length === 0 ? (
                                <View style={tailwind`items-center py-10`}>
                                    <MaterialIcons name="person-search" size={48} color="#334155" />
                                    <Text style={[tailwind`mt-3 text-sm`, { color: '#475569' }]}>
                                        {searchText ? 'No players found' : 'No players available'}
                                    </Text>
                                </View>
                            ) : (
                                filteredPlayers.map((item, index) => {
                                    const isSelected = selectedPlayer?.player?.public_id === item.player?.public_id;
                                    return (
                                        <Pressable
                                            key={item.player?.public_id || index}
                                            onPress={() => {
                                                setSelectedPlayer(item);
                                                setError({ ...error, fields: { ...error.fields, player_public_id: null } });
                                                setShowPlayerModal(false);
                                            }}
                                            style={[
                                                tailwind`flex-row items-center py-3 px-3 mb-1 rounded-xl`,
                                                isSelected
                                                    ? { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }
                                                    : { backgroundColor: 'transparent' },
                                            ]}
                                        >
                                            {/* Avatar */}
                                            {item.player?.media_url ? (
                                                <Image
                                                    source={{ uri: item.player.media_url }}
                                                    style={tailwind`w-11 h-11 rounded-full`}
                                                />
                                            ) : (
                                                <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center`, { backgroundColor: '#1e293b' }]}>
                                                    <Text style={[tailwind`font-bold`, { color: '#f87171' }]}>
                                                        {item.player?.name?.charAt(0)?.toUpperCase()}
                                                    </Text>
                                                </View>
                                            )}

                                            {/* Player Info */}
                                            <View style={tailwind`flex-1 ml-3`}>
                                                <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                                                    {item.player?.name || 'Unknown'}
                                                </Text>
                                                <View style={tailwind`flex-row items-center mt-0.5`}>
                                                    {item.player?.positions && (
                                                        <Text style={{ color: '#64748b', fontSize: 11 }}>{item.player.positions}</Text>
                                                    )}
                                                    {item.player?.country && (
                                                        <>
                                                            <View style={[tailwind`mx-1.5 rounded-full`, { width: 3, height: 3, backgroundColor: '#334155' }]} />
                                                            <Text style={{ color: '#64748b', fontSize: 11 }}>{item.player.country}</Text>
                                                        </>
                                                    )}
                                                </View>
                                            </View>

                                            {/* Selected indicator */}
                                            {isSelected ? (
                                                <View style={[tailwind`w-6 h-6 rounded-full items-center justify-center`, { backgroundColor: '#f87171' }]}>
                                                    <MaterialIcons name="check" size={16} color="#fff" />
                                                </View>
                                            ) : (
                                                <View style={[tailwind`w-6 h-6 rounded-full`, { borderWidth: 1.5, borderColor: '#334155' }]} />
                                            )}
                                        </Pressable>
                                    );
                                })
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

export default ShootoutIncidentForm;