import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View, Text, TextInput, Pressable, Image, ScrollView, Alert, ActivityIndicator, Platform, Modal, Dimensions} from 'react-native';
import axiosInstance from "../../screen/axios_config";
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/ApiConstants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { addFootballIncidents } from '../../redux/actions/actions';
import { useWebSocket } from '../../context/WebSocketContext';
import { KeyboardAvoidingView } from 'native-base';
import { validateFootballIncidentForm } from '../../utils/validation/footballIncidentValidation';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    const [showPlayerInModal, setShowPlayerInModal] = useState(false);
    const [showPlayerOutModal, setShowPlayerOutModal] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [loading, setLoading] = useState(false);
    const isMountedRef = useRef(true);
    const game = useSelector((state) => state.sportReducers.game);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleAddSubstitution = async () => {
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
            navigation.goBack();
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

    const filteredPlayersIn = playersIn.filter(p =>
        p.player?.name?.toLowerCase().includes(searchText.toLowerCase())
    );
    const filteredPlayersOut = playersOut.filter(p =>
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
                            <Pressable
                                onPress={() => setError({ global: null, fields: {} })}
                                style={tailwind`ml-2`}
                            >
                                <MaterialIcons name="close" size={18} color="#f87171" />
                            </Pressable>
                        </View>
                    </View>
                )}
                {/* Substitution Header */}
                <View style={[tailwind`flex-row items-center mb-5 p-4 rounded-2xl`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                    <View style={[tailwind`w-10 h-10 rounded-full items-center justify-center mr-3`, { backgroundColor: '#f8717125' }]}>
                        <MaterialIcons name="swap-horiz" size={22} color="#f87171" />
                    </View>
                    <View style={tailwind`flex-1`}>
                        <Text style={[tailwind`text-base font-bold`, { color: '#f87171' }]}>Substitution</Text>
                        <Text style={{ color: '#64748b', fontSize: 12 }}>
                            {homeTeam?.name} vs {awayTeam?.name}
                        </Text>
                    </View>
                </View>

                {/* Period + Minute Row */}
                <View style={tailwind`flex-row gap-3 mb-5`}>
                    {/* Period */}
                    <View style={tailwind`flex-1`}>
                        <Text style={[tailwind`text-xs font-semibold mb-2 tracking-wide`, { color: '#64748b' }]}>PERIOD</Text>
                        <View style={tailwind`flex-row gap-2`}>
                            {['first_half', 'second_half'].map((half) => (
                                <Pressable
                                    key={half}
                                    onPress={() => setSelectedHalf(half)}
                                    style={[
                                        tailwind`flex-1 py-3 rounded-xl items-center`,
                                        selectedHalf === half
                                            ? { backgroundColor: '#f87171' }
                                            : { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' },
                                    ]}
                                >
                                    <Text style={[
                                        tailwind`text-sm font-semibold`,
                                        { color: selectedHalf === half ? '#fff' : '#94a3b8' }
                                    ]}>
                                        {half === 'first_half' ? '1H' : '2H'}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Minute */}
                    <View style={{ width: 100 }}>
                        <Text style={[tailwind`text-xs font-semibold mb-2 tracking-wide`, { color: '#64748b' }]}>MINUTE</Text>
                        <View style={[tailwind`flex-row items-center rounded-xl px-3`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', height: 44 }]}>
                            <TextInput
                                style={[tailwind`flex-1 text-center text-lg font-bold`, { color: '#f1f5f9', padding: 0 }]}
                                keyboardType="number-pad"
                                value={selectedMinute}
                                onChangeText={setSelectedMinute}
                                maxLength={3}
                                placeholder="--"
                                placeholderTextColor="#475569"
                            />
                            <Text style={{ color: '#475569', fontSize: 14 }}>'</Text>
                        </View>
                    </View>
                </View>

                {/* Team Selector */}
                <View style={tailwind`mb-5`}>
                    <Text style={[tailwind`text-xs font-semibold mb-2 tracking-wide`, { color: '#64748b' }]}>TEAM</Text>
                    <View style={tailwind`flex-row gap-2`}>
                        {[
                            { id: homeTeam.public_id, name: homeTeam.name },
                            { id: awayTeam.public_id, name: awayTeam.name },
                        ].map((team) => (
                            <Pressable
                                key={team.id}
                                onPress={() => {
                                    setTeamPublicID(team.id);
                                    setSelectedPlayerIn(null);
                                    setSelectedPlayerOut(null);
                                }}
                                style={[
                                    tailwind`flex-1 py-3 px-2 rounded-xl items-center`,
                                    teamPublicID === team.id
                                        ? { backgroundColor: '#f87171' }
                                        : { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' },
                                ]}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        tailwind`text-sm font-semibold`,
                                        { color: teamPublicID === team.id ? '#fff' : '#94a3b8' }
                                    ]}
                                >
                                    {team.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Player In Selector — tap to open modal */}
                <View style={tailwind`mb-5`}>
                    <Text style={[tailwind`text-xs font-semibold mb-2 tracking-wide`, { color: '#64748b' }]}>PLAYER IN ({playersIn?.length || 0} substitutes)</Text>

                    {error?.fields?.player_in_public_id && (
                        <View style={[tailwind`mb-2 px-3 py-2 rounded-lg`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                            <Text style={[tailwind`text-xs`, { color: '#fca5a5' }]}>{error.fields.player_in_public_id}</Text>
                        </View>
                    )}

                    {playersIn?.length === 0 ? (
                        <View style={[tailwind`p-4 rounded-xl items-center`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }]}>
                            <MaterialIcons name="person-off" size={28} color="#475569" />
                            <Text style={[tailwind`text-sm font-medium mt-2`, { color: '#94a3b8' }]}>No substitute players available</Text>
                            <Text style={[tailwind`text-xs mt-1`, { color: '#475569' }]}>Ensure the squad is set up properly</Text>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => {
                                setSearchText('');
                                setShowPlayerInModal(true);
                            }}
                            style={[
                                tailwind`flex-row items-center p-3 rounded-xl`,
                                {
                                    backgroundColor: '#0f172a',
                                    borderWidth: 1,
                                    borderColor: selectedPlayerIn ? '#4ade8050' : '#334155',
                                },
                            ]}
                        >
                            {selectedPlayerIn ? (
                                <>
                                    {selectedPlayerIn.player?.media_url ? (
                                        <Image source={{ uri: selectedPlayerIn.player.media_url }} style={tailwind`w-10 h-10 rounded-full mr-3`} />
                                    ) : (
                                        <View style={[tailwind`w-10 h-10 rounded-full mr-3 items-center justify-center`, { backgroundColor: '#4ade8020' }]}>
                                            <Text style={[tailwind`font-bold`, { color: '#4ade80' }]}>
                                                {selectedPlayerIn.player?.name?.charAt(0)?.toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={tailwind`flex-1`}>
                                        <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                                            {selectedPlayerIn.player?.name || selectedPlayerIn.player_name}
                                        </Text>
                                        <Text style={{ color: '#4ade80', fontSize: 11 }}>Substitute</Text>
                                    </View>
                                    <Pressable onPress={(e) => { e.stopPropagation(); setSelectedPlayerIn(null); }} hitSlop={8}>
                                        <MaterialIcons name="close" size={18} color="#475569" />
                                    </Pressable>
                                </>
                            ) : (
                                <>
                                    <View style={[tailwind`w-10 h-10 rounded-full mr-3 items-center justify-center`, { backgroundColor: '#1e293b' }]}>
                                        <MaterialIcons name="person-add" size={20} color="#4ade80" />
                                    </View>
                                    <Text style={[tailwind`flex-1 text-sm`, { color: '#475569' }]}>
                                        Tap to select player coming in ({playersIn.length})
                                    </Text>
                                    <MaterialIcons name="chevron-right" size={22} color="#475569" />
                                </>
                            )}
                        </Pressable>
                    )}
                </View>

                {/* Player Out Selector — tap to open modal */}
                <View style={tailwind`mb-5`}>
                    <Text style={[tailwind`text-xs font-semibold mb-2 tracking-wide`, { color: '#64748b' }]}>PLAYER OUT ({playersOut?.length || 0} active)</Text>

                    {error?.fields?.player_out_public_id && (
                        <View style={[tailwind`mb-2 px-3 py-2 rounded-lg`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                            <Text style={[tailwind`text-xs`, { color: '#fca5a5' }]}>{error.fields.player_out_public_id}</Text>
                        </View>
                    )}

                    {playersOut?.length === 0 ? (
                        <View style={[tailwind`p-4 rounded-xl items-center`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }]}>
                            <MaterialIcons name="person-off" size={28} color="#475569" />
                            <Text style={[tailwind`text-sm font-medium mt-2`, { color: '#94a3b8' }]}>No active players available</Text>
                            <Text style={[tailwind`text-xs mt-1`, { color: '#475569' }]}>Ensure the lineup is set up properly</Text>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => {
                                setSearchText('');
                                setShowPlayerOutModal(true);
                            }}
                            style={[
                                tailwind`flex-row items-center p-3 rounded-xl`,
                                {
                                    backgroundColor: '#0f172a',
                                    borderWidth: 1,
                                    borderColor: selectedPlayerOut ? '#f8717150' : '#334155',
                                },
                            ]}
                        >
                            {selectedPlayerOut ? (
                                <>
                                    {selectedPlayerOut.player?.media_url ? (
                                        <Image source={{ uri: selectedPlayerOut.player.media_url }} style={tailwind`w-10 h-10 rounded-full mr-3`} />
                                    ) : (
                                        <View style={[tailwind`w-10 h-10 rounded-full mr-3 items-center justify-center`, { backgroundColor: '#f8717120' }]}>
                                            <Text style={[tailwind`font-bold`, { color: '#f87171' }]}>
                                                {selectedPlayerOut.player?.name?.charAt(0)?.toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={tailwind`flex-1`}>
                                        <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                                            {selectedPlayerOut.player?.name || selectedPlayerOut.player_name}
                                        </Text>
                                        <Text style={{ color: '#f87171', fontSize: 11 }}>Active</Text>
                                    </View>
                                    <Pressable onPress={(e) => { e.stopPropagation(); setSelectedPlayerOut(null); }} hitSlop={8}>
                                        <MaterialIcons name="close" size={18} color="#475569" />
                                    </Pressable>
                                </>
                            ) : (
                                <>
                                    <View style={[tailwind`w-10 h-10 rounded-full mr-3 items-center justify-center`, { backgroundColor: '#1e293b' }]}>
                                        <MaterialIcons name="person-remove" size={20} color="#f87171" />
                                    </View>
                                    <Text style={[tailwind`flex-1 text-sm`, { color: '#475569' }]}>
                                        Tap to select player going out ({playersOut.length})
                                    </Text>
                                    <MaterialIcons name="chevron-right" size={22} color="#475569" />
                                </>
                            )}
                        </Pressable>
                    )}
                </View>

                {/* Description */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-xs font-semibold mb-2 tracking-wide`, { color: '#64748b' }]}>DESCRIPTION (OPTIONAL)</Text>
                    <TextInput
                        style={[tailwind`p-3 rounded-xl text-sm`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', minHeight: 70, textAlignVertical: 'top' }]}
                        placeholder="Add details about the substitution..."
                        placeholderTextColor="#334155"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
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
                    <View style={[tailwind`mb-5 rounded-2xl overflow-hidden`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                        <View style={[tailwind`px-4 py-3 flex-row items-center`, { backgroundColor: '#f8717110', borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                            <MaterialIcons name="swap-horiz" size={16} color="#f87171" />
                            <Text style={[tailwind`ml-2 text-xs font-bold tracking-wide`, { color: '#f87171' }]}>SUMMARY</Text>
                        </View>
                        <View style={tailwind`px-4 py-3`}>
                            <View style={tailwind`flex-row items-center mb-2`}>
                                <View style={[tailwind`w-6 h-6 rounded-full items-center justify-center mr-2`, { backgroundColor: '#4ade8020' }]}>
                                    <MaterialIcons name="arrow-upward" size={12} color="#4ade80" />
                                </View>
                                <Text style={[tailwind`text-sm font-semibold`, { color: '#4ade80' }]}>
                                    {selectedPlayerIn?.player?.name || selectedPlayerIn?.player_name}
                                </Text>
                            </View>
                            <View style={tailwind`flex-row items-center mb-2`}>
                                <View style={[tailwind`w-6 h-6 rounded-full items-center justify-center mr-2`, { backgroundColor: '#f8717120' }]}>
                                    <MaterialIcons name="arrow-downward" size={12} color="#f87171" />
                                </View>
                                <Text style={[tailwind`text-sm font-semibold`, { color: '#f87171' }]}>
                                    {selectedPlayerOut?.player?.name || selectedPlayerOut?.player_name}
                                </Text>
                            </View>
                            <View style={tailwind`flex-row items-center`}>
                                <Text style={{ color: '#64748b', fontSize: 11 }}>
                                    {teamName} - {selectedHalf === 'first_half' ? '1st Half' : '2nd Half'} - {selectedMinute}'
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Player In Selection Modal */}
            <Modal
                visible={showPlayerInModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPlayerInModal(false)}
            >
                <View style={tailwind`flex-1 justify-end bg-black/60`}>
                    <Pressable style={tailwind`flex-1`} onPress={() => setShowPlayerInModal(false)} />

                    <View style={[tailwind`rounded-t-3xl`, { backgroundColor: '#0f172a', minHeight: SCREEN_HEIGHT * 0.75 }]}>
                        {/* Modal Handle */}
                        <View style={tailwind`items-center pt-3 pb-1`}>
                            <View style={[tailwind`rounded-full`, { width: 36, height: 4, backgroundColor: '#334155' }]} />
                        </View>

                        {/* Modal Header */}
                        <View style={[tailwind`flex-row items-center justify-between px-4 pb-3`, { borderBottomWidth: 1, borderBottomColor: '#1e293b' }]}>
                            <View>
                                <Text style={[tailwind`text-base font-bold`, { color: '#f1f5f9' }]}>Select Player In</Text>
                                <Text style={{ color: '#4ade80', fontSize: 12 }}>{teamName} - {playersIn.length} substitutes</Text>
                            </View>
                            <Pressable
                                onPress={() => setShowPlayerInModal(false)}
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
                            {filteredPlayersIn.length === 0 ? (
                                <View style={tailwind`items-center py-10`}>
                                    <MaterialIcons name="person-search" size={48} color="#334155" />
                                    <Text style={[tailwind`mt-3 text-sm`, { color: '#475569' }]}>
                                        {searchText ? 'No players found' : 'No substitute players available'}
                                    </Text>
                                </View>
                            ) : (
                                filteredPlayersIn.map((item, index) => {
                                    const isSelected = selectedPlayerIn?.player?.public_id === item.player?.public_id;
                                    return (
                                        <Pressable
                                            key={item.player?.public_id || index}
                                            onPress={() => {
                                                setSelectedPlayerIn(item);
                                                setError({ ...error, fields: { ...error.fields, player_in_public_id: null } });
                                                setShowPlayerInModal(false);
                                            }}
                                            style={[
                                                tailwind`flex-row items-center py-3 px-3 mb-1 rounded-xl`,
                                                isSelected
                                                    ? { backgroundColor: '#4ade8015', borderWidth: 1, borderColor: '#4ade8030' }
                                                    : { backgroundColor: 'transparent' },
                                            ]}
                                        >
                                            {item.player?.media_url ? (
                                                <Image source={{ uri: item.player.media_url }} style={tailwind`w-11 h-11 rounded-full`} />
                                            ) : (
                                                <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center`, { backgroundColor: '#1e293b' }]}>
                                                    <Text style={[tailwind`font-bold`, { color: '#4ade80' }]}>
                                                        {item.player?.name?.charAt(0)?.toUpperCase()}
                                                    </Text>
                                                </View>
                                            )}
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
                                            {isSelected ? (
                                                <View style={[tailwind`w-6 h-6 rounded-full items-center justify-center`, { backgroundColor: '#4ade80' }]}>
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

            {/* Player Out Selection Modal */}
            <Modal
                visible={showPlayerOutModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPlayerOutModal(false)}
            >
                <View style={tailwind`flex-1 justify-end bg-black/60`}>
                    <Pressable style={tailwind`flex-1`} onPress={() => setShowPlayerOutModal(false)} />

                    <View style={[tailwind`rounded-t-3xl`, { backgroundColor: '#0f172a', minHeight: SCREEN_HEIGHT * 0.75 }]}>
                        {/* Modal Handle */}
                        <View style={tailwind`items-center pt-3 pb-1`}>
                            <View style={[tailwind`rounded-full`, { width: 36, height: 4, backgroundColor: '#334155' }]} />
                        </View>

                        {/* Modal Header */}
                        <View style={[tailwind`flex-row items-center justify-between px-4 pb-3`, { borderBottomWidth: 1, borderBottomColor: '#1e293b' }]}>
                            <View>
                                <Text style={[tailwind`text-base font-bold`, { color: '#f1f5f9' }]}>Select Player Out</Text>
                                <Text style={{ color: '#f87171', fontSize: 12 }}>{teamName} - {playersOut.length} active players</Text>
                            </View>
                            <Pressable
                                onPress={() => setShowPlayerOutModal(false)}
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
                            {filteredPlayersOut.length === 0 ? (
                                <View style={tailwind`items-center py-10`}>
                                    <MaterialIcons name="person-search" size={48} color="#334155" />
                                    <Text style={[tailwind`mt-3 text-sm`, { color: '#475569' }]}>
                                        {searchText ? 'No players found' : 'No active players available'}
                                    </Text>
                                </View>
                            ) : (
                                filteredPlayersOut.map((item, index) => {
                                    const isSelected = selectedPlayerOut?.player?.public_id === item.player?.public_id;
                                    return (
                                        <Pressable
                                            key={item.player?.public_id || index}
                                            onPress={() => {
                                                setSelectedPlayerOut(item);
                                                setError({ ...error, fields: { ...error.fields, player_out_public_id: null } });
                                                setShowPlayerOutModal(false);
                                            }}
                                            style={[
                                                tailwind`flex-row items-center py-3 px-3 mb-1 rounded-xl`,
                                                isSelected
                                                    ? { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }
                                                    : { backgroundColor: 'transparent' },
                                            ]}
                                        >
                                            {item.player?.media_url ? (
                                                <Image source={{ uri: item.player.media_url }} style={tailwind`w-11 h-11 rounded-full`} />
                                            ) : (
                                                <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center`, { backgroundColor: '#1e293b' }]}>
                                                    <Text style={[tailwind`font-bold`, { color: '#f87171' }]}>
                                                        {item.player?.name?.charAt(0)?.toUpperCase()}
                                                    </Text>
                                                </View>
                                            )}
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

export default SubstitutionIncidentForm;