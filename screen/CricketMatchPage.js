import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Image, Modal, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getHomePlayer, getMatch, getAwayPlayer, setBatTeam, setInningScore, setEndInning, setCurrentInning, setInningStatus } from '../redux/actions/actions';
const filePath = require('../assets/status_code.json');
import CricketMatchPageContent from '../navigation/CricketMatchPageContent';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import CheckBox from '@react-native-community/checkbox';
import AddBatsmanAndBowler from '../components/AddBatsAndBowler';
import { fetchTeamPlayers } from '../services/teamServices';
import { current } from '@reduxjs/toolkit';

// Team Score Component
const TeamScore = ({ team, score, isInning1 }) => {
    if (!score || !isInning1) return <Text style={tailwind`text-lg text-white`}>-</Text>;
    
    return (
        <>
            <Text style={tailwind`ml-2 text-lg text-white`}>
                {score.score}/{score.wickets}
            </Text>
            <Text style={tailwind`ml-2 text-lg text-white`}>
                ({convertBallToOvers(score.overs)})
            </Text>
        </>
    );
};

// Team Logo Component
const TeamLogo = ({ team }) => {
    if (team?.media_url) {
        return <Image source={{ uri: team.media_url }} style={tailwind`h-12 w-12 rounded-full`} />;
    }
    
    return (
        <View style={tailwind`rounded-full h-12 w-12 bg-yellow-400 items-center justify-center`}>
            <Text style={tailwind`text-white text-md`}>
                {team?.name?.charAt(0)?.toUpperCase()}
            </Text>
        </View>
    );
};

// Match Header Component
const MatchHeader = ({ match, cricketToss, onBackPress, onMenuPress }) => {
    const getInningDescription = () => {
        if (!match?.status_code || match?.status_code === "not_started") return null;
        
        const isAwayBatting = match.awayTeam.id === cricketToss?.tossWonTeam?.id && 
                            cricketToss?.tossDecision === "Batting" && 
                            match.awayScore?.is_inning_completed;

        if (match.status_code === "finished") {
            return (
                <View style={tailwind`items-center -top-4`}>
                    <Text style={tailwind`text-white text-sm`}>
                        {isAwayBatting 
                            ? `${match.awayTeam.name} beat ${match.homeTeam.name} by ${match.awayScore.score - match.homeScore.score} runs`
                            : `${match.homeTeam.name} beat ${match.awayTeam.name} by ${10 - match.homeScore.wickets} wickets`}
                    </Text>
                </View>
            );
        }

        if (match.status_code === "in_progress" || match.status_code === "break") {
            return (
                <View style={tailwind`items-center -top-4`}>
                    <Text style={tailwind`text-white text-sm`}>
                        {isAwayBatting
                            ? `${match.homeTeam.name} require ${match.awayScore?.score + 1 - match.homeScore.score} runs in ${convertBallToOvers(50.0 - match.homeScore.overs)}`
                            : `${match.awayTeam.name} require ${match.homeScore?.score + 1 - match.awayScore.score} runs in ${convertBallToOvers(50.0 - match.awayScore.overs)}`}
                    </Text>
                </View>
            );
        }

        return null;
    };

    return (
        <View style={[tailwind`safe-center top-0 right-0 left-0 bg-red-400`]}>
            <View style={tailwind`flex-row justify-between fixed p-2 pt-4`}>
                <Pressable onPress={onBackPress}>
                    <AntDesign name="arrowleft" size={26} color="white" />
                </Pressable>
                <Pressable onPress={onMenuPress}>
                    <MaterialIcon name="more-vert" size={24} color="white" />
                </Pressable>
            </View>
            
            <View style={[tailwind`items-center -top-4`]}>
                <Text style={tailwind`text-white text-xl font-semibold`}>
                    {match?.status_code?.charAt(0)?.toUpperCase() + match?.status_code?.slice(1)}
                </Text>
            </View>

            <View style={[tailwind`items-center flex-row justify-evenly px-2 py-2 bg-red-400 -top-4`]}>
                <View style={tailwind`items-center`}>
                    <TeamLogo team={match.homeTeam} />
                    <Text style={tailwind`text-white`}>{match.homeTeam?.name}</Text>
                </View>

                <View style={tailwind`flex-row gap-2 justify-evenly items-center`}>
                    <View>
                        <TeamScore 
                            team={match.homeTeam} 
                            score={match.homeScore} 
                            isInning1={match.homeScore?.inning === "inning1"} 
                        />
                    </View>
                    <View style={tailwind`h-10 w-0.4 bg-white`} />
                    <View>
                        <TeamScore 
                            team={match.awayTeam} 
                            score={match.awayScore} 
                            isInning1={match.awayScore?.inning === "inning1"} 
                        />
                    </View>
                </View>

                <View style={tailwind`items-center`}>
                    <TeamLogo team={match.awayTeam} />
                    <Text style={tailwind`text-white`}>{match.awayTeam?.name}</Text>
                </View>
            </View>

            {getInningDescription()}
        </View>
    );
};

