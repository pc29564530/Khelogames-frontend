import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Modal, ActivityIndicator, FlatList } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import AddFootballModalIncident from '../components/AddFootballModalIncidents';
import IncidentCheck from '../components/IncidentsCheck';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolation, useSharedValue } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { getFootballIncidents } from '../redux/actions/actions';
import { useSelector, useDispatch } from 'react-redux';

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
first_half: { label: "FIRST HALF", style: "bg-green-100 text-green-800" },
half_time: { label: "HALF TIME", style: "bg-gray-100 text-gray-800" },
second_half: { label: "SECOND HALF", style: "bg-blue-100 text-blue-800" },
extra_half_time: { label: "EXTRA TIME", style: "bg-orange-100 text-orange-800" },
penalty_shootout: { label: "PENALTY SHOOTOUT", style: "bg-yellow-100 text-yellow-800" },
full_time: { label: "FULL TIME", style: "bg-red-100 text-red-800" },
};

const dummyIncidents = [
    // First half goal by Raya Club
    {
      id: 1,
      public_id: "11111111-1111-1111-1111-111111111111",
      match_id: 1,
      team_id: 1, // Raya Club
      periods: "first_half",
      incident_type: "goal",
      incident_time: 12,
      description: "Striker scored a goal",
      penalty_shootout_scored: false,
      player: { name: "Raya Striker" },
      home_score: { goals: 1 },
      away_score: { goals: 0 }
    },
  
    // First half yellow card for Mathura Club
    {
      id: 2,
      public_id: "22222222-2222-2222-2222-222222222222",
      match_id: 1,
      team_id: 2, // Mathura Club
      periods: "first_half",
      incident_type: "yellow_card",
      incident_time: 28,
      description: "Foul by defender",
      penalty_shootout_scored: false,
      player: { name: "Mathura Defender" }
    },
  
    // Substitution for Raya Club
    {
      id: 3,
      public_id: "33333333-3333-3333-3333-333333333333",
      match_id: 1,
      team_id: 1,
      periods: "second_half",
      incident_type: "substitutions",
      incident_time: 55,
      description: "Midfielder substituted",
      penalty_shootout_scored: false,
      player_in: { name: "Fresh Midfielder" },
      player_out: { name: "Tired Midfielder" }
    },
  
    // Second half goal for Mathura Club
    {
      id: 4,
      public_id: "44444444-4444-4444-4444-444444444444",
      match_id: 1,
      team_id: 2,
      periods: "second_half",
      incident_type: "goal",
      incident_time: 78,
      description: "Forward equalizer",
      penalty_shootout_scored: false,
      player: { name: "Mathura Forward" },
      home_score: { goals: 1 },
      away_score: { goals: 1 }
    },

  
    // Penalty shootout kick 1 (Home scored)
    {
      id: 5,
      public_id: "66666666-6666-6666-6666-666666666666",
      match_id: 1,
      team_id: 1,
      periods: "penalty_shootout",
      incident_type: "penalty_shootout",
      incident_time: 91,
      description: "Captain scored",
      penalty_shootout_scored: true,
      player: { name: "Raya Captain" },
      home_score: { goals: 2 },
      away_score: { goals: 1 }
    },
  
    // Penalty shootout kick 2 (Away missed)
    {
      id: 6,
      public_id: "77777777-7777-7777-7777-777777777777",
      match_id: 1,
      team_id: 2,
      periods: "penalty_shootout",
      incident_type: "penalty_shootout",
      incident_time: 92,
      description: "Captain missed",
      penalty_shootout_scored: false,
      player: { name: "Mathura Captain" },
      home_score: { goals: 2 },
      away_score: { goals: 1 }
    },
  
    // Penalty shootout kick 3 (Home scored)
    {
      id: 7,
      public_id: "88888888-8888-8888-8888-888888888888",
      match_id: 1,
      team_id: 1,
      periods: "penalty_shootout",
      incident_type: "penalty_shootout",
      incident_time: 93,
      description: "Winger scored",
      penalty_shootout_scored: true,
      player: { name: "Raya Winger" },
      home_score: { goals: 3 },
      away_score: { goals: 1 }
    }
  ];
  


const PenaltyShootOutIncident = ({key, item, match}) => {
    return(
        <View key={key} style={tailwind`p-2 bg-white`}>
            {item.team_id === match.homeTeam.id ? (
                    <View style={tailwind`flex-row justify-start gap-2 items-center`}>
                        <Text style={tailwind`text-md`}>{item.penalty_shootout_scored ? '⚽' : '🚫'}</Text>
                        <Text style={tailwind`h-10 w-0.2 bg-gray-400`} />
                        <Text style={tailwind`text-md`}>{item.player.name}</Text>
                        <View style={tailwind`rounded-lg bg-gray-200 p-1`}>
                            <Text style={tailwind`text-lg font-bold`}>{item.home_score.goals} - {item.away_score.goals}</Text>
                        </View>
                    </View>
            ) : (
                    <View style={tailwind`flex-row justify-end gap-2 ml-40 items-center`}>
                        <View style={tailwind`rounded-lg bg-gray-200 p-1`}>
                            <Text style={tailwind`text-lg font-bold`}>{item.home_score.goals} - {item.away_score.goals}</Text>
                        </View>
                        <Text style={tailwind`text-md`}>{item.player.name}</Text>
                        <Text style={tailwind`h-10 w-0.2 bg-gray-400`} />
                        <Text style={tailwind`text-md`}>{item.penalty_shootout_scored ? '⚽' : '🚫'}</Text>
                    </View>
            )}
            
        </View>
    );
}

