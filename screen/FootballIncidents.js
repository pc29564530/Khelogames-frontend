import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Modal, ActivityIndicator, FlatList } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import AddFootballModalIncident from '../components/AddFootballModalIncidents';
import IncidentCheck from '../components/IncidentsCheck';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolation, useSharedValue } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { addFootballIncidents, addFootballMatchScore, setFootballScore, getFootballIncidents } from '../redux/actions/actions';
import { useSelector, useDispatch } from 'react-redux';
import { useWebSocket } from '../context/WebSocketContext';

// change the code so that when no incident is done it does not show the header

const PERIOD_ORDER = [
    "penalty_shootout",
    "extra_half_time",
    "full_time",
    "second_half",
    "half_time",
    "first_half"
];

const PERIOD_LABELS = {
    first_half: { label: "FIRST HALF", bg: '#10b98120', text: '#4ade80' },
    half_time: { label: "HALF TIME", bg: '#33415540', text: '#94a3b8' },
    second_half: { label: "SECOND HALF", bg: '#3b82f620', text: '#60a5fa' },
    extra_half_time: { label: "EXTRA TIME", bg: '#f59e0b20', text: '#fbbf24' },
    penalty_shootout: { label: "PENALTY SHOOTOUT", bg: '#eab30820', text: '#fbbf24' },
    full_time: { label: "FULL TIME", bg: '#f8717120', text: '#f87171' },
};

const PenaltyShootOutIncident = ({key, item, match}) => {
    return(
        <View key={key} style={[tailwind`p-2`, { backgroundColor: '#1e293b' }]}>
            {item.team_id === match.homeTeam.id ? (
                    <View style={tailwind`flex-row justify-start gap-2 items-center`}>
                        <Text style={tailwind`text-md`}>{item.penalty_shootout_scored ? '⚽' : '🚫'}</Text>
                        <View style={[tailwind`h-10`, { width: 1, backgroundColor: '#475569' }]} />
                        <Text style={[tailwind`text-md`, { color: '#f1f5f9' }]}>{item.player.name}</Text>
                        <View style={[tailwind`rounded-lg p-1`, { backgroundColor: '#0f172a' }]}>
                            <Text style={[tailwind`text-lg font-bold`, { color: '#f1f5f9' }]}>{item.homeScore?.penalty_shootout_goals} - {item.awayScore?.penalty_shootout_goals}</Text>
                        </View>
                    </View>
            ) : (
                    <View style={tailwind`flex-row justify-end gap-2 ml-40 items-center`}>
                        <View style={[tailwind`rounded-lg p-1`, { backgroundColor: '#0f172a' }]}>
                            <Text style={[tailwind`text-lg font-bold`, { color: '#f1f5f9' }]}>{item.homeScore?.penalty_shootout_goals} - {item.awayScore?.penalty_shootout_goals}</Text>
                        </View>
                        <Text style={[tailwind`text-md`, { color: '#f1f5f9' }]}>{item.player.name}</Text>
                        <View style={[tailwind`h-10`, { width: 1, backgroundColor: '#475569' }]} />
                        <Text style={tailwind`text-md`}>{item.penalty_shootout_scored ? '⚽' : '🚫'}</Text>
                    </View>
            )}

        </View>
    );
}

