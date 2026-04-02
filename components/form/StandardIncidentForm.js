import React, {useState, useRef, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../screen/axios_config';
import { BASE_URL } from '../../constants/ApiConstants';
import {View, Text, TextInput, Pressable, Image, ScrollView, Alert, ActivityIndicator, Platform, Modal, Dimensions} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../../context/WebSocketContext';
import { KeyboardAvoidingView } from 'native-base';
import { validateFootballIncidentForm } from '../../utils/validation/footballIncidentValidation';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const isMountedRef = useRef(true);
    const {wsRef} = useWebSocket();
    const game = useSelector((state) => state.sportReducers.game);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const formatIncidentType = (type) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const getIncidentIcon = (type) => {
        switch (type) {
            case 'goals': return 'sports-soccer';
            case 'yellow_card': return 'square';
            case 'red_card': return 'square';
            case 'penalty': return 'sports-soccer';
            default: return 'sports';
        }
    };

    const getIncidentColor = (type) => {
        switch (type) {
            case 'goals': return '#22c55e';
            case 'yellow_card': return '#eab308';
            case 'red_card': return '#ef4444';
            case 'penalty': return '#f87171';
            default: return '#f87171';
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

    const homeActivePlayers = getActivePlayers(homeSquad);
    const awayActivePlayers = getActivePlayers(awaySquad);
    const currentPlayers = teamPublicID === homeTeam.public_id ? homeActivePlayers : awayActivePlayers;
    const filteredPlayers = currentPlayers.filter(p =>
        p.player?.name?.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleAddIncident = async () => {
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
                    setError({ global: "Please fix the errors below", fields: validation.errors });
                }
                return;
            }

            const data = {
                "match_public_id": match?.public_id,
                "team_public_id": teamPublicID,
                "tournament_public_id": tournament?.public_id,
                "player_public_id": selectedPlayer?.player?.public_id || selectedPlayer?.public_id,
                "periods": selectedHalf,
                "incident_type": incidentType,
                "incident_time": parseInt(selectedMinute),
                "description": description || `${formatIncidentType(incidentType)} by ${selectedPlayer?.player?.name || selectedPlayer?.name}`,
                "penalty_shootout_scored": false,
            };

            const authToken = await AsyncStorage.getItem("AccessToken");
            if (!authToken) throw new Error("Authentication required");

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
            setError({
                global: "Unable to add football incident",
                fields: err?.response?.data?.error?.fields || {}
            })
            console.log("Unable to add football incident: ", err)
        } finally {
            setLoading(false);
        }
    };

    const incidentColor = getIncidentColor(incidentType);
    const teamName = teamPublicID === homeTeam?.public_id ? homeTeam?.name : awayTeam?.name;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[tailwind`flex-1 w-full`, { backgroundColor: "#020617" }]}
        >
            <ScrollView
                contentContainerStyle={tailwind`p-4 pb-10`}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
            >
                {/* Incident Type Header */}
                <View style={[tailwind`flex-row items-center mb-5 p-4 rounded-2xl`, { backgroundColor: incidentColor + '15', borderWidth: 1, borderColor: incidentColor + '30' }]}>
                    <View style={[tailwind`w-10 h-10 rounded-full items-center justify-center mr-3`, { backgroundColor: incidentColor + '25' }]}>
                        <MaterialIcons name={getIncidentIcon(incidentType)} size={22} color={incidentColor} />
                    </View>
                    <View style={tailwind`flex-1`}>
                        <Text style={[tailwind`text-base font-bold`, { color: incidentColor }]}>
                            {formatIncidentType(incidentType)}
                        </Text>
                        <Text style={{ color: '#64748b', fontSize: 12 }}>
                            {match?.homeTeam?.name || homeTeam?.name} vs {match?.awayTeam?.name || awayTeam?.name}
                        </Text>
                    </View>
                </View>

                {/* Global Error Banner */}
                {error?.global && (
                    <View style={[tailwind`mb-4 rounded-xl p-3 flex-row items-center`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                        <MaterialIcons name="error-outline" size={18} color="#f87171" />
                        <Text style={[tailwind`flex-1 ml-2 text-sm`, { color: '#fca5a5' }]}>{error.global}</Text>
                        <Pressable onPress={() => setError({ global: null, fields: {} })}>
                            <MaterialIcons name="close" size={18} color="#f87171" />
                        </Pressable>
                    </View>
                )}

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
                                    setSelectedPlayer(null);
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

                {/* Player Selector — tap to open modal */}
                <View style={tailwind`mb-5`}>
                    <Text style={[tailwind`text-xs font-semibold mb-2 tracking-wide`, { color: '#64748b' }]}>PLAYER</Text>

                    {error?.fields?.player_public_id && (
                        <View style={[tailwind`mb-2 px-3 py-2 rounded-lg`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                            <Text style={[tailwind`text-xs`, { color: '#fca5a5' }]}>{error.fields.player_public_id}</Text>
                        </View>
                    )}

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
                </View>

                {/* Description */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-xs font-semibold mb-2 tracking-wide`, { color: '#64748b' }]}>DESCRIPTION (OPTIONAL)</Text>
                    <TextInput
                        style={[tailwind`p-3 rounded-xl text-sm`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', minHeight: 70, textAlignVertical: 'top' }]}
                        placeholder={`Add details...`}
                        placeholderTextColor="#334155"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Submit Button */}
                <Pressable
                    style={[
                        tailwind`p-4 rounded-xl flex-row items-center justify-center`,
                        loading || currentPlayers?.length === 0 || !selectedPlayer
                            ? { backgroundColor: '#334155' }
                            : { backgroundColor: '#f87171' },
                    ]}
                    onPress={() => handleAddIncident()}
                    disabled={loading || currentPlayers?.length === 0 || !selectedPlayer}
                >
                    {loading ? (
                        <>
                            <ActivityIndicator size="small" color="white" />
                            <Text style={tailwind`text-white font-semibold text-base ml-2`}>Recording...</Text>
                        </>
                    ) : (
                        <>
                            <MaterialIcons name="check-circle" size={22} color="white" />
                            <Text style={tailwind`text-white font-semibold text-base ml-2`}>
                                Record {formatIncidentType(incidentType)}
                            </Text>
                        </>
                    )}
                </Pressable>
            </ScrollView>

            {/* Player Selection Modal */}
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

export default StandardIncidentForm;
