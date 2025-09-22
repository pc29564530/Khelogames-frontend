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
import Animated, { 
    Extrapolation, 
    interpolate, 
    interpolateColor, 
    useAnimatedScrollHandler, 
    useAnimatedStyle, 
    useSharedValue,
} from 'react-native-reanimated';
import { convertToISOString, formatToDDMMYY, formattedDate, formattedTime } from '../utils/FormattedDateTime';

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
            <Text style={tailwind`text-lg text-white`}>
                ({convertBallToOvers(score.overs)})
            </Text>
        </View>
    );
};

// Team Logo Component
const TeamLogo = ({ team }) => {
    if (team?.media_url){
        return (
            <Image
                source={{ uri: team.media_url }}
                style={tailwind`w-12 h-12 rounded-full`}
                resizeMode="cover"
            />
        )
    } else {
        return (
            <View style={tailwind`rounded-full h-12 w-12 bg-yellow-400 items-center justify-center`}>
                <Text style={tailwind`text-white text-lg font-bold`}>
                    {team?.name?.charAt(0)?.toUpperCase()}
                </Text>
            </View>
        )
    }
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
    
    
    const {matchPublicID} = route.params;
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

    const {height: sHeight, width: sWidth} = Dimensions.get('screen');

    // Shared scroll value for all child components
    const parentScrollY = useSharedValue(0);
    
    // Animation constants
    const bgColor = '#ffffff';   // white
    const bgColor2 = '#f87171';  // red-400
    const headerHeight = 200;
    const collapsedHeader = 60; // Increased for better visibility
    const offsetValue = 120; // Reduced for smoother transition

    // Header animation style
    const headerStyle = useAnimatedStyle(() => {
        const height = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [headerHeight, collapsedHeader],
            Extrapolation.CLAMP,
        );

        const backgroundColor = interpolateColor(
            parentScrollY.value,
            [0, offsetValue],
            [bgColor2, bgColor2]
        );

        const opacity = interpolate(
            parentScrollY.value,
            [0, offsetValue * 0.5, offsetValue],
            [1, 0.8, 0.6],
            Extrapolation.CLAMP,
        );

        return {
            backgroundColor, 
            height,
        };
    });

    // Content container animation
    const contentContainerStyle = useAnimatedStyle(() => {
        const marginTop = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [headerHeight, collapsedHeader],
            Extrapolation.CLAMP,
        );
        return { 
            marginTop,
            flex: 1,
        };
    });

    //Content firstTeam animation
    const firstAvatarStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0,-90],
            Extrapolation.CLAMP
        );
        const translateX = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0,40],
            Extrapolation.CLAMP
        )
        const scale = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [1, 0.8],
            Extrapolation.CLAMP,
        );
        return {
            transform:[{translateY}, {translateX}, {scale}]
        }
    })

        //Content firstTeam animation
    const secondAvatarStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0,-90],
            Extrapolation.CLAMP
        );
        const translateX = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0,-40],
            Extrapolation.CLAMP
        )
        const scale = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [1, 0.8],
            Extrapolation.CLAMP,
        );
        return {
            transform:[{translateY}, {translateX}, {scale}]
        }
    })

    // Score visibility animation
    const scoreStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [0,-100],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            parentScrollY.value,
            [0, offsetValue * 0.7],
            [1, 0],
            Extrapolation.CLAMP,
        );

        const scale = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [1, 0.8],
            Extrapolation.CLAMP,
        );

        return {
            transform: [ {translateY}, {scale}]
        };
    });

    const fadeStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            parentScrollY.value,
            [0, offsetValue * 0.7],
            [1, 0],
            Extrapolation.CLAMP,
        );

        const scale = interpolate(
            parentScrollY.value,
            [0, offsetValue],
            [1, 0.8],
            Extrapolation.CLAMP,
        );

        return {
            opacity,
            transform: [{ scale }]
        };
    });


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
            {/* Animated Header */}
            <Animated.View
                style={[
                    headerStyle,
                    { 
                        position: "absolute", 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        zIndex: 10,
                    },
                ]}
            >
                {/* Header Controls */}
                <View style={tailwind`flex-row justify-between items-center px-2 py-2`}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <AntDesign name="arrowleft" size={26} color="white" />
                    </Pressable>
                    <Pressable onPress={() => {setMenuVisible(true)}}>
                        <MaterialIcon name="more-vert" size={24} color="white" />
                    </Pressable>
                </View>

                {/* Match Status */}
                <Animated.View style={[tailwind`items-center`, fadeStyle]}>
                    <Text style={tailwind`text-white text-lg font-semibold`}>
                        {match?.status_code || 'Loading...'}
                    </Text>
                </Animated.View>

                {/* Team Information and Score */}
                <Animated.View style={[tailwind`flex-row justify-between items-center px-2 py-2 mt-2`]}>
                    {/* Home Team */}
                    <Animated.View style={[tailwind`items-center flex-1`,firstAvatarStyle]}>
                        {match?.homeTeam?.media_url ? (
                            <Image
                                source={{ uri: match.homeTeam.media_url }}
                                style={tailwind`w-12 h-12 rounded-full`}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={tailwind`rounded-full h-12 w-12 bg-yellow-400 items-center justify-center`}>
                                <Text style={tailwind`text-white text-sm font-bold`}>
                                    {match?.homeTeam?.name?.charAt(0)?.toUpperCase() || 'H'}
                                </Text>
                            </View>
                        )}
                        <Animated.Text style={[tailwind`text-white text-sm mt-2 text-center`, fadeStyle]} numberOfLines={2}>
                            {match?.homeTeam?.name || 'Home'}
                        </Animated.Text>
                    </Animated.View>

                    {match.status_code === 'not_started' ? (
                        <Animated.View style={[tailwind`items-center justify-center `,scoreStyle]}>
                            <Text style={tailwind`text-white items-center`}>{formatToDDMMYY(convertToISOString(match.start_timestamp))}</Text>
                            <Text style={tailwind`text-white items-center`}>{formattedTime(convertToISOString(match.start_timestamp))}</Text>
                        </Animated.View>
                    ): (
                        <>
                            {/* first score style */}
                            <Animated.View style={[tailwind`items-center justify-center`, scoreStyle]}>
                                {match?.homeScore?.length > 0 && match.homeScore.map((item, index) => (
                                    <TeamScore 
                                        key={index}
                                        team={match.homeTeam} 
                                        score={item} 
                                        isInning1={item.inning_number === "2" ? "2" : "1"} 
                                    />
                                ))}
                            </Animated.View>

                            {/* second score style */}
                            <Animated.View style={[tailwind`items-center justify-center`, scoreStyle]}>
                                {match?.awayScore?.length > 0 && match.awayScore.map((item, index) => (
                                    <TeamScore 
                                        key={index}
                                        team={match.awayTeam} 
                                        score={item} 
                                        isInning1={item.inning_number === "2" ? "2" : "1"} 
                                    />
                                ))}
                            </Animated.View>
                        </>
                    )}

                    {/* Away Team */}
                    <Animated.View style={[tailwind`items-center flex-1`, secondAvatarStyle]}>
                        {match?.awayTeam?.media_url ? (
                            <Image
                                source={{ uri: match.awayTeam.media_url }}
                                style={tailwind`w-12 h-12 rounded-full`}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={tailwind`rounded-full h-12 w-12 bg-yellow-400 items-center justify-center`}>
                                <Text style={tailwind`text-white text-sm font-bold`}>
                                    {match?.awayTeam?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </Text>
                            </View>
                        )}
                        <Animated.Text style={[tailwind`text-white text-sm mt-2 text-center`, fadeStyle]} numberOfLines={2}>
                            {match?.awayTeam?.name || 'Away'}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
                <Animated.View style={[tailwind``, fadeStyle]}>
                        {getInningDescription()}
                </Animated.View>
            </Animated.View>
            <Animated.View style={[tailwind`flex-1`, contentContainerStyle]}>
                <CricketMatchPageContent match={match} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>
            </Animated.View>

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