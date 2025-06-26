import React, {useState} from 'react';
import {View, Text, Pressable, ScrollView} from 'react-native';
import tailwind from 'twrnc';
import Dropdown from 'react-native-modal-dropdown';
const periodsPath = require('../assets/format_periods.json');
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from '../screen/axios_config';
import { BASE_URL } from '../constants/ApiConstants';

const AddFootballPeriods = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam, selectedIncident}) => {
    const [selectedHalf, setSelectedHalf] = useState("first_half");
    const [selectedMinute, setSelectedMinute] = useState('45');
    const periodsData = periodsPath["formatPeriod"];
    const minutes = Array.from({ length: 90 }, (_, i) => i + 1);
    const axiosInstance = useAxiosInterceptor();
    const handleAddIncident = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                "match_id":matchData.id,
                "team_id":null,
                "periods":selectedHalf,
                "incident_type":selectedIncident,
                "incident_time":selectedMinute,
                "player_id":null,
                "description":"description"
            }
            const response = await axiosInstance.post(`${BASE_URL}/football/addFootballIncidents`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
        } catch (err) {
            console.error("Unable to add the incident: ", err);
        }
    }

    return (
        <ScrollView contentContainerStyle={tailwind`p-5 bg-gray-100 min-h-full`}>
            {/* Header Section */}
            <Text style={tailwind`text-xl font-bold text-gray-800 mb-5`}>Add Football Incident</Text>

            {/* Select Period */}
            <View style={tailwind`mb-6`}>
                <Text style={tailwind`text-lg font-semibold mb-2`}>Select Period:</Text>
                <View style={tailwind`flex-row flex-wrap`}>
                    {periodsData.map((item, index) => (
                        <Pressable 
                            key={index}
                            style={[
                                tailwind`p-3 m-1 rounded-lg border`,
                                selectedHalf === item.slug 
                                    ? tailwind`bg-red-400` 
                                    : tailwind`bg-gray-200`
                            ]} 
                            onPress={() => setSelectedHalf(item.slug)}
                        >
                            <Text style={[
                                tailwind`font-semibold`, 
                                selectedHalf === item.slug 
                                    ? tailwind`text-white` 
                                    : tailwind`text-gray-800`
                            ]}>
                                {item.name}
                            </Text>
                        </Pressable>
                    ))}
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

            {/* Submit Button */}
            <Pressable 
                style={tailwind`p-4 bg-red-400 rounded-lg shadow-lg flex items-center justify-center`}
                onPress={handleAddIncident}
            >
                <Text style={tailwind`text-white font-semibold text-lg`}>Confirm</Text>
            </Pressable>
        </ScrollView>
    );
}
export default AddFootballPeriods;
