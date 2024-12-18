import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, FlatList, Image, ScrollView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import tailwind from 'twrnc';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import { SelectMedia } from '../services/SelectMedia';
import { useDispatch, useSelector } from 'react-redux';
import { createClub } from '../redux/actions/actions';
import CountryPicker from 'react-native-country-picker-modal';

const CreateClub = ({ route }) => {
    const sports = route.params.sports;
    const navigation = useNavigation();
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [national, setNational] = useState(false);
    const [country, setCountry] = useState('');
    const [gender, setGender] = useState('');
    const [category, setCategory] = useState('');
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const game = useSelector((state) => state.sportReducers.game)

    const handleMediaSelection = async () => {
        const { mediaURL } = await SelectMedia();
        setMediaUrl(mediaURL);
    };

    const handleSubmit = async () => {
        try {
            const user = await AsyncStorage.getItem('User');
            const newTeam = {
                name: teamName,
                media_url: mediaUrl,
                gender: gender,
                country: country,
                type: category,
                player_count: 0,
                game_id: game.id
            };
            console.log("data: ", newTeam)
            const authToken = await AsyncStorage.getItem('AccessToken');

            const response = await axiosInstance.post(
                `${BASE_URL}/${sports}/newTeams`,
                newTeam,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const item = response.data || [];
            dispatch(createClub(item));
            navigation.navigate('Club');
        } catch (err) {
            console.error('Unable to create the club ', err);
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
        <View style={tailwind`flex-1 p-2 bg-white`}>
            <View style={tailwind`items-center mb-4`}>
                <Pressable
                    onPress={handleMediaSelection}
                    style={tailwind`w-24 h-24 rounded-full bg-gray-200 items-center justify-center shadow-lg`}
                >
                    {mediaUrl ? (
                        <Image source={{ uri: mediaUrl }} style={tailwind`w-32 h-32 rounded-full`} />
                    ) : (
                        <FontAwesome name="camera" size={32} color="gray" />
                    )}
                </Pressable>
                <Text style={tailwind`text-sm text-gray-500 mt-2`}>Upload a team logo</Text>
            </View>

            <View style={tailwind`mb-4`}>
                <Text style={tailwind`text-xl font-semibold text-gray-800 mb-2`}>Team Name</Text>
                <TextInput
                    style={tailwind`border p-4 text-lg rounded-md bg-white shadow-sm`}
                    value={teamName}
                    onChangeText={setTeamName}
                    placeholder="Enter team or club name"
                    placeholderTextColor="gray"
                />
            </View>

            <View style={tailwind`mb-4`}>
                <Text style={tailwind`text-xl font-semibold text-gray-800 mb-2`}>Gender</Text>
                <View style={tailwind`flex-row justify-between`}>
                    <Pressable
                        onPress={() => setGender('M')}
                        style={[
                            tailwind`flex-1 items-center py-3 rounded-lg mx-1`,
                            gender === 'M'
                                ? tailwind`bg-blue-500 text-white`
                                : tailwind`bg-gray-200`,
                        ]}
                    >
                        <Text
                            style={[
                                tailwind`text-lg font-semibold`,
                                gender === 'M' ? tailwind`text-white` : tailwind`text-gray-600`,
                            ]}
                        >
                            Male
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setGender('F')}
                        style={[
                            tailwind`flex-1 items-center py-3 rounded-lg mx-1`,
                            gender === 'F'
                                ? tailwind`bg-pink-500 text-white`
                                : tailwind`bg-gray-200`,
                        ]}
                    >
                        <Text
                            style={[
                                tailwind`text-lg font-semibold`,
                                gender === 'F' ? tailwind`text-white` : tailwind`text-gray-600`,
                            ]}
                        >
                            Female
                        </Text>
                    </Pressable>
                </View>
            </View>

            <View style={tailwind`mb-4`}>
                <Text style={tailwind`text-xl font-semibold text-gray-800 mb-2`}>Category</Text>
                <View style={tailwind`flex-row justify-between`}>
                    {['team', 'individual', 'double'].map((item) => (
                        <Pressable
                            key={item}
                            onPress={() => setCategory(item)}
                            style={[
                                tailwind`flex-1 items-center py-3 rounded-lg mx-1`,
                                category === item
                                    ? tailwind`bg-green-500 text-white`
                                    : tailwind`bg-gray-200`,
                            ]}
                        >
                            <Text
                                style={[
                                    tailwind`text-lg font-semibold`,
                                    category === item
                                        ? tailwind`text-white`
                                        : tailwind`text-gray-600`,
                                ]}
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <View style={tailwind`mb-4`}>
                <Pressable
                    onPress={() => setIsCountryPicker(true)}
                    style={tailwind`border p-4 rounded-lg bg-white shadow-md flex-row items-center justify-between`}
                >
                    <Text style={tailwind`text-lg text-gray-600`}>
                        {country ? country : 'Select Country'}
                    </Text>
                    <FontAwesome name="chevron-down" size={18} color="gray" />
                </Pressable>
            </View>

            <Pressable
                onPress={handleSubmit}
                style={tailwind`bg-blue-600 py-4 rounded-lg shadow-lg`}
            >
                <Text style={tailwind`text-lg font-bold text-white text-center`}>Create Team</Text>
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
        </View>
    );
};

export default CreateClub;
