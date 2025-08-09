import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import { View, Text, Pressable, Image, Modal} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import {formattedDate, formattedTime} from '../utils/FormattedDateTime'
import { ScrollView } from 'react-native-gesture-handler';
import {findTournamentByID} from '../services/tournamentServices';
import { useDispatch, useSelector } from 'react-redux';
import { getTournamentBySportAction, getTournamentByIdAction, getMatch } from '../redux/actions/actions';
import { getTournamentBySport } from '../services/tournamentServices';
import { convertToISOString, formatToDDMMYY } from '../utils/FormattedDateTime';

const ClubFootballMatch = ({teamData}) => {
    const [matches, setMatches] = useState([]);
    const [isDropDownVisible, setIsDropDownVisible] = useState(false);
    
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
            const response = await axiosInstance.get(`${BASE_URL}/football/getMatchesByTeam/${teamData.public_id}`, {
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
        navigation.navigate("FootballMatchPage", { matchPublicID: item.public_id });
    };

    const handleDropDown = () => {
        setIsDropDownVisible(true);
    };

    const handleTournamentNavigate = async (tournamentItem) => {
        const tournamentPublicID = tournamentItem.tournament_id;
        const tournamentStatus = ["live", "previous", "upcoming"];
        const tournamentBySport = await getTournamentBySport({ axiosInstance, sport });
        dispatch(getTournamentBySportAction(tournamentBySport));
        const foundTournament = findTournamentByID({ tournamentBySport, tournamentId, tournamentStatus });
        if (foundTournament !== null) {
            dispatch(getTournamentByIdAction(foundTournament));
        }
        navigation.navigate("TournamentPage", { tournament, currentRole });
    }

    let tournamentsPublicID = new Set();
    matches.map((item) => {
        tournamentsPublicID.add(item.tournament.public_id);
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
                                                {item.status !== "not_started" && (
                                                    <View>
                                                    <View style={tailwind``}>
                                                        {item.homeScore  && (
                                                            <View style={tailwind``}>
                                                                <View key={index} style={tailwind`flex-row ml-2`}>
                                                                    <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                                                                        {item.awayScore.goals}
                                                                    </Text>
                                                                    {item.awayScore?.penalty_shootout && (
                                                                    <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                                                                        ({item.awayScore.penalty_shootout})
                                                                    </Text>
                                                                    )}
                                                                </View>
                                                            </View>
                                                        )}
                                                        {item.awayScore && (
                                                            <View style={tailwind``}>
                                                                <View key={index} style={tailwind`flex-row ml-2`}>
                                                                    <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                                                                        {item.homeScore.goals}
                                                                    </Text>
                                                                    {item.homeScore?.penalty_shootout && (
                                                                    <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                                                                        ({item.homeScore.penalty_shootout})
                                                                    </Text>
                                                                    )}
                                                                </View>
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
            </ScrollView>
        </View>
    );
}

export default ClubFootballMatch;                                                                                                                                             