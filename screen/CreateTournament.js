import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Modal, ScrollView} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
    
                const fetchIPLocation = async () => {
                    const location = await getIPBasedLocation();
                    if (isActive && location) {
                        setCity(location.city);
                        setState(location.state);
                        setCountry(location.country);
                    }
                };
    
                fetchIPLocation();
    
                // Cleanup when screen loses focus
                return () => {
                    isActive = false;
                };
            }, [])
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

            const response = await axiosInstance.post(
            `${BASE_URL}/${game.name}/createTournament`,
            data
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
        headerTitle: () => (
            <Text style={tailwind`text-xl font-bold text-white`}>Create Tournament</Text>
        ),
        headerStyle: {
            backgroundColor: tailwind.color('red-400'),
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        headerTintColor: 'white',
        headerTitleAlign: 'center',
        headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
                <AntDesign name="arrowleft" size={24} color="white" />
            </Pressable>
        ),
    });

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
        <ScrollView style={tailwind`flex-1 bg-gray-50`} contentContainerStyle={tailwind`px-5 py-5 pb-12`}>
            {error?.global && (
                <View style={tailwind`mb-4 p-3.5 bg-white rounded-xl border border-gray-100`}>
                    <View style={tailwind`flex-row items-center`}>
                        <MaterialIcons name="error-outline" size={18} color="#f87171" />
                        <Text style={tailwind`text-red-400 text-sm ml-2 flex-1`}>
                            {error?.global}
                        </Text>
                    </View>
                </View>
            )}

            {/* Form card */}
            <View style={tailwind`bg-white rounded-2xl p-5 mb-4`}>
                <View style={tailwind`mb-5`}>
                  <Text style={tailwind`text-gray-900 font-semibold mb-2 text-sm`}>
                    Tournament Name
                  </Text>
                  <TextInput
                    style={tailwind`py-3 px-4 bg-gray-50 rounded-xl text-gray-900 text-sm`}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Premier League 2025"
                    placeholderTextColor="#D1D5DB"
                  />
                  {(error?.fields?.name || error?.fields?.tournamentName) && (
                    <Text style={tailwind`text-red-400 text-xs mt-1.5`}>
                      {error.fields.name || error?.fields.tournamentName}
                    </Text>
                  )}
                </View>

                {/* Location row */}
                <Text style={tailwind`text-gray-900 font-semibold mb-2 text-sm`}>Location</Text>
                <View style={tailwind`flex-row mb-5`}>
                  <View style={tailwind`flex-1 mr-2`}>
                    <TextInput
                      style={tailwind`py-3 px-4 bg-gray-50 rounded-xl text-gray-900 text-sm`}
                      value={city}
                      onChangeText={setCity}
                      placeholder="City"
                      placeholderTextColor="#D1D5DB"
                    />
                    {error?.fields.city && (
                      <Text style={tailwind`text-red-400 text-xs mt-1`}>{error.fields.city}</Text>
                    )}
                  </View>
                  <View style={tailwind`flex-1`}>
                    <TextInput
                      style={tailwind`py-3 px-4 bg-gray-50 rounded-xl text-gray-900 text-sm`}
                      value={state}
                      onChangeText={setState}
                      placeholder="State"
                      placeholderTextColor="#D1D5DB"
                    />
                    {error?.fields.state && (
                      <Text style={tailwind`text-red-400 text-xs mt-1`}>{error.fields.state}</Text>
                    )}
                  </View>
                </View>
                <View style={tailwind`mb-5`}>
                  <TextInput
                    style={tailwind`py-3 px-4 bg-gray-50 rounded-xl text-gray-900 text-sm`}
                    value={country}
                    onChangeText={setCountry}
                    placeholder="Country"
                    placeholderTextColor="#D1D5DB"
                  />
                  {error?.fields.country && (
                    <Text style={tailwind`text-red-400 text-xs mt-1`}>{error.fields.country}</Text>
                  )}
                </View>

                {/* Date Picker */}
                <View style={tailwind`mb-5`}>
                  <Text style={tailwind`text-gray-900 font-semibold mb-2 text-sm`}>Start Date</Text>
                  <Pressable
                        onPress={() => setIsDurationVisible(true)}
                        style={tailwind`flex-row justify-between items-center py-3 px-4 bg-gray-50 rounded-xl`}
                    >
                        <Text style={startTimestamp ? tailwind`text-gray-900 text-sm` : tailwind`text-gray-300 text-sm`}>
                            {startTimestamp ? startTimestamp : 'Select date & time'}
                        </Text>
                        <MaterialIcons name="calendar-today" size={18} color="#9CA3AF" />
                    </Pressable>
                    {(error?.fields.startOn || error?.fields.start_timestamp) && (
                        <Text style={tailwind`text-red-400 text-xs mt-1.5`}>
                            {error.fields.start_timestamp || error?.fields.startOn}
                        </Text>
                    )}
                </View>

                {/* Stage selector */}
                <View style={tailwind`mb-5`}>
                    <Text style={tailwind`text-gray-900 font-semibold mb-2 text-sm`}>Stage</Text>
                    <View style={tailwind`flex-row bg-gray-50 rounded-xl p-1`}>
                        {Stages.map((item, index) => (
                        <Pressable key={index} onPress={() => {setStage(item)}} style={[tailwind`flex-1 items-center py-2.5 rounded-lg`, stage===item && tailwind`bg-red-400`]}>
                            <Text style={[tailwind`text-sm`, stage===item?tailwind`text-white font-semibold`:tailwind`text-gray-400`]}>{item}</Text>
                        </Pressable>
                        ))}
                    </View>
                    {error?.fields.stage && (
                        <Text style={tailwind`text-red-400 text-xs mt-1.5`}>
                            {error.fields.stage}
                        </Text>
                    )}
                </View>

                {/* Group Count */}
                {(stage === "group" || stage === "league" || stage === "Group" || stage === "League") && (
                    <View style={tailwind`mb-5`}>
                        <TextInput
                            style={tailwind`py-3 px-4 bg-gray-50 rounded-xl text-gray-900 text-sm`}
                            placeholder="Group Count"
                            keyboardType='numeric'
                            placeholderTextColor="#D1D5DB"
                            value={groupCount}
                            onChangeText={setGroupCount}
                        />
                        {error?.fields.groupCount && (
                            <Text style={tailwind`text-red-400 text-xs mt-1.5`}>{error.fields.groupCount}</Text>
                        )}
                    </View>
                )}

                {/* Max Team Per Group */}
                {(stage === "Group" || stage === "League") && (
                    <View style={tailwind`mb-5`}>
                        <TextInput
                            style={tailwind`py-3 px-4 bg-gray-50 rounded-xl text-gray-900 text-sm`}
                            placeholder="Max Team Per Group"
                            keyboardType='numeric'
                            placeholderTextColor="#D1D5DB"
                            value={maxTeamGroup}
                            onChangeText={setMaxGroupTeam}
                        />
                        {stage === "Group" && error?.fields.maxTeamGroup && (
                            <Text style={tailwind`text-red-400 text-xs mt-1.5`}>{error.fields.maxTeamGroup}</Text>
                        )}
                    </View>
                )}

                {/* Knockout toggle */}
                <Pressable
                    onPress={() => setIsKnockout(!isKnockout)}
                    style={tailwind`flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-xl mb-2`}
                >
                    <Text style={tailwind`text-sm text-gray-900`}>Has Knockout Stage</Text>
                    <View style={[tailwind`w-11 h-6 rounded-full justify-center px-0.5`, isKnockout ? tailwind`bg-red-400` : tailwind`bg-gray-200`]}>
                        <View style={[tailwind`w-5 h-5 rounded-full bg-white`, isKnockout && tailwind`self-end`]} />
                    </View>
                </Pressable>
            </View>

            {/* Submit Button */}
            <Pressable
                style={[tailwind`py-4 rounded-2xl items-center bg-red-400`, {shadowColor: '#f87171', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4}]}
                onPress={() => handleCreateTournament()}
            >
                <Text style={tailwind`text-white text-base font-semibold`}>
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
