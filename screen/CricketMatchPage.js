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
import { getHomePlayer, getMatch, getAwayPlayer, setBatTeam, setInningScore, setEndInning, setCurrentInning, setInningStatus, setCurrentInningNumber, setMatchStatus, setBatsmanScore, setBowlerScore, setCricketMatchToss, addBatsman, addBowler, addCricketWicketFallen, setActionRequired } from '../redux/actions/actions';
import CricketMatchPageContent from '../navigation/CricketMatchPageContent';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import CheckBox from '@react-native-community/checkbox';
import AddBatsmanAndBowler from '../components/AddBatsAndBowler';
import { fetchTeamPlayers } from '../services/teamServices';
import { StatusModal } from '../components/modals/StatusModal';
import { useWebSocket } from '../context/WebSocketContext';
import LinearGradient from 'react-native-linear-gradient';
import { displayMatchStatus } from '../utils/MatchStatus';
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
export const getLeadTrailStatus = (match, batTeam) => {
    if (!match?.homeScore?.length || !match?.awayScore?.length) return '';
    const homeTeam = match.homeTeam;
    const awayTeam = match.awayTeam;
    const homeInnings = match.homeScore;
    const awayInnings = match.awayScore;
    const homeTotalScore = match.homeScore.map((item) => item.score).reduce((a, b) => a + b, 0);
    const awayTotalScore = match.awayScore.map((item) => item.score).reduce((a, b) => a + b, 0);
    if (homeInnings[0].team === batTeam) {
        if (homeTotalScore > awayTotalScore) {
            return `${homeTeam?.name} is leading by ${homeTotalScore - awayTotalScore} runs`;
        } else {
            return `${homeTeam?.name} is trailing by ${awayTotalScore - homeTotalScore} runs`;
        }
    } else if (awayInnings[0].team_id === batTeam) {
        if (homeTotalScore < awayTotalScore) {
            return `${awayTeam?.name} is leading by ${awayTotalScore - homeTotalScore} runs`;
        } else {
            return `${awayTeam?.name} is trailing by ${homeTotalScore - awayTotalScore} runs`;
        }
    }
    return '';
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
    const {height: sHeight, width: sWidth} = Dimensions.get('screen');
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const {wsRef, subscribe} = useWebSocket();
    
    const {matchPublicID} = route.params;
    const match = useSelector(state => state.matches.match);
    const homePlayer = useSelector(state => state.teams.homePlayer);
    const awayPlayer = useSelector(state => state.teams.awayPlayer);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam);
    const game = useSelector((state) => state.sportReducers.game);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss);
    const currentInning = useSelector(state => state.cricketMatchInning.currentInning);
    const currentInningNumber = useSelector(state => state.cricketMatchInning.currentInningNumber);
    const actionRequired = useSelector(state => state.cricketMatchScore.actionRequired);
    const inningStatus = useSelector(state => state.cricketMatchInning.inningStatus);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [menuVisible, setMenuVisible] = useState(false);
    const [statusVisible, setStatusVisible] = useState(false);
    const [inningVisible, setInningVisible] = useState(false);
    const [teamInning, setTeamInning] = useState();
    const [addOpeningBatsmanAndBowlerModalVisible, setAddOpeningBatsmanAndBowlerModalVisible] = useState(false);
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

        const sendSubscribe = () => {
            try {
                const payloadData = {
                    type: "SUBSCRIBE",
                    category: "MATCH",
                    payload: { match_public_id: match.public_id }
                };
                wsRef.current.send(JSON.stringify(payloadData));
            } catch (err) {
                console.error("Failed to subscribe to chat:", err);
            }
        };

        if (wsRef.current.readyState === WebSocket.OPEN) {
            // Already open — subscribe immediately
            sendSubscribe();
        }
        
        
        console.log("CricketMatchPage - Subscribing to match:", matchPublicID);
    }, [matchPublicID, wsRef]);

    const toggleMenu = () => setMenuVisible(!menuVisible);
    const handleSearch = (text) => setSearchQuery(text);
    // Close status modal and clear errors
    const handleCloseStatusModal = () => {
        setStatusVisible(false);
        setError({
            global: null,
            fields: {},
        });
        setSearchQuery('');
    };

    useEffect(() => {
        const statusArray = filePath.status_codes;
        const combined = statusArray.reduce((acc, curr) => ({...acc, ...curr}), ({}))
        setAllStatus(combined)
    }, [])

    const filteredStatusCodes = allStatus?.cricket?.filter((item) => 
        item.type.includes(searchQuery) || item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            : (tossWonTeamPublicId === match?.homeTeam?.public_id ? match?.awayTeam?.public_id : match?.homeTeam?.public_id);

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
                    fetchTeamPlayers( match?.homeTeam?.public_id, game),
                    fetchTeamPlayers( match?.awayTeam?.public_id, game)
                ]);
                
                dispatch(getHomePlayer(homePlayers.data));
                dispatch(getAwayPlayer(awayPlayers.data));
            } catch (err) {
                const backendError = err?.response?.data?.error?.fields;
                setError({
                    global: "Unable to get team player",
                    fields: backendError,
                });
                console.log("Failed to fetch players: ", err);
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
            const tossWonTeamPublicId = cricketToss?.tossWonTeam?.public_id;
            const isBatting = cricketToss?.tossDecision === "Batting";
            const batTeamId = isBatting
                ? tossWonTeamPublicId
                : (tossWonTeamPublicId === match?.homeTeam?.public_id ? match?.awayTeam?.public_id : match?.homeTeam?.public_id);
            dispatch(setInningStatus("not_started", 1));
            dispatch(setCurrentInningNumber(1));
            dispatch(setBatTeam(batTeamId));
        }
    }, [cricketToss, match, batTeam]);

    const handleInningComplete = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            await axiosInstance.post(`${BASE_URL}/${game.name}/endInning`, {
                match_public_id: match.public_id,
                team_public_id: batTeam,
                inning_number: currentInningNumber
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

    const handleUpdateMatchStatus = async (statusCode) => {
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
        } catch (err) {
            const errorCode = err?.response?.data?.error?.code;
            const errorMessage = err?.response?.data?.error?.message;
            const backendFields = err?.response?.data?.error?.fields;

            if (backendFields && Object.keys(backendFields).length > 0) {
                setError({ global: errorMessage || "Invalid input", fields: backendFields });
            } else if (errorCode && errorCode !== "INTERNAL_ERROR") {
                setError({ global: errorMessage, fields: {} });
            } else {
                setError({ global: "Unable to update match status", fields: {} });
            }
            console.error("unable to update match status: ", err?.response?.data?.error);
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
                if(message.payload.event_type === "normal"){
                    if(message.payload.striker_batsman) dispatches.push(setBatsmanScore(message.payload.striker_batsman));
                    if(message.payload.non_striker_batsman) dispatches.push(setBatsmanScore(message.payload.non_striker_batsman));
                    if(message.payload.bowler) dispatches.push(setBowlerScore(message.payload.bowler));
                    if(message.payload.inning_score) dispatches.push(setInningScore(message.payload.inning_score));
                    if(message.payload.inning_score.inning_status !== inningStatus){
                        dispatches.push(setInningStatus(message.payload.inning_score.inning_status, message.payload.inning_score.inning_number));
                        dispatches.push(setCurrentInningNumber(message.payload.inning_score.inning_number));
                    }
                } else if(message.payload.event_type === "wide") {
                    if(message.payload.striker_batsman) dispatches.push(setBatsmanScore(message.payload.striker_batsman));
                    if(message.payload.non_striker_batsman) dispatches.push(setBatsmanScore(message.payload.non_striker_batsman));
                    if(message.payload.bowler) dispatches.push(setBowlerScore(message.payload.bowler));
                    if(message.payload.inning_score) dispatches.push(setInningScore(message.payload.inning_score));
                    if(message.payload.inning_score.inning_status !== "in_progress"){
                        dispatches.push(setInningStatus(message.payload.inning_score.inning_status, message.payload.inning_score.inning_number));
                        dispatches.push(setCurrentInningNumber(message.payload.inning_score.inning_number));
                    }
                } else if(message.payload.event_type === "no_ball") {
                    if(message.payload.striker_batsman) dispatches.push(setBatsmanScore(message.payload.striker_batsman));
                    if(message.payload.non_striker_batsman) dispatches.push(setBatsmanScore(message.payload.non_striker_batsman));
                    if(message.payload.bowler) dispatches.push(setBowlerScore(message.payload.bowler));
                    if(message.payload.inning_score) dispatches.push(setInningScore(message.payload.inning_score));
                    if(message.payload.inning_score.inning_status !== "in_progress"){
                        dispatches.push(setInningStatus(message.payload.inning_score.inning_status, message.payload.inning_score.inning_number));
                        dispatches.push(setCurrentInningNumber(message.payload.inning_score.inning_number));
                    }
                } else if(message.payload.event_type === "wicket") {
                    if(message.payload.out_batsman) dispatches.push(setBatsmanScore(message.payload.out_batsman));
                    if(message.payload.not_out_batsman) dispatches.push(setBatsmanScore(message.payload.not_out_batsman));
                    if(message.payload.bowler) dispatches.push(setBowlerScore(message.payload.bowler));
                    if(message.payload.inning_score) dispatches.push(setInningScore(message.payload.inning_score));
                    if(message.payload.wickets) dispatches.push(addCricketWicketFallen(message.payload.wickets));
                    if(message.payload.inning_score.inning_status !== "in_progress"){
                        dispatches.push(setInningStatus(message.payload.inning_score.inning_status, message.payload.inning_score.inning_number));
                        dispatches.push(setCurrentInningNumber(message.payload.inning_score.inning_number));
                    }
                }
                const action = message.payload.action_required;

                if (action !== undefined) {
                    if (action !== actionRequired) {
                        dispatches.push(setActionRequired(action));
                    }
                }
                
                // Execute all dispatches at once
                dispatches.forEach(dispatchAction => dispatchRef.current(dispatchAction));
            } else if(message.type === "UPDATE_MATCH_STATUS") {
                dispatch(setMatchStatus(message.payload));
            } else if(message.type === "CRICKET_TOSS") {
                const tossPayload = message.payload;
                if (!tossPayload || !tossPayload.tossWonTeam) {
                    console.warn("Skipping CRICKET_TOSS without tossWonTeam:", tossPayload);
                    return;
                }
                const tossWonTeamId = tossPayload.tossWonTeam.public_id;
                const isBatting = tossPayload.tossDecision === "Batting";
                const batTeamId = isBatting
                    ? tossWonTeamId
                    : (tossWonTeamId === match?.homeTeam?.public_id ? match?.awayTeam?.public_id : match?.homeTeam?.public_id);

                dispatchRef.current(setCricketMatchToss({
                    tossWonTeam: tossPayload.tossWonTeam,
                    tossDecision: tossPayload.tossDecision,
                }));
                dispatchRef.current(setBatTeam(batTeamId));
                if (tossPayload.inning) {
                    dispatchRef.current(setInningScore(tossPayload.inning));
                    dispatchRef.current(setInningStatus(tossPayload.inning.inning_status, tossPayload.inning.inning_number));
                    dispatchRef.current(setCurrentInningNumber(tossPayload.inning.inning_number));
                }
            } else if(message.type === "ADD_BATSMAN") {
                dispatch(addBatsman(message.payload))
            } else if(message.type === "ADD_BOWLER") {
                dispatch(addBowler(message.payload))
            } else if(message.type === "UPDATE_BOWLER") {
                dispatch(addBowler(message.payload.current_bowler));
                dispatch(addBowler(message.payload.next_bowler))
            }
            
            if(message.type === "INNING_STATUS"){
                const payload = message.payload;
                    dispatchRef.current(setInningStatus(payload.inning_score.inning_status, payload.inning_score.inning_number));

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
                        dispatchRef.current(setInningStatus(payload.inning_score.inning_status, payload.inning_score.inning_number))
                        dispatchRef.current(setCurrentInningNumber(payload.inning_score.inning_number))
                    }
                // }
            }
        } catch (err) {
            console.error('error parsing json: ', err);
        }
    }, [inningStatus, match, actionRequired]);

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
                            {getLeadTrailStatus(match, batTeam)}
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
                <ActivityIndicator size="large" color="#f87171" />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (error.global) {
        return (
            <View style={tailwind`flex-1 justify-center items-center`}>
                <Text style={{color:'#f87171'}}>{error.global}</Text>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={[tailwind`mt-4 px-4 py-2 rounded-lg`, {backgroundColor:'#f87171'}]}
                >
                    <Text style={tailwind`text-white`}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={[tailwind`flex-1`, {backgroundColor: '#0f172a'}]}>
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
                        backgroundColor: '#0f172a'
                    },
                ]}
            >
                <LinearGradient
                    colors={['#0f172a', '#1e293b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
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
                    <Text style={{color:'#f1f5f9',fontSize:18,fontWeight:'600'}}>
                        {displayMatchStatus(match?.status_code)}
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
                            <View style={[tailwind`rounded-full h-12 w-12 items-center justify-center`, {backgroundColor:'#334155'}]}>
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
                                <View style={{height:40,width:1,backgroundColor:'#334155'}} />
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
                            <View style={[tailwind`rounded-full h-12 w-12 items-center justify-center`, {backgroundColor:'#334155'}]}>
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
                        <View style={[tailwind`rounded-t-lg max-h-[70%]`, {backgroundColor:'#1e293b',borderTopWidth:1,borderColor:'#334155'}]}>
                            <View style={tailwind`p-4 border-b border-gray-200`}>
                                <Text style={{color:'#f1f5f9',fontSize:16}}>
                                    Update Match Status
                                </Text>
                            </View>
                            <TextInput
                                style={[tailwind`bg-gray-100 p-3 m-4 rounded-md`, {color:'#f1f5f9'}]}
                                placeholder="Search status..."
                                value={searchQuery}
                                onChangeText={handleSearch}
                                placeholderTextColor="#94a3b8"
                            />
                            <ScrollView style={{minHeight: 20}}>
                                {filteredStatusCodes.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => {setStatusCode(item.type); handleUpdateMatchStatus(item)}}
                                        style={tailwind`py-4 px-3 border-b border-gray-200 flex-row items-center`}
                                    >
                                        <MaterialIcon name="sports-football" size={22} color="#4b5563" />
                                        <Text style={[tailwind`text-lg ml-3`, {color:'#f1f5f9'}]}>{item.label}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
            )}

            {/* Menu Modal */}
            {menuVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={menuVisible}
                    onRequestClose={toggleMenu}
                >
                    <TouchableOpacity onPress={toggleMenu} style={tailwind`flex-1 bg-black/30`}>
                        <View style={tailwind`flex-row justify-end`}>
                            <View style={[tailwind`mt-16 mr-4 rounded-xl overflow-hidden w-56`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                        setStatusVisible(true);
                                    }}
                                    style={[tailwind`px-4 py-4 flex-row items-center`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}
                                >
                                    <View style={[tailwind`w-9 h-9 rounded-lg items-center justify-center mr-3`, { backgroundColor: '#3b82f620' }]}>
                                        <MaterialIcon name="edit" size={18} color="#60a5fa" />
                                    </View>
                                    <Text style={[tailwind`text-base font-medium`, { color: '#f1f5f9' }]}>Edit Main Status</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                    }}
                                    style={[tailwind`px-4 py-4 flex-row items-center`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}
                                >
                                    <View style={[tailwind`w-9 h-9 rounded-lg items-center justify-center mr-3`, { backgroundColor: '#9333ea20' }]}>
                                        <MaterialIcon name="share" size={18} color="#c084fc" />
                                    </View>
                                    <Text style={[tailwind`text-base font-medium`, { color: '#f1f5f9' }]}>Share</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                        // Handle delete
                                    }}
                                    style={tailwind`px-4 py-4 flex-row items-center`}
                                >
                                    <View style={[tailwind`w-9 h-9 rounded-lg items-center justify-center mr-3`, { backgroundColor: '#ef444420' }]}>
                                        <MaterialIcon name="delete" size={18} color="#f87171" />
                                    </View>
                                    <Text style={[tailwind`text-base font-medium`, { color: '#f87171' }]}>Delete Match</Text>
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

            {addOpeningBatsmanAndBowlerModalVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={addOpeningBatsmanAndBowlerModalVisible}
                    onRequestClose={() => setAddOpeningBatsmanAndBowlerModalVisible(false)}
                >
                    <TouchableOpacity 
                        onPress={() => setAddOpeningBatsmanAndBowlerModalVisible(false)} 
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