import React, {useState, useRef, useEffect} from 'react';
import {View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Platform, Alert} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../screen/axios_config';
import { BASE_URL } from '../../constants/ApiConstants';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../../context/WebSocketContext';
import { KeyboardAvoidingView } from 'native-base';
import { validateFootballIncidentField, validateFootballIncidentForm } from '../../utils/validation/footballIncidentValidation';


const PeriodIncidentForm = ({
    match,
    tournament,
    navigation
}) => {
    // Props validation
    if (!match) {
        return (
            <View style={[tailwind`flex-1 items-center justify-center p-6`, {backgroundColor: '#0f172a'}]}>
                <MaterialIcons name="error-outline" size={64} color="#ef4444" />
                <Text style={[tailwind`text-lg font-semibold mt-4 text-center`, {color: '#fca5a5'}]}>
                    Invalid match data
                </Text>
                <Text style={[tailwind`text-center mt-2`, {color: '#94a3b8'}]}>
                    Required information is missing. Please go back and try again.
                </Text>
                <Pressable
                    onPress={() => navigation?.goBack()}
                    style={[tailwind`mt-6 px-6 py-3 rounded-xl`, {backgroundColor: '#f87171'}]}
                >
                    <Text style={tailwind`text-white font-semibold`}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const [selectedHalf, setSelectedHalf] = useState("first_half");
    const [selectedMinute, setSelectedMinute] = useState('45');
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const isMountedRef = useRef(true);
    const {wsRef} = useWebSocket();
    const game = useSelector((state) => state.sportReducers.game);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const periodsData = [
        { name: "First Half", slug: "first_half" },
        { name: "Second Half", slug: "second_half" },
        { name: "Extra Time - First Half", slug: "extra_time_first_half" },
        { name: "Extra Time - Second Half", slug: "extra_time_second_half" }
    ];

    const handleAddIncident = async () => {
        // Validate required fields
        if (!selectedMinute || selectedMinute === '') {
            setError({
                global: "Please enter the incident time",
                fields: { incident_time: "Incident time is required" },
            });
            return;
        }

        // Show confirmation
        setShowConfirmation(true);
    };

    const confirmAddIncident = async () => {
        setShowConfirmation(false);
        setLoading(true);
        setError({ global: null, fields: {} });

        try {
            const formData = {
                "match_public_id": match?.public_id,
                "team_public_id": null,
                "tournament_public_id": tournament?.public_id,
                "periods": selectedHalf,
                "incident_type": "period",
                "incident_time": parseInt(selectedMinute),
                "player_public_id": null,
                "description": `Period change: ${selectedHalf.replace(/_/g, ' ')}`,
                "event_type": "periods",
            };

            const validation = validateFootballIncidentForm(formData);
            if (!validation.isValid) {
                if (isMountedRef.current) {
                    setError({
                        global: "Please fix the errors below",
                        fields: validation.errors,
                    });
                }
                return;
            }

            const authToken = await AsyncStorage.getItem("AccessToken");

            if (!authToken) {
                throw new Error("Authentication required");
            }

            const response = await axiosInstance.post(
                `${BASE_URL}/${game?.name}/addFootballIncidents`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const item = response?.data;
            if (item?.data && isMountedRef.current) {
                // Send WebSocket update
                if (wsRef?.current && wsRef.current.readyState === WebSocket.OPEN) {
                    try {
                        wsRef.current.send(JSON.stringify({
                            type: "MATCH_UPDATE",
                            payload: {
                                match_public_id: match?.public_id,
                                incident_type: "period",
                            }
                        }));
                    } catch (wsErr) {
                        console.error("WebSocket send failed:", wsErr);
                    }
                }

                Alert.alert('Success', 'Period change recorded successfully!', [
                    {
                        text: 'OK',
                        onPress: () => navigation?.goBack()
                    }
                ]);
            }
        } catch (err) {
            if (isMountedRef.current) {
                const backendErrors = err?.response?.data?.error?.fields || {};
                setError({
                    global: err?.response?.data?.error?.message || "Unable to add period. Please try again.",
                    fields: backendErrors,
                });
                console.error("Unable to add period:", err);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    const formatPeriodName = (slug) => {
        const periodMap = {
            'first_half': '1st Half',
            'second_half': '2nd Half',
            'extra_time_first_half': 'Extra Time - 1st Half',
            'extra_time_second_half': 'Extra Time - 2nd Half'
        };
        return periodMap[slug] || slug.replace(/_/g, ' ');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[tailwind`flex-1 w-full`, {backgroundColor: '#020617'}]}
        >
            <ScrollView
                contentContainerStyle={tailwind`p-4`}
                showsVerticalScrollIndicator={false}
            >
                {/* Global Error Banner */}
                {error?.global && (
                    <View style={[tailwind`mb-4 rounded-xl p-4`, {backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130'}]}>
                        <View style={tailwind`flex-row items-start`}>
                            <MaterialIcons name="error-outline" size={20} color="#f87171" />
                            <View style={tailwind`flex-1 ml-2`}>
                                <Text style={[tailwind`font-semibold text-sm`, {color: '#fca5a5'}]}>
                                    {error.global}
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => setError({ global: null, fields: {} })}
                                style={tailwind`ml-2`}
                            >
                                <MaterialIcons name="close" size={18} color="#f87171" />
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Select Period */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: '#f1f5f9'}]}>Select Period</Text>
                    <View style={tailwind`flex-row flex-wrap gap-3`}>
                        {periodsData.map((item, index) => (
                            <Pressable
                                key={index}
                                style={[
                                    tailwind`px-4 py-3 rounded-xl`,
                                    {borderWidth: 1, borderColor: '#334155'},
                                    selectedHalf === item.slug
                                        ? {backgroundColor: '#f87171', borderColor: '#f87171'}
                                        : {backgroundColor: '#0f172a'}
                                ]}
                                onPress={() => setSelectedHalf(item.slug)}
                            >
                                <Text style={[
                                    tailwind`font-semibold`,
                                    selectedHalf === item.slug
                                        ? tailwind`text-white`
                                        : {color: '#94a3b8'}
                                ]}>
                                    {item.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Minute Input */}
                <View style={tailwind`mb-6`}>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, {color: '#f1f5f9'}]}>
                        Incident Time (Minute)
                    </Text>
                    <TextInput
                        style={[tailwind`p-4 rounded-xl text-lg`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', color: '#f1f5f9'}]}
                        keyboardType="number-pad"
                        value={selectedMinute}
                        placeholder="Enter minute"
                        placeholderTextColor="#64748b"
                        onChangeText={(text) => setSelectedMinute(text)}
                        maxLength={3}
                    />
                </View>

                {/* Confirm Button */}
                <Pressable
                    style={[
                        tailwind`p-4 rounded-xl flex-row items-center justify-center`,
                        loading || !selectedMinute ? {backgroundColor: '#334155'} : {backgroundColor: '#f87171'}
                    ]}
                    onPress={handleAddIncident}
                    disabled={loading || !selectedMinute}
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
                                Record Period Change
                            </Text>
                        </>
                    )}
                </Pressable>

                {/* Summary Card */}
                {selectedHalf && selectedMinute && (
                    <View style={[tailwind`mt-4 p-4 rounded-xl`, {backgroundColor: '#3b82f615', borderWidth: 1, borderColor: '#3b82f630'}]}>
                        <Text style={[tailwind`font-semibold mb-2`, {color: '#93c5fd'}]}>Summary:</Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Period: {formatPeriodName(selectedHalf)}
                        </Text>
                        <Text style={[tailwind`text-sm`, {color: '#93c5fd'}]}>
                            Time: {selectedMinute}'
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <View style={tailwind`absolute inset-0 bg-black bg-opacity-50 items-center justify-center`}>
                    <View style={[tailwind`rounded-2xl p-6 mx-6 w-80`, {backgroundColor: '#1e293b'}]}>
                        <MaterialIcons name="access-time" size={48} color="#f87171" style={tailwind`self-center mb-4`} />
                        <Text style={[tailwind`text-xl font-bold text-center mb-2`, {color: '#f1f5f9'}]}>
                            Confirm Period Change
                        </Text>
                        <Text style={[tailwind`text-center mb-2 font-semibold`, {color: '#e2e8f0'}]}>
                            {formatPeriodName(selectedHalf)}
                        </Text>
                        <Text style={[tailwind`text-center text-sm mb-4`, {color: '#94a3b8'}]}>
                            At {selectedMinute} minutes
                        </Text>

                        <View style={tailwind`flex-row gap-3`}>
                            <Pressable
                                onPress={() => setShowConfirmation(false)}
                                style={[tailwind`flex-1 p-3 rounded-xl`, {backgroundColor: '#334155'}]}
                            >
                                <Text style={[tailwind`font-semibold text-center`, {color: '#e2e8f0'}]}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={confirmAddIncident}
                                style={[tailwind`flex-1 p-3 rounded-xl`, {backgroundColor: '#f87171'}]}
                            >
                                <Text style={tailwind`text-white font-semibold text-center`}>
                                    Confirm
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

export default PeriodIncidentForm;