// Status Modal Component
const StatusModal = ({ visible, onClose, onStatusSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    
    const filteredStatusCodes = filePath["status_codes"].filter((item) => 
        item.type.includes(searchQuery) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable onPress={onClose} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                <ScrollView style={tailwind`bg-white rounded-lg p-6 shadow-lg`}>
                    <TextInput
                        style={tailwind`bg-gray-100 p-3 mb-4 rounded-md text-black`}
                        placeholder="Search status..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {filteredStatusCodes.map((item, index) => (
                        <Pressable 
                            key={index} 
                            onPress={() => onStatusSelect(item.type)} 
                            style={tailwind`p-4 border-b border-gray-200 flex-row items-center gap-3`}
                        >
                            <Text style={tailwind`text-lg text-black`}>{index + 1}.</Text>
                            <Text style={tailwind`text-lg text-gray-800`}>{item?.description}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </Pressable>
        </Modal>
    );
};

// Main Component
const CricketMatchPage = ({ route }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const axiosInstance = useAxiosInterceptor();
    
    const matchId = route.params.item;
    const match = useSelector((state) => state.cricketMatchScore.match);
    const homePlayer = useSelector(state => state.teams.homePlayer);
    const awayPlayer = useSelector(state => state.teams.awayPlayer);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam);
    const game = useSelector((state) => state.sportReducers.game);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss);
    const currentInning = useSelector(state => state.cricketMatchScore.currentInning);
    const inningStatus = useSelector(state => state.cricketMatchScore.inningStatus);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [statusVisible, setStatusVisible] = useState(false);
    const [inningVisible, setInningVisible] = useState(false);
    const [teamInning, setTeamInning] = useState();
    const [addBatsmanAndBowlerModalVisible, setAddBatsmanAndBowlerModalVisible] = useState(false);

    useEffect(() => {
        if (match) {
            setLoading(false);
        }
    }, [match]);

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getMatchByMatchID`, {
                    params: { match_id: matchId.toString() },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                dispatch(getMatch(response.data || null));
            } catch (err) {
                console.error("Failed to fetch match data: ", err);
                setError("Failed to load match data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchMatch();
    }, [matchId, game.name, dispatch]);

    useEffect(() => {
        if (!match || !cricketToss) return;

        const tossWonTeamId = cricketToss.tossWonTeam?.id;
        const isBatting = cricketToss.tossDecision === "Batting";
        const batTeamId = isBatting
            ? (tossWonTeamId === match.home_team_id ? match.home_team_id : match.away_team_id)
            : (tossWonTeamId !== match.home_team_id ? match.home_team_id : match.away_team_id);

        dispatch(setBatTeam(batTeamId));
    }, [match, cricketToss]);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const [homePlayers, awayPlayers] = await Promise.all([
                    fetchTeamPlayers(BASE_URL, match.homeTeam.id, game, axiosInstance),
                    fetchTeamPlayers(BASE_URL, match.awayTeam.id, game, axiosInstance)
                ]);
                
                dispatch(getHomePlayer(homePlayers));
                dispatch(getAwayPlayer(awayPlayers));
            } catch (err) {
                console.error("Failed to fetch players: ", err);
                setError("Failed to load team players. Please try again.");
            }
        };

        if (match?.homeTeam?.id && match?.awayTeam?.id) {
            fetchPlayers();
        }
    }, [match?.homeTeam?.id, match?.awayTeam?.id]);

    useEffect(() => {
        if (cricketToss && match) {
            const isHomeBatting = cricketToss.tossWonTeam.id === match.homeTeam.id && cricketToss.tossDecision === "Batting";
                dispatch(setCurrentInning("inning1"));
                dispatch(setInningStatus("is_progress"));
                dispatch(setBatTeam(isHomeBatting))
        }
    }, [cricketToss, match, inningStatus]);

    const handleInningComplete = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            await axiosInstance.post(`${BASE_URL}/${game.name}/endInning`, {
                match_id: match.id,
                team_id: batTeam,
                inning: currentInning
            }, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            
            dispatch(setInningStatus("completed"));
            
            if (match.match_type === "TEST" && currentInning === "inning1") {
                dispatch(setCurrentInning("inning2"));
            }
        } catch (err) {
            console.error("Failed to end inning: ", err);
        }
    };

    const handleUpdateResult = async (statusCode) => {
        setStatusVisible(false);
        setMenuVisible(false);
        setLoading(true);
        
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.put(
                `${BASE_URL}/${game.name}/updateMatchStatus`,
                { id: match.matchId, status_code: statusCode },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            dispatch(getMatch(response.data || null));
        } catch (err) {
            console.error("Unable to update the match: ", err);
            setError("Failed to update match status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const updateInning = async (teamID) => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.put(
                `${BASE_URL}/${game.name}/updateCricketInning`,
                {
                    inning: currentInning,
                    match_id: match.id,
                    team_id: teamID.id
                },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            if (response.data) {
                setAddBatsmanAndBowlerModalVisible(true);
            }
        } catch (err) {
            console.error("Failed to update inning: ", err);
            setError("Failed to update inning. Please try again.");
        }
    };

    if (loading) {
        return (
            <View style={tailwind`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={tailwind`mt-2`}>Loading match data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={tailwind`flex-1 justify-center items-center p-4`}>
                <Text style={tailwind`text-red-500 text-center mb-4`}>{error}</Text>
                <TouchableOpacity 
                    style={tailwind`bg-blue-500 px-4 py-2 rounded`}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={tailwind`text-white`}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={tailwind`flex-1 bg-white`}>
            <MatchHeader
                match={match}
                cricketToss={cricketToss}
                onBackPress={() => navigation.goBack()}
                onMenuPress={() => setMenuVisible(true)}
            />

            <View style={tailwind`flex-1`}>
                <CricketMatchPageContent />
            </View>

            <StatusModal
                visible={statusVisible}
                onClose={() => setStatusVisible(false)}
                onStatusSelect={handleUpdateResult}
            />

            {menuVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={menuVisible}
                    onRequestClose={() => setMenuVisible(false)}
                >
                    <TouchableOpacity 
                        onPress={() => setMenuVisible(false)} 
                        style={tailwind`flex-1`}
                    >
                        <View style={tailwind`flex-row justify-end`}>
                            <View style={tailwind`mt-12 mr-4 bg-white rounded-lg shadow-lg p-4 w-40 gap-4`}>
                                <TouchableOpacity onPress={() => setStatusVisible(true)}>
                                    <Text style={tailwind`text-xl`}>Edit Match</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {}}>
                                    <Text style={tailwind`text-xl`}>Delete Match</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {}}>
                                    <Text style={tailwind`text-xl`}>Share</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => {
                                        if (match.status_code !== "finished") {
                                            navigation.navigate("Live Match");
                                        }
                                    }}
                                >
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
                    <TouchableOpacity 
                        onPress={() => setInningVisible(false)} 
                        style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                    >
                        <View style={tailwind`bg-white rounded-t-lg p-6`}>
                            <View style={tailwind`bg-white p-4 w-full gap-4`}>
                                <Text style={tailwind`text-lg font-bold text-gray-600 mb-2`}>
                                    Set Team Inning
                                </Text>
                                <View style={tailwind`flex-row items-center mb-2`}>
                                    <Text style={tailwind`ml-2 text-lg text-blue-900`}>
                                        {match.homeTeam.name}
                                    </Text>
                                    <CheckBox
                                        value={teamInning === "inning1"}
                                        onValueChange={() => {
                                            setTeamInning("inning1");
                                            updateInning(match.homeTeam);
                                            dispatch(setBatTeam(match.homeTeam.id));
                                        }}
                                    />
                                </View>
                                <View style={tailwind`flex-row items-center mb-4`}>
                                    <Text style={tailwind`ml-2 text-lg text-blue-900`}>
                                        {match.awayTeam.name}
                                    </Text>
                                    <CheckBox
                                        value={teamInning === "inning2"}
                                        onValueChange={() => {
                                            setTeamInning("inning2");
                                            updateInning(match.awayTeam);
                                            dispatch(setBatTeam(match.awayTeam.id));
                                        }}
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
                    <Pressable 
                        onPress={() => setAddBatsmanAndBowlerModalVisible(false)} 
                        style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                    >
                        <View style={tailwind`bg-white rounded-t-lg p-6`}>
                            <AddBatsmanAndBowler 
                                match={match} 
                                setAddBatsmanAndBowlerModalVisible={setAddBatsmanAndBowlerModalVisible}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
};

export default CricketMatchPage;