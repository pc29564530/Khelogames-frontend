import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {View, Text, Pressable, ScrollView, Image, Modal} from 'react-native';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import AntDesign from 'react-native-vector-icons/AntDesign';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { getTournamentByID, getTournamentBySport } from '../services/tournamentServices';
import { getTournamentBySportAction, getTournamentByIdAction, setGames, setGame } from '../redux/actions/actions';
import { useDispatch, useSelector } from 'react-redux';
import CountryPicker from 'react-native-country-picker-modal';
import { sportsServices } from '../services/sportsServices';


const Tournament = () => {
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const [currentRole, setCurrentRole] = useState('');
    const [category, setCategory] = useState('international');
    const [status, setStatus] = useState('in_progress');
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [selectedSport, setSelectedSport] = useState({"id": 1, "min_players": 11, "name": "football"});
    const dispatch = useDispatch();
    const tournaments = useSelector(state => state.tournamentsReducers.tournaments);
    const [filterTournaments, setFilterTournaments] = useState([]);
    const [isDropDown, setIsDropDown] = useState(false);
    const games = useSelector(state => state.sportReducers.games);
    const game = useSelector(state => state.sportReducers.game);
    const [isStatusDropDown, setIsStatusDropDown] = useState(false);
    const scrollViewRef = useRef(null);
    const handleTournamentPage = (item) => {
        dispatch(getTournamentByIdAction(item));
        navigation.navigate("TournamentPage" , {tournament: item, currentRole: currentRole})
    }

    useEffect(() => {
        const defaultSport = { id: 1, name: 'football', min_players: 11};
        dispatch(setGame(defaultSport));
    }, [dispatch]);

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

    useEffect(() => {
        const checkRole = async () => {
            const role = await AsyncStorage.getItem('Role');
            setCurrentRole(role);
        }
        checkRole();
    }, []);
    useEffect(() => {
        const fetchTournament = async () => {
            const {gameData, tournament} = await getTournamentBySport({axiosInstance: axiosInstance, sport: game, category: category});
                    dispatch(getTournamentBySportAction(tournament["tournament"]));
        }
        fetchTournament();
    }, [game, category]);
        
    
    navigation.setOptions({
            headerTitle: '',
            headerStyle: tailwind`bg-white shadow-md`, // Add a shadow for depth
            headerLeft: () => (
                <Pressable onPress={() => navigation.goBack()} style={tailwind`p-2`}>
                    <AntDesign name="arrowleft" size={24} color="black" />
                </Pressable>
            ),
            headerRight: () => (
                <View style={tailwind`flex-row items-center`}>
                    <Pressable onPress={() => setIsDropDown(true)} style={tailwind`border rounded-lg bg-blue-500 p-2 flex-row items-center justify-between mr-4`}>
                        <Text style={tailwind`text-lg text-white`}>{category}</Text>
                        <MaterialIcons name="keyboard-arrow-down" size={24} color="white" />
                    </Pressable>
                    {currentRole === 'admin' && (
                        <Pressable style={tailwind`p-2 bg-blue-500 rounded-full shadow-lg`} onPress={() => navigation.navigate("CreateTournament")}>
                            <MaterialIcons name="add" size={24} color="white" />
                        </Pressable>
                    )}
                </View>
            )
        });

    const handleSport = useCallback((item) => {
        setSelectedSport(item);
        dispatch(setGame(item));
    }, [game]) 

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }

     // Filter tournaments based on category and status
     const filteredTournaments = () => {
        console.log('Tournamet:' , tournaments)
        const filtered = tournaments["tournament"].filter(tournament => {
            return tournament.level === category;
        });
        setFilterTournaments(filtered)
    };
     useEffect(() => {
        filteredTournaments()
     }, [category, status])
     
    return (
        <View style={tailwind`flex-1 mt-1 mb-2`}>
            <ScrollView nestedScrollEnabled={true}>
                <View style={tailwind`flex-row mt-5`}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ref={scrollViewRef}
                        contentContainerStyle={tailwind`flex-row flex-wrap justify-center`}
                    >
                        {games && games?.map((item, index) => (
                            <Pressable key={index} style={[tailwind`border rounded-lg bg-blue-500 p-2 mr-2 ml-2`, selectedSport===item?tailwind`bg-orange-400`:tailwind`bg-orange-200`]} onPress={() => handleSport(item)}>
                                <Text style={tailwind`text-white`}>{item.name}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                    <Pressable onPress={scrollRight} style={tailwind`justify-center ml-2`}>
                        <MaterialIcons name="keyboard-arrow-right" size={30} color="black" />
                    </Pressable>
                </View>
                <Pressable onPress={() => {setIsStatusDropDown(true)}} style={tailwind`border rounded-lg bg-blue-500 p-2 flex-row items-center justify-between mr-4 m-4`}>
                        <Text style={tailwind`text-lg text-white`}>{status}</Text>
                        <MaterialIcons name="keyboard-arrow-down" size={24} color="white" />
                </Pressable>
                {filterTournaments?.map((item, index) => (
                    <View key={index} style={tailwind`mt-6`}>
                         <Pressable
                                        style={tailwind`border rounded-lg w-40 h-52 p-2 mr-4 relative bg-white shadow-lg`}
                                        onPress={() => handleTournamentPage(item)}
                                    >
                                        <View style={tailwind`rounded-lg p-1 flex-row justify-between mb-2`}>
                                            <View style={tailwind`flex-row items-center bg-yellow-300 rounded-lg px-2 py-1`}>
                                                <Text style={tailwind`text-black text-sm`}>{item.status_code}</Text>
                                            </View>
                                            {/* <View style={tailwind`flex-row items-center bg-purple-200 p-1 rounded-lg px-2 py-1`}>
                                                <Text style={tailwind`text-black text-xs font-semibold`}>{item.format}</Text>
                                            </View> */}
                                        </View>
                                        <View style={tailwind`mt-auto`}>
                                            <Text style={tailwind`text-black text-lg font-semibold`} numberOfLines={1}>{item.name}</Text>
                                            <View style={tailwind`flex-row justify-between items-center mt-2`}>
                                                {/* <View style={tailwind`flex-row items-center`}>
                                                    <AntDesign name="team" size={14} color="black" />
                                                    <Text style={tailwind`text-sm text-black ml-1`}>{item.teams_joined}</Text>
                                                </View> */}
                                                {/* <Text style={tailwind`text-black text-sm ml-1`}>{}</Text> */}
                                            </View>
                                        </View>
                                    </Pressable>
                        <Text style={tailwind`text-xl font-bold mb-2 p-2 ml-4 text-blue-800`}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</Text>
                    </View>
                ))}
            </ScrollView>
            {isCountryPicker && (
                <CountryPicker
                    withFilter
                    withFlag
                    withCountryNameButton
                    withAlphaFilter
                    withCallingCode
                    withEmoji
                    onSelect={(selectedCountry) => {
                        setCategory(selectedCountry.name);
                        setIsCountryPicker(false);
                        setIsDropDown(false);
                    }}
                    visible={isCountryPicker}
                    onClose={() => {setIsCountryPicker(false)}}
                />
            )}
            {isDropDown && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isDropDown}
                    onRequestClose={() => setIsDropDown(false)}
                >
                    <Pressable onPress={() => setIsDropDown(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <Pressable onPress={() => {setCategory('international'); setIsDropDown(false)}}>
                                <Text>International</Text>
                            </Pressable>
                            <Pressable onPress={() =>{setCategory('country'); setIsCountryPicker(true)}}>
                                <Text>Country</Text>
                            </Pressable>
                            <Pressable onPress={() => {setCategory('local'); setIsCountryPicker(true)}}>
                                <Text>Local</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            )}
            {isStatusDropDown && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isStatusDropDown}
                    onRequestClose={() => setIsStatusDropDown(false)}
                >
                    <Pressable onPress={() => setIsDropDown(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <Pressable onPress={() => {setStatus('not_started'); setIsStatusDropDown(false)}}>
                                <Text>Upcoming</Text>
                            </Pressable>
                            <Pressable onPress={() =>{setStatus('in_progress'); setIsStatusDropDown(false)}}>
                                <Text>Live</Text>
                            </Pressable>
                            <Pressable onPress={() => {setStatus('finished'); setIsStatusDropDown(false)}}>
                                <Text>Ended</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
        
}

export default Tournament;