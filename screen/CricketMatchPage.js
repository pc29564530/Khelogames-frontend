import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Image, Modal, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getHomePlayer, getMatch, getAwayPlayer, setBatTeam, setInningScore, setEndInning, setCurrentInning, setInningStatus, setCurrentInningNumber } from '../redux/actions/actions';
import CricketMatchPageContent from '../navigation/CricketMatchPageContent';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import CheckBox from '@react-native-community/checkbox';
import AddBatsmanAndBowler from '../components/AddBatsAndBowler';
import { fetchTeamPlayers } from '../services/teamServices';

// get lead and trail status
const getLeadTrailStatus = ({match}) => {
    const homeInnings = match.homeScore;
    const awayInnings = match.awayScore;
    const homeTotalScore = match.homeScore.map((item) => item.score).reduce((a,b) => a+b);
    const awayTotalScore = match.awayScore.map((item) => item.score).reduce((a,b) => a+b);
    if(homeInnings[0].team === batTeam) {
        if(homeTotalScore > awayTotalScore) {
            return `${homeTeam.name} is leading by ${homeTotalScore - awayTotalScore} runs`;
        } else {
            return  `${homeTeam.name} is trailing by ${awayTotalScore - homeTotalScore} runs`;
        }
    } else if(awayInnings[0].team_id === batTeam) {
        if(homeTotalScore < awayTotalScore) {
            return `${awayTeam.name} is leading by ${awayTotalScore - homeTotalScore} runs`;
        } else {
            return  `${awayTeam.name} is trailing by ${homeTotalScore - awayTotalScore} runs`;
        }
    }
}

// Team Score Component
const TeamScore = ({ team, score, isInning1 }) => {
    if (!score || !isInning1) return <Text style={tailwind`text-lg text-white`}>-</Text>;
    
    return (
        <View style={tailwind`flex-row items-center`}>
            <Text style={tailwind`text-lg text-white`}>
                {score.score}/{score.wickets}
            </Text>
            <Text style={tailwind`text-lg text-white ml-2`}>
                ({convertBallToOvers(score.overs)})
            </Text>
        </View>
    );
};

