import {useState, useEffect} from 'react';
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
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector, useDispatch } from 'react-redux';
import {setGames, setGame } from '../redux/actions/actions';
import { sportsServices } from '../services/sportsServices';

const CreatePlayerProfile = () => {
    const profile = useSelector((state) => state.profile.profile)
    //const [playerBio, setPlayerBio] = useState('');
    const [playerSport, setPlayerSport] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [position, setPosition] = useState('');
    const [playerCountry, setPlayerCountry] = useState('');
    const [isSportVisible, setIsSportVisible] = useState(false);
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [isPositionsVisible, setIsPositionsVisible] = useState(false);
    const dispatch = useDispatch();
    const games = useSelector(state => state.sportReducers.games);
    const game = useSelector(state => state.sportReducers.game)
    const axiosInstance = useAxiosInterceptor();
    const navigation  = useNavigation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await sportsServices({axiosInstance});
                dispatch(setGames(data));
            } catch (error) {
                console.error("unable to fetch games data: ", error)
            }
        };
        fetchData();
    }, []);

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
                    sports: playerSport.name,
                    country: playerCountry.name,
                    game_id: playerSport.id,
                    profile_id: profile.id
            }
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

    navigation.setOptions({
        headerTitle: 'Create Player',
        headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="white" style={tailwind`ml-4`} />
            </Pressable>
        ),
    });

    const handleCloseModal = () => {
        setIsSportVisible(false);
    }

    return (
        <View style={tailwind`flex-1 mx-3 pt-6`}>
            <View style={tailwind`items-center mb-6`}>
                <Pressable style={tailwind`w-24 h-24 bg-gray-200 rounded-full items-center justify-center shadow-md`}>
                    <FontAwesome name="upload" size={28} color="black" />
                </Pressable>
                <Text style={tailwind`text-sm text-gray-500 mt-2`}>Upload Player Picture</Text>
            </View>
            <Pressable
                onPress={() => setIsSportVisible(true)}
                style={tailwind`bg-white rounded-xl px-4 py-3 mb-4 shadow-sm flex-row items-center justify-between`}
            >
                <Text style={tailwind`text-base text-gray-800`}>
                    {playerSport.name || 'Select Sport'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
            </Pressable>
            <Pressable
                onPress={() => setIsPositionsVisible(true)}
                style={tailwind`bg-white rounded-xl px-4 py-3 mb-4 shadow-sm flex-row items-center justify-between`}
            >
                <Text style={tailwind`text-base text-gray-800`}>
                    {position ? position : 'Select Position'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
            </Pressable>
            <Pressable
                onPress={() => setIsCountryPicker(true)}
                style={tailwind`bg-white rounded-xl px-4 py-3 mb-4 shadow-sm flex-row items-center justify-between`}
            >
                <Text style={tailwind`text-base text-gray-800`}>
                    {playerCountry?.name || 'Select Country'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
            </Pressable>
            <View style={tailwind`bottom-0`}>
                <Pressable style={tailwind`bg-white rounded-xl px-4 py-3 mb-4 shadow-sm flex-row items-center justify-between`} onPress={() => handleAddPlayer()}>
                    <Text style={tailwind`text-lg p-2`}>Add Player</Text>
                    <AntDesign name="arrowright" size={24} color="gray" />
                </Pressable>
            </View>
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
            {isSportVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isSportVisible}
                    onRequestClose={handleCloseModal}
                >
                    <Pressable onPress={() => setIsSportVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            {games.map((item, index) => (
                                <Pressable key={index} onPress={() => handleSportSelection(item)}>
                                    <Text style={tailwind`text-xl py-2`}>{item.name}</Text>
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
                                {filePath[`${playerSport.name}`].map((item, index ) => (
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