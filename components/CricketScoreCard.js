import {useEffect, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, ActivityIndicator } from 'react-native';
import tailwind from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAxiosInterceptor from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { fetchTeamPlayers } from "../services/teamServices";
import CricketBattingScorecard from "./CricketBattingScorecard";
import CricketBowlingScorecard from "./CricketBowlingScorecard";
import CricketWicketCard from "./CricketWicketCard";
import { useDispatch, useSelector } from "react-redux";
import UpdateCricketScoreCard from "./UpdateCricketScoreCard";
import { getCricketBattingScore, getCricketBowlingScore, getCricketMatchInningScore, getCricketWicketFallen, setBatTeam, getAwayPlayer, getHomePlayer } from "../redux/actions/actions";


const convertBallToOvers = (item) => {
    const overs = Math.floor(item / 6);
    const remainingBall = item % 6;
    return `${overs}.${remainingBall}`;
};

const CricketScoreCard = () => {
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const game = useSelector(state => state.sportReducers.game);
    const match = useSelector((state) => state.cricketMatchScore.match);
    const batting = useSelector((state) => state.cricketPlayerScore.battingScore);
    const bowling = useSelector((state) => state.cricketPlayerScore.bowlingScore);
    const wickets = useSelector((state) => state.cricketPlayerScore.wicketFallen);
    const homePlayer = useSelector((state) => state.teams.homePlayer);
    const awayPlayer = useSelector((state) => state.teams.awayPlayer);
    const [isUpdateScoreCardModal, setIsUpdateScoreCardModal] = useState(false);
    const [isModalBatsmanStrikerChange, setIsModalBatsmanStrikeChange] = useState(false);
    const [isBatsmanStrikeChange,setIsBatsmanStrikeChange] = useState(false);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam);
    const [isYetToBatModalVisible, setIsYetToBatModalVisible] = useState(false);
    const [isFielder, setIsFielder] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss)
    const [currentScoreCard, setCurrentScoreCard] = useState() 
    const homeTeamID = match?.homeTeam?.id;
    const awayTeamID = match?.awayTeam?.id;

    useEffect(() => {
        if (cricketToss) {
            if (cricketToss.tossDecision === "Batting") {
                setCurrentScoreCard(cricketToss.tossWonTeam.id === homeTeamID ? homeTeamID : awayTeamID);
            } else {
                setCurrentScoreCard(cricketToss.tossWonTeam.id === homeTeamID ? awayTeamID : homeTeamID);
            }
        }
    }, [cricketToss, homeTeamID, awayTeamID]);

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
                    params: { match_id: match.id.toString(), team_id: homeTeamID===currentScoreCard?homeTeamID.toString(): awayTeamID.toString() },
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                dispatch(getCricketBattingScore(battingScore?.data || []));
            } catch (err) {
                console.error("Unable to fetch batting score: ", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBatting();
    }, [currentScoreCard, match.id]);

    useEffect(() => {
        const fetchBowling = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const bowlingScore = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketBowlerFunc`, {
                    params: { match_id: match.id, team_id: awayTeamID!==currentScoreCard?awayTeamID: homeTeamID },
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                dispatch(getCricketBowlingScore(bowlingScore?.data || []))
            } catch (err) {
                console.error("Unable to fetch bowling score: ", err);
            }
        };
        fetchBowling();
    }, [currentScoreCard, match.id]);

    useEffect(() => {
        const loadPlayers = async () => {
            const homePlayersResponse = await fetchTeamPlayers(BASE_URL, homeTeamID, game, axiosInstance);
            const awayPlayersResponse = await fetchTeamPlayers(BASE_URL, awayTeamID, game, axiosInstance);
            dispatch(getHomePlayer(homePlayersResponse));
            dispatch(getAwayPlayer(awayPlayersResponse));
        };

        loadPlayers();
    }, []);

    useEffect(() => {
        const handleYetToBat = () => {
            let notBatted = [];
            if (batTeam === homeTeamID){
                notBatted = homePlayer.filter((item) => !batting?.innings?.some((batter) => item.id !== batter.id) )
            } else {
                notBatted = awayPlayer.filter((item) => !batting?.innings?.some((batter) => item.id !== batter.id))
            }
            setYetToBat(notBatted);
        }
        handleYetToBat();
    }, [currentScoreCard, match.id]);

    const handleAddNextBatsman = async () => {
        try{

            const data = {
                batsman_id: item.id,
                match_id: match.matchId,
                team_id: batTeam,
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
                    match_id: match.matchId,
                    team_id: currentScoreCard,
                }
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketWickets`, {
                    params: {
                        "match_id": match.id.toString(),
                        "team_id": currentScoreCard.toString()
                    },
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                dispatch(getCricketWicketFallen(response?.data || []))
                setWicketsData(response.data || []);
            } catch (err) {
                console.error("failed to get the wickets: ", err)
            }
        }
        fetchTeamWickets()
    }, [currentScoreCard, match.id]);

    const currentFielder = homeTeamID !== batTeam
    ? homePlayer?.filter((player) => {
        const currentField = !bowling?.innings?.some(
            (bowler) => bowler.is_current_bowler === true && bowler.player.id === player.id
        )
        return currentField;
    }
            
      ) || []
    : awayPlayer?.filter((player) => 
        {
            const currentField = !bowling?.innings?.filter(
                (bowler) => bowler.is_current_bowler === true && bowler.player.id === player.id
            )
            return currentField; 
        } 
     ) || [];
    
    const toggleScoreCard = (teamID) => {
        setCurrentScoreCard(teamID)
    }

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
                <View style={tailwind`p-4`}>
                    <Pressable onPress={() => setIsUpdateScoreCardModal(true)}>
                        <Text>Edit Score</Text>
                    </Pressable>
                </View>
                <ScrollView style={tailwind`bg-white`}>
                    <View style={tailwind`flex-row mb-2 p-2 items-center justify-between gap-2`}>
                        <Pressable onPress={() => {toggleScoreCard(homeTeamID)}} style={[tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`, homeTeamID === currentScoreCard ? tailwind`bg-red-400`: tailwind`bg-white`]}>
                            <Text style={tailwind`text-lg font-bold`}>{match.homeTeam.name}</Text>
                        </Pressable>
                        <Pressable onPress={() => toggleScoreCard(awayTeamID)} style={[tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`, awayTeamID===currentScoreCard?tailwind`bg-red-400`:tailwind`bg-white`]}>
                            <Text style={tailwind`text-lg font-bold`}>{match.awayTeam.name}</Text>
                        </Pressable>
                    </View>
                    {batting?.innings?.length > 0 ? (
                        <View style={tailwind``}>
                                <View style={tailwind`bg-white mb-2 p-1`}>
                                    <CricketBattingScorecard batting={batting} setIsModalBattingVisible={setIsModalBattingVisible}/>
                                </View>
                                <View style={tailwind`bg-white mb-2 p-1`}>
                                    <CricketBowlingScorecard bowling={bowling} setIsModalBowlingVisible={setIsModalBowlingVisible}  convertBallToOvers={convertBallToOvers} />
                                </View>
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
                    
                </ScrollView>
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
                {isFielder && (
                    <Modal
                    transparent
                    visible={isFielder}
                    animationType="fade"
                    onRequestClose={() => setIsFielder(false)}
                >
                    <Pressable 
                        style={tailwind`flex-1 justify-end bg-black bg-opacity-50`} 
                        onPress={() => setIsFielder(false)}
                    >
                        <View style={tailwind`bg-white rounded-t-2xl p-5 h-[100%]`}>
                            <Text style={tailwind`text-lg font-semibold mb-3 text-center`}>Select Fielder</Text>
                            <ScrollView style={tailwind``} showsVerticalScrollIndicator={false}>
                                {currentFielder?.map((item, index) => (
                                    <Pressable 
                                        key={index} 
                                        style={tailwind`p-3 border-b border-gray-200`}
                                        onPress={() => {
                                            setSelectedFielder(item);
                                            setIsFielder(false);
                                            setIsModalBatsmanStrikeChange(true);
                                        }}
                                    >   
                                        <Text style={tailwind`text-lg text-gray-600 text-center`}>{item.player_name}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
                )}
            </View>
        );
    }
};

export default CricketScoreCard;