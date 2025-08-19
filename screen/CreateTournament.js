import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Modal, ScrollView} from 'react-native';
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

const CreateTournament = () => {
    const [tournamentName, setTournamentName] = useState('');
    const [startOn, setStartOn] = useState(null);
    const [country, setCountry] = useState('');
    const [category, setCategory] = useState('');
    const [groupCount, setGroupCount] = useState(null);
    const [maxTeamGroup, setMaxGroupTeam] = useState(null);
    const [stage, setStage] = useState(null)
    

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
    
    const handleCreateTournament = async () => {
        try {
            const data = {
                    name: tournamentName,
                    country: category==='international'?'':country,
                    status: "not_started",
                    level: category,
                    start_timestamp: modifyDateTime(startOn),
                    game_id: game.id,
                    group_count: parseInt(groupCount, 10),
                    max_group_team: parseInt(maxTeamGroup, 10),
                    stage: stage.toLowerCase(),
                    has_knockout: isKnockout
                }
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/createTournament`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const item = response.data;
            dispatch(addTournament(item));
            // const organizerData = {
            //     organizer_name: user,
            //     tournament_id: item.tournament_id,
            // };

            // try {
            //     await axiosInstance.post(`${BASE_URL}/createOrganizer`, organizerData, {
            //         headers: {
            //             'Authorization': `Bearer ${authToken}`,
            //             'Content-Type': 'application/json',
            //         },
            //     });
            // } catch (err) {
            //     console.log("Unable to add the organizer to the tournament: ", err);
            // }
            navigation.navigate("TournamentPage", { tournament: item, currentRole: 'user' });

        } catch (err) {
            console.log("Unable to create a new tournament ", err);
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
            {/* Input Fields */}
            <TextInput
                style={tailwind`border p-4 text-lg rounded-md bg-white border-gray-300 shadow-md mb-2`}
                placeholder="Tournament Name"
                placeholderTextColor="gray"
                value={tournamentName}
                onChangeText={setTournamentName}
            />

            {/* Country Selection */}
            <Pressable
                onPress={() => setIsCountryPicker(true)}
                style={tailwind`flex-row justify-between items-center border border-gray-300 p-4 bg-white rounded-md shadow-md mb-2`}
            >
                <Text style={tailwind`text-gray-600 text-lg`}>
                    {country ? `Country: ${country}` : 'Select Country'}
                </Text>
                <AntDesign name="down" size={20} color="gray" />
            </Pressable>

            {/* Level Selection */}
            <Pressable
                onPress={() => setIsLevelVisible(true)}
                style={tailwind`flex-row justify-between items-center border border-gray-300 p-4 bg-white rounded-md shadow-md mb-2`}
            >
                <Text style={tailwind`text-gray-600 text-lg`}>
                    {category || 'Select Level'}
                </Text>
                <AntDesign name="down" size={20} color="gray" />
            </Pressable>

            {/* Date Picker */}
            <Pressable
                onPress={() => setIsDurationVisible(true)}
                style={tailwind`flex-row justify-between items-center border border-gray-300 p-4 bg-white rounded-md shadow-md mb-2`}
            >
                <Text style={tailwind`text-gray-600 text-lg`}>
                    {startOn ? startOn: 'Select Start Date'}
                </Text>
                <AntDesign name="calendar" size={20} color="gray" />
            </Pressable>

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
            {/* Select Group Count */}
            {(stage === "Group" || stage === "League") && (
                <TextInput
                    style={tailwind`border p-4 text-lg rounded-md bg-white border-gray-300 shadow-md mb-4`}
                    placeholder="Group Count"
                    keyboardType='numeric'
                    placeholderTextColor="gray"
                    value={groupCount}
                    onChangeText={setGroupCount}
                />
            ) }

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
                    onSelect={(country) => setCountry(country.cca2)}
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
                            onSelectedChange={(startOn) => {
                            setStartOn(startOn);
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