// Team Logo Component
const TeamLogo = ({ team }) => {
    return (
        <Image 
            source={{ uri: team?.media_url }} 
            style={tailwind`w-12 h-12 bg-gray-200 rounded-full`} 
        />
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
                            ? `${match.awayTeam.name} beat ${match.homeTeam.name} by ${match?.awayScore[0]?.score - match?.homeScore[0]?.score} runs`
                            : `${match?.homeTeam?.name} beat ${match?.awayTeam?.name} by ${10 - match?.homeScore[0]?.wickets} wickets`}
                    </Text>
                </View>
            );
        }
        if(match.match_format === "TEST") {
            if ((match.status_code === "in_progress" || match.status_code === "break") && match.awayScore.length >= 1 && match.homeScore.length >= 1) {
                return (
                    <View style={tailwind`items-center -top-4`}>
                        <Text style={tailwind`text-white text-sm`}>
                            {getLeadTrailStatus(match)}
                        </Text>
                    </View>
                );
            }
        } else {
            if ((match.status_code === "in_progress" || match.status_code === "break") && match?.awayScore?.length > 0 && match?.homeScore?.length > 0) {
                return (
                    <View style={tailwind`items-center -top-4`}>
                        <Text style={tailwind`text-white text-sm`}>
                            {isAwayBatting
                                ? `${match.homeTeam.name} require ${match.awayScore[0]?.score + 1 - match?.homeScore[0]?.score} runs in ${convertBallToOvers(50.0 - match?.homeScore[0]?.overs)}`
                                : `${match.awayTeam.name} require ${match.homeScore[0]?.score + 1 - match?.awayScore[0]?.score} runs in ${convertBallToOvers(50.0 - match?.awayScore[0]?.overs)}`}
                        </Text>
                    </View>
                );
            }
        }

        return null;
    };

    return (
        <View style={tailwind`bg-red-400 p-4`}>
            <View style={tailwind`flex-row justify-between items-center mb-4`}>
                <Pressable onPress={onBackPress}>
                    <MaterialIcon name="arrow-back" size={24} color="white" />
                </Pressable>
                <Pressable onPress={onMenuPress}>
                    <MaterialIcon name="more-vert" size={24} color="white" />
                </Pressable>
            </View>

            <View style={tailwind`flex-row justify-between items-center`}>
                <View style={tailwind`items-center`}>
                    <TeamLogo team={match?.homeTeam} />
                    <Text style={tailwind`text-white`}>{match?.homeTeam?.name}</Text>
                </View>

                <View style={tailwind`flex-row gap-2 justify-evenly items-center`}>
                    <View>
                        {match?.homeScore?.length > 0 && match.homeScore.map((item, index) => (
                            <TeamScore 
                                key={index}
                                team={match.homeTeam} 
                                score={item} 
                                isInning1={item.innin_number === "1" ? "1" : "2"} 
                            />
                        ))}
                    </View>
                    <View style={tailwind`h-10 w-0.4 bg-white`} />
                    <View>
                        {match?.awayScore?.length > 0 && match.awayScore.map((item, index) => (
                            <TeamScore 
                                key={index}
                                team={match.awayTeam} 
                                score={item} 
                                isInning1={item.inning_number === "2" ? "2" : "1"} 
                            />
                        ))}
                    </View>
                </View>

                <View style={tailwind`items-center`}>
                    <TeamLogo team={match?.awayTeam} />
                    <Text style={tailwind`text-white`}>{match?.awayTeam?.name}</Text>
                </View>
            </View>

            {getInningDescription()}
        </View>
    );
};

