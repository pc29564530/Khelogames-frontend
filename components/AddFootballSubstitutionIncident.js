import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, Picker, Image} from 'react-native';
import useAxiosInterceptor from "../screen/axios_config";
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';

const AddFootballSubstitution = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam}) => {
    const [selectedPlayerIn, setSelectedPlayerIn] = useState(null);
    const [selectedPlayerOut, setSelectedPlayerOut] = useState(null);
    const [selectedHalf, setSelectedHalf] = useState("first_half");
    const [selectedMinute, setSelectedMinute] = useState('45');
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

    return (
        <View style={tailwind``}>
            {/* Added the events: */}
            <View>
                <View>
                    <Text>Edit Periods</Text>
                </View>
                <View style={tailwind`flex-row items-center  justify-between`}>
                    <Pressable style={tailwind`border roounded-md h-30 w-30`} onPress={() => setSelectedHalf("first_half")}>
                        <Text>1st Half</Text>
                    </Pressable>
                    <Pressable style={tailwind`border roounded-md h-30 w-30`} onPress={() => setSelectedHalf("second_half")}>
                        <Text>2nd Half</Text>
                    </Pressable>
                </View>
                
            </View>
            {/* Minute Selector */}
            <View style={tailwind`flex-row items-center mb-4`}>
                <Text style={tailwind`mr-2`}>Incident Time:</Text>
                <Picker
                    selectedValue={selectedMinute}
                    style={tailwind`h-50 w-30`}
                    onValueChange={(itemValue) => setSelectedMinute(itemValue)}>
                    {minutes.map((minute) => (
                        <Picker.Item label={`${minute}`} value={minute} key={minute} />
                    ))}
                </Picker>
            </View>

            <View style={tailwind`flex-row items-center  justify-between`}>
                <Pressable style={tailwind`border roounded-md h-30 w-30`} onPress={() => setTeamID(homeTeam.id)}>
                    <Text>{homeTeam.name}</Text>
                </Pressable>
                <Pressable style={tailwind`border roounded-md h-30 w-30`} onPress={() => setTeamID(awayTeam.id)}>
                    <Text>{awayTeam.name}</Text>
                </Pressable>
            </View>

            {/* Select Players */}
            <View style={tailwind`mb-4 items-start justify-between`}>
                <View style={tailwind``}>
                    <Text style={tailwind`mb-2 text-xl font-bold`}>Player In:</Text>
                    <Dropdown 
                        style={tailwind`p-4 bg-white rounded-lg shadow-md border border-gray-200`}
                        options={teamID === homeTeam.id ? homePlayer : awayPlayer}
                        onSelect={(index, item) => setSelectedPlayerIn(item)}
                        data={teamID === homeTeam.id ? homePlayer : awayPlayer}
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
                                {selectedPlayerIn ? selectedPlayerIn.player_name : 'Select player'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
                        </View>
                    </Dropdown>
                </View>
                <View style={tailwind``}>
                    <Text style={tailwind`mb-2 text-xl font-bold`}>Player Out:</Text>
                    <Dropdown 
                        style={tailwind`p-4 bg-white rounded-lg shadow-md border border-gray-200`}
                        options={teamID === homeTeam.id ? homePlayer : awayPlayer}
                        onSelect={(index, item) => setSelectedPlayerOut(item)}
                        data={teamID === homeTeam.id ? homePlayer : awayPlayer}
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
                style={tailwind`p-4 bg-blue-600 rounded-lg shadow-lg flex items-center justify-center`}
                onPress={() => handleAddSubstitution()}
            >
                <Text style={tailwind`text-white font-semibold text-lg`}>Confirm</Text>
            </Pressable>
        </View>
    );
}

export default AddFootballSubstitution;