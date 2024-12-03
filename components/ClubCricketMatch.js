import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, Image, Modal, ScrollView } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { formattedDate, formattedTime } from '../utils/FormattedDateTime';
import { findTournamentByID, getTournamentBySport } from '../services/tournamentServices';
import { useDispatch, useSelector } from 'react-redux';
import { getTournamentByIdAction, getTournamentBySportAction } from '../redux/actions/actions';

const ClubCricketMatch = ({ teamData }) => {
    const [matches, setMatches] = useState([]);
    const [isDropDownVisible, setIsDropDownVisible] = useState(false);
    const [tournamentName, setTournamentName] = useState([]);
    const axiosInstance = useAxiosInterceptor();
    const [currentRole, setCurrentRole] = useState('');
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const tournaments = useSelector((state) => state.tournamentsReducers.tournaments);
    const tournament = useSelector((state) => state.tournamentsReducers.tournament);
    const sport = useSelector((state) => state.sportReducers.sport);

    useEffect(() => {
        fetchClubMatch();
    }, []);

    const fetchClubMatch = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/cricket/getMatchByTeamFunc`, {
                params: {
                    id: teamData.id.toString()
                },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.data) {
                setMatches([]);
            } else {
                setMatches(response.data.filter(item => item !== null));
            }
        } catch (err) {
            console.log("unable to get the match by teams ", err);
        }
    };

    const handleMatch = (item) => {
        navigation.navigate("CricketMatchPage", { item });
    };

    const handleDropDown = () => {
        setIsDropDownVisible(true);
    };

    const handleTournamentNavigate = async (tournamentItem) => {
        const tournamentId = tournamentItem.tournament_id;
        const tournamentStatus = ["live", "previous", "upcoming"];
        const tournamentBySport = await getTournamentBySport({ axiosInstance, sport });
        dispatch(getTournamentBySportAction(tournamentBySport));
        const foundTournament = findTournamentByID({ tournamentBySport, tournamentId, tournamentStatus });
        if (foundTournament !== null) {
            dispatch(getTournamentByIdAction(foundTournament));
        }
        navigation.navigate("TournamentPage", { tournament, currentRole });
    };

    let tournamentsID = new Set();
    matches.map((item) => {
        tournamentsID.add(item.tournament.id);
    })

    return (
        <View style={tailwind`flex-1`}>
            <ScrollView contentContainerStyle={{flexGrow:1}} nestedScrollEnabled>
                <Pressable style={tailwind`border rounded-lg flex-row items-center justify-center w-35 gap-2`} onPress={handleDropDown}>
                    <Text style={tailwind`text-lg text-black p-2`}>Tournament</Text>
                    <AntDesign name="down" size={10} color="black" />
                </Pressable>
                {matches.length > 0 && matches.map((item, index) => (
                    <Pressable key={index} style={tailwind`mb-4 p-1 bg-white rounded-lg shadow-md`} onPress={() => handleMatch(item)} >
                        <View style={tailwind`items-start justify-center ml-2`}>
                            <Text>{item?.tournament.name}</Text>
                        </View>
                        <View style={tailwind`flex-row items-center`}>
                            <View style={tailwind`justify-between mb-2 gap-1 p-2 mt-1`}>
                                <View style={tailwind`items-center flex-row`}>
                                    <View style={tailwind`flex-row`}>
                                        <Image source={{ uri: item?.homeTeam.media_url }} style={tailwind`w-6 h-6 bg-violet-200 rounded-full`} />
                                        <Text style={tailwind`ml-2 text-md font-semibold text-gray-800`}>{item?.homeTeam.name}</Text>
                                    </View>
                                    {item.status !== "not_started" && item.homeScore !== null && (
                                        <View>
                                            <Text style={tailwind`text-black`}>{item?.homeScore.score}/{item?.homeScore.wickets}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={tailwind`items-center flex-row`}>
                                    <View style={tailwind`items-center flex-row`}>
                                        <View style={tailwind`flex-row`}>
                                            <Image source={{ uri: item?.homeTeam.media_url }} style={tailwind`w-6 h-6 bg-violet-200 rounded-full`} />
                                            <Text style={tailwind`ml-2 text-md font-semibold text-gray-800`}>{item?.awayTeam.name}</Text>
                                        </View>
                                        {item.status !== "not_started"  && item.awayScore !== null && (
                                            <View>
                                                <Text style={tailwind`text-black`}>{item.awayScore.score}/{item.awayScore.wickets}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <View style={tailwind`bg-gray-400 w-0.2 mx-4 h-10`}></View>
                            <View style={tailwind`justify-between`}>
                                {item.status === "not started" ? (
                                    <>
                                        <Text style={tailwind`text-black`}>{formattedDate(item.date_on)}</Text>
                                        <Text style={tailwind`text-black`}>{formattedTime(item.start_time)}</Text>
                                    </>
                                ):(
                                   <Text>{item.status}</Text> 
                                )}
                            </View>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
            {isDropDownVisible && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isDropDownVisible}
                    onRequestClose = {() => setIsDropDownVisible(!isDropDownVisible)}
                >
                    <Pressable style={tailwind`flex-1 justify-end bg-gray-900 bg-opacity-50 w-full`} onPress={() => setIsDropDownVisible(false)}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            {[...tournamentsID]?.map((tournamentID, index) => {
                                const tournamentItem = matches.find((item) => item.tournament.id === tournamentID );
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