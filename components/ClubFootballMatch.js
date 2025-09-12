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
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const ClubFootballMatch = ({teamData, parentScrollY, headerHeight, collapsedHeader}) => {
    const [matches, setMatches] = useState([]);
    const [isDropDownVisible, setIsDropDownVisible] = useState(false);
    
    const [currentRole, setCurrentRole] = useState('');
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const tournaments = useSelector((state) => state.tournamentsReducers.tournaments);
    const tournament = useSelector((state) => state.tournamentsReducers.tournament);
    const game = useSelector((state) => state.sportReducers.game);

    const currentScrollY = useSharedValue(0);
    const handlerScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            if(parentScrollY === collapsedHeader){
                parentScrollY.value = currentScrollY;
            } else {
                parentScrollY.value = event.contentOffset.y;
            }
        }
    })

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
        navigation.navigate("TournamentPage", { tournament, currentRole });
    }

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
                }}
            >
                <Pressable
                    style={tailwind`border rounded-xl flex-row items-center justify-center bg-gray-100 shadow-sm mb-4 mt-2`}
                    onPress={() => handleDropDown()}
                >
                    <Text style={tailwind`text-lg font-semibold text-gray-800`}>Tournaments</Text>
                    <AntDesign name="down" size={14} color="black" />
                </Pressable>
                {matches?.length > 0 ? (
                    matches.map((item, index) => (
                        <Pressable key={index} style={tailwind`mb-1 p-1 bg-white rounded-lg shadow-md flex-row  justify-between h-100 `} onPress={() => handleMatchPage(item)}>
                            <View>
                                <Pressable onPress={() => handleTournamentPage(item?.tournament)} style={tailwind`p-1 flex flex-row justify-between`}>
                                    <Text style={tailwind`text-6md`}>{item?.tournament?.name}</Text>
                                    <AntDesign name="right" size={12} color="black" />
                                </Pressable>
                                <View style={tailwind`flex-row items-center justify-between `}>
                                    <View style={tailwind`flex-row`}>
                                        <View style={tailwind``}>
                                            {item.awayTeam.media_url ? (
                                                <Image 
                                                    source={{ uri: item.awayTeam?.media_url }} 
                                                    style={tailwind`w-6 h-6 bg-violet-200 rounded-full mb-2`} 
                                                />
                                            ):(
                                                <View style={tailwind`w-6 h-6 bg-violet-200 rounded-full justify-center items-center mb-2`}>
                                                    <Text>{item.awayTeam.name.charAt(0).toUpperCase()}</Text>
                                                </View>
                                            )}
                                            {item.homeTeam.media_url ? (
                                                <Image 
                                                    source={{ uri: item.homeTeam?.media_url }} 
                                                    style={tailwind`w-6 h-6 bg-violet-200 rounded-full mb-2`} 
                                                />
                                            ):(
                                                <View style={tailwind`w-6 h-6 bg-violet-200 rounded-full items-center justify-center mb-2`}>
                                                    <Text>{item.homeTeam.name.charAt(0).toUpperCase()}</Text>
                                                </View>
                                            )}
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
                        <Pressable
                            style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                            onPress={() => setIsDropDownVisible(false)}
                        >
                            <View style={tailwind`bg-white rounded-t-2xl p-4 shadow-lg`}>
                                <View style={tailwind`w-12 h-1.5 bg-gray-300 self-center rounded-full mb-3`} />
                                <Text style={tailwind`text-xl font-bold text-gray-800 mb-4`}>
                                    Select Tournament
                                </Text>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {[...tournamentsPublicID]?.map((tournamentPublicID, index) => {
                                        const tournamentItem = matches.find(
                                            (item) => item.tournament.public_id === tournamentPublicID
                                        );
                                        return (
                                            <Pressable
                                                key={index}
                                                style={tailwind`flex-row items-center bg-gray-50 p-3 mb-3 rounded-xl shadow-sm active:bg-gray-100`}
                                                onPress={() => handleTournamentNavigate(tournamentItem)}
                                            >
                                                <View style={tailwind`w-10 h-10 rounded-full bg-yellow-100 items-center justify-center mr-3`}>
                                                    <FontAwesome name="trophy" size={20} color="gold" />
                                                </View>
                                                <Text style={tailwind`text-base font-medium text-gray-700`}>
                                                    {tournamentItem?.tournament?.name}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </Pressable>
                    </Modal>
                )}
            </Animated.ScrollView>
        </View>
    );
}

export default ClubFootballMatch;                                                                                                                                             