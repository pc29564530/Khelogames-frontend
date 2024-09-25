import React, { useState, useEffect, useRef, useContext } from 'react';
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
    const [category, setCategory] = useState('international')
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [selectedSport, setSelectedSport] = useState({"id": 1, "min_players": 11, "name": "football"});
    const dispatch = useDispatch();
    const tournaments = useSelector(state => state.tournamentsReducers.tournaments);
    const [isDropDown, setIsDropDown] = useState(false);
    const games = useSelector(state => state.sportReducers.games);
    const game = useSelector(state => state.sportReducers.game);
    const scrollViewRef = useRef(null);
    const handleTournamentPage = (item) => {
        dispatch(getTournamentByIdAction(item));
        navigation.navigate("TournamentPage" , {tournament: item, currentRole: currentRole, game: game})
    }

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
            dispatch(setGames(gameData))
            dispatch(getTournamentBySportAction(tournament));
        }
        fetchTournament();
    }, [game, category]);
    
    navigation.setOptions({
        headerTitle:'',
        headerLeft:()=>(
            <Pressable onPress={()=>navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="black" style={tailwind`ml-4`} />
            </Pressable>
        ),
        headerRight:() => (
            <View>
                {currentRole === 'admin' && (
                     <Pressable style={tailwind`relative p-2 bg-white items-center justify-center rounded-lg shadow-lg mr-4`} onPress={() => navigation.navigate("CreateTournament")}>
                        <MaterialIcons name="add" size={24} color="black"/>
                    </Pressable>
                )}
            </View>
        )
    })

    const handleSport = (item) => {
        setSelectedSport(item);
        dispatch(setGame(item));
    } 

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }

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
                <Pressable onPress={() => {setIsDropDown(true)}} style={tailwind`border rounded-lg bg-blue-500 p-2 mr-2 ml-2 mt-4 w-30 flex-row justify-between`}>
                    <Text style={tailwind`text-lg`}>{category}</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={30} color="black" />
                </Pressable>
                {tournaments && Object?.keys(tournaments)?.map((tournamentItem, index) => (
                    <View key={index} style={tailwind`mt-6`}>
                        <Text style={tailwind`text-xl font-bold mb-2 p-2 ml-4 text-blue-800`}>{tournamentItem.charAt(0).toUpperCase() + tournamentItem.slice(1)}</Text>
                        {tournaments[tournamentItem] && tournaments[tournamentItem].length>0?(
                            <ScrollView
                                style={tailwind`ml-4 mr-2 flex-row`}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                ref={scrollViewRef}
                                contentContainerStyle={tailwind`ml-2 mr-2`}
                            >
                                {tournaments[tournamentItem].map((item, idx) => (
                                    <Pressable
                                        key={idx}
                                        style={tailwind`border rounded-lg w-40 h-52 p-2 mr-4 relative bg-white shadow-lg`}
                                        onPress={() => handleTournamentPage(item)}
                                    >
                                        <View style={tailwind`rounded-lg p-1 flex-row justify-between mb-2`}>
                                            <View style={tailwind`flex-row items-center bg-yellow-300 rounded-lg px-2 py-1`}>
                                                <Text style={tailwind`text-black text-sm`}>{item.currentStatus}</Text>
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
                                ))}
                        </ScrollView>
                        ):(
                            <View style={tailwind`items-center justify-center h-30 w-full p-4 bg-white shadow-lg rounded-lg mt-2`}>
                                <Text style={tailwind`text-black text-center`}>There is no tournament {tournamentItem}</Text>
                            </View>
                        )}
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
                            <Pressable onPress={() => {setCategory('Global'); setIsDropDown(false)}}>
                                <Text>International</Text>
                            </Pressable>
                            <Pressable onPress={() => setIsCountryPicker(true)}>
                                <Text>Country</Text>
                            </Pressable>
                            <Pressable onPress={() => setIsCountryPicker(true)}>
                                <Text>Local</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
        
}

export default Tournament;