const FootballIncidents = ({ item, parentScrollY, headerHeight, collapsedHeight }) => {
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
                setAwaySquad(response.data || [])
            } catch (err) {
                console.error("failed to fetch football lineup: ", err);
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
                setAwaySquad(response.data || [])
            } catch (err) {
                console.error("failed to fetch football lineup: ", err);
            }
        }
        fetchHSquad();
        fetchASquad();
    }, [])


    useEffect(() => {
        const fetchPlayersAndIncidents = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const homeResponse = await axiosInstance.get(`${BASE_URL}/football/getTeamsMemberFunc/${match.homeTeam.public_id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                });
                setHomePlayer(homeResponse.data || []);

                const awayResponse = await axiosInstance.get(`${BASE_URL}/football/getTeamsMemberFunc/${match.awayTeam.public_id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                });
                setAwayPlayer(awayResponse.data || []);

                const incidentsResponse = await axiosInstance.get(`${BASE_URL}/football/getFootballIncidents/${match.public_id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                });
                const item = incidentsResponse.data[1].incidents;
                if(item){
                    dispatch(getFootballIncidents(item));
                } else {
                    dispatch(getFootballIncidents([]));
                }
            } catch (err) {
                console.error("Unable to fetch data: ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayersAndIncidents();
    }, []);

    // useEffect(() => {
    //     setLoading(true)
    //     setIncidents(dummyIncidents); // use dummy data
    //     setLoading(false);
    //   }, []);
      
    const groupIncidents = useMemo(() => {
        if(!incidents){
            return [];
        }
        const sorted = [...incidents]?.sort((a,b) => {
            if(a.periods === b.periods) {
                return b.incident_time - a.incident_time;
            }
            return PERIOD_ORDER.indexOf(b.periods) - PERIOD_ORDER.indexOf(a.periods);
        } )
        const groups = {};
        sorted.forEach((inc) => {
            let targetPeriod = inc.periods;
            if (inc.periods === "first_half") {
                targetPeriod = "half_time"; // move to half time
            } else if (inc.periods === "second_half") {
                targetPeriod = "full_time"; // move to full time
            }
          if (!groups[targetPeriod]) groups[targetPeriod] = [];
          groups[targetPeriod].push(inc);
        });
    
        return PERIOD_ORDER.filter((p) => groups[p]).map((period) => ({
          type: "header",
          period,
          data: groups[period],
        }));
    });

    const handleIncidentModal = () => {
        setIncidentModalVisible(true);
    }

    return (
        <View style={tailwind`flex-1`}>
            {groupIncidents.length === 0 ? (
                <View style={tailwind`px-2 py-2`}>
                    <Pressable 
                            onPress={() => handleIncidentModal()} 
                            style={tailwind`bg-white rounded-xl shadow-sm border border-gray-100 p-2 items-center mb-4`}
                        >
                            <View style={tailwind`flex-row`}>
                            <MaterialIcons name="add" size={24} color="#ef4444" />
                            <Text style={tailwind`text-gray-700 text-lg font-semibold ml-2`}>
                                Add Incident
                            </Text>
                            </View>
                        </Pressable>
                    <View style={tailwind`items-center`}>
                        <Text style={tailwind`text-gray-500 text-md`}>No incidents yet</Text>
                    </View>
                </View>
            ):(
                <Animated.FlatList 
                    data = {groupIncidents}
                    keyExtractor={(item, index) => item.period + index}
                    renderItem={({item}) => {
                        if(item.period === "penalty_shootout"){
                            return (
                                <Animated.View style={[tailwind`mb-4`, contentStyle]}>
                                <View style={tailwind`items-center mb-4`}>
                                    <View style={tailwind`bg-yellow-100 px-3 py-3 rounded-full`}>
                                    <Text style={tailwind`text-yellow-800 font-bold text-md`}>
                                        {PERIOD_LABELS[item.period].label}
                                    </Text>
                                    </View>
                                </View>
                        
                                <View style={tailwind`bg-white rounded-xl shadow-sm border border-gray-100 p-2`}>
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
                                    <View style={tailwind`${PERIOD_LABELS[item.period].style} px-2 py-3 rounded-full`}>
                                    <Text style={tailwind`font-bold text-md`}>
                                        {PERIOD_LABELS[item.period].label}
                                    </Text>
                                    </View>
                                </View>

                                <View style={tailwind`bg-white rounded-xl shadow-sm border border-gray-100 p-2`}>
                                    {item.data.map((incident, index) => (
                                    <IncidentCheck key={index} incident={[incident]} matchData={match} />
                                    ))}
                                </View>
                                </Animated.View>
                        );
                    }}
                    style={tailwind`flex-1 bg-gray-50`}
                    onScroll={handlerScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop: 20,
                        paddingBottom: 100,
                        paddingHorizontal: 16
                    }}
                    ListHeaderComponent={
                        <Pressable 
                            onPress={() => setIncidentModalVisible(true)} 
                            style={tailwind`bg-white rounded-xl shadow-sm border border-gray-100 p-2 items-center mb-4`}
                        >
                            <View style={tailwind`flex-row`}>
                            <MaterialIcons name="add" size={24} color="#ef4444" />
                            <Text style={tailwind`text-gray-700 text-lg font-semibold ml-2`}>
                                Add Incident
                            </Text>
                            </View>
                        </Pressable>
                    }
                />
            )}
            {incidentModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={incidentModalVisible}
                    onRequestClose={() => setIncidentModalVisible(false)}
                >
                    <Pressable onPress={() => setIncidentModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-t-lg p-8`}>
                            <AddFootballModalIncident 
                                match={match} 
                                awayPlayer={awayPlayer} 
                                homePlayer={homePlayer} 
                                awayTeam={match.awayTeam} 
                                homeTeam={match.homeTeam}
                                awaySquad={awaySquad}
                                homeSquad={homeSquad}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}

export default FootballIncidents;