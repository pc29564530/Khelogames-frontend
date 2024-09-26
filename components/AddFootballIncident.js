import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, Modal, Image, ScrollView} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';

const AddFootballIncident = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam}) => {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectedMinute, setSelectedMinute] = useState('45');
    const [teamID, setTeamID] = useState(homeTeam.id);
    const [description, setDescription] = useState('');

    const minutes = Array.from({ length: 90 }, (_, i) => i + 1);

    const handleAddIncident = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                "match_id":matchData.id,
                "team_id":teamID,
                "periods":selectedHalf,
                "incident_type":selectedIncident,
                "incident_time":selectedMinute,
                "player_id":selectedPlayer.id,
                "description":description
            }
            const response = await axiosInstance.post(`${BASE_URL}/Football/addFootballIncidents`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
        } catch (err) {
            console.error("unable to add the incident: ", err);
        }
    }


    return (
        <ScrollView contentContainerStyle={tailwind`p-5 bg-gray-100 min-h-full`}>
            {/* Header Section */}
            <Text style={tailwind`text-xl font-bold text-gray-800 mb-5`}>Add Football Penalty</Text>

            {/* Select Period */}
            <View style={tailwind`mb-6`}>
                <Text style={tailwind`text-lg font-semibold mb-2`}>Select Period:</Text>
                <View style={tailwind`flex-row items-center justify-between`}>
                    <Pressable 
                        style={[tailwind`p-3 rounded-lg`, teamID === 'first_half' ? tailwind`bg-blue-600` : tailwind`bg-gray-200`]} 
                        onPress={() => setTeamID('first_half')}
                    >
                        <Text style={tailwind`text-white font-semibold`}>1st Half</Text>
                    </Pressable>
                    <Pressable 
                        style={[tailwind`p-3 rounded-lg`, teamID === 'second_half' ? tailwind`bg-blue-600` : tailwind`bg-gray-200`]} 
                        onPress={() => setTeamID('second_half')}
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
                        style={[tailwind`p-4 flex-1 rounded-lg mr-3`, teamID === homeTeam.id ? tailwind`bg-blue-600` : tailwind`bg-gray-200`]}
                        onPress={() => setTeamID(homeTeam.id)}
                    >
                        <Text style={tailwind`text-white font-semibold text-center`}>{homeTeam.name}</Text>
                    </Pressable>
                    <Pressable 
                        style={[tailwind`p-4 flex-1 rounded-lg`, teamID === awayTeam.id ? tailwind`bg-blue-600` : tailwind`bg-gray-200`]}
                        onPress={() => setTeamID(awayTeam.id)}
                    >
                        <Text style={tailwind`text-white font-semibold text-center`}>{awayTeam.name}</Text>
                    </Pressable>
                </View>
            </View>

            {/* Player Selector */}
            <View style={tailwind`mb-6`}>
                <Text style={tailwind`text-lg font-semibold mb-2`}>Select Player:</Text>
                <Dropdown
                    style={tailwind`p-4 bg-white rounded-lg shadow-md border border-gray-200`}
                    options={teamID === homeTeam.id ? homePlayer : awayPlayer}
                    onSelect={(index, item) => setSelectedPlayer(item)}
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
                            {selectedPlayer ? selectedPlayer.player_name : 'Select player'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
                    </View>
                </Dropdown>
            </View>

            {/* Description Input */}
            <View style={tailwind`mb-6`}>
                <Text style={tailwind`text-lg font-semibold mb-2`}>Description:</Text>
                <TextInput
                    style={tailwind`border p-4 rounded-lg bg-white shadow-md`}
                    placeholder="Enter details about the substitution"
                    value={description}
                    onChangeText={setDescription}
                />
            </View>

            {/* Confirm Button */}
            <Pressable 
                style={tailwind`p-4 bg-blue-600 rounded-lg shadow-lg flex items-center justify-center`}
                onPress={() => handleAddIncident()}
            >
                <Text style={tailwind`text-white font-semibold text-lg`}>Confirm`</Text>
            </Pressable>
        </ScrollView>
    );
}

export default AddFootballIncident;
