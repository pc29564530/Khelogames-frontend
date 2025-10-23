import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, Image, ScrollView} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../screen/axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { useDispatch } from 'react-redux';

const AddFootballShootout = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam, selectedIncident, homeSquad, awaySquad}) => {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [goalScore, setGoalScore] = useState(false);
    const [teamID, setTeamID] = useState(homeTeam.public_id);
    const [description, setDescription] = useState('');
    const axiosInstance = axiosInstance()
    const dispatch = useDispatch();
    
    const handleAddShootout = async () => {
        try {
            const data = {
                "match_public_id":matchData.public_id,
                "team_public_id":teamID,
                "periods":'',
                "incident_type":selectedIncident,
                "incident_time":0,
                "player_public_id":selectedPlayer.public_id,
                "description":'',
                "penalty_shootout_scored":goalScore
            }
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.post(`${BASE_URL}/football/addFootballIncidents`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            console.log(response.data)
        } catch (err) {
            console.error("unable to add the football penalty shootout: ", err)
        }
    }

    const formatIncidentType = (type) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    const handleWebSocketMessage = useCallback((event) => {
        const rawData = event.data;
        if(rawData === null || !rawData){
            console.error("raw data is undefined");
            return;
        }

        const message = JSON.parse(rawData);
        if(message.type === "UPDATE_FOOTBALL_PENALTY_SHOOTOUT") {
            dispatch(message.payload)
        }
    }, [])

    useEffect(() => {
        if(!wsRef.current) {
            return
        }
        wsRef.current.onmessage = handleWebSocketMessage
    }, [handleWebSocketMessage])

    return (
        <ScrollView contentContainerStyle={tailwind`p-5 bg-gray-100 min-h-full bg-white`}>
            {/* Header Section */}
            <Text style={tailwind`text-xl font-bold text-gray-800 mb-5`}>Add Football {formatIncidentType(selectedIncident)}</Text>
            {/* Team Selector */}
            <View style={tailwind`mb-6`}>
                <Text style={tailwind`text-lg font-semibold mb-2`}>Select Team:</Text>
                <View style={tailwind`flex-row justify-between`}>
                    <Pressable 
                        style={[tailwind`p-4 flex-1 rounded-lg mr-3`, teamID === homeTeam.public_id ? tailwind`bg-red-400` : tailwind`bg-gray-200`]}
                        onPress={() => setTeamID(homeTeam.public_id)}
                    >
                        <Text style={tailwind`text-white font-semibold text-center`}>{homeTeam.name}</Text>
                    </Pressable>
                    <Pressable 
                        style={[tailwind`p-4 flex-1 rounded-lg`, teamID === awayTeam.public_id ? tailwind`bg-red-400` : tailwind`bg-gray-200`]}
                        onPress={() => setTeamID(awayTeam.public_id)}
                    >
                        <Text style={tailwind`text-white font-semibold text-center`}>{awayTeam.name}</Text>
                    </Pressable>
                </View>
            </View>

            {/* Player Selector */}
            <View style={tailwind`mb-6`}>
                <Text style={tailwind`text-lg font-semibold mb-2`}>Select Player:</Text>
                <Dropdown
                    style={tailwind`p-4 bg-white border border-gray-200`}
                    options={teamID === homeTeam.public_id ? homeSquad.filter(player => player.is_substitute === false) : awaySquad.filter(player => player.is_substitute === false)}
                    onSelect={(index, item) => setSelectedPlayer(item)}
                    renderRow={(item) => (
                        <View style={tailwind`flex-row items-center p-3 border-b border-gray-100`}>
                            <Image
                                src={{uri: item.media_url}}
                                style={tailwind`rounded-full h-12 w-12 mr-3 bg-yellow-300`}
                                resizeMode="cover"
                            />
                            <Text style={tailwind`text-lg font-semibold text-gray-700`}>{item.player_name}</Text>
                        </View>
                    )}
                >
                    <View style={tailwind`flex-row items-center justify-between p-3 border rounded-md bg-gray-50`}>
                        <Text style={tailwind`text-lg font-medium text-gray-700`}>
                            {selectedPlayer ? selectedPlayer.player_name : 'Select player'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
                    </View>
                </Dropdown>
            </View>

            <View style={tailwind`mb-6`}>
                <Text style={tailwind`text-xl font-bold text-gray-800 mb-4`}>Goal Scored?</Text>

                <View style={tailwind`flex-row justify-between gap-4`}>
                    <Pressable
                    onPress={() => setGoalScore(true)}
                    style={[
                        tailwind`flex-1 px-4 py-3 rounded-2xl border shadow-md items-center`,
                        goalScore === true
                        ? tailwind`bg-green-600 border-green-700`
                        : tailwind`bg-white border-gray-300`,
                    ]}
                    >
                    <Text style={goalScore === true
                        ? tailwind`text-white text-lg font-semibold`
                        : tailwind`text-gray-800 text-lg font-medium`}>
                        ✅ Yes
                    </Text>
                    </Pressable>

                    <Pressable
                    onPress={() => setGoalScore(false)}
                    style={[
                        tailwind`flex-1 px-4 py-3 rounded-2xl border shadow-md items-center`,
                        goalScore === false
                        ? tailwind`bg-red-600 border-red-700`
                        : tailwind`bg-white border-gray-300`,
                    ]}
                    >
                    <Text style={goalScore === false
                        ? tailwind`text-white text-lg font-semibold`
                        : tailwind`text-gray-800 text-lg font-medium`}>
                        ❌ No
                    </Text>
                    </Pressable>
                </View>
                </View>


            {/* Confirm Button */}
            <Pressable 
                style={tailwind`p-4 bg-red-400 rounded-lg shadow-lg flex items-center justify-center`}
                onPress={() => handleAddShootout()}
            >
                <Text style={tailwind`text-white font-semibold text-lg`}>Confirm</Text>
            </Pressable>
        </ScrollView>
    );
}

export default AddFootballShootout;
