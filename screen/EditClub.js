import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Pressable, TextInput, Image, ScrollView, Platform, PermissionsAndroid, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import axiosInstance from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import { SelectMedia } from '../services/SelectMedia';
import { useDispatch, useSelector } from 'react-redux';
import { setTeams } from '../redux/actions/actions';
import { getIPBasedLocation, requestLocationPermission } from '../utils/locationService';

const EditClub = ({ route }) => {
    const navigation = useNavigation();
    const { teamData } = route.params;
    console.log("Team: ", teamData)
    const dispatch = useDispatch();
    const game = useSelector((state) => state.sportReducers.game)

    // Initialize state with existing team data
    const [teamName, setTeamName] = useState(teamData.name || '');
    const [mediaUrl, setMediaUrl] = useState(teamData.media_url || '');
    const [mediaType, setMediaType] = useState('');
    const [country, setCountry] = useState(teamData.country || '');
    const [city, setCity] = useState(teamData.city || '');
    const [state, setState] = useState(teamData.state || '');
    const [gender, setGender] = useState(teamData.gender || '');
    const [category, setCategory] = useState(teamData.type || '');
    const [latitude, setLatitude] = useState(teamData.latitude ? parseFloat(teamData.latitude) : null);
    const [longitude, setLongitude] = useState(teamData.longitude ? parseFloat(teamData.longitude) : null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const handleMediaSelection = async () => {
        const { mediaURL, mediaType } = await SelectMedia(axiosInstance);
        setMediaUrl(mediaURL);
        setMediaType(mediaType);
    };

    // Get location based on IP when screen is focused (only if not already set)
    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;

            const fetchIPLocation = async () => {
                // Only fetch if location is not already set from teamData
                if (!city && !state && !country) {
                    const location = await getIPBasedLocation();
                    if (isActive && location) {
                        setCity(location.city);
                        setState(location.state);
                        setCountry(location.country);
                    }
                }
            };

            fetchIPLocation();

            // Cleanup when screen loses focus
            return () => {
                isActive = false;
            };
        }, [])
    );

    const handleLocation = async () => {
        await requestLocationPermission(
            (coords) => {
                setLatitude(coords.latitude);
                setLongitude(coords.longitude);
            },
            null,
            setIsLoadingLocation
        );
    };

    const handleSubmit = async () => {
        try {
            const updatedTeam = {
                name: teamName,
                media_url: mediaUrl,
                gender: gender,
                country: country,
                type: category,
                game_id: teamData.game_id,
                latitude: latitude != null ? latitude.toString() : '',
                longitude: longitude != null ? longitude.toString() : '',
                city: city,
                state: state,
            };
            console.log("Updated team: ", updatedTeam);
            const authToken = await AsyncStorage.getItem('AccessToken');
            console.log("team public id: ", teamData.public_id.toString())
            const response = await axiosInstance.put(
                `${BASE_URL}/${game.name}/update-team-location/${teamData.public_id.toString()}`,
                updatedTeam,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            Alert.alert('Success', 'Team updated successfully!');
            navigation.goBack();
        } catch (err) {
            console.error('Unable to update the team: ', err);
            Alert.alert('Error', 'Failed to update team. Please try again.');
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
            <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '600' }}>
                Edit Team
            </Text>
            ),
            headerStyle: {
            backgroundColor: '#1e293b',
            elevation: 0,
            shadowOpacity: 0,
            },
            headerTintColor: '#e2e8f0',
            headerTitleAlign: 'center',
            headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
                <AntDesign name="arrowleft" size={24} color="#e2e8f0" />
            </Pressable>
            ),
        });
    }, [navigation]);

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#0f172a' }}
            contentContainerStyle={tailwind`p-5`}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Update your team details</Text>

            {/* Team Logo */}
            <View style={{
                alignItems: 'center', marginBottom: 24, padding: 24, borderRadius: 16,
                backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
            }}>
                <Pressable
                    onPress={handleMediaSelection}
                    style={{
                        width: 112, height: 112, borderRadius: 56,
                        backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center',
                        borderWidth: 3, borderColor: '#475569',
                    }}
                >
                    {mediaUrl ? (
                        <Image source={{ uri: mediaUrl }} style={tailwind`w-full h-full rounded-full`} />
                    ) : (
                        <FontAwesome name="camera" size={36} color="#64748b" />
                    )}
                </Pressable>
                <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 12, fontWeight: '500' }}>Change Team Logo</Text>
            </View>

            {/* Team Details Card */}
            <View style={{
                padding: 20, borderRadius: 16, marginBottom: 20,
                backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
            }}>
                <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Team Details</Text>

                {/* Team Name */}
                <View style={tailwind`mb-4`}>
                    <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Team Name *</Text>
                    <TextInput
                        style={{
                            padding: 16, backgroundColor: '#0f172a', borderRadius: 12,
                            borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', fontSize: 15,
                        }}
                        value={teamName}
                        onChangeText={setTeamName}
                        placeholder="Enter team name"
                        placeholderTextColor="#475569"
                    />
                </View>

                {/* Gender */}
                <View style={tailwind`mb-4`}>
                    <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Gender *</Text>
                    <View style={tailwind`flex-row gap-3`}>
                        <Pressable
                            onPress={() => setGender('M')}
                            style={[
                                tailwind`flex-1 py-3 rounded-xl items-center`,
                                { backgroundColor: gender === 'M' ? '#f87171' : '#334155' },
                            ]}
                        >
                            <Text style={{ fontWeight: '600', color: gender === 'M' ? '#ffffff' : '#94a3b8' }}>
                                Male
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setGender('F')}
                            style={[
                                tailwind`flex-1 py-3 rounded-xl items-center`,
                                { backgroundColor: gender === 'F' ? '#f87171' : '#334155' },
                            ]}
                        >
                            <Text style={{ fontWeight: '600', color: gender === 'F' ? '#ffffff' : '#94a3b8' }}>
                                Female
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Category */}
                <View style={tailwind`mb-0`}>
                    <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Category *</Text>
                    <View style={tailwind`flex-row gap-2`}>
                        {['team', 'individual', 'double'].map((item) => (
                            <Pressable
                                key={item}
                                onPress={() => setCategory(item)}
                                style={[
                                    tailwind`flex-1 py-3 rounded-xl items-center`,
                                    { backgroundColor: category === item ? '#f87171' : '#334155' },
                                ]}
                            >
                                <Text style={{ fontWeight: '600', fontSize: 13, color: category === item ? '#ffffff' : '#94a3b8' }}>
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </View>

            {/* Location Details Card */}
            <View style={[tailwind`p-5 rounded-2xl mb-5`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Location</Text>

                <View style={tailwind`mb-4`}>
                    <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>City</Text>
                    <TextInput
                        style={[tailwind`p-4 rounded-xl`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', color: '#f1f5f9' }]}
                        value={city}
                        onChangeText={setCity}
                        placeholder="Enter city"
                        placeholderTextColor="#475569"
                    />
                </View>

                <View style={tailwind`mb-4`}>
                    <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>State/Province</Text>
                    <TextInput
                        style={[tailwind`p-4 rounded-xl`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', color: '#f1f5f9' }]}
                        value={state}
                        onChangeText={setState}
                        placeholder="Enter state or province"
                        placeholderTextColor="#475569"
                    />
                </View>

                <View style={tailwind`mb-0`}>
                    <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Country</Text>
                    <TextInput
                        style={[tailwind`p-4 rounded-xl`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', color: '#f1f5f9' }]}
                        value={country}
                        onChangeText={setCountry}
                        placeholder="Enter country"
                        placeholderTextColor="#475569"
                    />
                </View>
            </View>

            {/* GPS Location Card */}
            <View
                style={[
                    tailwind`p-5 rounded-2xl mb-5`,
                    { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }
                ]}
            >
                <View style={tailwind`flex-row items-center justify-between mb-3`}>
                    <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700' }}>
                        Precise Location
                    </Text>

                    {latitude && longitude && (
                    <MaterialIcons name="check-circle" size={20} color="#22c55e" />
                    )}
                </View>

                <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>
                    {latitude && longitude
                    ? 'Update precise location'
                    : 'Add precise location for better visibility'}
                </Text>

                <Pressable
                    onPress={handleLocation}
                    disabled={isLoadingLocation}
                    style={[
                    tailwind`p-4 rounded-xl flex-row items-center justify-between`,
                    {
                        backgroundColor: '#0f172a',
                        borderWidth: 1,
                        borderColor: '#334155'
                    }
                    ]}
                >
                    <View style={tailwind`flex-row items-center flex-1`}>
                    <MaterialIcons
                        name="my-location"
                        size={22}
                        color={latitude && longitude ? '#22c55e' : '#f87171'}
                    />

                    <Text
                        style={{
                        marginLeft: 12,
                        flex: 1,
                        fontWeight: '500',
                        color: latitude && longitude ? '#22c55e' : '#cbd5e1'
                        }}
                    >
                        {isLoadingLocation
                        ? 'Getting location...'
                        : latitude && longitude
                        ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                        : 'Tap to get location'}
                    </Text>
                    </View>

                    <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
                </Pressable>
                </View>

            {/* Update Button */}
            <Pressable
                onPress={handleSubmit}
                style={{
                    backgroundColor: '#f87171', paddingVertical: 16,
                    borderRadius: 16, marginBottom: 24,
                }}
            >
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#ffffff', textAlign: 'center' }}>
                    Update Team
                </Text>
            </Pressable>
        </ScrollView>
    );
};

export default EditClub;
