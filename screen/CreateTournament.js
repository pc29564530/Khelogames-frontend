import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Modal, ScrollView} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from 'react-native-modern-datepicker';
import CountryPicker from 'react-native-country-picker-modal';
import { useSelector, useDispatch } from 'react-redux';
import { BASE_URL } from '../constants/ApiConstants';
import CheckBox from '@react-native-community/checkbox';
import { addTournament } from '../redux/actions/actions';
const Stages = ['Group', 'Knockout', 'League'];
import { validateTournamentField, validateTournamentForm } from '../utils/validation/tournamentValidation';
import { handleInlineError } from '../utils/errorHandler';


const CreateTournament = () => {
    const [name, setName] = useState('');
    const [startTimestamp, setStartTimestamp] = useState(null);
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [category, setCategory] = useState('');
    const [groupCount, setGroupCount] = useState(null);
    const [maxTeamGroup, setMaxGroupTeam] = useState(null);
    const [stage, setStage] = useState(null)
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [loading, setLoading] = useState(false);
    

    const [isSportVisible, setIsSportVisible] = useState(false);
    const [isLevelVisible, setIsLevelVisible] = useState(false);
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [isDurationVisible, setIsDurationVisible] = useState(false);
    const games = useSelector(state => state.sportReducers.games);
    const dispatch = useDispatch();
    const [isKnockout, setIsKnockout] = useState(false);
    const levels = ['International', 'Country', 'Local'];
    const navigation = useNavigation();
    const game = useSelector((state) => state.sportReducers.game);


    // Get location based on IP when screen is focused
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
        }, [city, state, country])
    );
    
    const handleCreateTournament = async () => {
        try {
            // Validate all fields before submission
            const formData = {
                name,
                city,
                state,
                country,
                startTimestamp,
                stage,
                groupCount,
                maxTeamGroup,
            }

            const validation = validateTournamentForm(formData);
            console.log("Validation Result: ", validation);
            if (!validation.isValid) {
                setError({
                    global: null,
                    fields: validation.errors
                });
                return;
            }
            setLoading(true);
            setError({
                global: null,
                fields: {},
            });

            const data = {
                name: name,
                status: "not_started",
                level: "local",
                start_timestamp: modifyDateTime(startTimestamp),
                game_id: game.id,
                group_count: parseInt(groupCount, 10),
                max_group_team: parseInt(maxTeamGroup, 10),
                stage: stage?.toLowerCase(),
                has_knockout: isKnockout,
                city: city,
                state: state,
                country: country,
            };

            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(
            `${BASE_URL}/${game.name}/createTournament`,
            data,
            {
                headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json",
                },
            }
            );


            const tournament = response.data

            console.log("API Response structure:", {
            data: response.data,
            type: typeof response.data,
            isArray: Array.isArray(response.data)
        });

            if (tournament) {
                dispatch(addTournament(tournament));
                navigation.popToTop()
                navigation.navigate("TournamentPage", { tournament, currentRole: "user" });
            } else {
            console.error("No tournament found in response", response.data);
            }
        } catch (err) {
            const backendErrors = err.response?.data?.error?.fields || {};
            if (backendErrors.global) {
                setError({
                    global: backendErrors.global,
                    fields: {},
                });
            } else {
                setError({
                    global: err?.response?.data?.error?.message || "Unable to create tournament",
                    fields: backendErrors,
                });
            }
            console.error("Unable to create a new tournament", err);
        } finally {
            setLoading(false);
        }
    };


    navigation.setOptions({
      headerTitle:'',
      headerStyle:tailwind`bg-red-400 shadow-lg`,
      headerTintColor:'white',
      headerLeft: ()=> (
        <View style={tailwind`flex-row items-center items-start justify-between gap-2 p-2`}>
            <AntDesign name="arrowleft" onPress={()=>navigation.goBack()} size={24} color="white" />
            <FontAwesome name="trophy" size={24} color="gold" />
            <View style={tailwind`items-center`}>
                <Text style={tailwind`text-xl text-white`}>Create Tournament</Text>
            </View>
        </View>
      ),
    })

    const modifyDateTime = (newDateTime) => {
        if (!newDateTime) {
            console.error('new date time is undefined');
            return null;
          }
          const [datePart, timePart] = newDateTime.split(' ');
          const [year, month, day] = datePart.split('/').map(Number);
          const [hour, minute] = timePart.split(':').map(Number);
          const matchDateTime = new Date(Date.UTC(year, month - 1, day, hour, minute));
          return matchDateTime;
      };

    return (
        <ScrollView style={tailwind`flex-1 bg-gray-50 px-6 py-4`}>
            {error?.global && (
                <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                    <Text style={tailwind`text-red-700 text-sm`}>
                        *{error?.global}
                    </Text>
                </View> 
            )}
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`text-gray-700 font-semibold mb-2 text-sm`}>
                Tournament Name*
              </Text>
              <TextInput
                style={tailwind`p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-base`}
                value={name}
                onChangeText={setName}
                placeholder="Enter your tournament name"
                placeholderTextColor="#9CA3AF"
              />
              {(error?.fields?.name || error?.fields?.tournamentName) && (
                <Text style={tailwind`text-red-500 text-sm mt-1`}>
                  *{error.fields.name || error?.fields.tournamentName}
                </Text>
              )}
            </View>
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`text-gray-700 font-semibold mb-2 text-sm`}>
                City *
              </Text>
              <TextInput
                style={tailwind`p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-base`}
                value={city}
                onChangeText={setCity}
                placeholder="Enter your city"
                placeholderTextColor="#9CA3AF"
              />
              {error?.fields.city && (
                <Text style={tailwind`text-red-500 text-sm mt-1`}>
                  *{error.fields.city}
                </Text>
              )}
            </View>
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`text-gray-700 font-semibold mb-2 text-sm`}>
                State *
              </Text>
              <TextInput
                style={tailwind`p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-base`}
                value={state}
                onChangeText={setState}
                placeholder="Enter your state"
                placeholderTextColor="#9CA3AF"
              />
              {error?.fields.state && (
                <Text style={tailwind`text-red-500 text-sm mt-1`}>
                  *{error.fields.state}
                </Text>
              )}
            </View>
            <View style={tailwind`mb-4`}>
              <Text style={tailwind`text-gray-700 font-semibold mb-2 text-sm`}>
                Country *
              </Text>
              <TextInput
                style={tailwind`p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-base`}
                value={country}
                onChangeText={setCountry}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
              />
              {error?.fields.country && (
                <Text style={tailwind`text-red-500 text-sm mt-1`}>
                  *{error.fields.country}
                </Text>
              )}
            </View>
            {/* Date Picker */}
            <View>
              <Pressable
                    onPress={() => setIsDurationVisible(true)}
                    style={tailwind`flex-row justify-between items-center border border-gray-300 p-4 bg-white rounded-md shadow-md mb-2`}
                >
                    <Text style={tailwind`text-gray-600 text-lg`}>
                        {startTimestamp ? startTimestamp: 'Select Start Date'}
                    </Text>
                    <AntDesign name="calendar" size={20} color="gray" />
                </Pressable>
                {(error?.fields.startOn || error?.fields.start_timestamp) && (
                    <Text style={tailwind`text-red-500 text-sm mb-4`}>
                        *{error.fields.start_timestamp || error?.fields.startOn}
                    </Text>
                )}
            </View>

            <View style={tailwind`mb-2`}>
                <Text style={tailwind`text-lg text-gray-700 mb-2`}>Stage</Text>
                <View style={tailwind`flex-row justify-between`}>
                    {Stages.map((item, index) => (
                    <Pressable key={index} onPress={() => {setStage(item)}} style={[tailwind`flex-1 items-center py-3 rounded-lg mx-1 shadow-md bg-white`, stage===item?tailwind`bg-red-400`:tailwind`bg-white`]}>
                        <Text style={tailwind`text-black text-center`}>{item}</Text>
                    </Pressable>
                    ))}
                </View>
            </View>
            {error?.fields.stage && (
                <Text style={tailwind`text-red-500 text-sm mb-4`}>
                    *{error.fields.stage}
                </Text>
            )}
            {/* Select Group Count */}
            {(stage === "group" || stage === "league") && (
                <TextInput
                    style={tailwind`border p-4 text-lg rounded-md bg-white border-gray-300 shadow-md mb-4`}
                    placeholder="Group Count"
                    keyboardType='numeric'
                    placeholderTextColor="gray"
                    value={groupCount}
                    onChangeText={setGroupCount}
                />
            ) }
            {error?.fields.groupCount && (
                <Text style={tailwind`text-red-500 text-sm mb-4`}>
                    *{error.fields.groupCount}
                </Text>
            )}

            {/* Max Team Per Group */}
            {(stage === "Group" || stage === "League") && (
                <TextInput
                    style={tailwind`border p-4 text-lg rounded-md bg-white border-gray-300 shadow-md mb-4`}
                    placeholder="Max Team Per Group"
                    keyboardType='numeric'
                    placeholderTextColor="gray"
                    value={maxTeamGroup}
                    onChangeText={setMaxGroupTeam}
                />
            )}
            {stage === "Group" && error?.fields.maxTeamGroup && (
                <Text style={tailwind`text-red-500 text-sm mb-4`}>
                    *{error.fields.maxTeamGroup}
                </Text>
            )}
            <View style={tailwind`border flex-row rounded-md bg-white border-gray-300 shadow-md mb-4 p-2`}>
                <Text style={tailwind`ml-2 text-lg text-black-200 text-lg`}>Has Knockout Stage: </Text>
                <View style={tailwind`flex-row items-center mb-2`}>
                    <CheckBox
                        value={isKnockout === true}
                        onValueChange={() => {setIsKnockout(true)}}
                    />
                </View>
            </View>
            {/* Submit Button */}
            <Pressable
                style={tailwind`bg-red-400 py-3 rounded-md bg-white items-center shadow-md border border-gray-300 `}
                onPress={() => handleCreateTournament()}
            >
                <Text style={tailwind`text-black-200 text-lg font-semibold`}>
                    Create Tournament
                </Text>
            </Pressable>

            {/* Modals */}
            {isSportVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isSportVisible}
                >
                    <Pressable
                        style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                        onPress={() => setIsSportVisible(false)}
                    >
                        <View style={tailwind`bg-white rounded-t-lg p-4`}>
                            {games?.map((item, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => {
                                        setSport(item.name);
                                        setIsSportVisible(false);
                                    }}
                                    style={tailwind`py-2 border-b border-gray-200`}
                                >
                                    <Text style={tailwind`text-lg text-gray-800`}>
                                        
                                        {item.name}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </Pressable>
                </Modal>
            )}

            {isCountryPicker && (
                <CountryPicker
                    withFilter
                    withFlag
                    countryCode={country}
                    onSelect={(country) => setCountry(country.name)}
                    visible={isCountryPicker}
                    onClose={() => setIsCountryPicker(false)}
                />
            )}

            {isLevelVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isLevelVisible}
                >
                    <Pressable
                        style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                        onPress={() => setIsLevelVisible(false)}
                    >
                        <View style={tailwind`bg-white rounded-t-lg p-4`}>
                            {levels.map((item) => (
                                <Pressable
                                    key={item}
                                    onPress={() => {
                                        setCategory(item.toLocaleLowerCase());
                                        setIsLevelVisible(false);
                                    }}
                                    style={tailwind`py-2 border-b border-gray-200`}
                                >
                                    <Text style={tailwind`text-lg text-gray-800`}>
                                        {item}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </Pressable>
                </Modal>
            )}

            {isDurationVisible && (
                <Modal
                transparent={true}
                animationType="slide"
                visible={isDurationVisible}
              >
                <Pressable onPress={() => setIsDurationVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                  <View style={tailwind`bg-white rounded-md p-4`}>
                    <DateTimePicker
                            onSelectedChange={(startTimestamp) => {
                            setStartTimestamp(startTimestamp);
                            setIsDurationVisible(false);
                        }}
                    />
                    </View>
                </Pressable>
              </Modal>
            )}
        </ScrollView>
    );
};

export default CreateTournament;
