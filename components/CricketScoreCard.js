import React, {useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, ActivityIndicator, Dimensions, useWindowDimensions } from 'react-native';
import tailwind from "twrnc";
import { useFocusEffect } from '@react-navigation/native';
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
    const [battingSquad, setBattingSquad] = useState([]);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam);
    const [isLoading, setIsLoading] = useState(true);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss)
    const [currentScoreCardTeam, setCurrentScoreCardTeam] = useState();
    const [yetToBat, setYetToBat] = useState([]);
    const [selectedInning, setSelectedInning] = useState(1);
    const [error, setError] = useState({global: null, fields: {}});
    const homeTeamID = match?.homeTeam?.id;
    const awayTeamID = match?.awayTeam?.id;
    const homeTeamPublicID = match?.homeTeam?.public_id;
    const awayTeamPublicID = match?.awayTeam?.public_id;

    const {height: sHeight, width: sWidth} = useWindowDimensions();

    const currentScrollY = useSharedValue(0);
    // scroll handler for header animation
    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if (!parentScrollY?.value) return;
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

    useFocusEffect(
        React.useCallback(() => {
            if (!match && !cricketToss) return;
            if (cricketToss && cricketToss.tossWonTeam) {
            let firstBattingTeam;

            if (cricketToss.tossDecision === "Batting") {
                firstBattingTeam = cricketToss.tossWonTeam.public_id;
            } else {
                firstBattingTeam =
                cricketToss.tossWonTeam.public_id === homeTeamPublicID
                    ? awayTeamPublicID
                    : homeTeamPublicID;
            }

            setCurrentScoreCardTeam(firstBattingTeam);
            setSelectedInning(1);
            }
        }, [cricketToss, homeTeamPublicID, awayTeamPublicID])
    );

    useEffect(() => {
        const fetchBatting = async () => {
            try {
                setIsLoading(true);
                if (!match && !currentScoreCardTeam) return;
                const authToken = await AsyncStorage.getItem('AccessToken');
                const battingScore = await axiosInstance.get(`${BASE_URL}/${game.name}/getPlayerScoreFunc`, {
                    params: { match_public_id: match?.public_id.toString(), team_public_id: homeTeamPublicID===currentScoreCardTeam?homeTeamPublicID.toString(): awayTeamPublicID.toString() },
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                dispatch(getCricketBattingScore(battingScore?.data?.data || []));
            } catch (err) {
                setError({
                    global: "Unable to get inning score",
                    fields: {},
                })
                console.error("Unable to fetch batting score: ", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBatting();
    }, [currentScoreCardTeam, match?.public_id]);

    useEffect(() => {
        const fetchBowling = async () => {
            try {
                if (!match && !currentScoreCardTeam) return;
                const authToken = await AsyncStorage.getItem('AccessToken');
                const bowlingScore = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketBowlerFunc`, {
                    params: { match_public_id: match?.public_id.toString(), team_public_id: homeTeamPublicID!==currentScoreCardTeam?homeTeamPublicID.toString(): awayTeamPublicID.toString() },
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                dispatch(getCricketBowlingScore(bowlingScore?.data?.data || []))
            } catch (err) {
                setError({
                    global: "Unable to get inning score",
                    fields: {},
                });
                console.error("Unable to get bowling score: ", err);
            }
        };
        fetchBowling();
    }, [currentScoreCardTeam, match?.public_id]);

        useEffect(() => {
        const fetchTeamWickets = async () => {
            if(!match.public_id) {
                return;
            }
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketWickets/${match?.public_id}/${currentScoreCardTeam}`, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                dispatch(getCricketWicketFallen(response?.data?.data || []))
            } catch (err) {
                setError({
                    global: "unable to get wickets",
                    fields: {},
                })
                console.log("failed to get the wickets: ", err)
            }
        }
        fetchTeamWickets()
    }, [currentScoreCardTeam, match?.public_id]);

    const fetchBattingSquad = async () => {
        try {
            if (!match && !currentScoreCardTeam) return;
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketMatchSquad`, {
                params: {
                    "match_public_id": match.public_id,
                    "team_public_id": batTeam
                },
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                }
            });
            setBattingSquad(response.data.data || []);
        } catch (err) {
            const backendErrors = err?.response?.data?.error?.fields;
            if (typeof setError === 'function') {
                setError({
                    global: "Unable to get batting squad",
                    fields: backendErrors,
                });
            }
            console.error("Failed to fetch batting squad", err);
        }
    };

    useEffect(() => {
        fetchBattingSquad();
    }, [match?.public_id]);
    
    useEffect(() => {
        const handleYetToBat = () => {
            if (!Array.isArray(battingSquad)) return;

            const allBattedIDs = new Set();

            Object.keys(batting?.innings || {}).forEach(key => {
                batting.innings[key]?.forEach(batter => {
                    if (batter?.batsman_id) {
                        allBattedIDs.add(batter.batsman_id);
                    }
                });
            });

            const notBatted = battingSquad.filter(
                player => !allBattedIDs.has(player.player_id)
            );

            setYetToBat(notBatted);
        };
        if(batTeam === currentScoreCardTeam) {
            handleYetToBat();
        }
    }, [batting, battingSquad, currentScoreCardTeam, match?.public_id]);

    const handleAddNextBatsman = async () => {

        try{
            setIsLoading(true);
            const formData = {
                match_public_id: match?.public_id,
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
            const validation = validateCricketBatsman(formData);
            if (!validation.isValid) {
                setError({
                    global: null,
                    fields: validation.errors,
                })
                return;
            }
            const data = {
                match_public_id: match?.public_id,
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
            setError({
                global: "Unable to select batsman",
                fields: err?.response?.data?.error?.fields,
            })
            console.error("Failed to add the striker : ", err)
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <View style={[tailwind`flex-1 justify-center items-center`, {backgroundColor: '#0f172a'}]}>
                <ActivityIndicator size="large" color="#f87171" />
                <Text style={[tailwind`mt-2`, {color: '#94a3b8'}]}>Loading...</Text>
            </View>
        );
    } else {
        return (
            <View style={[tailwind`flex-1`, {backgroundColor: '#0f172a'}]}>
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
                    <Animated.View style={[tailwind`w-full px-2`, {backgroundColor: '#0f172a'}, contentStyle]}>
                        {/* Team switcher */}
                        <View style={tailwind`flex-row mb-2 p-2 items-center justify-between gap-2`}>
                            <Pressable
                            onPress={() => {
                                setCurrentScoreCardTeam(homeTeamPublicID);
                            }}
                            style={[
                                tailwind`rounded-lg w-1/2 items-center p-2`,
                                {borderWidth: 1, borderColor: '#334155'},
                                homeTeamPublicID === currentScoreCardTeam
                                ? {backgroundColor: '#f87171'}
                                : {backgroundColor: '#0f172a'},
                            ]}
                            >
                            <Text style={[tailwind`text-lg font-bold`, {color: homeTeamPublicID === currentScoreCardTeam ? '#ffffff' : '#94a3b8'}]}>
                                {match?.homeTeam?.name}
                            </Text>
                            </Pressable>
                            <Pressable
                            onPress={() => setCurrentScoreCardTeam(awayTeamPublicID)}
                            style={[
                                tailwind`rounded-lg w-1/2 items-center p-2`,
                                {borderWidth: 1, borderColor: '#334155'},
                                awayTeamPublicID === currentScoreCardTeam
                                ? {backgroundColor: '#f87171'}
                                : {backgroundColor: '#0f172a'},
                            ]}
                            >
                            <Text style={[tailwind`text-lg font-bold`, {color: awayTeamPublicID === currentScoreCardTeam ? '#ffffff' : '#94a3b8'}]}>
                                {match?.awayTeam?.name}
                            </Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                    {match?.match_format === "Test" ? (
                        <>
                            {batting?.innings && Object.keys(batting?.innings).length > 0 ? (
                                 <>
                                    {Object.keys(batting?.innings).map((key, index) => (
                                        <Pressable key={key} onPress={() => setSelectedInning(key)}>
                                            <Text style={[tailwind`px-4 py-2`, {color: '#f1f5f9'}]}>
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
                                <Text style={[tailwind`text-center py-4`, {color: '#64748b'}]}>Inning Not Started</Text>
                            )}
                        </>
                    ):(
                        <>
                            {batting?.innings && Object.keys(batting?.innings).length >  0 ? (
                                <View>
                                        {Object.keys(batting?.innings)?.map((key, index) => (
                                            <View style={tailwind`mb-3 px-2`} key={`bat-${index}`}>
                                                <CricketBattingScorecard batting={batting?.innings[key]} />
                                            </View>
                                        ))}
                                        {Object.keys(batting?.innings).map((key, index) => (
                                            <View style={tailwind`mb-3 px-2`} key={`bowl-${index}`}>
                                                <CricketBowlingScorecard bowling={bowling?.innings[key]} convertBallToOvers={convertBallToOvers}/>
                                            </View>
                                        ))}
                                        {match.status_code === "in_progress" && yetToBat.length > 0 && (
                                            <View style={[tailwind`rounded-lg p-4 mb-4`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                                                <Text style={[tailwind`font-semibold mb-2`, {color: '#f1f5f9'}]}>Yet to bat:</Text>
                                                <View>
                                                        {yetToBat.map((item, index) => (
                                                        <View key={index} style={tailwind`flex-1`}>
                                                                <Text style={[tailwind`py-1`, {color: '#cbd5e1'}]}>{item.player.name}</Text>
                                                        </View>
                                                        ))}
                                                </View>
                                            </View>
                                        )}
                                        {console.log("wickets: ", wickets)}
                                        {wickets.length > 0 && (
                                            <View style={tailwind`mb-3 px-2`}>
                                                <CricketWicketCard wickets={wickets} convertBallToOvers={convertBallToOvers}/>
                                            </View>
                                        )}
                                </View>
                            ):(
                                <View style={tailwind`flex-1 p-4`}>
                                    <View style={[tailwind`rounded-lg items-center justify-center h-40 p-4`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                                        <MaterialIcon name="info-outline" size={40} color="#475569" />
                                        <Text style={[tailwind`text-lg font-bold mt-2`, {color: '#64748b'}]}>Inning Not Started</Text>
                                    </View>
                                </View>
                            )}
                        </>
                    )}

                </Animated.ScrollView>
            </View>
        );
    }
};

export default CricketScoreCard;