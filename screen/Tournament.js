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
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [typeFilterModal, setTypeFilterModal] = useState(false);
    const [statusFilterModal, setStatusFilterModal] = useState(false);
    const [selectedSport, setSelectedSport] = useState({"id": 1, "min_players": 11, "name": "football"});
    const dispatch = useDispatch();
    const tournaments = useSelector(state => state.tournamentsReducers.tournaments);
    const [filterTournaments, setFilterTournaments] = useState(tournaments["tournament"]);
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
            const {tournament} = await getTournamentBySport({axiosInstance: axiosInstance, sport: game});
                    dispatch(getTournamentBySportAction(tournament["tournament"]));
        }
        fetchTournament();
    }, [game]);
        
    
    navigation.setOptions({
            headerTitle: '',
            headerStyle: tailwind`bg-white shadow-md`, // Add a shadow for depth
            headerLeft: () => (
                <Pressable onPress={() => navigation.goBack()} style={tailwind`p-2`}>
                    <AntDesign name="arrowleft" size={24} color="black" />
                </Pressable>
            )
        });

    const handleSport = useCallback((item) => {
        setSelectedSport(item);
        dispatch(setGame(item));
    }, [game])

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }

    const filteredTournaments = () => {
        const filtered = tournaments["tournament"]?.filter(tournament => {
            return tournament.level === typeFilter && tournament.status_code === statusFilter;
        });
        if(filtered?.length>0){
            setFilterTournaments(filtered)
        } else {
            setFilterTournaments(tournaments["tournament"])
        }
        
    };
     useEffect(() => {
        filteredTournaments();
     }, [typeFilter, statusFilter, game]);
     console.log("Filter Tournament: ", filterTournaments)
     console.log("Tournaments: ", tournaments)
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
                        <Text style={tailwind`text-white`}>Type</Text>
                    </Pressable>
                    <Pressable style={tailwind`border rounded-lg bg-blue-500 p-2 mr-2 ml-2`} onPress={() => setStatusFilterModal(true)}>
                        <Text style={tailwind`text-white`}>Status</Text>
                    </Pressable> 
                </View>
                {/* Display Selected Filters */}
                {(typeFilter !== "all" || statusFilter !== "all") && (
                    <View style={tailwind`flex-row flex-wrap mt-2 justify-evenly items-start`}>
                        {typeFilter !== "all" && (
                            <View style={tailwind`rounded-lg p-2 shadow-lg bg-white`}>
                                <Text style={tailwind`text-lg mr-4`}>{typeFilter}</Text>
                            </View>
                        )}
                        {statusFilter !== "all" && (
                            <View style={tailwind`rounded-lg p-2 shadow-lg bg-white`}>
                                <Text style={tailwind`text-lg`}>{statusFilter}</Text>
                            </View>
                        )}
                    </View>
                )}
                {filterTournaments?.map((item, index) => (
                    <View key={index} style={tailwind`mt-6`}>
                        <Pressable
                            style={tailwind` rounded-md w-full relative bg-white shadow-lg`}
                            onPress={() => handleTournamentPage(item)}
                        >
                            <View style={tailwind`mt-auto p-2 flex-row`}>
                                <Text style={tailwind`text-black text-lg font-semibold`}>{item.name}</Text>

                            </View>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>
            <View style={tailwind`absolute bottom-12 right-4`}>
                {/* {currentRole === 'admin' && ( */}
                    <Pressable style={tailwind`p-2 bg-blue-500 rounded-full shadow-lg`} onPress={() => navigation.navigate("CreateTournament")}>
                        <MaterialIcons name="add" size={24} color="white" />
                    </Pressable>
                {/* )} */}
            </View>
            {/* Full-Screen Type Filter Modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={typeFilterModal}
                onRequestClose={() => setTypeFilterModal(false)}
            >
                <Pressable onPress={() => setTypeFilterModal(false)} style={tailwind`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                    <View onPress={tailwind`bg-white rounded-lg p-6 w-2/4`}>
                        <View style={tailwind`bg-white p-2`}>
                            <Pressable onPress={() => {setTypeFilter("all"); setTypeFilterModal(false)}}>
                                <Text style={tailwind`text-xl text-black`}>All</Text>
                            </Pressable>
                            <Pressable onPress={() => {setTypeFilter("international"); setTypeFilterModal(false)}}>
                                <Text style={tailwind`text-xl text-black`}>International</Text>
                            </Pressable>
                            <Pressable onPress={() => {setTypeFilter("country"); setTypeFilterModal(false); setIsCountryPicker(true)}}>
                                <Text style={tailwind`text-xl text-black`}>Country</Text>
                            </Pressable>
                            <Pressable onPress={() => {setTypeFilter("local"); setTypeFilterModal(false); setIsCountryPicker(true)}}>
                                <Text style={tailwind`text-xl text-black`}>Local</Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Modal>
            <Modal
                transparent={true}
                animationType="slide"
                visible={statusFilterModal}
                onRequestClose={() => setStatusFilterModal(false)}
            >
                <Pressable onPress={() => {() => setStatusFilterModal(false)}} style={tailwind`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                    <View onPress={tailwind`bg-white rounded-lg p-6 w-2/4`}>
                        <View style={tailwind`bg-white p-2`}>
                        <Text style={tailwind`text-xl text-center mb-4`}>Select Status</Text>
                        <Pressable onPress={() => {setStatusFilter("all"); setStatusFilterModal(false)}}>
                            <Text style={tailwind`text-xl text-black`}>All</Text>
                        </Pressable>
                        <Pressable onPress={() => {setStatusFilter("not_started"); setStatusFilterModal(false)}}>
                            <Text style={tailwind`text-xl text-black`}>Upcoming</Text>
                        </Pressable>
                        <Pressable onPress={() => {setStatusFilter("live"); setStatusFilterModal(false)}}>
                            <Text style={tailwind`text-xl text-black`}>Live</Text>
                        </Pressable>
                        </View>
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