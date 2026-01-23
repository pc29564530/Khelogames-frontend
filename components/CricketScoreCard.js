import {useEffect, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import tailwind from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { fetchTeamPlayers } from "../services/teamServices";
import CricketBattingScorecard from "./CricketBattingScorecard";
import CricketBowlingScorecard from "./CricketBowlingScorecard";
import CricketWicketCard from "./CricketWicketCard";
import { useDispatch, useSelector } from "react-redux";
import { getCricketBattingScore, getCricketBowlingScore, getCricketMatchInningScore, getCricketWicketFallen, setBatTeam, getAwayPlayer, getHomePlayer } from "../redux/actions/actions";
import Animated, {useSharedValue, useAnimatedScrollHandler, Extrapolation, interpolate, useAnimatedStyle} from "react-native-reanimated";

const convertBallToOvers = (item) => {
    const overs = Math.floor(item / 6);
    const remainingBall = item % 6;
    return `${overs}.${remainingBall}`;
};

const CricketScoreCard = ({match, parentScrollY, headerHeight, collapsedHeader}) => {
    
    const dispatch = useDispatch();
    const game = useSelector(state => state.sportReducers.game);
    const batting = useSelector((state) => state.cricketPlayerScore.battingScore);
    const bowling = useSelector((state) => state.cricketPlayerScore.bowlingScore);
    const wickets = useSelector((state) => state.cricketPlayerScore.wicketFallen);
    const homePlayer = useSelector((state) => state.teams.homePlayer);
    const awayPlayer = useSelector((state) => state.teams.awayPlayer);
    const [isModalBatsmanStrikerChange, setIsModalBatsmanStrikeChange] = useState(false);
    const [isBatsmanStrikeChange,setIsBatsmanStrikeChange] = useState(false);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam);
    const [isYetToBatModalVisible, setIsYetToBatModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss)
    const [currentScoreCard, setCurrentScoreCard] = useState();
    const [selectedInning, setSelectedInning] = useState(1);
    const [error, setError] = useState({global: null, fields: {}});
    const homeTeamID = match?.homeTeam?.id;
    const awayTeamID = match?.awayTeam?.id;
    const homeTeamPublicID = match?.homeTeam?.public_id;
    const awayTeamPublicID = match?.awayTeam?.public_id;

    const {height: sHeight, width: sWidth} = Dimensions.get("window");

    const currentScrollY = useSharedValue(0);
    // scroll handler for header animation
    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeader){
                parentScrollY.value = currentScrollY.value
            } else {
                parentScrollY.value = event.contentOffset.y
            }
        }
    })

    // Content animation style
    const contentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            parentScrollY.value,
            [0, 50],
            [1, 1],
            Extrapolation.CLAMP
        );

        return {
            opacity
        };
    });

    useEffect(() => {
        if (cricketToss) {
            if (cricketToss.tossDecision === "Batting") {
                setCurrentScoreCard(cricketToss.tossWonTeam.public_id === homeTeamPublicID ? homeTeamPublicID : awayTeamPublicID);
                setSelectedInning(cricketToss.tossWonTeam.public_id === homeTeamPublicID ? 1 : 2);
            } else {
                setCurrentScoreCard(cricketToss.tossWonTeam.public_id === awayTeamPublicID ? awayTeamPublicID : homeTeamPublicID);
                setSelectedInning(cricketToss.tossWonTeam.public_id === awayTeamPublicID ? 1 : 2);
            }
        }
    }, [cricketToss, homeTeamPublicID, awayTeamPublicID]);

    useEffect(() => {
        if(match) {
            setIsLoading(false);
        }
    }, [match]);
    
    const [yetToBat, setYetToBat] = useState([]);

    useEffect(() => {
        const fetchBatting = async () => {
            try {
                setIsLoading(true);
                const authToken = await AsyncStorage.getItem('AccessToken');
                const battingScore = await axiosInstance.get(`${BASE_URL}/${game.name}/getPlayerScoreFunc`, {
                    params: { match_public_id: match.public_id.toString(), team_public_id: homeTeamPublicID===currentScoreCard?homeTeamPublicID.toString(): awayTeamPublicID.toString() },
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                dispatch(getCricketBattingScore(battingScore?.data?.data || []));
            } catch (err) {
                console.error("Unable to fetch batting score: ", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBatting();
    }, [currentScoreCard, match.public_id]);

    useEffect(() => {
        const fetchBowling = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const bowlingScore = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketBowlerFunc`, {
                     params: { match_public_id: match.public_id.toString(), team_public_id: homeTeamPublicID!==currentScoreCard?homeTeamPublicID.toString(): awayTeamPublicID.toString() },
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                dispatch(getCricketBowlingScore(bowlingScore?.data?.data || []))
            } catch (err) {
                console.error("Unable to fetch bowling score: ", err);
            }
        };
        fetchBowling();
    }, [currentScoreCard, match.public_id]);

    useEffect(() => {
        const handleYetToBat = () => {
            let notBatted = [];
            const allBattedIDs = new Set();
        
            Object.keys(batting?.innings || {}).forEach(key => {
                batting.innings[key]?.forEach(batter => {
                    if (key === selectedInning && batter?.id) allBattedIDs.add(batter.id);
                });
            });
        
            if (currentScoreCard === homeTeamPublicID) {
                if (Array.isArray(homePlayer)) {
                    notBatted = homePlayer.filter(item => !allBattedIDs.has(item.id));
                }
            } else {
                if (Array.isArray(awayPlayer)) {
                    notBatted = awayPlayer.filter(item => !allBattedIDs.has(item.id));
                }
            }
        
            setYetToBat(notBatted);
        };
        
        handleYetToBat();
    }, [currentScoreCard, match.public_id]);

    const handleAddNextBatsman = async () => {
        try{

            const data = {
                match_public_id: match.public_id,
                team_public_id: batTeam,
                batsman_public_id: item.public_id,
                position: item.position,
                runs_scored: 0,
                balls_faced: 0,
                fours: 0,
                sixes: 0,
                batting_status: true,
                is_striker: false,
                is_currently_batting: true,
            }

            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addCricketBatScore`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
        } catch (err) {
            console.error("Failed to add the striker : ", err)
        }
    }

    useEffect(() => {
        const fetchTeamWickets = async () => {
            try {
                const data = {
                    match_public_id: match.public_id,
                    team_public_id: currentScoreCard,
                }
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketWickets/${match?.public_id}`, {
                    params: {
                        "match_public_id": match.public_id.toString(),
                        "team_public_id": currentScoreCard.toString()
                    },
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                dispatch(getCricketWicketFallen(response?.data?.data || []))
                setWicketsData(response.data.data || []);
            } catch (err) {
                console.error("failed to get the wickets: ", err)
            }
        }
        fetchTeamWickets()
    }, [currentScoreCard, match.public_id]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    } else {
        return (
            <View style={tailwind`flex-1 bg-white`}>
                <Animated.ScrollView 
                    onScroll={handlerScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop: 0,
                        paddingBottom: 100,
                        minHeight: sHeight + 100
                    }}
                >   
                    <Animated.View style={[tailwind`bg-white shadow-lg w-full px-2`, contentStyle]}>
                        {/* Team switcher */}
                        <View style={tailwind`flex-row mb-2 p-2 items-center justify-between gap-2 `}>
                            <Pressable
                            onPress={() => {
                                setCurrentScoreCard(homeTeamPublicID);
                            }}
                            style={[
                                tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`,
                                homeTeamPublicID === currentScoreCard
                                ? tailwind`bg-red-400`
                                : tailwind`bg-white`,
                            ]}
                            >
                            <Text style={tailwind`text-lg font-bold`}>
                                {match?.homeTeam?.name}
                            </Text>
                            </Pressable>
                            <Pressable
                            onPress={() => setCurrentScoreCard(awayTeamPublicID)}
                            style={[
                                tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`,
                                awayTeamPublicID === currentScoreCard
                                ? tailwind`bg-red-400`
                                : tailwind`bg-white`,
                            ]}
                            >
                            <Text style={tailwind`text-lg font-bold`}>
                                {match?.awayTeam?.name}
                            </Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                    {match.match_format === "Test" ? (
                        <>
                            {batting?.innings && Object.keys(batting?.innings).length > 0 ? (
                                 <>
                                    {Object.keys(batting?.innings).map((key, index) => (
                                        <Pressable key={key} onPress={() => setSelectedInning(key)}>
                                            <Text style={tailwind`text-black`}>
                                                {index === 0 ? '1st Innings' : '2nd Innings'}
                                            </Text>
                                        </Pressable>
                                    ))}
                                    <View>
                                        
                                        <CricketBattingScorecard batting={batting?.innings && batting.innings[selectedInning]} />
                                        <CricketBowlingScorecard bowling={batting?.innings && bowling.innings[selectedInning]} convertBallToOvers={convertBallToOvers} />
                                        <CricketWicketCard wickets={wickets.innings[selectedInning]} convertBallToOvers={convertBallToOvers} />
                                    </View>
                                 </>
                            ):(
                                <Text style={tailwind`text-center text-gray-500`}>Inning Not Started</Text>
                            )}
                        </>
                    ):(
                        <>
                            {batting?.innings && Object.keys(batting?.innings).length >  0 ? (
                                <View style={tailwind``}>
                                        {Object.keys(batting?.innings)?.map((key, index) => (
                                            <View style={tailwind`bg-white mb-2 p-1`} key = {index}>
                                                <CricketBattingScorecard batting={batting?.innings[key]} />
                                            </View>
                                        ))}
                                        {Object.keys(batting?.innings).map((key, index) => (
                                            <View style={tailwind`bg-white mb-2 p-1`} key= {index}>
                                                <CricketBowlingScorecard bowling={bowling?.innings[key]} convertBallToOvers={convertBallToOvers}/>
                                            </View>
                                        ))}
                                        {yetToBat.length > 0 && (
                                            <View style={tailwind`bg-white rounded-lg shadow-md p-4 mb-4`}>
                                                <Text style={tailwind`text-black`}>Yet to bat:</Text>
                                                <View>
                                                        {yetToBat.map((item, index) => (
                                                        <View key={index} style={tailwind`bg-red flex-1`}>
                                                                <Text style={tailwind`text-black`}>{item.player_name}</Text>
                                                        </View>
                                                        ))}
                                                </View>
                                            </View>
                                        )}
                                        {wickets.length > 0 && (
                                            <View style={tailwind`bg-white mb-2 p-1`}>
                                                <CricketWicketCard wickets={wickets} convertBallToOvers={convertBallToOvers}/>
                                            </View>
                                        )}
                                </View>
                            ):(
                                <View style={tailwind`flex-1 p-4`}>
                                    <View style={tailwind`bg-white rounded-lg shadow-lg items-center justify-center h-40 p-4`}>
                                        <MaterialIcon name="info-outline" size={40} color="gray" />
                                        <Text style={tailwind`text-lg font-bold text-gray mt-2`}>Inning Not Started</Text>
                                    </View>
                                </View>
                            )}
                        </>
                    )}
                    
                </Animated.ScrollView>
                {isYetToBatModalVisible && (
                        <Modal
                        transparent={true}
                        animationType="slide"
                        visible={isYetToBatModalVisible}
                        onRequestClose={() => setIsYetToBatModalVisible(false)}
                        >  
                        <Pressable onPress={() => setIsYetToBatModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                            <View style={tailwind`bg-white rounded-md p-4`}>
                            {yetToBat.map((item, index) => (
                                <Pressable key={index} onPress={() => {handleAddNextBatsman(item)}} style={tailwind``}>
                                    <Text style={tailwind`text-xl py-2 text-black`}>{item.player_name}</Text>
                                </Pressable>
                            ))}
                            </View>
                        </Pressable>
                    </Modal>
                )}
            </View>
        );
    }
};

export default CricketScoreCard;