import {useState, useEffect, useLayoutEffect} from 'react';
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

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
            <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '600' }}>
                Add Player
            </Text>
            ),
            headerStyle: {
            backgroundColor: '#1e293b',
            elevation: 0,
            shadowOpacity: 0,
            },
            headerTintColor: '#e2e8f0',
            headerTitleAlign: 'center',
            headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
                <AntDesign name="arrowleft" size={24} color="#e2e8f0" />
            </Pressable>
            ),
        });
    }, [navigation]);

    const handleCloseModal = () => {
        setIsSportVisible(false);
    }

    return (
        <View style={[tailwind`flex-1`, {backgroundColor: '#0f172a'}]}>
            {error?.global && (
                <View style={[tailwind`mx-4 mb-3 p-3 rounded-xl`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#ef4444'}]}>
                    <Text style={{color: '#f87171', fontSize: 13}}>
                        {error?.global}
                    </Text>
                </View>
            )}
            <ScrollView style={tailwind`flex-1`} contentContainerStyle={tailwind`px-5 pt-6 pb-8`}>
                <View style={tailwind`items-center mb-8`}>
                    <Pressable style={[tailwind`w-28 h-28 rounded-full items-center justify-center`, {backgroundColor: '#1e293b', borderWidth: 2, borderColor: '#334155'}]}>
                        <FontAwesome name="user-plus" size={32} color="#94a3b8" />
                    </Pressable>
                    <Text style={{color: '#94a3b8', fontSize: 13, marginTop: 12, fontWeight: '500'}}>Add Player Photo</Text>
                </View>

                <View style={tailwind`mb-5`}>
                    <Text style={{color: '#e2e8f0', fontSize: 13, fontWeight: '600', marginBottom: 8}}>Sport</Text>
                    <Pressable
                        onPress={() => setIsSportVisible(true)}
                        style={[tailwind`rounded-xl px-4 py-4 flex-row items-center justify-between`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: error?.game_id ? '#ef4444' : '#334155'}]}
                    >
                        <Text style={{color: game.name ? '#f1f5f9' : '#64748b', fontSize: 15}}>
                            {game.name || 'Select sport'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
                    </Pressable>
                    {error?.fields?.game_id && (
                        <Text style={{color: '#f87171', fontSize: 11, marginTop: 6, marginLeft: 4}}>{error?.fields?.game_id}</Text>
                    )}
                </View>

                <View style={tailwind`mb-5`}>
                    <Text style={{color: '#e2e8f0', fontSize: 13, fontWeight: '600', marginBottom: 8}}>Position</Text>
                    <Pressable
                        onPress={() => {
                            setIsPositionsVisible(true);
                        }}
                        style={[tailwind`rounded-xl px-4 py-4 flex-row items-center justify-between`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: error?.position ? '#ef4444' : '#334155'}]}
                    >
                        <Text style={{color: position ? '#f1f5f9' : '#64748b', fontSize: 15}}>
                            {position || 'Select position'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
                    </Pressable>
                    {error?.fields?.position && (
                        <Text style={{color: '#f87171', fontSize: 11, marginTop: 6, marginLeft: 4}}>{error.position}</Text>
                    )}
                </View>

                <View style={tailwind`mb-8`}>
                    <Text style={{color: '#e2e8f0', fontSize: 13, fontWeight: '600', marginBottom: 8}}>Country</Text>
                    <Pressable
                        onPress={() => {
                            setIsCountryPicker(true);
                        }}
                        style={[tailwind`rounded-xl px-4 py-4 flex-row items-center justify-between`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: error?.country ? '#ef4444' : '#334155'}]}
                    >
                        <Text style={{color: playerCountry?.name ? '#f1f5f9' : '#64748b', fontSize: 15}}>
                            {playerCountry?.name || 'Select country'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
                    </Pressable>
                    {error?.fields?.country && (
                        <Text style={{color: '#f87171', fontSize: 11, marginTop: 6, marginLeft: 4}}>{error?.fields?.country}</Text>
                    )}
                </View>

                <Pressable
                    style={[tailwind`rounded-xl py-4 items-center`, {backgroundColor: '#ef4444'}]}
                    onPress={() => handleAddPlayer()}
                >
                    <Text style={{color: '#ffffff', fontSize: 15, fontWeight: '600'}}>Create Player Profile</Text>
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
                    <Pressable onPress={() => setIsSportVisible(false)} style={tailwind`flex-1 justify-end bg-black/60`}>
                        <View style={[tailwind`rounded-t-2xl pt-2 pb-8 max-h-96`, {backgroundColor: '#1e293b'}]}>
                            <View style={[tailwind`w-12 h-1.5 rounded-full self-center mb-4`, {backgroundColor: '#475569'}]} />
                            <Text style={{color: '#f1f5f9', fontSize: 17, fontWeight: '600', paddingHorizontal: 20, marginBottom: 12}}>Select Sport</Text>
                            <ScrollView>
                                {games.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => handleSportSelection(item)}
                                        style={[tailwind`px-5 py-4`, {borderBottomWidth: 1, borderColor: '#334155'}]}
                                    >
                                        <Text style={{color: '#e2e8f0', fontSize: 15}}>{item.name}</Text>
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
                    <Pressable onPress={() => setIsPositionsVisible(false)} style={tailwind`flex-1 justify-end bg-black/60`}>
                        <View style={[tailwind`rounded-t-2xl pt-2 pb-8 max-h-96`, {backgroundColor: '#1e293b'}]}>
                            <View style={[tailwind`w-12 h-1.5 rounded-full self-center mb-4`, {backgroundColor: '#475569'}]} />
                            <Text style={{color: '#f1f5f9', fontSize: 17, fontWeight: '600', paddingHorizontal: 20, marginBottom: 12}}>Select Position</Text>
                            <ScrollView>
                                {game.name && filePath[`${game.name}`]?.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => {setPosition(item.code), setIsPositionsVisible(false)}}
                                        style={[tailwind`px-5 py-4`, {borderBottomWidth: 1, borderColor: '#334155'}]}
                                    >
                                        <Text style={{color: '#e2e8f0', fontSize: 15}}>{item.name}</Text>
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