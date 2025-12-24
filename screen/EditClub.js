import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Image, ScrollView, Platform, PermissionsAndroid, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import axiosInstance from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import { SelectMedia } from '../services/SelectMedia';
import { useDispatch } from 'react-redux';
import { setTeams } from '../redux/actions/actions';
import Geolocation from '@react-native-community/geolocation';

const EditClub = ({ route }) => {
    const navigation = useNavigation();
    const { teamData } = route.params;
    const dispatch = useDispatch();

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

    const reverseGeocode = async (lat, lon) => {
        console.log("Lat: ", lat);
        console.log("Long: ", lon);
        if (!lat || !lon) {
            console.log("Skipping reverse geocode - coordinates are null");
            return;
        }

        try {
            const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Reverse geocode result: ", data);

            if (data) {
                const cityName = data.city || data.locality || '';
                const stateName = data.principalSubdivision || '';
                const countryName = data.countryName || '';

                setCity(cityName);
                setState(stateName);
                setCountry(countryName);
                console.log("Address updated: ", cityName, stateName, countryName);
            }
        } catch (err) {
            console.error("BigDataCloud geocoding failed: ", err.message);
        }
    };

    const getFastLocation = async () => {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (pos) => resolve(pos),
                (err) => reject(err),
                {
                    enableHighAccuracy: false,
                    timeout: 8000,
                    maximumAge: 20000,
                }
            );
        });
    };

    const getCurrentLocation = async () => {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (pos) => resolve(pos),
                (err) => reject(err),
                {
                    enableHighAccuracy: true,
                    timeout: 25000,
                    maximumAge: 0,
                }
            );
        });
    };

    const getCurrentCoordinates = async () => {
        setIsLoadingLocation(true);
        console.log("Getting team location...");

        try {
            const fastPos = await getFastLocation();
            const { latitude: lat, longitude: lon } = fastPos.coords;
            setLatitude(lat);
            setLongitude(lon);

            reverseGeocode(lat, lon);

            setTimeout(async () => {
                try {
                    const precisePos = await getCurrentLocation();
                    const { latitude: lat, longitude: lon } = precisePos.coords;
                    console.log("Precise location:", lat, lon);

                    setLatitude(lat);
                    setLongitude(lon);
                } catch (err) {
                    console.error("Failed to get precise location: ", err);
                }
                setIsLoadingLocation(false);
            }, 1500);
        } catch (err) {
            console.error("Failed to get location: ", err);
            setIsLoadingLocation(false);
        }
    };

    const handleLocation = async () => {
        console.log("Platform:", Platform.OS);
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'We need access to your location to update the team location.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            console.log("Granted:", granted);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                getCurrentCoordinates();
                return true;
            } else {
                Alert.alert(
                    'Location Permission Denied',
                    'You can update the team without precise location.'
                );
                return false;
            }
        } else if (Platform.OS === "ios") {
            getCurrentCoordinates();
        }
    };

    const handleSubmit = async () => {
        try {
            const updatedTeam = {
                name: teamName,
                media_url: mediaUrl,
                gender: gender,
                country: country,
                type: category,
                latitude: latitude != null ? latitude.toString() : '',
                longitude: longitude != null ? longitude.toString() : '',
                city: city,
                state: state,
            };
            console.log("Updated team: ", updatedTeam);
            const authToken = await AsyncStorage.getItem('AccessToken');

            const response = await axiosInstance.put(
                `${BASE_URL}/${teamData.game_name}/updateTeam/${teamData.public_id}`,
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

    navigation.setOptions({
        headerTitle: 'Edit Team',
        headerStyle: {
            backgroundColor: tailwind.color('red-400'),
        },
        headerTintColor: 'white',
        headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="white" style={tailwind`ml-4`} />
            </Pressable>
        ),
    });

    return (
        <ScrollView
            style={tailwind`flex-1 bg-gray-50`}
            contentContainerStyle={tailwind`p-5`}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <Text style={tailwind`text-3xl font-bold text-gray-800 mb-2`}>Edit Team</Text>
            <Text style={tailwind`text-base text-gray-500 mb-6`}>Update your team details</Text>

            {/* Team Logo */}
            <View style={tailwind`items-center mb-6 bg-white p-6 rounded-2xl shadow-sm`}>
                <Pressable
                    onPress={handleMediaSelection}
                    style={tailwind`w-28 h-28 rounded-full bg-gray-100 items-center justify-center border-4 border-white shadow-md`}
                >
                    {mediaUrl ? (
                        <Image source={{ uri: mediaUrl }} style={tailwind`w-full h-full rounded-full`} />
                    ) : (
                        <FontAwesome name="camera" size={36} color="#9CA3AF" />
                    )}
                </Pressable>
                <Text style={tailwind`text-sm text-gray-500 mt-3 font-medium`}>Change Team Logo</Text>
            </View>

            {/* Team Details Card */}
            <View style={tailwind`bg-white p-5 rounded-2xl shadow-sm mb-5`}>
                <Text style={tailwind`text-lg font-bold text-gray-800 mb-4`}>Team Details</Text>

                {/* Team Name */}
                <View style={tailwind`mb-4`}>
                    <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>Team Name *</Text>
                    <TextInput
                        style={tailwind`p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800`}
                        value={teamName}
                        onChangeText={setTeamName}
                        placeholder="Enter team name"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* Gender */}
                <View style={tailwind`mb-4`}>
                    <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>Gender *</Text>
                    <View style={tailwind`flex-row gap-3`}>
                        <Pressable
                            onPress={() => setGender('M')}
                            style={[
                                tailwind`flex-1 py-3 rounded-xl items-center`,
                                gender === 'M' ? tailwind`bg-red-400` : tailwind`bg-gray-100`,
                            ]}
                        >
                            <Text style={[tailwind`font-semibold`, gender === 'M' ? tailwind`text-white` : tailwind`text-gray-600`]}>
                                Male
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setGender('F')}
                            style={[
                                tailwind`flex-1 py-3 rounded-xl items-center`,
                                gender === 'F' ? tailwind`bg-red-400` : tailwind`bg-gray-100`,
                            ]}
                        >
                            <Text style={[tailwind`font-semibold`, gender === 'F' ? tailwind`text-white` : tailwind`text-gray-600`]}>
                                Female
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Category */}
                <View style={tailwind`mb-0`}>
                    <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>Category *</Text>
                    <View style={tailwind`flex-row gap-2`}>
                        {['team', 'individual', 'double'].map((item) => (
                            <Pressable
                                key={item}
                                onPress={() => setCategory(item)}
                                style={[
                                    tailwind`flex-1 py-3 rounded-xl items-center`,
                                    category === item ? tailwind`bg-red-400` : tailwind`bg-gray-100`,
                                ]}
                            >
                                <Text style={[tailwind`font-semibold text-sm`, category === item ? tailwind`text-white` : tailwind`text-gray-600`]}>
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </View>

            {/* Location Details Card */}
            <View style={tailwind`bg-white p-5 rounded-2xl shadow-sm mb-5`}>
                <Text style={tailwind`text-lg font-bold text-gray-800 mb-4`}>Location</Text>

                <View style={tailwind`mb-4`}>
                    <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>City</Text>
                    <TextInput
                        style={tailwind`p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800`}
                        value={city}
                        onChangeText={setCity}
                        placeholder="Enter city"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View style={tailwind`mb-4`}>
                    <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>State/Province</Text>
                    <TextInput
                        style={tailwind`p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800`}
                        value={state}
                        onChangeText={setState}
                        placeholder="Enter state or province"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View style={tailwind`mb-0`}>
                    <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>Country</Text>
                    <TextInput
                        style={tailwind`p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800`}
                        value={country}
                        onChangeText={setCountry}
                        placeholder="Enter country"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
            </View>

            {/* GPS Location Card */}
            <View style={tailwind`bg-white p-5 rounded-2xl shadow-sm mb-6`}>
                <View style={tailwind`flex-row items-center justify-between mb-3`}>
                    <Text style={tailwind`text-lg font-bold text-gray-800`}>GPS Coordinates</Text>
                    {latitude && longitude && (
                        <MaterialIcons name="check-circle" size={20} color="#10B981" />
                    )}
                </View>
                <Text style={tailwind`text-xs text-gray-500 mb-4`}>
                    {latitude && longitude ? 'Update precise location' : 'Add precise location for better visibility'}
                </Text>

                <Pressable
                    onPress={handleLocation}
                    disabled={isLoadingLocation}
                    style={[
                        tailwind`p-4 rounded-xl flex-row items-center justify-between`,
                        isLoadingLocation ? tailwind`bg-gray-100` : tailwind`bg-red-50`,
                    ]}
                >
                    <View style={tailwind`flex-row items-center flex-1`}>
                        <MaterialIcons
                            name="my-location"
                            size={22}
                            color={latitude && longitude ? "#10B981" : "#EF4444"}
                        />
                        <Text style={[tailwind`ml-3 flex-1`, latitude && longitude ? tailwind`text-green-600 font-semibold` : tailwind`text-red-500 font-medium`]}>
                            {isLoadingLocation
                                ? 'Getting location...'
                                : latitude && longitude
                                    ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                                    : 'Tap to get location'}
                        </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                </Pressable>
            </View>

            {/* Update Button */}
            <Pressable
                onPress={handleSubmit}
                style={tailwind`bg-red-400 py-4 rounded-2xl shadow-lg mb-6`}
            >
                <Text style={tailwind`text-lg font-bold text-white text-center`}>
                    Update Team
                </Text>
            </Pressable>
        </ScrollView>
    );
};

export default EditClub;
