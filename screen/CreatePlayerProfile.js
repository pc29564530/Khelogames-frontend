import {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal, ScrollView} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import CountryPicker from 'react-native-country-picker-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
const filePath = require('../assets/position.json');
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector, useDispatch } from 'react-redux';
import {setGames } from '../redux/actions/actions';
import { sportsServices } from '../services/sportsServices';
import { handleInlineError, logSilentError } from '../utils/errorHandler';
import { validatePlayerForm } from '../utils/validation/playerValidation';

const CreatePlayerProfile = () => {
    const profile = useSelector((state) => state.profile.profile)
    const [game, setGame] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [position, setPosition] = useState('');
    const [playerCountry, setPlayerCountry] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSportVisible, setIsSportVisible] = useState(false);
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [isPositionsVisible, setIsPositionsVisible] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const dispatch = useDispatch();
    const games = useSelector(state => state.sportReducers.games);
    
    const navigation  = useNavigation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await sportsServices();
                const item = response.data;
                dispatch(setGames(item));
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields;
                setError({
                    global: "Unable to get games",
                    fields: backendError,
                })
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSportSelection = (sport) => {
        setGame(sport);
        setIsSportVisible(false);
    }

    const handleAddPlayer = async () => {
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem('AccessToken');
            const formData = {
                position: position,
                game_id: game?.id,
                country: playerCountry?.name,
            }

            const validation = validatePlayerForm(formData)
            if(!validation.isValid) {
                setError({
                    global: null,
                    fields: validation.errors
                })
                return
            }

            setError({
                global: null,
                fields: {},
            })

            const data = {
                    positions: position,
                    country: playerCountry.name,
                    game_id: game.id
            }
            const response = await axiosInstance.post(`${BASE_URL}/newPlayer`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setPlayerCountry('');
            setPosition('');
            navigation.goBack();
        } catch (err) {
            const backendError = err?.response?.data?.error?.fields;
            setError({
                global: "Unable to create player",
                fields: backendError,
            })
            console.error("unable to create the player data: ", err);
        } finally {
            setLoading(false);
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
        <View style={tailwind`flex-1 bg-gray-50`}>
            {error?.global && (
                <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                    <Text style={tailwind`text-red-700 text-sm`}>
                        {error?.global}
                    </Text>
                </View>
            )}
            <ScrollView style={tailwind`flex-1`} contentContainerStyle={tailwind`px-5 pt-6 pb-8`}>
                <View style={tailwind`items-center mb-8`}>
                    <Pressable style={tailwind`w-28 h-28 bg-white rounded-full items-center justify-center border-2 border-gray-200`}>
                        <FontAwesome name="user-plus" size={32} color="#6B7280" />
                    </Pressable>
                    <Text style={tailwind`text-sm text-gray-600 mt-3 font-medium`}>Add Player Photo</Text>
                </View>

                <View style={tailwind`mb-5`}>
                    <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>Sport</Text>
                    <Pressable
                        onPress={() => setIsSportVisible(true)}
                        style={tailwind`bg-white border ${error?.game_id ? 'border-red-400' : 'border-gray-300'} rounded-lg px-4 py-4 flex-row items-center justify-between`}
                    >
                        <Text style={tailwind`text-base ${game.name ? 'text-gray-900' : 'text-gray-400'}`}>
                            {game.name || 'Select sport'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="#9CA3AF" />
                    </Pressable>
                    {error?.fields?.game_id && (
                        <Text style={tailwind`text-red-500 text-xs mt-1.5 ml-1`}>{error?.fields?.game_id}</Text>
                    )}
                </View>

                <View style={tailwind`mb-5`}>
                    <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>Position</Text>
                    <Pressable
                        onPress={() => {
                            setIsPositionsVisible(true);
                        }}
                        style={tailwind`bg-white border ${error?.position ? 'border-red-400' : 'border-gray-300'} rounded-lg px-4 py-4 flex-row items-center justify-between`}
                    >
                        <Text style={tailwind`text-base ${position ? 'text-gray-900' : 'text-gray-400'}`}>
                            {position || 'Select position'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="#9CA3AF" />
                    </Pressable>
                    {error?.fields?.position && (
                        <Text style={tailwind`text-red-500 text-xs mt-1.5 ml-1`}>{error.position}</Text>
                    )}
                </View>

                <View style={tailwind`mb-8`}>
                    <Text style={tailwind`text-sm font-semibold text-gray-700 mb-2`}>Country</Text>
                    <Pressable
                        onPress={() => {
                            setIsCountryPicker(true);
                        }}
                        style={tailwind`bg-white border ${error?.country ? 'border-red-400' : 'border-gray-300'} rounded-lg px-4 py-4 flex-row items-center justify-between`}
                    >
                        <Text style={tailwind`text-base ${playerCountry?.name ? 'text-gray-900' : 'text-gray-400'}`}>
                            {playerCountry?.name || 'Select country'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="#9CA3AF" />
                    </Pressable>
                    {error?.fields?.country && (
                        <Text style={tailwind`text-red-500 text-xs mt-1.5 ml-1`}>{error?.fields?.country}</Text>
                    )}
                </View>

                <Pressable
                    style={tailwind`bg-blue-600 rounded-lg py-4 items-center shadow-sm`}
                    onPress={() => handleAddPlayer()}
                >
                    <Text style={tailwind`text-white text-base font-semibold`}>Create Player Profile</Text>
                </Pressable>
            </ScrollView>

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
                    <Pressable onPress={() => setIsSportVisible(false)} style={tailwind`flex-1 justify-end bg-black/50`}>
                        <View style={tailwind`bg-white rounded-t-2xl pt-2 pb-8 max-h-96`}>
                            <View style={tailwind`w-12 h-1.5 bg-gray-300 rounded-full self-center mb-4`} />
                            <Text style={tailwind`text-lg font-semibold text-gray-900 px-5 mb-3`}>Select Sport</Text>
                            <ScrollView>
                                {games.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => handleSportSelection(item)}
                                        style={tailwind`px-5 py-4 border-b border-gray-100 active:bg-gray-50`}
                                    >
                                        <Text style={tailwind`text-base text-gray-900`}>{item.name}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
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
                    <Pressable onPress={() => setIsPositionsVisible(false)} style={tailwind`flex-1 justify-end bg-black/50`}>
                        <View style={tailwind`bg-white rounded-t-2xl pt-2 pb-8 max-h-96`}>
                            <View style={tailwind`w-12 h-1.5 bg-gray-300 rounded-full self-center mb-4`} />
                            <Text style={tailwind`text-lg font-semibold text-gray-900 px-5 mb-3`}>Select Position</Text>
                            <ScrollView>
                                {game.name && filePath[`${game.name}`]?.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => {setPosition(item.code), setIsPositionsVisible(false)}}
                                        style={tailwind`px-5 py-4 border-b border-gray-100 active:bg-gray-50`}
                                    >
                                        <Text style={tailwind`text-base text-gray-900`}>{item.name}</Text>
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