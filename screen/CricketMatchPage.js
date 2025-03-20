import { useState, useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Image, Modal, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getHomePlayer, getMatch, getAwayPlayer, setBatTeam, setInningScore, setEndInning } from '../redux/actions/actions';
const filePath = require('../assets/status_code.json');
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import CricketMatchPageContent from '../navigation/CricketMatchPageContent';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import CheckBox from '@react-native-community/checkbox';
import AddBatsmanAndBowler from '../components/AddBatsAndBowler';
import { fetchTeamPlayers } from '../services/teamServices';


const CricketMatchPage = ({ route }) => {
    const dispatch = useDispatch();
    const matchId = route.params.item;
    const match = useSelector((state) => state.cricketMatchScore.match );  
    const homePlayer = useSelector(state => state.teams.homePlayer);
    const awayPlayer = useSelector(state => state.teams.awayPlayer);                                                 
    const navigation = useNavigation();
    const [menuVisible, setMenuVisible] = useState(false);
    const [statusVisible, setStatusVisible] = useState(false);
    const axiosInstance = useAxiosInterceptor();
    const [statusCode, setStatusCode] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam)
    const [addBatsmanAndBowlerModalVisible, setAddBatsmanAndBowlerModalVisible] = useState(false);
    const game = useSelector((state) => state.sportReducers.game);
    const [inningVisible, setInningVisible] = useState(false);
    const [teamInning, setTeamInning] = useState();
    const prevMatchRef = useRef(null);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss);
    const {height:sHeight, width: sWidth} = Dimensions.get('screen');
    const [currentInning, setCurrentInning] = useState("inning1")
    const [endInningVisible, setEndInningVisible] = useState(false);

    useEffect(() => {
        if(match) {
            setLoading(false);
        }
    }, [match]);

    useEffect( () => {
        const fetchMatch = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken')
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getMatchByMatchID`, {
                    params: {
                        match_id: matchId.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                dispatch(getMatch(response.data || null));
            } catch (err) {
                console.error("Failed to fetch match data: ", err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchMatch();
    }, [matchId, game.name, dispatch]);

    useEffect(() => {
        const fetchPlayer = async () => {
            const homePlayersResponse = await fetchTeamPlayers(BASE_URL,match.homeTeam.id, game, axiosInstance);
            const awayPlayersResponse = await fetchTeamPlayers(BASE_URL,match.awayTeam.id, game, axiosInstance);
            dispatch(getHomePlayer(homePlayersResponse))
            dispatch(getAwayPlayer(awayPlayersResponse))
        }
        fetchPlayer() 
    }, []);


    const handleUpdateResult = async (itm) => {
        setStatusVisible(false);
        setMenuVisible(false);
        setLoading(true);
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const data = { id: match.matchId, status_code: itm };
            const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateMatchStatus`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            dispatch(getMatch(response.data || null));
        } catch (err) {
            console.error("Unable to update the match: ", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleMenu = () => setMenuVisible(!menuVisible);


    const handleSearch = (text) => setSearchQuery(text);

    const filteredStatusCodes = filePath["status_codes"].filter((item) => 
        item.type.includes(searchQuery) || item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const updateInning = async (teamID) => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                inning: currentInning,
                match_id:match.id,
                team_id:teamID.id
            }
            const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketInning`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            if(response.data) {
                setAddBatsmanAndBowlerModalVisible(true);
            }
            
        } catch (err) {
            console.log("failed to update inning: ", err)
        }
    }

    const getInningDescription = () => {
        if ((match?.status_code === "in_progress" || match?.status_code === "break") && (match?.homeScore !== null && match?.awayScore != null)) {
            if(match.awayTeam.id === cricketToss?.tossWonTeam?.id && cricketToss?.tossDecision === "Batting" && match.awayScore?.is_inning_completed===true){
                return (
                    <View style={[tailwind`items-center -top-4`]}>
                        <Text style={tailwind`text-white text-sm`}>`{match.homeTeam.name} require {match.awayScore.score+1-match.homeScore.score} runs in {convertBallToOvers(50.0 - match?.homeScore?.overs)}`</Text>
                    </View>
                )
            } else {
                return (
                    <View style={[tailwind`items-center -top-4`]}>
                        <Text style={tailwind`text-white text-sm`}>{match.awayTeam.name} require {match?.homeScore?.score+1-match?.awayScore?.score} runs in {convertBallToOvers(50.0 - match?.awayScore?.overs)}</Text>
                    </View>
                )
            }
        } else if (match?.status_code === "finished"){
            if(match.awayTeam.id === cricketToss?.tossWonTeam?.id && cricketToss?.tossDecision === "Batting" && match.awayScore?.is_inning_completed===true){
                return (
                    <View style={[tailwind`items-center -top-4`]}>
                        <Text style={tailwind`text-white text-sm`}>`{match.awayTeam.name} beat {match.homeTeam.name} by {match.awayScore.score+1-match.homeScore.score} runs`</Text>
                    </View>
                )
            } else {
                return (
                    <View style={[tailwind`items-center -top-4`]}>
                        <Text style={tailwind`text-white text-sm`}>{match.homeTeam.name} beat {match.awayTeam.name} by {10-match?.homeScore?.wickets} wickets</Text>
                    </View>
                )
            }
        }
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    } else {
        return (
            <View style={tailwind`flex-1 bg-white`}>
                <View style={[tailwind`safe-center top-0 right-0 left-0 bg-red-400`]}>
                    <View style={tailwind`flex-row justify-between fixed p-2 pt-4`}>
                        <Pressable onPress={() => navigation.goBack()}>
                            <AntDesign name="arrowleft" size={26} color="white" />
                        </Pressable>
                        <Pressable style={tailwind``} onPress={toggleMenu}>
                            <MaterialIcon name="more-vert" size={24} color="white" />
                        </Pressable>
                    </View>
                    <View style={[tailwind`items-center -top-4`]}>
                        <Text style={tailwind`text-white text-xl font-semibold`}>{match?.status_code?.charAt(0)?.toUpperCase()+match?.status_code?.slice(1)}</Text>
                    </View>
                    <View style={[tailwind`items-center flex-row justify-evenly px-2 py-2  bg-red-400 -top-4`]}>
                        <View style={tailwind`items-center`}>
                            {match?.homeTeam?.media_url?(
                                <Image/>
                            ):(
                                <View style={tailwind`rounded-full h-12 w-12 bg-yellow-400 items-center justify-center`}>
                                    <Text style={tailwind`text-white text-md`}>{match?.homeTeam?.name?.charAt(0)?.toUpperCase()}</Text>
                                </View>
                            )}
                            <View>
                                <Text  style={tailwind`text-white`}>{match.homeTeam?.name}</Text>
                            </View>
                        </View>
                        <View style={tailwind`flex-row gap-2 justify-evenly items-center`}>
                            <View style={tailwind``}>
                                {match.status_code !== "not_started" && match.homeScore?.inning === "inning1" &&  match?.homeScore ? (
                                    <> 
                                        <Text style={tailwind`ml-2 text-lg text-white`}>
                                            {match?.homeScore?.score}/{match?.homeScore?.wickets}
                                        </Text>
                                        <Text style={tailwind`ml-2 text-lg text-white`}>({convertBallToOvers(match?.homeScore?.overs)})</Text>
                                    </>
                                ):(<Text style={tailwind`text-lg text-white`}>-</Text>)}
                                
                            </View>
                            <View style={tailwind`h-10 w-0.4 bg-white`} />
                            <View style={tailwind``}>
                                {match.status_code !== "not_started" && match.awayScore?.inning === "inning1" &&  match?.awayScore ? (
                                    <>
                                        <Text style={tailwind`ml-2 text-lg text-white`}>
                                            {match?.awayScore?.score}/{match?.awayScore?.wickets}
                                        </Text>
                                        <Text style={tailwind`ml-2 text-lg text-white`}>({convertBallToOvers(match?.awayScore?.overs)})</Text>
                                    </>
                                ):(
                                    <Text style={tailwind`text-lg text-white`}>-</Text> 
                                )}
                            </View>
                        </View>
                        <View style={tailwind`items-center`}>
                            { match.awayTeam?.media_url ? (
                                <Image/>
                            ):(
                                <View style={tailwind`rounded-full h-12 w-12 bg-yellow-400 items-center justify-center`}>
                                    <Text style={tailwind`text-white text-md`}>{match?.awayTeam?.name?.charAt(0)?.toUpperCase()}</Text>
                                </View>
                            )}
                            <View>
                                <Text  style={tailwind`text-white`}>{match?.awayTeam?.name}</Text>
                            </View>
                        </View>
                    </View>
                    {match.status !== "not_started" && match.status !== "finished" && getInningDescription()}
                </View>
            <View
                style={tailwind`flex-1`}   
            >
                <CricketMatchPageContent/>
            </View>
            {statusVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={statusVisible}
                    onRequestClose={() => setStatusVisible(false)}
                >
                    <Pressable onPress={() => setStatusVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <ScrollView style={tailwind`bg-white rounded-lg p-6 shadow-lg`}>
                            <TextInput
                                style={tailwind`bg-gray-100 p-3 mb-4 rounded-md text-black`}
                                placeholder="Search status..."
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                            {filteredStatusCodes.map((item, index) => (
                                <Pressable key={index} onPress={() => { setStatusCode(item.type); handleUpdateResult(item.type); }} style={tailwind`p-4 border-b border-gray-200 flex-row items-center gap-3`}>
                                    <Text style={tailwind`text-lg text-black`}>{index + 1}.</Text>
                                    <Text style={tailwind`text-lg text-gray-800`}>{item?.description}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Modal>
            )}
            {menuVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={menuVisible}
                    onRequestClose={toggleMenu}
                >
                    <TouchableOpacity onPress={toggleMenu} style={tailwind`flex-1`}>
                        <View style={tailwind`flex-row justify-end`}>
                            <View style={tailwind`mt-12 mr-4 bg-white rounded-lg shadow-lg p-4 w-40 gap-4`}>
                                <TouchableOpacity onPress={() => setStatusVisible(true)}>
                                    <Text style={tailwind`text-xl`}>Edit Match</Text>
                                </TouchableOpacity>
                                {/* <TouchableOpacity onPress={() => setInningVisible(true)}>
                                    <Text style={tailwind`text-xl`}>Set Inning</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleEndInning()}>
                                    <Text style={tailwind`text-xl`}>End Inning</Text>
                                </TouchableOpacity> */}
                                <TouchableOpacity onPress={() => {}}>
                                    <Text style={tailwind`text-xl`}>Delete Match</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {}}>
                                    <Text style={tailwind`text-xl`}>Share</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {match.status_code !== "finished" && navigation.navigate('Live Match')}}>
                                    <Text style={tailwind`text-xl`}>Edit Score</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
            {inningVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={inningVisible}
                    onRequestClose={() => setInningVisible(false)}
                >
                <TouchableOpacity onPress={() => setInningVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                    <View style={tailwind`bg-white rounded-t-lg p-6`}>
                        <View style={tailwind`bg-white p-4 w-full gap-4`}>
                        <Text style={tailwind`text-lg font-bold text-gray-600 mb-2`}>Set Team Inning</Text>
                        <View style={tailwind``}/>
                            <View style={tailwind`flex-row items-center mb-2`}>
                                <Text style={tailwind`ml-2 text-lg text-blue-900`}>{match.homeTeam.name}</Text>
                                <CheckBox
                                    value={teamInning === "inning1"}
                                    onValueChange={() => {setTeamInning("inning1"); updateInning(match.homeTeam); dispatch(setBatTeam(match.homeTeam.id))}}
                                />
                            </View>
                            <View style={tailwind`flex-row items-center mb-4`}>
                                <Text style={tailwind`ml-2 text-lg text-blue-900`}>{match.awayTeam.name}</Text>
                                <CheckBox
                                    value={teamInning === "inning2"}
                                    onValueChange={() => {setTeamInning("inning2"); updateInning(match.awayTeam); dispatch(setBatTeam(match.awayTeam.id))}}
                                />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
            )}
            {addBatsmanAndBowlerModalVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={addBatsmanAndBowlerModalVisible}
                    onRequestClose={() => setAddBatsmanAndBowlerModalVisible(false)}
                >
                <Pressable onPress={() => setAddBatsmanAndBowlerModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                    <View style={tailwind`bg-white rounded-t-lg p-6`}>
                        <AddBatsmanAndBowler match={match} setAddBatsmanAndBowlerModalVisible={setAddBatsmanAndBowlerModalVisible}/>
                    </View>
                </Pressable>
            </Modal>
            )}
        </View>
    );
    }
};

export default CricketMatchPage;