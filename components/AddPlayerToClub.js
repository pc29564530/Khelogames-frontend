import React ,{useState} from 'react';
import {View, Text, Pressable, TextInput, Modal} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import CountryPicker from 'react-native-country-picker-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';

const sports = ['Football', 'Basketball', 'Tennis', 'Cricket', 'Volleyball'];

const AddPlayerToClub = () => {
    const [playerName, setPlayerName] = useState('');
    const [playerBio, setPlayerBio] = useState();
    const [playerSport, setPlayerSport] = useState('');
    const [playerCountry, setPlayerCountry] = useState('');
    const [isSportVisible, setIsSportVisible] = useState(false);
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const axiosInstance = useAxiosInterceptor();

    const handleSportSelection = (sport) => {
        setPlayerSport(sport);
        setIsSportVisible(false);
    }

    const handleAddPlayer = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/addPlayerProfile`, {
                params: {
                    player_name:playerName,
                    player_avatar_url: "",
                    player_bio: playerBio,
                    player_category: "",
                    player_sport: playerSport,
                    nation: playerCountry
                },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (err) {
            console.error("unable to add the player data: ", err);
        }
    }

    return (
        <View style={tailwind`flex-1 gap-20`}>
            <View style={tailwind`border rounded-full w-20 h-20 bg-pink items-center justify-center mt-4 ml-4`}>
                <Pressable>
                    <FontAwesome name="upload" size={10} color="black" />
                </Pressable>
            </View>
            <View style={tailwind`ml-4 mt-4`}>
                <TextInput
                    value={playerName}
                    onChangeText={setPlayerName}
                    placeholder="Player Name..."
                    placeholderTextColor="black"
                    style={tailwind`border-b-2 border-gray-200 text-lg mb-4`}
                />
            </View>
            <View style={tailwind`ml-4 mt-4`}>
                <TextInput
                    value={playerBio}
                    onChangeText={setPlayerBio}
                    placeholder="Bio..."
                    placeholderTextColor="black"
                    style={tailwind`border-b-2 border-gray-200 text-lg mb-4`}
                    multiline
                />
            </View>
            <View style={tailwind`absolute bottom-0 w-full bg-white p-2 items-end flex-row justify-between`}>
                <View style={tailwind`flex-row gap-5`}>
                    <Pressable style={tailwind`items-center`} onPress={() => setIsSportVisible(true)} >
                        <MaterialIcons name="sports" size={24} color="black"/>
                        <Text>Sport Type</Text>
                    </Pressable>
                    <Pressable style={tailwind`items-center`} onPress={() => setIsCountryPicker(true)}>
                        <MaterialIcons name="place" size={24} color="black"/>
                        <Text>Country</Text>
                    </Pressable>
                    {isCountryPicker && (
                        <CountryPicker
                            withFilter
                            withFlag
                            withCountryNameButton
                            withAlphaFilter
                            withCallingCode
                            withEmoji
                            countryCode={playerCountry}
                            onSelect={(selectedCountry) => setPlayerCountry(selectedCountry)}
                            visible={isCountryPicker}
                            onClose={() => setIsCountryPicker(false)}
                        />
                    )}
                </View>
                <Pressable style={tailwind`border rounded-md`} onPress={() => handleAddPlayer()}>
                    <Text style={tailwind`text-lg p-1 bg-pink-300`}>Post</Text>
                </Pressable>
            </View>
            {isSportVisible && (
                <Modal
                transparent={true}
                animationType="slide"
                visible={isSportVisible}
                onRequestClose={() => setIsSportVisible(false)}
            >
                <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                    <View style={tailwind`bg-white rounded-md p-4`}>
                        {sports.map((item, index) => (
                            <Pressable key={index} onPress={() => handleSportSelection(item)}>
                                <Text style={tailwind`text-xl py-2`}>{item}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </Modal>
            )}
        </View>
    );
}

export default AddPlayerToClub;