const FootballIncidents = ({tournament, item, permissions, parentScrollY, headerHeight, collapsedHeight }) => {
    const match = item;
    const dispatch = useDispatch()
    const incidents = useSelector(state => state.footballIncidents.incidents)
    const game = useSelector(state => state.sportReducers.game)
    const [incidentModalVisible, setIncidentModalVisible] = useState(false);
    const [homePlayer, setHomePlayer] = useState([]);
    const [awayPlayer, setAwayPlayer] = useState([]);
    const [homeSquad, setHomeSquad] = useState([]);
    const [awaySquad, setAwaySquad] = useState([]);
    const [penaltyH, setPenaltyH] = useState([]);
    const [penaltyA, setPenaltyA] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const {wsRef, subscribe} = useWebSocket()

    const currentScrollY = useSharedValue(0);
    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeight){
                parentScrollY.value = currentScrollY.value
            } else {
                parentScrollY.value = event.contentOffset.y
            }
        }
    })

    // Content animation style
    const contentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            parentScrollY.value,
            [0, 50],
            [1, 1],
            Extrapolation.CLAMP
        );

        return {
            opacity
        };
    });

    useEffect(() => {
        const fetchHSquad = async () => {
            try {
                setLoading(true);
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballMatchSquad`, {
                    params: {
                        'match_public_id':match.public_id.toString(),
                        'team_public_id': match.homeTeam.public_id.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                const item = response.data;
                setHomeSquad(item.data || [])
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields;
                setError({
                    global: "Unable to get match lineup",
                    fields: backendError,
                })
                console.error("failed to fetch football lineup for home incident: ", err);
            } finally {
                setLoading(false);
            }
        }
        const fetchASquad = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballMatchSquad`, {
                    params: {
                        'match_public_id':match.public_id.toString(),
                        'team_public_id': match.awayTeam.public_id.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                const item = response.data;
                setAwaySquad(item.data || [])
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields;
                setError({
                    global: "Unable to get match lineup",
                    fields: backendError,
                });
                console.error("failed to fetch football lineup for away incident: ", err);
            } finally {
                setLoading(false);
            }
        }
        fetchHSquad();
        fetchASquad();
    }, [match.public_id])


    useEffect(() => {
        const fetchPlayersAndIncidents = async () => {
            try {
                setLoading(true);
                setError({
                    global: null,
                    fields: {},
                })
                const authToken = await AsyncStorage.getItem('AccessToken');
                const homeResponse = await axiosInstance.get(`${BASE_URL}/football/getTeamsMemberFunc/${match.homeTeam.public_id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                });
                setHomePlayer(homeResponse.data.data || []);

                const awayResponse = await axiosInstance.get(`${BASE_URL}/football/getTeamsMemberFunc/${match.awayTeam.public_id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                });
                setAwayPlayer(awayResponse.data.data || []);

                const incidentsResponse = await axiosInstance.get(`${BASE_URL}/football/getFootballIncidents/${match.public_id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                });
                const item = incidentsResponse.data.data[1].incidents;
                if(item){
                    dispatch(getFootballIncidents(item));
                } else {
                    dispatch(getFootballIncidents([]));
                }
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields;
                setError({
                    global: "Unable to get match indcident",
                    fields: backendError,
                })
                console.error("Unable to get match incidents: ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayersAndIncidents();
    }, [match, dispatch]);

    // useEffect(() => {
    //     setLoading(true)
    //     setIncidents(dummyIncidents); // use dummy data
    //     setLoading(false);
    //   }, []);

    const groupIncidents = useMemo(() => {
        if (!incidents || incidents.length === 0) return [];

        const matchStatus = match?.status_code || '';

        // Sort: PERIOD_ORDER priority → incident_time desc → id desc
        const sorted = [...incidents].sort((a, b) => {
            const periodDiff = PERIOD_ORDER.indexOf(b.periods) - PERIOD_ORDER.indexOf(a.periods);
            if (periodDiff !== 0) return periodDiff;
            const timeDiff = b.incident_time - a.incident_time;
            if (timeDiff !== 0) return timeDiff;
            return b.id - a.id;
        });

        // Bucket each incident into its display period
        const buckets = {};
        sorted.forEach((inc) => {
            let bucket;
            if (inc.periods === 'first_half') {
                bucket = matchStatus === 'first_half' ? 'first_half' : 'half_time';
            } else if (inc.periods === 'second_half') {
                bucket = matchStatus === 'second_half' ? 'second_half' : 'full_time';
            } else {
                bucket = inc.periods;
            }
            if (!buckets[bucket]) buckets[bucket] = [];
            buckets[bucket].push(inc);
        });

        // Determine section headers — most recent period at top, first_half at bottom
        let sections = [];
        switch (matchStatus) {
            case 'first_half':
                sections = ['first_half'];
                break;
            case 'half_time':
                sections = ['half_time'];
                break;
            case 'second_half':
                sections = ['second_half', 'half_time'];
                break;
            case 'full_time':
            case 'finished':
                sections = ['full_time', 'half_time'];
                if (buckets['extra_half_time']) sections.unshift('extra_half_time');
                if (buckets['penalty_shootout']) sections.unshift('penalty_shootout');
                break;
            case 'extra_half_time':
                sections = ['extra_half_time', 'full_time', 'half_time'];
                if (buckets['penalty_shootout']) sections.unshift('penalty_shootout');
                break;
            case 'penalty_shootout':
                sections = ['penalty_shootout', 'extra_half_time', 'full_time', 'half_time'];
                break;
            default: {
                // Infer phase from which incident periods are present
                const hasFH = incidents.some(i => i.periods === 'first_half');
                const hasSH = incidents.some(i => i.periods === 'second_half');
                const hasET = incidents.some(i => i.periods === 'extra_half_time');
                const hasPS = incidents.some(i => i.periods === 'penalty_shootout');

                if (hasPS)       sections = ['penalty_shootout', 'extra_half_time', 'full_time', 'half_time'];
                else if (hasET)  sections = ['extra_half_time', 'full_time', 'half_time'];
                else if (hasSH)  sections = ['full_time', 'half_time'];
                else if (hasFH)  sections = ['half_time'];
                else             return [];
                break;
            }
        }

        return sections.map(period => ({
            type: 'header',
            period,
            data: buckets[period] || [],
        }));
    }, [incidents, match]);

    const handleIncidentModal = () => {
        setIncidentModalVisible(true);
    }

     const handleWebSocketMessage = useCallback((event) => {
        const rawData = event.data;
        if (!rawData) {
            console.error("Raw data is undefined");
            return;
        }

        try {
            const message = JSON.parse(rawData);
            switch(message.type) {
                case "ADD_FOOTBALL_INCIDENT":
                    dispatch(addFootballIncidents(message.payload));
                    break;
                default:
                    console.log("Unhandled message type:", message.type);
            }
        } catch (err) {
            console.error("Error parsing WebSocket message for football incident:", err);
        }
    }, [dispatch]);

    useEffect(() => {
        console.log("Football - Subscribing to WebSocket messages");
        const unsubscribe = subscribe(handleWebSocketMessage);
        return unsubscribe;
    }, [handleWebSocketMessage, subscribe])



    return (
        <View style={[tailwind`flex-1`, { backgroundColor: '#0f172a' }]}>
            {/* Add Incident Button */}
            {match.status_code === "in_progress" && permissions?.can_edit && (
                <Pressable
                    onPress={handleIncidentModal}
                    style={({ pressed }) => [
                        tailwind`rounded-xl p-4 flex-row items-center justify-center m-4`,
                        { backgroundColor: pressed ? '#dc2626' : '#f87171' },
                    ]}
                >
                    <MaterialIcons name="add" size={22} color="white" />
                    <Text style={tailwind`text-white text-base font-semibold ml-2`}>
                        Add Incident
                    </Text>
                </Pressable>
            )}
            {groupIncidents.length === 0 ? (
               <View style={[tailwind`px-4 py-4 flex-1`, { backgroundColor: '#0f172a' }]}>
                    {/* Empty State */}
                    <View style={tailwind`flex-1 justify-center items-center mt-10`}>
                        <MaterialIcons name="sports-soccer" size={64} color="#475569" />
                        <Text style={[tailwind`text-lg font-medium mt-4`, { color: '#64748b' }]}>
                        No Incidents Yet
                        </Text>
                        <Text style={[tailwind`text-sm mt-1 text-center px-10`, { color: '#475569' }]}>
                        Tap the button above to add a new match incident.
                        </Text>
                    </View>
                </View>
            ):(
                <Animated.FlatList
                    data = {groupIncidents}
                    keyExtractor={(item, index) => item.period + index}
                    renderItem={({item}) => {
                        const periodConfig = PERIOD_LABELS[item.period];
                        if(item.period === "penalty_shootout"){
                            return (
                                <Animated.View style={[tailwind`mb-4`, contentStyle]}>
                                <View style={tailwind`items-center mb-4`}>
                                    <View style={[tailwind`px-3 py-3 rounded-full`, { backgroundColor: periodConfig.bg }]}>
                                    <Text style={[tailwind`font-bold text-md`, { color: periodConfig.text }]}>
                                        {periodConfig.label}
                                    </Text>
                                    </View>
                                </View>

                                <View style={[tailwind`rounded-xl overflow-hidden`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                                    {item.data.map((incident, index) => (
                                    <PenaltyShootOutIncident key={index} item={incident} match={match} />
                                    ))}
                                </View>
                                </Animated.View>
                            );
                        }

                        // Normal incidents (first_half, second_half, etc.)
                        return (
                                <Animated.View style={[tailwind`mb-4`, contentStyle]}>
                                <View style={tailwind`items-center mb-4`}>
                                    <View style={[tailwind`px-3 py-3 rounded-full`, { backgroundColor: periodConfig.bg }]}>
                                    <Text style={[tailwind`font-bold text-md`, { color: periodConfig.text }]}>
                                        {periodConfig.label}
                                    </Text>
                                    </View>
                                </View>

                                <View style={[tailwind`rounded-xl overflow-hidden`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                                    {item.data.map((incident, index) => (
                                    <IncidentCheck key={index} incident={incident} matchData={match} />
                                    ))}
                                </View>
                                </Animated.View>
                        );
                    }}
                    style={[tailwind`flex-1`, { backgroundColor: '#0f172a' }]}
                    onScroll={handlerScroll}
                    scrollEventThrottle={16}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop: 20,
                        paddingBottom: 100,
                        paddingHorizontal: 16
                    }}
                />
            )}
            {incidentModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={incidentModalVisible}
                    onRequestClose={() => setIncidentModalVisible(false)}
                >
                    <View style={tailwind`flex-1 bg-black/50 justify-end`}>
                    <Pressable
                        style={tailwind`flex-1`}
                        onPress={() => setIncidentModalVisible(false)}
                    />
                    <View style={[tailwind`rounded-t-2xl p-8 max-h-[80%]`, { backgroundColor: '#1e293b' }]}>
                            <AddFootballModalIncident
                                tournament={tournament}
                                match={match}
                                awayPlayer={awayPlayer}
                                homePlayer={homePlayer}
                                awayTeam={match.awayTeam}
                                homeTeam={match.homeTeam}
                                awaySquad={awaySquad}
                                homeSquad={homeSquad}
                                setIncidentModalVisible={setIncidentModalVisible}
                            />
                    </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

export default FootballIncidents;