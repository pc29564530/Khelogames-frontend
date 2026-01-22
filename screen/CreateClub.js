import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, FlatList, Image, ScrollView, Platform, PermissionsAndroid, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import axiosInstance from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import { SelectMedia } from '../services/SelectMedia';
import { useDispatch, useSelector } from 'react-redux';
import { setTeams } from '../redux/actions/actions';
import CountryPicker from 'react-native-country-picker-modal';
import Geolocation from '@react-native-community/geolocation';
import { validateTeamField, validateTeamForm } from '../utils/validation/teamValidation';
import { handleInlineError } from '../utils/errorHandler';

const CreateClub = () => {
    const navigation = useNavigation();
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [name, setName] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [national, setNational] = useState(false);
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [gender, setGender] = useState('');
    const [type, setType] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationBuffer, setLocationBuffer] = useState([]);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });

    const dispatch = useDispatch();
    const game = useSelector((state) => state.sportReducers.game)

    const handleMediaSelection = async () => {
        const { mediaURL, mediaType } = await SelectMedia(axiosInstance);
        setMediaUrl(mediaURL);
        setMediaType(mediaType)
    };

    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;

            const getIPLocation = async () => {
                try {
                    console.log("Getting IP-based location...");

                    // Try BigDataCloud API
                    const response = await fetch('http://ip-api.com/json/', {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' }
                    });
                    console.log("IP location response status:", response);

                    if (!isActive) return;

                    const data = await response.json();
                    console.log("IP location response:", data);

                    if (data && data.status === 'success') {
                        let cleanedRegion = data.regionName || data.region || '';

                        // Remove common prefixes/suffixes to make region names cleaner
                        cleanedRegion = cleanedRegion
                            .replace(/^National Capital Territory of /i, '')
                            .replace(/^Union Territory of /i, '')
                            .replace(/^State of /i, '')
                            .trim();

                        setCity(data.city || '');
                        setState(cleanedRegion);
                        setCountry(data.country || '');
                        console.log("✓ Location set:");
                        console.log("  City:", data.city);
                        console.log("  State:", cleanedRegion);
                        console.log("  Country:", data.country);
                    }
                } catch (err) {
                    console.error("IP location failed:", err.message);
                }
            };

            getIPLocation();

            // Cleanup when screen loses focus
            return () => {
            isActive = false;
            };
        }, [])
    );

    const reverseGeocode = async (lat, lon) => {
      console.log("Lat: ", lat)
      console.log("Long: ", lon)
      if (!lat || !lon) {
        console.log("Skipping reverse geocode - coordinates are null");
        return;
      }

      try {
        // BigDataCloud Free API - No authentication required
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
        
        console.log("Fetching from BigDataCloud:", url);
        
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
          console.log("Address set: ", cityName, stateName, countryName);
        }
      } catch (err) {
        console.error("BigDataCloud geocoding failed: ", err.message);
      }
    };

    const getCurrentCoordinates = () => {
        setIsLoadingLocation(true);
        console.log("Getting match location...");

        // First try with high accuracy
        Geolocation.getCurrentPosition(
            (position) => {
            handlePositionSuccess(position);
            },
            (error) => {
            console.error("High accuracy failed:", error);
            // Fallback to lower accuracy
            console.log("Trying with lower accuracy...");
            Geolocation.getCurrentPosition(
                (position) => {
                handlePositionSuccess(position);
                },
                (finalError) => {
                console.error("Final geolocation error:", finalError);
                setIsLoadingLocation(false);
                Alert.alert(
                    'Location Error',
                    `Unable to get location. Please ensure:\n• GPS is enabled\n• You're in an open area\n• Location services are on\n\nError: ${finalError.message}`
                );
                },
                {
                enableHighAccuracy: false, // Lower accuracy = faster
                timeout: 15000,
                maximumAge: 10000,
                }
            );
            },
            {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 10000,
            distanceFilter: 0,
            forceRequestLocation: true,
            showLocationDialog: true,
            }
        );
    };

    const handlePositionSuccess = (position) => {
        console.log("✓ SUCCESS - Position received:", position);

        if (!position || !position.coords) {
        setIsLoadingLocation(false);
        Alert.alert('Location Error', 'Unable to get coordinates');
        return;
        }

        const {latitude, longitude, accuracy} = position.coords;
        console.log("Coordinates:", latitude, longitude, "Accuracy:", accuracy);
        reverseGeocode(latitude, longitude)

        setLocationBuffer(prevBuffer => {
        const newBuffer = [...prevBuffer, {latitude, longitude}];
        if (newBuffer.length > 3) {
            newBuffer.shift();
        }

        if (newBuffer.length >= 3) {
            const avgLat = newBuffer.reduce((sum, p) => sum + p.latitude, 0) / newBuffer.length;
            const avgLng = newBuffer.reduce((sum, p) => sum + p.longitude, 0) / newBuffer.length;
            setLatitude(avgLat);
            setLongitude(avgLng);
            console.log("Avg location set:", avgLat, avgLng);
            setIsLoadingLocation(false);
        } else {
            setLatitude(latitude);
            setLongitude(longitude);
            console.log("Initial location set:", latitude, longitude);
            setIsLoadingLocation(false);
        }

        return newBuffer;
        });
    };

    const handleLocation = async () => {
        console.log("Platform:", Platform.OS);
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'We need access to your location to set the team location.',
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
                    'You can still create a team without location.'
                );
                return false;
            }
        } else if (Platform.OS === "ios") {
            getCurrentCoordinates();
        }
    };

    const handleSubmit = async () => {
        try {
            const userPublicID = await AsyncStorage.getItem('UserPublicID');
            const formData = {
                name,
                city,
                state,
                country,
                gender,
                type,
            }
            const validation = validateTeamForm(formData)
            if(!validation.isValid){
                setError({
                    global: null,
                    fields: validation.errors,
                })
                return;
            }
            const newTeam = {
                name: name,
                media_url: mediaUrl,
                gender: gender,
                national: national,
                country: country,
                type: type,
                player_count: 0,
                game_id: game.id,
                latitude: latitude != null ? latitude.toString() : '',
                longitude: longitude != null ? longitude.toString() : '',
                city: city,
                state: state,
            };
            console.log("new team: ", newTeam)
            const authToken = await AsyncStorage.getItem('AccessToken');

            const response = await axiosInstance.post(
                `${BASE_URL}/${game.name}/newTeams`,
                newTeam,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const item = response.data || [];
            dispatch(setTeams(item));
            navigation.navigate('Club');
        } catch (err) {
            const backendErrors = err?.response?.data?.error?.fields;
            setError({
                global: "Unable to create new team",
                fields: backendErrors,
            });
            console.error("Unable to create new team: ", err);
        }
    };
    
    navigation.setOptions({
        headerTitle: '',
        headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="black" style={tailwind`ml-4`} />
            </Pressable>
        ),
    });

    return (
            <ScrollView
                style={tailwind`flex-1 bg-gray-50`}
                contentContainerStyle={tailwind`p-5`}
                showsVerticalScrollIndicator={false}
            >   
                {error.global && (
                    <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                        <Text style={tailwind`text-red-700 text-sm`}>
                            {error.global}
                        </Text>
                    </View>
                )}
                {/* Header */}
                <Text style={tailwind`text-3xl font-bold text-gray-800 mb-2`}>Create Team</Text>
                <Text style={tailwind`text-base text-gray-500 mb-6`}>Fill in the details to create your team</Text>

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
                    <Text style={tailwind`text-sm text-gray-500 mt-3 font-medium`}>Upload Team Logo</Text>
                </View>

                {/* Team Details Card */}
                <View style={tailwind`bg-white p-5 rounded-2xl shadow-sm mb-5`}>
                    <Text style={tailwind`text-lg font-bold text-gray-800 mb-4`}>Team Details</Text>

                    {/* Team Name */}
                    <View style={tailwind`mb-4`}>
                        <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>Team Name *</Text>
                        <TextInput
                            style={tailwind`p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800`}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter team name"
                            placeholderTextColor="#9CA3AF"
                        />
                        {error?.fields?.name && (
                        <Text style={tailwind`text-red-500 text-sm`}>
                            *{error.fields?.name}
                        </Text>
                    )}
                    </View>
                    {/* Gender */}
                    <View style={tailwind`mb-4`}>
                        <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>Gender *</Text>
                        <View style={tailwind`flex-row gap-3`}>
                            <Pressable
                                onPress={() => setGender('male')}
                                style={[
                                    tailwind`flex-1 py-3 rounded-xl items-center`,
                                    gender === 'male' ? tailwind`bg-red-400` : tailwind`bg-gray-100`,
                                ]}
                            >
                                <Text style={[tailwind`font-semibold`, gender === 'male' ? tailwind`text-white` : tailwind`text-gray-600`]}>
                                    Male
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setGender('female')}
                                style={[
                                    tailwind`flex-1 py-3 rounded-xl items-center`,
                                    gender === 'female' ? tailwind`bg-red-400` : tailwind`bg-gray-100`,
                                ]}
                            >
                                <Text style={[tailwind`font-semibold`, gender === 'female' ? tailwind`text-white` : tailwind`text-gray-600`]}>
                                    Female
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setGender('mixed')}
                                style={[
                                    tailwind`flex-1 py-3 rounded-xl items-center`,
                                    gender === 'mixed' ? tailwind`bg-red-400` : tailwind`bg-gray-100`,
                                ]}
                            >
                                <Text style={[tailwind`font-semibold`, gender === 'mixed' ? tailwind`text-white` : tailwind`text-gray-600`]}>
                                    Mixed
                                </Text>
                            </Pressable>
                        </View>
                        {error?.fields?.gender && (
                            <Text style={tailwind`text-red-500 text-sm`}>
                                *{error.fields?.gender}
                            </Text>
                        )}
                    </View>

                    {/* Category */}
                    <View style={tailwind`mb-0`}>
                        <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>Category *</Text>
                        <View style={tailwind`flex-row gap-2`}>
                            {['team', 'individual', 'double'].map((item) => (
                                <Pressable
                                    key={item}
                                    onPress={() => setType(item)}
                                    style={[
                                        tailwind`flex-1 py-3 rounded-xl items-center`,
                                        type === item ? tailwind`bg-red-400` : tailwind`bg-gray-100`,
                                    ]}
                                >
                                    <Text style={[tailwind`font-semibold text-sm`, type === item ? tailwind`text-white` : tailwind`text-gray-600`]}>
                                        {item.charAt(0).toUpperCase() + item.slice(1)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                        {error?.fields?.type && (
                            <Text style={tailwind`text-red-500 text-sm`}>
                                *{error.fields?.type}
                            </Text>
                        )}
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
                        {error?.fields?.city && (
                            <Text style={tailwind`text-red-500 text-sm`}>
                                *{error.fields.city}
                            </Text>
                        )}
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
                        {error?.fields?.state && (
                            <Text style={tailwind`text-red-500 text-sm`}>
                                *{error.fields.state}
                            </Text>
                        )}
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
                        {error?.fields?.country && (
                            <Text style={tailwind`text-red-500 text-sm`}>
                                *{error.fields.country}
                            </Text>
                        )}
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
                    <Text style={tailwind`text-xs text-gray-500 mb-4`}>Optional - Get precise location</Text>

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

                {/* Submit Button */}
                <Pressable
                    onPress={handleSubmit}
                    style={tailwind`bg-red-400 py-4 rounded-2xl shadow-lg mb-6`}
                >
                    <Text style={tailwind`text-lg font-bold text-white text-center`}>
                        Create Team
                    </Text>
                </Pressable>

                {isCountryPicker && (
                    <CountryPicker
                        withFilter
                        withFlag
                        withCountryNameButton
                        withAlphaFilter
                        withCallingCode
                        withEmoji
                        countryCode={country}
                        onSelect={(selectedCountry) => {
                        setCountry(selectedCountry.name);
                        setIsCountryPicker(false);
                        }}
                        visible={isCountryPicker}
                        onClose={() => setIsCountryPicker(false)}
                    />
                )}
            </ScrollView>
    );
};

export default CreateClub;
