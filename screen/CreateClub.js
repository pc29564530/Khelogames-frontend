import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, FlatList } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import tailwind from 'twrnc';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import { SelectMedia } from '../services/SelectMedia';
import { useDispatch } from 'react-redux';

import { createClub } from '../redux/actions/actions';
import CountryPicker from 'react-native-country-picker-modal';

const category = ['Team', 'Individual', 'Double'];

const CreateClub = ({ route }) => {
    const sports = route.params.sports;
    const navigation = useNavigation();
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [sport, setSport] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [national, setNational] = useState(false);
    const [country, setCountry] = useState('');
    const [gender, setGender] = useState('');
    const [types, setTypes] = useState('');
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();

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
                national: national,
                country: country,
                sports: sports,
                type: types,
            };
            const authToken = await AsyncStorage.getItem('AccessToken');

            const response = await axiosInstance.post(`${BASE_URL}/${sports}/newTeams`,newTeam, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const item = response.data || [];
            dispatch(createClub(item));
            navigation.navigate('Club');
        } catch (err) {
            console.error('Unable to create the club ', err);
        }
    };

    navigation.setOptions({
        headerTitle: '',
        headerRight: () => (
            <View style={tailwind`flex-row items-center justify-center ml-12`}>
                <Pressable style={tailwind`mr-2`} onPress={handleSubmit}>
                    <FontAwesome name="send" size={24} color="black" />
                </Pressable>
            </View>
        ),
    });

    const handleSelectSport = (item) => {
        setSport(item);
    };

    return (
        <View style={tailwind`flex-1 p-4 bg-white`}>
            <View style={tailwind`items-center`}>
                <Pressable onPress={handleMediaSelection} style={tailwind`border rounded-full bg-gray-200 w-24 h-24 items-center justify-center`}>
                    {mediaUrl ? (
                        <Image source={{ uri: mediaUrl }} style={tailwind`w-24 h-24 rounded-full`} />
                    ) : (
                        <Text style={tailwind`text-black text-lg`}>Upload Image</Text>
                    )}
                </Pressable>
                <Pressable onPress={handleMediaSelection} style={tailwind`border rounded-full w-8 h-8 bg-blue-400 items-center justify-center -mt-6 ml-20`}>
                    <FontAwesome name="upload" size={20} color="black" />
                </Pressable>
            </View>
            <View style={tailwind`mb-5`}>
                <TextInput
                    style={tailwind`border p-3 mb-4 text-lg h-16 text-black`}
                    multiline
                    value={teamName}
                    onChangeText={setTeamName}
                    placeholder="Name your team or club.."
                    placeholderTextColor="gray"
                />
            </View>
            <View style={tailwind`mb-5`}>
                <Text style={tailwind`text-lg mb-2`}>Gender</Text>
                <View style={tailwind`flex-row justify-between`}>
                    <Pressable
                        style={[tailwind`rounded-xl border p-3 w-1/2 mr-2`, gender === 'M' ? tailwind`bg-blue-500` : tailwind`bg-white-200`]}
                        onPress={() => setGender('M')}
                    >
                        <Text style={tailwind`text-center text-black`}>Male</Text>
                    </Pressable>
                    <Pressable
                        style={[tailwind`rounded-xl border p-3 w-1/2`, gender === 'F' ? tailwind`bg-pink-500` : tailwind`bg-white-200`]}
                        onPress={() => setGender('F')}
                    >
                        <Text style={tailwind`text-center text-black`}>Female</Text>
                    </Pressable>
                </View>
            </View>
            <View style={tailwind`mb-5`}>
                <Text style={tailwind`text-lg mb-2`}>National</Text>
                <View style={tailwind`flex-row justify-between`}>
                    <Pressable
                        style={[tailwind`rounded-xl border p-3 w-1/2 mr-2`, national ? tailwind`bg-green-500` : tailwind`bg-gray-200`]}
                        onPress={() => setNational(true)}
                    >
                        <Text style={tailwind`text-center text-white`}>Yes</Text>
                    </Pressable>
                    <Pressable
                        style={[tailwind`rounded-xl border p-3 w-1/2`, !national ? tailwind`bg-red-500` : tailwind`bg-gray-200`]}
                        onPress={() => setNational(false)}
                    >
                        <Text style={tailwind`text-center text-white`}>No</Text>
                    </Pressable>
                </View>
            </View>
            <Pressable onPress={() => setIsCountryPicker(true)} style={tailwind`mb-5 border p-3 rounded-xl bg-gray-200`}>
                <Text style={tailwind`text-lg text-center`}>{country ? country : 'Select Country'}</Text>
            </Pressable>
            <View style={tailwind`mb-5`}>
                <Text style={tailwind`text-lg mb-2`}>Category</Text>
                <FlatList
                    data={category}
                    horizontal
                    renderItem={({ item }) => (
                        <Pressable
                            key={item}
                            style={[tailwind`border rounded-md bg-orange-200 p-2 mr-2`, types === item ? tailwind`bg-orange-500` : null]}
                            onPress={() => setTypes(item.toLowerCase())}
                        >
                            <Text style={tailwind`text-black`}>{item}</Text>
                        </Pressable>
                    )}
                    keyExtractor={(item) => item}
                />
            </View>
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
