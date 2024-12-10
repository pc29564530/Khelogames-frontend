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
import FontAwesome from 'react-native-vector-icons/FontAwesome';


const Tournament = () => {
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const [currentRole, setCurrentRole] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [typeFilterModal, setTypeFilterModal] = useState(false);
    const [statusFilterModal, setStatusFilterModal] = useState(false);
    const [selectedSport, setSelectedSport] = useState({"id": 1, "min_players": 11, "name": "football"});
    const dispatch = useDispatch();
    const tournaments = useSelector(state => state.tournamentsReducers.tournaments);
    const [filterTournaments, setFilterTournaments] = useState(tournaments["tournaments"]);
    const [isDropDown, setIsDropDown] = useState(false);
    const games = useSelector(state => state.sportReducers.games);
    const game = useSelector(state => state.sportReducers.game);
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
            const tournament = await getTournamentBySport({axiosInstance: axiosInstance, sport: game});
            dispatch(getTournamentBySportAction(tournament["tournament"]));
        }
        
        if(game?.name){
            fetchTournament();
        }
    }, [game, axiosInstance, dispatch]);

    const handleSport = useCallback((item) => {
        setSelectedSport(item);
        dispatch(setGame(item));
    }, [game])

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }

    const filteredTournaments = useCallback(() => {
        const filtered = tournaments["tournament"]?.filter(tournament => {
            return (tournament.game_id === game.id && (typeFilter === "all" || tournament.level === typeFilter) && (statusFilter === "all" || tournament.status_code === statusFilter));
        });

        setFilterTournaments(filtered || tournaments["tournament"]);
    }, [tournaments, game, typeFilter, statusFilter]);

     useEffect(() => {
        filteredTournaments();
     }, [tournaments, game, typeFilter, statusFilter]);

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
                <View style={tailwind`flex-row mt-5 gap-2`}>
                    <View>
                        <Text style={tailwind`text-xl`}>Filter by:</Text>
                    </View>
                    <Pressable style={tailwind`border rounded-lg bg-blue-500 p-2 mr-2 ml-2`} onPress={() => setTypeFilterModal(true)}>
                        <Text style={tailwind`text-white`}>Categories</Text>
                    </Pressable>
                    <Pressable style={tailwind`border rounded-lg bg-blue-500 p-2 mr-2 ml-2`} onPress={() => setStatusFilterModal(true)}>
                        <Text style={tailwind`text-white`}>Status</Text>
                    </Pressable> 
                </View>
                {/* Display Selected Filters */}
                {(typeFilter !== "all" || statusFilter !== "all") && (
                    <View style={tailwind`flex-row flex-wrap mt-2 px-2 justify-around items-start`}>
                        {typeFilter !== "all" && (
                            <View style={tailwind`relative rounded-lg p-2 bg-white`}>
                                <Text style={tailwind`text-lg`}>{typeFilter}</Text>
                                <Pressable
                                    onPress={() => setTypeFilter("all")} // Reset typeFilter on close
                                    style={tailwind`absolute -top-2 -right-2 rounded-full p-1`}
                                >
                                    <FontAwesome name="close" size={16} style={tailwind`text-black-100`} />
                                </Pressable>
                            </View>
                        )}
                        {statusFilter !== "all" && (
                            <View style={tailwind`relative rounded-lg p-2 shadow-lg bg-white`}>
                                <Text style={tailwind`text-lg`}>{statusFilter}</Text>
                                <Pressable
                                    onPress={() => setStatusFilter("all")} // Reset statusFilter on close
                                    style={tailwind`absolute -top-2 -right-2 rounded-full p-1`}
                                >
                                    <FontAwesome name="close" size={16} style={tailwind`text-black-100`} />
                                </Pressable>
                            </View>
                        )}
                    </View>
                )}
                {filterTournaments?.map((item, index) => (
                    <View key={index} style={tailwind`mb-4 mt-2`}>
                        <Pressable
                            style={tailwind`rounded-md w-full bg-white shadow-lg justigy-center flex-row items-center`}
                            onPress={() => handleTournamentPage(item)}
                        >
                            <View style={tailwind`mt-auto p-2 flex-row gap-4`}>
                                <FontAwesome name="trophy" size={26} color="gold"  style={tailwind`rounded-full p-2 bg-gray-100`}/>
                                <Text style={tailwind`text-black text-xl font-semibold py-2`}>{item.name}</Text>
                            </View>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>
            <View style={tailwind`absolute bottom-16 right-6`}>
                {/* {currentRole === 'admin' && ( */}
                    <Pressable style={tailwind`p-4 bg-blue-500 rounded-full shadow-lg`} onPress={() => navigation.navigate("CreateTournament")}>
                        <MaterialIcons name="add" size={24} color="white" />
                    </Pressable>
                {/* )} */}
            </View>
            <Modal
                transparent={true}
                animationType="slide"
                visible={typeFilterModal}
                onRequestClose={() => setTypeFilterModal(false)}
            >
                <Pressable onPress={() => setTypeFilterModal(false)} style={tailwind`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                    <View style={tailwind`bg-white rounded-2xl p-6 w-3/4 shadow-lg`}>
                        <Text style={tailwind`text-lg font-bold text-gray-800 mb-4 text-center`}>
                            Select Categories
                        </Text>
                        <Pressable
                            style={tailwind`p-4 bg-gray-100 rounded-lg mb-3`}
                            onPress={() => {
                                setTypeFilter("all");
                                setTypeFilterModal(false);
                            }}
                        >
                            <Text style={tailwind`text-lg text-gray-800`}>All</Text>
                        </Pressable>
                        <Pressable
                            style={tailwind`p-4 bg-gray-100 rounded-lg mb-3`}
                            onPress={() => {
                                setTypeFilter("international");
                                setTypeFilterModal(false);
                            }}
                        >
                            <Text style={tailwind`text-lg text-gray-800`}>International</Text>
                        </Pressable>
                        <Pressable
                            style={tailwind`p-4 bg-gray-100 rounded-lg mb-3`}
                            onPress={() => {
                                setTypeFilter("country");
                                setTypeFilterModal(false);
                                setIsCountryPicker(true);
                            }}
                        >
                            <Text style={tailwind`text-lg text-gray-800`}>Country</Text>
                        </Pressable>
                        <Pressable
                            style={tailwind`p-4 bg-gray-100 rounded-lg`}
                            onPress={() => {
                                setTypeFilter("local");
                                setTypeFilterModal(false);
                                setIsCountryPicker(true);
                            }}
                        >
                            <Text style={tailwind`text-lg text-gray-800`}>Local</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            <Modal
                transparent={true}
                animationType="slide"
                visible={statusFilterModal}
                onRequestClose={() => setStatusFilterModal(false)}
            >
                <Pressable onPress={() => setStatusFilterModal(false)} style={tailwind`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                    <View style={tailwind`bg-white rounded-2xl p-6 w-3/4 shadow-lg`}>
                        <Text style={tailwind`text-lg font-bold text-gray-800 mb-4 text-center`}>
                            Select Status
                        </Text>
                        <Pressable
                            style={tailwind`p-4 bg-gray-100 rounded-lg mb-3`}
                            onPress={() => {
                                setStatusFilter("all");
                                setStatusFilterModal(false);
                            }}
                        >
                            <Text style={tailwind`text-lg text-gray-800`}>All</Text>
                        </Pressable>
                        <Pressable
                            style={tailwind`p-4 bg-gray-100 rounded-lg mb-3`}
                            onPress={() => {
                                setStatusFilter("not_started");
                                setStatusFilterModal(false);
                            }}
                        >
                            <Text style={tailwind`text-lg text-gray-800`}>Upcoming</Text>
                        </Pressable>
                        <Pressable
                            style={tailwind`p-4 bg-gray-100 rounded-lg`}
                            onPress={() => {
                                setStatusFilter("live");
                                setStatusFilterModal(false);
                            }}
                        >
                            <Text style={tailwind`text-lg text-gray-800`}>Live</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            {isCountryPicker && (
                <CountryPicker
                    withFilter
                    withFlag
                    withCountryNameButton
                    withAlphaFilter
                    withCallingCode
                    withEmoji
                    onSelect={(selectedCountry) => {
                        setTypeFilter(selectedCountry.name);
                        setIsCountryPicker(false);
                        setIsDropDown(false);
                    }}
                    visible={isCountryPicker}
                    onClose={() => {setIsCountryPicker(false)}}
                />
            )}
        </View>
    );
        
}

export default Tournament;