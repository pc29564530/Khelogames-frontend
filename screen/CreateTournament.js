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
import { getIPBasedLocation } from '../utils/locationService';


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
                tournamentName: name,
                city,
                state,
                country,
                startOn: startTimestamp,
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
                ...(stage === "Group" && { group_count: parseInt(groupCount, 10)}),
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


            const item = response.data

            if (item.data) {
                dispatch(addTournament(item.data));
                navigation.popToTop()
                navigation.navigate("TournamentPage", { tournament: item.data, currentRole: "user" });
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
            backgroundColor: '#0f172a',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#1e293b',
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

    const today = new Date().toISOString().split("T")[0];

    return (
        <ScrollView style={{flex: 1, backgroundColor: '#0f172a'}} contentContainerStyle={tailwind`px-5 py-5 pb-12`}>
            {error?.global && (
                <View style={[tailwind`mb-4 p-3.5 rounded-xl`, {backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1}]}>
                    <View style={tailwind`flex-row items-center`}>
                        <MaterialIcons name="error-outline" size={18} color="#f87171" />
                        <Text style={tailwind`text-red-400 text-sm ml-2 flex-1`}>
                            {error?.global}
                        </Text>
                    </View>
                </View>
            )}

            {/* Form card */}
            <View style={[tailwind`rounded-2xl p-5 mb-4`, {backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1}]}>
                <View style={tailwind`mb-5`}>
                  <Text style={{color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14}}>
                    Tournament Name
                  </Text>
                  <TextInput
                    style={[tailwind`py-3 px-4 rounded-xl text-sm`, {backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', borderWidth: 1}]}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Premier League 2025"
                    placeholderTextColor="#475569"
                  />
                  {(error?.fields?.name || error?.fields?.tournamentName) && (
                    <Text style={tailwind`text-red-400 text-xs mt-1.5`}>
                      {error.fields.name || error?.fields.tournamentName}
                    </Text>
                  )}
                </View>

                {/* Location row */}
                <Text style={{color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14}}>Location</Text>
                <View style={tailwind`flex-row mb-5`}>
                  <View style={tailwind`flex-1 mr-2`}>
                    <TextInput
                      style={[tailwind`py-3 px-4 rounded-xl text-sm`, {backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', borderWidth: 1}]}
                      value={city}
                      onChangeText={setCity}
                      placeholder="City"
                      placeholderTextColor="#475569"
                    />
                    {error?.fields.city && (
                      <Text style={tailwind`text-red-400 text-xs mt-1`}>{error.fields.city}</Text>
                    )}
                  </View>
                  <View style={tailwind`flex-1`}>
                    <TextInput
                      style={[tailwind`py-3 px-4 rounded-xl text-sm`, {backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', borderWidth: 1}]}
                      value={state}
                      onChangeText={setState}
                      placeholder="State"
                      placeholderTextColor="#475569"
                    />
                    {error?.fields.state && (
                      <Text style={tailwind`text-red-400 text-xs mt-1`}>{error.fields.state}</Text>
                    )}
                  </View>
                </View>
                <View style={tailwind`mb-5`}>
                  <TextInput
                    style={[tailwind`py-3 px-4 rounded-xl text-sm`, {backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', borderWidth: 1}]}
                    value={country}
                    onChangeText={setCountry}
                    placeholder="Country"
                    placeholderTextColor="#475569"
                  />
                  {error?.fields.country && (
                    <Text style={tailwind`text-red-400 text-xs mt-1`}>{error.fields.country}</Text>
                  )}
                </View>

                {/* Date Picker */}
                <View style={tailwind`mb-5`}>
                  <Text style={{color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14}}>Start Date</Text>
                  <Pressable
                        onPress={() => setIsDurationVisible(true)}
                        style={[tailwind`flex-row justify-between items-center py-3 px-4 rounded-xl`, {backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1}]}
                    >
                        <Text style={startTimestamp ? {color: '#f1f5f9', fontSize: 14} : {color: '#475569', fontSize: 14}}>
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
                    <Text style={{color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14}}>Stage</Text>
                    <View style={[tailwind`flex-row rounded-xl p-1`, {backgroundColor: '#0f172a'}]}>
                        {Stages.map((item, index) => (
                        <Pressable key={index} onPress={() => {setStage(item)}} style={[tailwind`flex-1 items-center py-2.5 rounded-lg`, stage===item && tailwind`bg-red-400`]}>
                            <Text style={[tailwind`text-sm`, stage===item?tailwind`text-white font-semibold`:{color: '#94a3b8'}]}>{item}</Text>
                        </Pressable>
                        ))}
                    </View>
                    {error?.fields.stage && (
                        <Text style={tailwind`text-red-400 text-xs mt-1.5`}>
                            {error.fields.stage}
                        </Text>
                    )}
                </View>

                {/* Group Count — only for Group stage, League always has 1 group (set by backend) */}
                {stage === "Group" && (
                    <View style={tailwind`mb-5`}>
                        <Text style={{color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14}}>Number of Groups</Text>
                        <TextInput
                            style={[tailwind`py-3 px-4 rounded-xl text-sm`, {backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', borderWidth: 1}]}
                            placeholder="e.g. 4"
                            keyboardType='numeric'
                            placeholderTextColor="#475569"
                            value={groupCount}
                            onChangeText={setGroupCount}
                        />
                        {error?.fields.groupCount && (
                            <Text style={tailwind`text-red-400 text-xs mt-1.5`}>{error.fields.groupCount}</Text>
                        )}
                    </View>
                )}

                {/* Max Team Per Group — shown for both Group and League */}
                {(stage === "Group" || stage === "League") && (
                    <View style={tailwind`mb-5`}>
                        <Text style={{color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14}}>Max Teams Per Group</Text>
                        <TextInput
                            style={[tailwind`py-3 px-4 rounded-xl text-sm`, {backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', borderWidth: 1}]}
                            placeholder="e.g. 6"
                            keyboardType='numeric'
                            placeholderTextColor="#475569"
                            value={maxTeamGroup}
                            onChangeText={setMaxGroupTeam}
                        />
                        {error?.fields.maxTeamGroup && (
                            <Text style={tailwind`text-red-400 text-xs mt-1.5`}>{error.fields.maxTeamGroup}</Text>
                        )}
                    </View>
                )}

                {/* Knockout toggle */}
                <Pressable
                    onPress={() => setIsKnockout(!isKnockout)}
                    style={[tailwind`flex-row items-center justify-between py-3 px-4 rounded-xl mb-2`, {backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1}]}
                >
                    <Text style={{color: '#f1f5f9', fontSize: 14}}>Has Knockout Stage</Text>
                    <View style={[tailwind`w-11 h-6 rounded-full justify-center px-0.5`, isKnockout ? tailwind`bg-red-400` : {backgroundColor: '#475569'}]}>
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
                        style={tailwind`flex-1 justify-end bg-black/60`}
                        onPress={() => setIsSportVisible(false)}
                    >
                        <View style={[tailwind`rounded-t-lg p-4`, {backgroundColor: '#1e293b', borderTopWidth: 1, borderColor: '#334155'}]}>
                            {games?.map((item, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => {
                                        setSport(item.name);
                                        setIsSportVisible(false);
                                    }}
                                    style={[tailwind`py-2`, {borderBottomWidth: 1, borderColor: '#334155'}]}
                                >
                                    <Text style={{color: '#cbd5e1', fontSize: 18}}>

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
                        style={tailwind`flex-1 justify-end bg-black/60`}
                        onPress={() => setIsLevelVisible(false)}
                    >
                        <View style={[tailwind`rounded-t-lg p-4`, {backgroundColor: '#1e293b', borderTopWidth: 1, borderColor: '#334155'}]}>
                            {levels.map((item) => (
                                <Pressable
                                    key={item}
                                    onPress={() => {
                                        setCategory(item.toLocaleLowerCase());
                                        setIsLevelVisible(false);
                                    }}
                                    style={[tailwind`py-2`, {borderBottomWidth: 1, borderColor: '#334155'}]}
                                >
                                    <Text style={{color: '#cbd5e1', fontSize: 18}}>
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
                    visible={isDurationVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsDurationVisible(false)}
                >
                    <View style={tailwind`flex-1 justify-end bg-black/60`}>
                        <Pressable
                            style={tailwind`flex-1`}
                            onPress={() => setIsDurationVisible(false)}
                        />
                        <View
                            style={[
                                tailwind`p-4 rounded-t-3xl`,
                                { backgroundColor: "#0f172a", borderTopWidth: 1, borderColor: "#334155" }
                            ]}
                        >
                            {/* Drag indicator */}
                            <View
                                style={{
                                width: 40,
                                height: 4,
                                backgroundColor: "#475569",
                                borderRadius: 2,
                                alignSelf: "center",
                                marginBottom: 10
                                }}
                            />

                            {/* Header */}
                            <View style={tailwind`flex-row items-center justify-between mb-3`}>
                                <Text style={{ color: "#f1f5f9", fontSize: 18, fontWeight: "700" }}>
                                Select Date
                                </Text>

                                <Pressable onPress={() => setIsDurationVisible(false)}>
                                    <MaterialIcons name="close" size={22} color="#94a3b8" />
                                </Pressable>
                            </View>
                            <DateTimePicker
                                current={today}
                                date={startTimestamp || today}
                                minimumDate={today}
                                mode="calendar"
                                onSelectedChange={(dateString) => {
                                    setStartTimestamp(dateString);
                                    setIsDurationVisible(false);
                                }}
                                options={{
                                    backgroundColor: "#0f172a",
                                    textHeaderColor: "#f87171",
                                    textDefaultColor: "#f1f5f9",
                                    selectedTextColor: "#fff",
                                    mainColor: "#f87171",
                                    textSecondaryColor: "#94a3b8",
                                    borderColor: "#334155",
                                }}
                            />
                            </View>
                    </View>
                 </Modal>
            )}
        </ScrollView>
    );
};

export default CreateTournament;
