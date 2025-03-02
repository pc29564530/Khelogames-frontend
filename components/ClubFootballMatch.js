import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import { View, Text, Pressable, Image, Modal} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import {formattedDate, formattedTime} from '../utils/FormattedDateTime'
import { ScrollView } from 'react-native-gesture-handler';
import {findTournamentByID} from '../services/tournamentServices';
import { useDispatch, useSelector } from 'react-redux';
import { getTournamentBySportAction, getTournamentByIdAction, getMatch } from '../redux/actions/actions';
import { getTournamentBySport } from '../services/tournamentServices';
import { convertToISOString } from '../utils/FormattedDateTime';

const ClubFootballMatch = ({teamData}) => {
    const [matches, setMatches] = useState([]);
    const [isDropDownVisible, setIsDropDownVisible] = useState(false);
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
            const response = await axiosInstance.get(`${BASE_URL}/football/getMatchByTeamFunc`, {
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
            console.log("unable to get the matches by teams ", err);
        }
    };

    const handleMatchPage = (item) => {
        dispatch(getMatch(item))
        navigation.navigate("FootballMatchPage", { item });
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
    }

    let tournamentsID = new Set();
    matches.map((item) => {
        tournamentsID.add(item.tournament.id);
    })

    return (
        <View style={tailwind`flex-1`}>
            <ScrollView style={tailwind``} contentContainerStyle={{flexGrow:1}}>
                <Pressable style={tailwind`border rounded-lg flex-row items-center justify-center inline inline-block w-35 gap-2`} onPress={() => handleDropDown()}>
                    <Text style={tailwind`text-lg text-black p-2`}>Tournament</Text>
                    <AntDesign name="down"  size={10} color="black" />
                </Pressable>
                {matches?.length > 0 ? (
                    matches.map((item, index) => (
                        <Pressable key={index} style={tailwind`mb-1 p-1 bg-white rounded-lg shadow-md flex-row  justify-between`} onPress={() => handleMatchPage(item)}>
                            <View>
                                <View style={tailwind`justify-between items-center mb-1 gap-1 p-1 flex-row`}>
                                    <View style={tailwind`flex-row`}>
                                        {/* //<Image source={{ uri: item.team1_avatar_url }} style={tailwind`w-6 h-6 bg-violet-200 rounded-full `} /> */}
                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>{item?.awayTeam.name}</Text>
                                    </View>
                                    {(item.status !== "not_started") && (
                                        <View>
                                            <Text>{item.awayScore.score}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={tailwind`justify-between items-center mb-1 gap-1 p-1 flex-row`}>
                                    <View style={tailwind`flex-row`}>
                                        {/* <Image source={{ uri: item.home_team_name }} style={tailwind`w-6 h-6 bg-violet-200 rounded-full `} /> */}
                                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>{item?.homeTeam.name}</Text>
                                    </View>
                                    {item.status !== "not_started"  && (
                                        <View>
                                            <Text>{item.homeScore.score}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View style={tailwind`h-16 items-center justify-center w-0.2 bg-black`}></View>
                            {item.status === "not_started" ? (
                                <View style={tailwind`items-center justify-evenly`}>
                                    <View style={tailwind`justify-center items-start`}>
                                        <Text style={tailwind`text-gray-600`}>{formattedDate(convertToISOString(item.startTimeStamp))}</Text>
                                    </View>
                                    
                                    <View style={tailwind`justify-center items-start`}>
                                        <Text style={tailwind`text-gray-600`}>{formattedTime(convertToISOString(item.startTimeStamp))}</Text>
                                    </View>
                                </View>
                            ):(
                                <View style={tailwind`justify-center items-start`}>
                                    <Text style={tailwind`text-gray-600`}>{item.status}</Text>
                                </View>
                            )}
                        </Pressable>
                    ))
                ) : (
                    <Text style={tailwind`text-center mt-4 text-gray-600`}>Loading matches...</Text>
                )}
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
            </ScrollView>
        </View>
    );
}

export default ClubFootballMatch;                                                                                                                                             