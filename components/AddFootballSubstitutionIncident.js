import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, Picker, Image} from 'react-native';
import useAxiosInterceptor from "../screen/axios_config";
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';

const AddFootballSubstitution = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam, selectedIncident, homeSquad, awaySquad}) => {
    const [selectedPlayerIn, setSelectedPlayerIn] = useState(null);
    const [selectedPlayerOut, setSelectedPlayerOut] = useState(null);
    const [selectedHalf, setSelectedHalf] = useState("first_half");
    const [selectedMinute, setSelectedMinute] = useState('45');
    const [description, setDescription] = useState(null);
    const [teamID, setTeamID] = useState(null);
    const axiosInstance = useAxiosInterceptor();

    const minutes = Array.from({length:90}, (_,i)=> i+1);

    const handleAddSubstitution = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                "match_id":matchData.id,
                "team_id":teamID,
                "periods":selectedHalf,
                "incident_type":selectedIncident,
                "incident_time":selectedMinute,
                "player_in_id":selectedPlayerIn.id,
                "player_out_id":selectedPlayerOut.id,
                "description":description
            }
            const response = await axiosInstance.post(`${BASE_URL}/football/addFootballIncidentsSubs`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (err) {
            console.error("unable to add the substitution: ", err);
        }
    }
    
    const formatIncidentType = (type) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

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
                        style={[tailwind`p-4 flex-1 rounded-lg mr-3`, teamID === homeTeam.id ? tailwind`bg-red-400` : tailwind`bg-gray-200`]}
                        onPress={() => setTeamID(homeTeam.id)}
                    >
                        <Text style={tailwind`text-white font-semibold text-center`}>{homeTeam.name}</Text>
                    </Pressable>
                    <Pressable 
                        style={[tailwind`p-4 flex-1 rounded-lg`, teamID === awayTeam.id ? tailwind`bg-red-400` : tailwind`bg-gray-200`]}
                        onPress={() => setTeamID(awayTeam.id)}
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
                        options={teamID === homeTeam.id ? homeSquad.filter(itm => itm.is_substitute === true) : awaySquad.filter(itm => itm.is_substitute === true)}
                        onSelect={(index, item) => setSelectedPlayerIn(item)}
                        data={teamID === homeTeam.id ? homePlayer : awayPlayer}
                        renderRow={(item) => (
                            <View key={index} style={tailwind`flex-row items-center p-3 border-b border-gray-100`}>
                                <Image
                                    src={item.media_url}
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
                        options={teamID === homeTeam.id ? homeSquad.filter(itm => itm.is_substitute === true) : awaySquad.filter(itm => itm.is_substitute === true)}
                        onSelect={(index, item) => setSelectedPlayerOut(item)}
                        data={teamID === homeTeam.id ? homeSquad : awaySquad}
                        renderRow={(item) => (
                            <View style={tailwind`flex-row items-center p-3 border-b border-gray-100`}>
                                <Image
                                    src={item.media_url}
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