import React, {useState} from 'react';
import {View, Text, Pressable, ScrollView} from 'react-native';
import tailwind from 'twrnc';
import Dropdown from 'react-native-modal-dropdown';
const periodsPath = require('../../assets/format_periods.json');
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../screen/axios_config';
import { BASE_URL } from '../../constants/ApiConstants';


const PeriodIncidentForm = ({
    match,
    tournament,
    navigation
}) => {
    const [selectedHalf, setSelectedHalf] = useState("first_half");
    const [selectedMinute, setSelectedMinute] = useState('45');
    const [loading, setLoading] = useState(false);
    const game = useSelector((state) => state.sportReducers.game);

    const periodsData = [
        { name: "First Half", slug: "first_half" },
        { name: "Second Half", slug: "second_half" },
        { name: "Extra Time - First Half", slug: "extra_time_first_half" },
        { name: "Extra Time - Second Half", slug: "extra_time_second_half" }
    ];

    const handleAddIncident = async () => {
        if (!selectedMinute) {
            Alert.alert('Error', 'Please enter minute');
            return;
        }

        setLoading(true);
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                "match_public_id": match.public_id,
                "team_public_id": null,
                "tournament_public_id": tournament?.public_id,
                "periods": selectedHalf,
                "incident_type": "period",
                "incident_time": parseInt(selectedMinute),
                "player_public_id": null,
                "description": `Period change: ${selectedHalf.replace(/_/g, ' ')}`
            };

            const response = await axiosInstance.post(
                `${BASE_URL}/${game.name}/addFootballIncidents`, 
                data, 
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data) {
                Alert.alert('Success', 'Period recorded successfully!');
                navigation.goBack();
            }
        } catch (err) {
            console.error("Unable to add period:", err);
            Alert.alert('Error', err.response?.data?.message || 'Failed to record period.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={tailwind`flex-1 w-full`}
        >
            <ScrollView 
                contentContainerStyle={tailwind`p-4`}
                showsVerticalScrollIndicator={false}
            >
                {/* Select Period */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-lg font-semibold mb-3 text-gray-700`}>Select Period</Text>
                    <View style={tailwind`flex-row flex-wrap gap-3`}>
                        {periodsData.map((item, index) => (
                            <Pressable 
                                key={index}
                                style={[
                                    tailwind`px-4 py-3 rounded-xl border shadow-sm`,
                                    selectedHalf === item.slug 
                                        ? tailwind`bg-red-400 border-red-500` 
                                        : tailwind`bg-gray-100 border-gray-300`
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

                {/* Minute Input */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-lg font-semibold mb-3 text-gray-700`}>
                        Incident Time (Minute)
                    </Text>
                    <TextInput
                        style={tailwind`border border-gray-300 p-4 bg-white rounded-xl shadow-sm text-lg`}
                        keyboardType="number-pad"
                        value={selectedMinute}
                        placeholder="Enter minute"
                        onChangeText={(text) => setSelectedMinute(text)}
                        maxLength={3} 
                    />
                </View>

                {/* Confirm Button */}
                <Pressable 
                    style={[
                        tailwind`p-4 rounded-xl shadow-lg flex-row items-center justify-center`,
                        loading ? tailwind`bg-gray-300` : tailwind`bg-red-400`
                    ]}
                    onPress={handleAddIncident}
                    disabled={loading}
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
                                Confirm Period
                            </Text>
                        </>
                    )}
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default PeriodIncidentForm;