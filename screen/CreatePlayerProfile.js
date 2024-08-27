import {useState} from 'react';
import {View, Text, Pressable, Modal, ScrollView} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import CountryPicker from 'react-native-country-picker-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
const filePath = require('../assets/position.json');
const sports = ['Football', 'Basketball', 'Tennis', 'Cricket', 'Volleyball'];

const CreatePlayerProfile = () => {

    //const [playerBio, setPlayerBio] = useState('');
    const [playerSport, setPlayerSport] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [position, setPosition] = useState('');
    const [playerCountry, setPlayerCountry] = useState('');
    const [isSportVisible, setIsSportVisible] = useState(false);
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [isPositionsVisible, setIsPositionsVisible] = useState(false);
    const axiosInstance = useAxiosInterceptor();
    const navigation  = useNavigation();
    const handleSportSelection = (sport) => {
        setPlayerSport(sport);
        setIsSportVisible(false);
    }

    const handleAddPlayer = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const username = await AsyncStorage.getItem('User')
            const data = {
                    name:username,
                    positions: position,
                    sports: playerSport,
                    country: playerCountry.name
            }
            console.log(data)
            const response = await axiosInstance.post(`${BASE_URL}/newPlayer`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setPlayerCountry('');
            setPlayerSport('');
            setPosition('');
            navigation.goBack();
        } catch (err) {
            console.error("unable to add the player data: ", err);
        }
    }

    const handleCloseModal = () => {
        setIsSportVisible(false);
    }

    return (
        <View style={tailwind`flex-1 gap-20`}>
            <View style={tailwind`border rounded-full w-20 h-20 bg-pink items-center justify-center mt-4 ml-4`}>
                <Pressable>
                    <FontAwesome name="upload" size={10} color="black" />
                </Pressable>
            </View>
            <Pressable  style={tailwind` flex-row ml-4 mt-4 rounded-lg border w-50 justify-center`} onPress={() => setIsPositionsVisible(true)}>
                <Text style={tailwind` text-xl mb-4 `} >Positions</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black"/>
            </Pressable>
            <Pressable  style={tailwind` flex-row ml-4 mt-4 rounded-lg border w-50 justify-center`} onPress={() => setIsCountryPicker(true)}>
                <Text style={tailwind` text-xl mb-4 `} >Country</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black"/>
            </Pressable>
            <Pressable  style={tailwind` flex-row ml-4 mt-4 rounded-lg border w-50 justify-center`} onPress={() => setIsSportVisible(true)}>
                <Text style={tailwind` text-xl mb-4 `} >Sport</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black"/>
            </Pressable>
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
                    onRequestClose={handleCloseModal}
                >
                    <Pressable onPress={() => setIsSportVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
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
            {isPositionsVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isPositionsVisible}
                    onRequestClose={handleCloseModal}
                >
                    <Pressable onPress={() => setIsPositionsVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <ScrollView>
                                {filePath["positions"].map((item, index ) => (
                                    <Pressable key={index} onPress={() => {setPosition(item.code), setIsPositionsVisible(false)}} style={tailwind`p-2  border-b-2 border-gray-200`}> 
                                        <Text style={tailwind`text-xl`}>{item.name}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}

export default CreatePlayerProfile;