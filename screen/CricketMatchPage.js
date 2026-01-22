import { useState, useEffect, useCallback, useRef, memo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Image, Modal, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getHomePlayer, getMatch, getAwayPlayer, setBatTeam, setInningScore, setEndInning, setCurrentInning, setInningStatus, setCurrentInningNumber, setMatchStatus, setBatsmanScore, setBowlerScore } from '../redux/actions/actions';
import CricketMatchPageContent from '../navigation/CricketMatchPageContent';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import CheckBox from '@react-native-community/checkbox';
import AddBatsmanAndBowler from '../components/AddBatsAndBowler';
import { fetchTeamPlayers } from '../services/teamServices';
import { StatusModal } from '../components/modals/StatusModal';
import { useWebSocket } from '../context/WebSocketContext';
const filePath = require('../assets/status_code.json');
import Animated, { 
    Extrapolation, 
    interpolate, 
    interpolateColor, 
    useAnimatedScrollHandler, 
    useAnimatedStyle, 
    useSharedValue,
} from 'react-native-reanimated';
import { convertToISOString, formatToDDMMYY, formattedDate, formattedTime } from '../utils/FormattedDateTime';
import { handleInlineError } from '../utils/errorHandler';

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
    if (!score || !isInning1) return <Text style={tailwind`text-md text-white`}>-</Text>;
    return (
        <View style={tailwind`items-center justify-center`}>
            <Text style={tailwind`text-md text-white font-bold`}>
                {score.score}/{score.wickets}
            </Text>
            <Text style={tailwind`text-md text-white font-bold`}>
                {convertBallToOvers(score.overs)}
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

// Main Component
const CricketMatchPage = ({ route }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const {wsRef, subscribe} = useWebSocket();
    
    const {matchPublicID} = route.params;
    const match = useSelector(state => state.cricketMatchScore.match);
    const homePlayer = useSelector(state => state.teams.homePlayer);
    const awayPlayer = useSelector(state => state.teams.awayPlayer);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam);
    const game = useSelector((state) => state.sportReducers.game);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss);
    const currentInning = useSelector(state => state.cricketMatchInning.currentInning);
    const currentInningNumber = useSelector(state => state.cricketMatchInning.currentInningNumber);
    const inningStatus = useSelector(state => state.cricketMatchScore.inningStatus);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [menuVisible, setMenuVisible] = useState(false);
    const [statusVisible, setStatusVisible] = useState(false);
    const [inningVisible, setInningVisible] = useState(false);
    const [teamInning, setTeamInning] = useState();
    const [addBatsmanAndBowlerModalVisible, setAddBatsmanAndBowlerModalVisible] = useState(false);
    const [statusCode, setStatusCode] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [allStatus, setAllStatus] = useState([]);
    const isMountedRef = useRef(true);
    const lastPayloadRef = useRef(null);
    const dispatchRef = useRef(dispatch);
    
    // Update dispatch ref when dispatch changes
    useEffect(() => {
        dispatchRef.current = dispatch;
    }, [dispatch]);

    // SUBSCRIBE ONCE - Send initial subscription
    useEffect(() => {
        if (!wsRef?.current || !match?.public_id) return;
        
        const payloadData = {
            type: "SUBSCRIBE",
            category: "MATCH",
            payload: { match_public_id: match.public_id }
        };
        
        console.log("CricketMatchPage - Subscribing to match:", match.public_id);
        wsRef.current.send(JSON.stringify(payloadData));
    }, [match?.public_id, wsRef]);

    useEffect(() => {
        const statusArray = filePath.status_codes;
        const combined = statusArray.reduce((acc, curr) => ({...acc, ...curr}), ({}))
        setAllStatus(combined)
    }, [])

    const handleSearch = (text) => setSearchQuery(text);

    const filteredStatusCodes = allStatus?.cricket?.filter((item) => 
        item.type.includes(searchQuery) || item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                const item = response.data;
                dispatch(getMatch(item.data || null));
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields;
                setError({
                    global: "Unable to get match",
                    fields: backendError,
                })
                console.error("Failed to fetch match data: ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatch();
    }, [matchPublicID]);

    useEffect(() => {
        if (!match || !cricketToss || batTeam) return;

        const tossWonTeamPublicId = cricketToss?.tossWonTeam?.public_id;
        const isBatting = cricketToss?.tossDecision === "Batting";
        const batTeamId = isBatting
            ? (tossWonTeamPublicId === match?.homeTeam?.public_id ? match?.homeTeam?.public_id : match?.awayTeam?.public_id)
            : (tossWonTeamPublicId !== match?.homeTeam?.public_id ? match?.awayTeam?.public_id : match?.awayTeam?.public_id);

        dispatch(setBatTeam(batTeamId));
    }, [match, cricketToss, batTeam]);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                setLoading(true);
                setError({
                    global: null,
                    fields: {},
                })
                const [homePlayers, awayPlayers] = await Promise.all([
                    fetchTeamPlayers(BASE_URL, match?.homeTeam?.public_id, game, axiosInstance),
                    fetchTeamPlayers(BASE_URL, match?.awayTeam?.public_id, game, axiosInstance)
                ]);
                
                dispatch(getHomePlayer(homePlayers));
                dispatch(getAwayPlayer(awayPlayers));
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields;
                setError({
                    global: "Unable to get team player",
                    fields: backendError,
                });
                console.error("Failed to fetch players: ", err);
            } finally {
                setLoading(false);
            }
        };

        if (match?.homeTeam?.public_id && match?.awayTeam?.public_id) {
            fetchPlayers();
        }
    }, [match?.homeTeam?.public_id, match?.awayTeam?.public_id]);


    useEffect(() => {
        // Only set initial state when match is first loaded AND status is truly not started
        if (cricketToss && match && match?.status_code === 'not_started' && !batTeam) {
            const isHomeBatting = cricketToss?.tossWonTeam?.public_id === match?.homeTeam?.public_id && cricketToss?.tossDecision === "Batting";
            dispatch(setInningStatus("not_started", 1));
            dispatch(setCurrentInningNumber(1));
            dispatch(setBatTeam(isHomeBatting ? match?.homeTeam?.public_id : match?.awayTeam?.public_id));
        }
    }, [cricketToss, match, batTeam]);

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
            
            dispatch(setInningStatus("completed", 1));
            
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
            setLoading(true);
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.put(
                `${BASE_URL}/${game.name}/updateMatchStatus/${match.public_id}`,
                { status_code: statusCode.type },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            // dispatch(setMatchStatus(response.data || []));
        } catch (err) {
            const backendError = err?.response?.data?.error.fields;
            setError({
                global: "Unable to update match status",
                fields: backendError,
            })
            console.error("Unable to update the match: ", err);
        } finally {
            setLoading(false);
        }
    };

    const handleWebSocketMessage = useCallback((event) => {
        const rawData = event?.data;
        try {
            if (rawData === null || !rawData) {
                setError({
                    global: "Getting message...",
                    fields: {},
                })
                console.error("raw data is undefined");
                return;
            }
            
            const message = JSON.parse(rawData);
            
            // Prevent duplicate processing - check by message type and key data
            const messageKey = `${message.type}_${JSON.stringify(message.payload)}`;
            if (lastPayloadRef.current === messageKey) {
                console.log("Duplicate message ignored:", messageKey);
                return;
            }
            lastPayloadRef.current = messageKey;
            console.log("Message Type: ", message.type)
            console.log("Score Line no Empos...: ", message.payload)

            if(message.type === "UPDATE_SCORE") {
                if (!message.payload.inning_score) {
                        console.warn("Skipping UPDATE_SCORE without inning_score:", message.payload);
                        return;
                }
                
                // Batch all dispatches to prevent multiple re-renders
                const dispatches = [];
                console.log("Message: ", message.payload.event_type)
                if(message.payload.event_type === "normal"){
                    if(message.payload.striker_batsman) dispatches.push(setBatsmanScore(message.payload.striker_batsman));
                    if(message.payload.non_striker_batsman) dispatches.push(setBatsmanScore(message.payload.non_striker_batsman));
                    if(message.payload.bowler) dispatches.push(setBowlerScore(message.payload.bowler));
                    if(message.payload.inning_score) dispatches.push(setInningScore(message.payload.inning_score));
                    if(message.payload.inning_score.inning_status !== inningStatus){
                        console.log("Inning Number normal: ", message.payload.inning_score.inning_number)
                        dispatches.push(setInningStatus(message.payload.inning_score.inning_status, message.payload.inning_score.inning_number));
                        dispatches.push(setCurrentInningNumber(message.payload.inning_score.inning_number));
                    }
                } else if(message.payload.event_type === "wide") {
                    if(message.payload.striker_batsman) dispatches.push(setBatsmanScore(message.payload.striker_batsman));
                    if(message.payload.non_striker_batsman) dispatches.push(setBatsmanScore(message.payload.non_striker_batsman));
                    if(message.payload.bowler) dispatches.push(setBowlerScore(message.payload.bowler));
                    if(message.payload.inning_score) dispatches.push(setInningScore(message.payload.inning_score));
                    if(message.payload.inning_score.inning_status !== "in_progress"){
                        dispatches.push(setInningStatus(message.payload.inning_score.inning_status, message.payload.inning_score.innning_number));
                        dispatchRef.push(setCurrentInningNumber(message.payload.inning_score.inning_number));
                    }
                } else if(message.payload.event_type === "no_ball") {
                    if(message.payload.striker_batsman) dispatches.push(setBatsmanScore(message.payload.striker_batsman));
                    if(message.payload.non_striker_batsman) dispatches.push(setBatsmanScore(message.payload.non_striker_batsman));
                    if(message.payload.bowler) dispatches.push(setBowlerScore(message.payload.bowler));
                    if(message.payload.inning_score) dispatches.push(setInningScore(message.payload.inning_score));
                    if(message.payload.inning_score.inning_status !== "in_progress"){
                        dispatches.push(setInningStatus(message.payload.inning_score.inning_status, message.payload.inning_score.innning_number));
                        dispatchRef.push(setCurrentInningNumber(message.payload.inning_score.inning_number));
                    }
                } else if(message.payload.event_type === "wicket") {
                    if(message.payload.out_batsman) dispatches.push(setBatsmanScore(message.payload.out_batsman));
                    if(message.payload.not_out_batsman) dispatches.push(setBatsmanScore(message.payload.not_out_batsman));
                    if(message.payload.bowler) dispatches.push(setBowlerScore(message.payload.bowler));
                    if(message.payload.inning_score) dispatches.push(setInningScore(message.payload.inning_score));
                    if(message.payload.wickets) dispatches.push(addCricketWicketFallen(message.payload.wickets));
                    if(message.payload.inning_score.inning_status !== "in_progress"){
                        dispatches.push(setInningStatus(message.payload.inning_score.inning_status, message.payload.inning_score.innning_number));
                        dispatchRef.push(setCurrentInningNumber(message.payload.inning_score.inning_number));
                    }
                }
                
                // Execute all dispatches at once
                dispatches.forEach(dispatchAction => dispatchRef.current(dispatchAction));
            } else if(message.type === "UPDATE_MATCH_STATUS") {
                console.log("Update match status: ", message)
                dispatch(setMatchStatus(message.payload));
            }

            // console.log("message : ", message.type)
            // console.log("message payload status: ", message.payload.inning_status)
            
            if(message.type === "INNING_STATUS"){
                const payload = message.payload;
                    dispatchRef.current(setInningStatus(payload.inning_score.inning_status, message.payload.inning_score.innning_number));
                    
                    // Also update batsman and bowler data from INNING_STATUS message
                    if(payload.striker) {
                        dispatchRef.current(setBatsmanScore(payload.striker));
                    }
                    if(payload.non_striker) {
                        dispatchRef.current(setBatsmanScore(payload.non_striker));
                    }
                    if(payload.bowler) {
                        dispatchRef.current(setBowlerScore(payload.bowler));
                    }
                    if(payload.inning_score) {
                        dispatchRef.current(setInningScore(payload.inning_score));
                        dispatchRef.current(setInningStatus(payload.inning_score.inning_status, message.payload.inning_score.innning_number))
                        dispatchRef.current(setCurrentInningNumber(payload.inning_score.inning_number))
                    }
                // }
            }
        } catch (e) {
            console.error('error parsing json: ', e);
        }
    }, []);

    useEffect(() => {
        console.log(" Cricket - Subscribing to WebSocket messages");
        const unsubscribe = subscribe(handleWebSocketMessage);
        return unsubscribe;
    }, [handleWebSocketMessage, subscribe]);    

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
        } else if(match.match_format === "ODI") {
            if ((match.status_code === "in_progress" || match.status_code === "break") && match?.awayScore?.length > 0 && match?.homeScore?.length > 0) {
                return (
                    <View style={tailwind`items-center -top-4`}>
                        <Text style={tailwind`text-white text-sm`}>
                            {isAwayBatting
                                ? `${match.homeTeam.name} require ${match.awayScore[0]?.score + 1 - match?.homeScore[0]?.score} runs in ${convertBallToOvers(300 - match?.homeScore[0]?.overs)}`
                                : `${match.awayTeam.name} require ${match.homeScore[0]?.score + 1 - match?.awayScore[0]?.score} runs in ${convertBallToOvers(300 - match?.awayScore[0]?.overs)}`}
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
                                ? `${match.homeTeam.name} require ${match.awayScore[0]?.score + 1 - match?.homeScore[0]?.score} runs in ${convertBallToOvers(120 - match?.homeScore[0]?.overs)}`
                                : `${match.awayTeam.name} require ${match.homeScore[0]?.score + 1 - match?.awayScore[0]?.score} runs in ${convertBallToOvers(120 - match?.awayScore[0]?.overs)}`}
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

    if (error.global) {
        return (
            <View style={tailwind`flex-1 justify-center items-center`}>
                <Text style={tailwind`text-red-500`}>{error.global}</Text>
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
                <View style={tailwind`flex-row justify-between items-center px-4 py-3`}>
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
                        {match?.status_code}
                    </Text>
                </Animated.View>

                {/* Team Information and Score */}
                <Animated.View style={[tailwind`flex-row justify-between items-center px-2 py-2 mt-2 mb-2`]}>
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
                    {match?.status_code === 'not_started' ? (
                        <Animated.View style={[tailwind`items-center justify-center`,scoreStyle]}>
                            <Text style={tailwind`text-white items-center`}>{formatToDDMMYY(convertToISOString(match.start_timestamp))}</Text>
                            <Text style={tailwind`text-white items-center`}>{formattedTime(convertToISOString(match.start_timestamp))}</Text>
                        </Animated.View>
                    ): (
                        <>
                            {/* first score style */}
                            <Animated.View style={[tailwind`items-center justify-center px-2 py-2`, scoreStyle]}>
                                {match?.homeScore?.length > 0 && match.homeScore.map((item, index) => (
                                    <TeamScore 
                                        key={index}
                                        team={match.homeTeam} 
                                        score={item} 
                                        isInning1={currentInningNumber} 
                                    />
                                ))}
                            </Animated.View>
                            <Animated.View style={[tailwind`items-center justify-center px-2 py-2`, scoreStyle]}>
                                <View  style={tailwind`h-10 w-0.5 bg-white`}/>
                            </Animated.View>
                            {/* second score style */}
                            <Animated.View style={[tailwind`items-center justify-center px-2 py-2`, scoreStyle]}>
                                {match?.awayScore?.length > 0 && match.awayScore.map((item, index) => (
                                    <TeamScore 
                                        key={index}
                                        team={match.awayTeam} 
                                        score={item} 
                                        isInning1={currentInningNumber} 
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

            {/* Status Modal */}
            {statusVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={statusVisible}
                    onRequestClose={() => setStatusVisible(false)}
                >
                    <Pressable 
                        onPress={() => setStatusVisible(false)} 
                        style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                    >
                        <View style={tailwind`bg-white rounded-t-lg max-h-[70%]`}>
                            <View style={tailwind`p-4 border-b border-gray-200`}>
                                <Text style={tailwind`text-lg font-semibold text-center`}>Update Match Status</Text>
                            </View>
                            <TextInput
                                style={tailwind`bg-gray-100 p-3 m-4 rounded-md text-black`}
                                placeholder="Search status..."
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                            <ScrollView style={{minHeight: 20}}>
                                {filteredStatusCodes.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => {setStatusCode(item.type); handleUpdateResult(item)}}
                                        style={tailwind`py-4 px-3 border-b border-gray-200 flex-row items-center`}
                                    >
                                        <MaterialIcon name="sports-football" size={22} color="#4b5563" />
                                        <Text style={tailwind`text-lg text-gray-700 ml-3`}>{item.label}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
            )}

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
                                <TouchableOpacity onPress={() => {}}>
                                    <Text style={tailwind`text-xl`}>Delete Match</Text>
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