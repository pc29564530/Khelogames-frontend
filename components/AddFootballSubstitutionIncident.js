import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, Picker, Image, ScrollView} from 'react-native';
import axiosInstance from "../screen/axios_config";
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';
import { useDispatch } from 'react-redux';
import { addFootballIncidents } from '../redux/actions/actions';

const AddFootballSubstitution = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam, selectedIncident, homeSquad, awaySquad}) => {
    const [selectedPlayerIn, setSelectedPlayerIn] = useState(null);
    const [selectedPlayerOut, setSelectedPlayerOut] = useState(null);
    const [selectedHalf, setSelectedHalf] = useState("first_half");
    const [selectedMinute, setSelectedMinute] = useState('45');
    const [description, setDescription] = useState(null);
    const [teamPublicID, setTeamPublicID] = useState(null);
    const dispatch = useDispatch();
    

    const minutes = Array.from({length:90}, (_,i)=> i+1);

    const handleAddSubstitution = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                "match_public_id":matchData.public_id,
                "team_public_id":teamPublicID,
                "periods":selectedHalf,
                "incident_type":selectedIncident,
                "incident_time":selectedMinute,
                "description":description,
                "player_in_public_id":selectedPlayerIn.public_id,
                "player_out_public_id":selectedPlayerOut.public_id
            }
            const response = await axiosInstance.post(`${BASE_URL}/football/addFootballIncidentsSubs`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const item = response.data;
            if(item){
                dispatch(addFootballIncidents(item))
            } else {
                dispatch(addFootballIncidents([]));
            }
        } catch (err) {
            console.error("unable to add the substitution: ", err);
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
        if(message.type === "ADD_FOOTBALL_SUB_INCIDENT") {
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
        <ScrollView style={tailwind``}>

            {/* Header Section */}
            <Text style={tailwind`text-xl font-bold text-gray-800 mb-5`}>Add Football {formatIncidentType(selectedIncident)}</Text>
            {/* Added the events: */}
            <View style={tailwind`mb-6`}>
                <Text style={tailwind`text-lg font-semibold mb-2`}>Select Period:</Text>
                <View style={tailwind`flex-row items-center justify-between`}>
                        <Pressable 
                        style={[tailwind`p-3 rounded-lg`, selectedHalf === 'first_half' ? tailwind`bg-red-400` : tailwind`bg-gray-200`]} 
                        onPress={() => setSelectedHalf('first_half')}
                    >
                        <Text style={tailwind`text-white font-semibold`}>1st Half</Text>
                    </Pressable>
                    
                    <Pressable 
                        style={[tailwind`p-3 rounded-lg`, selectedHalf === 'second_half' ? tailwind`bg-red-400` : tailwind`bg-gray-200`]} 
                        onPress={() => setSelectedHalf('second_half')}
                    >
                        <Text style={tailwind`text-white font-semibold`}>2nd Half</Text>
                    </Pressable>
                </View>
            </View>
            {/* Minute Selector */}
            <View style={tailwind`mb-6`}>
                <Text style={tailwind`text-lg font-semibold mb-2`}>Incident Time (Minute):</Text>
                <Dropdown
                    style={tailwind`border p-3 bg-white rounded-lg shadow-md`}
                    options={minutes}
                    onSelect={(index, value) => setSelectedMinute(value)}
                    defaultValue={selectedMinute}
                    renderRow={(minute) => (
                        <Text style={tailwind`text-lg p-3 text-center`}>{minute}</Text>
                    )}
                />
            </View>

            {/* Team Selector */}
            <View style={tailwind`mb-6`}>
                <Text style={tailwind`text-lg font-semibold mb-2`}>Select Team:</Text>
                <View style={tailwind`flex-row justify-between`}>
                    <Pressable 
                        style={[tailwind`p-4 flex-1 rounded-lg mr-3`, teamPublicID === homeTeam.public_id ? tailwind`bg-red-400` : tailwind`bg-gray-200`]}
                        onPress={() => setTeamPublicID(homeTeam.public_id)}
                    >
                        <Text style={tailwind`text-white font-semibold text-center`}>{homeTeam.name}</Text>
                    </Pressable>
                    <Pressable 
                        style={[tailwind`p-4 flex-1 rounded-lg`, teamPublicID === awayTeam.public_id ? tailwind`bg-red-400` : tailwind`bg-gray-200`]}
                        onPress={() => setTeamPublicID(awayTeam.public_id)}
                    >
                        <Text style={tailwind`text-white font-semibold text-center`}>{awayTeam.name}</Text>
                    </Pressable>
                </View>
            </View>

            {/* Select Players */}
            <View style={tailwind`mb-4 items-start justify-between flex-row`}>
                <View style={tailwind``}>
                    <Text style={tailwind`mb-2 text-xl font-bold`}>Player In:</Text>
                    <Dropdown 
                        style={tailwind`p-4 bg-white rounded-lg shadow-md`}
                        options={teamPublicID === homeTeam.public_id ? homeSquad.filter(itm => itm.is_substitute === true) : awaySquad.filter(itm => itm.is_substitute === true)}
                        onSelect={(index, item) => setSelectedPlayerIn(item)}
                        data={teamPublicID === homeTeam.public_id ? homePlayer : awayPlayer}
                        renderRow={(item) => (
                            <View key={index} style={tailwind`flex-row items-center p-3 border-b border-gray-100`}>
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
                                {selectedPlayerIn ? selectedPlayerIn.player_name : 'Select player'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
                        </View>
                    </Dropdown>
                </View>
                <View style={tailwind``}>
                    <Text style={tailwind`mb-2 text-xl font-bold`}>Player Out:</Text>
                    <Dropdown 
                        style={tailwind`p-4 bg-white rounded-lg`}
                        options={teamPublicID === homeTeam.public_id ? homeSquad.filter(itm => itm.is_substitute === false) : awaySquad.filter(itm => itm.is_substitute === false)}
                        onSelect={(index, item) => setSelectedPlayerOut(item)}
                        data={teamPublicID === homeTeam.public_id ? homeSquad : awaySquad}
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
                                {selectedPlayerOut ? selectedPlayerOut.player_name : 'Select player'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
                        </View>
                    </Dropdown>
                </View>
                <View style={tailwind`mb-4`}>
                    <Text>Description:</Text>
                    <TextInput
                        style={tailwind`border p-2 rounded`}
                        placeholder="Enter about incident.."
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>
            </View>
            {/* Confirm Button */}
            <Pressable 
                style={tailwind`p-4 bg-red-400 rounded-lg shadow-lg flex items-center justify-center`}
                onPress={() => handleAddSubstitution()}
            >
                <Text style={tailwind`text-white font-semibold text-lg`}>Confirm</Text>
            </Pressable>
        </ScrollView>
    );
}

export default AddFootballSubstitution;