// Status Modal Component
const StatusModal = ({ visible, onClose, onStatusSelect }) => {
    const statuses = [
        { code: "not_started", label: "Not Started" },
        { code: "in_progress", label: "In Progress" },
        { code: "break", label: "Break" },
        { code: "finished", label: "Finished" }
    ];

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                onPress={onClose} 
                style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
            >
                <View style={tailwind`bg-white rounded-t-lg p-6`}>
                    <Text style={tailwind`text-xl font-bold text-gray-800 mb-4`}>
                        Update Match Status
                    </Text>
                    {statuses.map((status) => (
                        <Pressable
                            key={status.code}
                            onPress={() => onStatusSelect(status.code)}
                            style={tailwind`py-3 border-b border-gray-200`}
                        >
                            <Text style={tailwind`text-lg text-gray-700`}>
                                {status.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

// Main Component
const CricketMatchPage = ({ route }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    
    
    const matchPublicID = route.params;
    const match = useSelector((state) => state.cricketMatchScore.match);
    const homePlayer = useSelector(state => state.teams.homePlayer);
    const awayPlayer = useSelector(state => state.teams.awayPlayer);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam);
    const game = useSelector((state) => state.sportReducers.game);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss);
    const currentInning = useSelector(state => state.cricketMatchInning.currentInning);
    const currentInningNumber = useSelector(state => state.cricketMatchInning.currentInningNumber);
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
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getMatchByMatchID/${matchPublicID}`, {
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
    }, [matchPublicID, game.name, dispatch]);

    useEffect(() => {
        if (!match || !cricketToss) return;

        const tossWonTeamPublicId = cricketToss.tossWonTeam?.public_id;
        const isBatting = cricketToss.tossDecision === "Batting";
        const batTeamId = isBatting
            ? (tossWonTeamPublicId === match.homeTeam.public_id ? match.homeTeam.public_id : match.awayTeam.public_id)
            : (tossWonTeamPublicId !== match.homeTeam.public_id ? match.awayTeam.public_id : match.awayTeam.public_id);

        dispatch(setBatTeam(batTeamId));
    }, [match, cricketToss]);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const [homePlayers, awayPlayers] = await Promise.all([
                    fetchTeamPlayers(BASE_URL, match.homeTeam.public_id, game, axiosInstance),
                    fetchTeamPlayers(BASE_URL, match.awayTeam.public_id, game, axiosInstance)
                ]);
                
                dispatch(getHomePlayer(homePlayers));
                dispatch(getAwayPlayer(awayPlayers));
            } catch (err) {
                console.error("Failed to fetch players: ", err);
                setError("Failed to load team players. Please try again.");
            }
        };

        if (match?.homeTeam?.public_id && match?.awayTeam?.public_id) {
            fetchPlayers();
        }
    }, [match?.homeTeam?.public_id, match?.awayTeam?.public_id]);

    useEffect(() => {
        if (cricketToss && match) {
            const isHomeBatting = cricketToss.tossWonTeam.public_id === match.homeTeam.public_id && cricketToss.tossDecision === "Batting";
            dispatch(setCurrentInning("inning1"));
            dispatch(setInningStatus("in_progress"));
            dispatch(setCurrentInningNumber(1));
            dispatch(setBatTeam(isHomeBatting ? match.homeTeam.public_id : match.awayTeam.public_id));
        }
    }, [cricketToss, match]);

    const handleInningComplete = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            await axiosInstance.post(`${BASE_URL}/${game.name}/endInning`, {
                match_public_id: match.public_id,
                team_public_id: batTeam,
                inning: currentInningNumber
            }, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            
            dispatch(setInningStatus("completed"));
            
            if (match.match_type === "TEST" && currentInningNumber === 1) {
                dispatch(setCurrentInningNumber(2));
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
                { id: match.id, status_code: statusCode },
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

    if (loading) {
        return (
            <View style={tailwind`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={tailwind`flex-1 justify-center items-center`}>
                <Text style={tailwind`text-red-500`}>{error}</Text>
                <Pressable 
                    onPress={() => navigation.goBack()}
                    style={tailwind`mt-4 bg-red-400 px-4 py-2 rounded-lg`}
                >
                    <Text style={tailwind`text-white`}>Go Back</Text>
                </Pressable>
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
                    <TouchableOpacity onPress={() => setMenuVisible(false)} style={tailwind`flex-1`}>
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
                    <TouchableOpacity 
                        onPress={() => setInningVisible(false)} 
                        style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                    >
                        <View style={tailwind`bg-white rounded-t-lg p-6`}>
                            <Text style={tailwind`text-xl font-bold text-gray-800 mb-4`}>
                                Set Team Inning
                            </Text>
                            <View style={tailwind`gap-4`}>
                                <View style={tailwind`flex-row items-center justify-between`}>
                                    <Text style={tailwind`text-lg text-gray-700`}>
                                        {match.homeTeam.name}
                                    </Text>
                                    <CheckBox
                                        value={teamInning === 1}
                                        onValueChange={() => {
                                            setTeamInning("1");
                                            dispatch(setBatTeam(match.homeTeam.public_id));
                                            setInningVisible(false);
                                        }}
                                    />
                                </View>
                                <View style={tailwind`flex-row items-center justify-between`}>
                                    <Text style={tailwind`text-lg text-gray-700`}>
                                        {match.awayTeam.name}
                                    </Text>
                                    <CheckBox
                                        value={teamInning === 2}
                                        onValueChange={() => {
                                            setTeamInning(2);
                                            dispatch(setBatTeam(match.awayTeam.public_id));
                                            setInningVisible(false);
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
                    <TouchableOpacity 
                        onPress={() => setAddBatsmanAndBowlerModalVisible(false)} 
                        style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                    >
                        <View style={tailwind`bg-white rounded-t-lg p-6`}>
                            <AddBatsmanAndBowler match={match} />
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
};

export default CricketMatchPage;