import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, Image, Modal, ScrollView, Dimensions } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { formattedDate, formattedTime, formatToDDMMYY, convertToISOString } from '../utils/FormattedDateTime';
import { findTournamentByID, getTournamentBySport } from '../services/tournamentServices';
import { useDispatch, useSelector } from 'react-redux';
import { getTournamentByIdAction, getTournamentBySportAction } from '../redux/actions/actions';
import { renderInningScore } from '../screen/Matches';
import Animated, {useSharedValue, useAnimatedScrollHandler} from 'react-native-reanimated';

const ClubCricketMatch = ({ teamData, parentScrollY, headerHeight, collapsedHeader }) => {
    const [matches, setMatches] = useState([]);
    const [isDropDownVisible, setIsDropDownVisible] = useState(false);
    const [tournamentName, setTournamentName] = useState([]);
    
    const [currentRole, setCurrentRole] = useState('');
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const tournaments = useSelector((state) => state.tournamentsReducers.tournaments);
    const tournament = useSelector((state) => state.tournamentsReducers.tournament);
    const game = useSelector((state) => state.sportReducers.game);

    const { height: sHeight, width: sWidth } = Dimensions.get("window");

    const currentScrollY = useSharedValue(0);
    const handlerScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            if(parentScrollY === collapsedHeader){
                parentScrollY.value = currentScrollY.value;
            } else {
                parentScrollY.value = event.contentOffset.y;
            }
        }
    })

    const handleTournamentPage = (item) => {
            dispatch(getTournamentByIdAction(item));
            navigation.navigate("TournamentPage" , {tournament: item, currentRole: ""})
    }

    const checkSportForMatchPage = (item, game) => {
        if (game.name==='football'){
            navigation.navigate("FootballMatchPage",{item: item.id} )
        } else if(game.name === 'cricket') {
            navigation.navigate("CricketMatchPage", {item: item.id})
        }
    }

    useEffect(() => {
        fetchClubMatch();
    }, []);

    const fetchClubMatch = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getMatchesByTeam/${teamData.public_id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.data) {
                setMatches([]);
            } else {
                setMatches(response.data);
            }
        } catch (err) {
            console.log("unable to get the match by teams ", err);
        }
    };

    const handleDropDown = () => {
        setIsDropDownVisible(true);
    };

    const handleTournamentNavigate = async (tournamentItem) => {
        const tournamentPublicID = tournamentItem.public_id;
        const tournamentStatus = ["live", "previous", "upcoming"];
        const tournamentBySport = await getTournamentBySport({ axiosInstance, sport });
        dispatch(getTournamentBySportAction(tournamentBySport));
        const foundTournament = findTournamentByID({ tournamentBySport, tournamentPublicID, tournamentStatus });
        if (foundTournament !== null) {
            dispatch(getTournamentByIdAction(foundTournament));
        }
        navigation.navigate("TournamentPage", { tournament, currentRole });
    };

    let tournamentsPublicID = new Set();
    matches.map((item) => {
        tournamentsPublicID.add(item.tournament.public_id);
    })

    return (
        <View style={tailwind`flex-1`}>
            <Animated.ScrollView
                style={tailwind`flex-1 bg-gray-50`}
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 20,
                    paddingBottom: 100,
                    minHeight: sHeight+100,
                }}
            >
                <Pressable
                    style={tailwind`border rounded-xl flex-row items-center justify-center bg-gray-100 shadow-sm mb-4 mt-2`}
                    onPress={() => handleDropDown()}
                >
                    <Text style={tailwind`text-lg font-semibold text-gray-800`}>Tournaments</Text>
                    <AntDesign name="down" size={14} color="black" />
                </Pressable>
                    {matches?.map((item, index) => (
                        <Pressable key={index}  onPress={() => checkSportForMatchPage(item, game)}
                        style={tailwind`mb-1 p-1 bg-white rounded-lg shadow-md`}
                        >
                            <View>
                                <Pressable onPress={() => handleTournamentPage(item?.tournament)} style={tailwind`p-1 flex flex-row justify-between`}>
                                    <Text style={tailwind`text-6md`}>{item?.tournament?.name}</Text>
                                    <AntDesign name="right" size={12} color="black" />
                                </Pressable>
                                <View style={tailwind`flex-row items-center justify-between `}>
                                    <View style={tailwind`flex-row`}>
                                        <View style={tailwind``}>
                                            <Image 
                                                source={{ uri: item.awayTeam?.media_url }} 
                                                style={tailwind`w-6 h-6 bg-violet-200 rounded-full mb-2`} 
                                            />
                                            <Image 
                                                source={{ uri: item.homeTeam?.media_url }} 
                                                style={tailwind`w-6 h-6 bg-violet-200 rounded-full mb-2`} 
                                            />
                                        </View>
                                        <View style={tailwind``}>
                                            <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                                                {item.homeTeam?.name}
                                            </Text>
                                            <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                                                {item.awayTeam?.name}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={tailwind`items-center justify-center flex-row`}>
                                        <View style={tailwind`mb-2 flex-row items-center gap-4`}>
                                                {/* {item.status_code !== "not_started" && checkSport(item, game)} */}
                                                {item.status !== "not_started" && (
                                                    <View>
                                                    <View style={tailwind``}>
                                                        {item.homeScore  && (
                                                            <View style={tailwind``}>
                                                                {renderInningScore(item.homeScore)}
                                                            </View>
                                                        )}
                                                        {item.awayScore && (
                                                            <View style={tailwind``}>
                                                                {renderInningScore(item.awayScore)}
                                                            </View>
                                                        )}
                                                    </View>
                                                    </View>
                                                )}
                                                <View style={tailwind`w-0.5 h-10 bg-gray-200`}/>
                                                <View style={tailwind`mb-2 right`}>
                                                    <Text style={tailwind`ml-2 text-lg text-gray-800`}> {formatToDDMMYY(convertToISOString(item.start_timestamp))}</Text>
                                                    {item.status !== "not_started" ? (
                                                        <Text style={tailwind`ml-2 text-md text-gray-800`}>{item.status_code}</Text>
                                                    ):(
                                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>{formattedTime(convertToISOString(item.start_timestamp))}</Text>
                                                    )}
                                                </View>
                                        </View>
                                    </View> 
                                </View>
                            </View>
                    </Pressable>
                ))}
            </Animated.ScrollView>
            {isDropDownVisible && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isDropDownVisible}
                    onRequestClose = {() => setIsDropDownVisible(!isDropDownVisible)}
                >
                    <Pressable style={tailwind`flex-1 justify-end bg-gray-900 bg-opacity-50 w-full`} onPress={() => setIsDropDownVisible(false)}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            {[...tournamentsPublicID]?.map((tournamentPublicID, index) => {
                                const tournamentItem = matches.find((item) => item.tournament.public_id === tournamentPublicID );
                                return (
                                    <Pressable
                                        key={index}
                                        style={tailwind`bg-white p-2`}
                                        onPress={() => {
                                            handleTournamentNavigate(tournamentItem)
                                        }}
                                    >
                                        <Text>{tournamentItem?.tournament?.name}</Text>
                                    </Pressable>
                                )
                                })}
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}

export default ClubCricketMatch;