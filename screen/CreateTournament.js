import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Modal, ScrollView } from 'react-native';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; 
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addTournament } from '../redux/actions/actions'; 
import { useDispatch } from 'react-redux';
import CountryPicker from 'react-native-country-picker-modal';

const filePath = require('../assets/status_code.json');

const CreateTournament = () => {
    const [country, setCountry] = useState('');
    const [tournamentName, setTournamentName] = useState('');
    const [isFormatVisible, setIsFormatVisible] = useState(false);
    const [statusCode, setStatusCode] = useState('');
    const [isStatusVisible, setIsStatusVisible] = useState(false);
    const [status, setStatus] = useState([]);
    const [isSportVisible, setIsSportVisible] = useState(false);
    const [isDurationVisible, setIsDurationVisible] = useState(false);
    const [isLevelVisible, setIsLevelVisible] = useState(false);
    const [tournament, setTournament] = useState([]);
    const [sport, setSport] = useState('');
    const axiosInstance = useAxiosInterceptor();
    const [startOn, setStartOn] = useState('');
    const [endOn, setEndOn] = useState('');
    const navigation = useNavigation();
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [isCategoryVisible, setIsCategoryVisible] = useState(false);
    const [category, setCategory] = useState('');
    const dispatch = useDispatch();
    const formats = ['group', 'league', 'knockout'];
    const sports = ['Football', 'Basketball', 'Tennis', 'Cricket', 'Volleyball'];
    const levels = ['international', 'country', 'local'];

    useEffect(() => {
        const readJSONFile = async () => {
            try {
                setStatus(filePath['status_codes']);
            } catch (error) {
                console.error('Error reading or parsing json file:', error);
            }
        };

        readJSONFile();
    }, []);

    const handleDurationModal = () => {
        setIsDurationVisible(!isDurationVisible);
    }

    const handleSportModal = () => {
        setIsSportVisible(!isSportVisible);
    }

    const handleSportSelection = (selectedSport) => {
        setSport(selectedSport);
        setIsSportVisible(false);
    }

    const handleCreatedTournament = async () => {
        try {
            let data;
            if (!startOn) {
                alert("Please select the start timestamp.");
            } else {
                data = {
                    tournament_name: tournamentName,
                    sports: sport,
                    country: category==='international'?'':country,
                    level: category,
                    start_timestamp: startOn,
                    status_code: statusCode
                }
                console.log("Data: ", data)
            }
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const response = await axiosInstance.post(`${BASE_URL}/createTournament`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const item = response.data;
            dispatch(addTournament(item));
            const organizerData = {
                organizer_name: user,
                tournament_id: item.tournament_id,
            };

            try {
                await axiosInstance.post(`${BASE_URL}/createOrganizer`, organizerData, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
            } catch (err) {
                console.log("Unable to add the organizer to the tournament: ", err);
            }
            navigation.navigate("TournamentPage", { tournament: item, currentRole: 'user', sport: item.sport_type });

        } catch (err) {
            console.log("Unable to create a new tournament ", err);
        }
    }

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || startOn;
        setStartOn(currentDate);
        setIsDurationVisible(false);
    }

    const handleCategory = (item) => {
        if (item === 'country' || item === 'local') {
            setIsCountryPicker(true);
            setCategory(item);
        } else {
            setCategory(item);
        }
        setIsLevelVisible(false)
        
    }

    return (
        <ScrollView style={tailwind`flex-1 bg-gray-100`}>
            <View style={tailwind`p-4`}>
                <View style={tailwind`border rounded-md h-60 w-full bg-white justify-center items-center`}>
                    <Pressable style={tailwind`absolute bottom-0 left-0 m-2`} onPress={() => {}}>
                        <EvilIcons name="trophy" size={40} color="black" />
                        <Text>Logo</Text> 
                    </Pressable>
                </View>
                <View style={tailwind`mt-4`}>
                    <TextInput 
                        value={tournamentName} 
                        onChangeText={setTournamentName} 
                        placeholder="Tournament Name.." 
                        placeholderTextColor="gray" 
                        style={tailwind`text-xl border-b-2 border-gray-400 pb-2`}
                    />
                </View>
                <Pressable onPress={handleSportModal} style={tailwind`mt-4 border-b-2 border-gray-400 pb-2`}>
                    <Text style={tailwind`text-xl text-gray-600`}>Select Sport</Text>
                </Pressable>
                {/* <Pressable onPress={() => setIsCategoryVisible(true)} style={tailwind`mt-4 border-b-2 border-gray-400 pb-2`}>
                    <Text style={tailwind`text-xl text-gray-600`}>Select Country</Text>
                </Pressable> */}
                <Pressable onPress={handleDurationModal} style={tailwind`mt-4 border-b-2 border-gray-400 pb-2`}>
                    <Text style={tailwind`text-xl text-gray-600`}>Select Start Date</Text>
                </Pressable>
                <Pressable onPress={() => setIsStatusVisible(true)} style={tailwind`mt-4 border-b-2 border-gray-400 pb-2`}>
                    <Text style={tailwind`text-xl text-gray-600`}>Select Status Code</Text>
                </Pressable>
                <Pressable onPress={() => setIsLevelVisible(true)} style={tailwind`mt-4 border-b-2 border-gray-400 pb-2`}>
                    <Text style={tailwind`text-xl text-gray-600`}>Select Level</Text>
                </Pressable>
                <View style={tailwind`mt-6 items-end`}>
                    <Pressable style={tailwind`bg-blue-500 p-3 rounded-md`} onPress={handleCreatedTournament}>
                        <Text style={tailwind`text-lg text-white`}>Create Tournament</Text>
                    </Pressable>
                </View>
            </View>

            {isStatusVisible && (
                <Modal 
                    transparent={true}
                    animationType='slide'
                    visible={isStatusVisible}
                    
                    onRequestClose={() => setIsStatusVisible(false)}
                >
                    <Pressable onPress={() => setIsStatusVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <ScrollView style={tailwind`bg-white rounded-md p-4 h-2/4`}>
                            {status?.map((item, index) => (
                                <Pressable key={index} onPress={() => {setStatusCode(item.type); setIsStatusVisible(false);}}>
                                    <Text style={tailwind`text-xl py-2`}>{item.type}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Modal>
            )}

            {isLevelVisible && (
                <Modal 
                    transparent={true}
                    animationType='slide'
                    visible={isLevelVisible}
                    onRequestClose={() => setIsLevelVisible(false)}
                >
                    <Pressable onPress={() => setIsLevelVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <Pressable onPress={() => handleCategory('international')}>
                                <Text style={tailwind`text-xl py-2`}>International</Text>
                            </Pressable>
                            <Pressable onPress={() => handleCategory('country')}>
                                <Text style={tailwind`text-xl py-2`}>Country</Text>
                            </Pressable>
                            <Pressable onPress={() => handleCategory('local')}>
                                <Text style={tailwind`text-xl py-2`}>Local</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            )}

            {isSportVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isSportVisible}
                    onRequestClose={handleSportModal}
                >
                    <Pressable onPress={handleSportModal} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            {sports.map((item, index) => (
                                <Pressable key={index} onPress={() => handleSportSelection(item)}>
                                    <Text style={tailwind`text-xl py-2`}>{item}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </Pressable>
                </Modal>
            )}

            {isDurationVisible && (
                <DateTimePicker 
                    testID='dateTimePicker'
                    value={startOn ? startOn : new Date()}
                    mode='date'
                    is24Hour={true}
                    display='default'
                    onChange={handleDateChange}
                />
            )}

            {isCountryPicker && (
                <CountryPicker
                    withFilter
                    withFlag
                    withCountryNameButton
                    withAlphaFilter
                    withCallingCode
                    withEmoji
                    countryCode={country}
                    onSelect={(selectedCountry) => { setCountry(selectedCountry.cca2); setIsCountryPicker(false); }}
                    visible={isCountryPicker}
                    onClose={() => setIsCountryPicker(false)}
                />
            )}
        </ScrollView>
    );
}

export default CreateTournament;
