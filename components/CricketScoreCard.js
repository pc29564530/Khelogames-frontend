import { useDebugValue, useEffect, useState } from "react";
import { View, Text, Pressable, Modal, TouchableOpacity, ScrollView, SafeAreaView, FlatList } from 'react-native';
import tailwind from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAxiosInterceptor from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { AddCricketBatsman } from "./AddCricketBatsman";
import { AddCricketBowler } from "./AddCricketBowler";
import { useSelector } from "react-redux";
import { fetchTeamPlayers } from "../services/teamServices";
import CricketBattingScorecard from "./CricketBattingScorecard";
import CricketBowlingScorecard from "./CricketBowlingScorecard";


const convertBallToOvers = (item) => {
    const overs = Math.floor(item / 6);
    const remainingBall = item % 6;
    return `${overs}.${remainingBall}`;
};

const CricketScoreCard = ({ route }) => {
    const axiosInstance = useAxiosInterceptor();
    const { matchData } = route.params;
    const game = useSelector(state => state.sportReducers.game);
    const [battingData, setBattingData] = useState([]);
    const [isModalBattingVisible, setIsModalBattingVisible] = useState(false);
    const [isModalBowlingVisible, setIsModalBowlingVisible] = useState(false);
    const [bowlingData, setBowlingData] = useState([]);
    const [homeBatting, setHomeBatting] = useState([]);
    const [awayBatting, setAwayBatting] = useState([]);
    const [homeBowling, setHomeBowling] = useState([]);
    const [awayBowling, setAwayBowling] = useState([]);
    const [batTeam, setBatTeam] = useState(matchData.homeTeam.id);
    const [homePlayer, setHomePlayer] = useState([]);
    const [awayPlayer, setAwayPlayer] = useState([]);
    const [currentBowler, setCurrentBowler] = useState();
    const [wicketType, setWicketType] = useState("");
    const [ballNumber, setBallNumber] = useState();
    const [wicketNumber, setWicketNumber] = useState();
    const [isWicketModalVisible,setIsWicketModalVisible] = useState(false);
    const [isUpdateBattingVisible, setIsUpdateBattingVisible] = useState(false);
    const [isUpdateBowlingVisible, setIsUpdateBowlingVisible] = useState(false);
    const [updateBatting, setUpdateBatting] = useState();
    const [updateBowling, setUpdateBowling] = useState();
    const homeTeamID = matchData.homeTeam.id;
    const awayTeamID = matchData.awayTeam.id;
    
    const [yetToBat, setYetToBat] = useState([]);

    useEffect(() => {
        const fetchBatting = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const battingScore = await axiosInstance.get(`${BASE_URL}/${game.name}/getPlayerScoreFunc`, {
                    params: { match_id: matchData.matchId.toString(), team_id: homeTeamID===batTeam?homeTeamID.toString(): awayTeamID.toString() },
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                setBattingData(battingScore.data || []);
            } catch (err) {
                console.error("Unable to fetch batting score: ", err);
            }
        };
        fetchBatting();
    }, [batTeam]);

    useEffect(() => {
        const fetchBowling = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const bowlingScore = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketBowlerFunc`, {
                    params: { match_id: matchData.matchId, team_id: awayTeamID!==batTeam?awayTeamID: homeTeamID },
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                setBowlingData(bowlingScore.data || []);
            } catch (err) {
                console.error("Unable to fetch bowling score: ", err);
            }
        };
        fetchBowling();
    }, [batTeam]);

    useEffect(() => {
        const loadPlayers = async () => {
            const homePlayers = await fetchTeamPlayers(BASE_URL, homeTeamID, game, axiosInstance);
            const awayPlayers = await fetchTeamPlayers(BASE_URL, awayTeamID, game, axiosInstance);
            setHomePlayer(homePlayers);
            setAwayPlayer(awayPlayers);
        };

        loadPlayers();
    }, [homeTeamID, awayTeamID]);

    const handleUpdatePlayerBatting = (item) => {
        setUpdateBatting(item);
        setIsUpdateBattingVisible(true);
    }

    const handleUpdatePlayerBowling = (item) => {
        setUpdateBowling(item);
        setIsUpdateBowlingVisible(true);
    }

    const handleUpdateRuns = (runs) => {
        updateBatting.runsScored = updateBatting.runsScored + runs;
    };

    const handleUpdateBalls = () => {
        updateBatting.ballFaced = updateBatting.ballFaced + 1;
    };

    const handleUpdateFours = () => {
        handleUpdateRuns(4);
        updateBatting.fours = updateBatting.fours + 1;
    };

    const handleUpdateSixes = () => {
        handleUpdateRuns(6);
        updateBatting.sixes = updateBatting.sixes + 1;
    };

    const  handleBowlingBalls = () => {
        updateBowling.ball = updateBowling.ball + 1;
    }

    const handleBowlingRuns = () => {
        updateBowling.runs = updateBowling.runs + 1;
    }

    const handleBowlingWickets = () => {
        updateBowling.wickets = updateBowling.wickets + 1;
    }

    const handleBowlingWide = () => {
        updateBowling.wide = updateBowling.wide + 1;
    }

    const handleBowlingNoBall = () => {
        updateBowling.noBall = updateBowling.noBall + 1;
    }

    const handleUpdateBatting = async () => {
        try {
            const data = {
                batsman_id: updateBatting.player.id,
                team_id: batTeam,
                match_id: matchData.matchId,
                position: updateBatting.player.position,
                runs_scored: updateBatting.runsScored,
                balls_faced: updateBatting.ballFaced,
                fours: updateBatting.fours,
                sixes: updateBatting.sixes,
            }
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketBat`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
        } catch (err) {
            console.error("Failed to update Batting")
        }
    }

    const handleUpdateBowling = async () => {
        try {
            const data = {
                bowler_id: updateBowling.player.id,
                team_id: batTeam!==awayTeamID!==batTeam?awayTeamID: homeTeamID,
                match_id: matchData.matchId,
                ball: updateBowling.ball,
                runs: updateBowling.runs,
                wickets: updateBowling.wickets,
                wide: updateBowling.wide,
                no_balls: updateBowling.noBall,
            }
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketBall`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
        } catch (err) {
            console.error("Failed to update Batting")
        }
    }
    

    return (
        <View style={tailwind`flex-1 bg-gray-100`}>
            <ScrollView>
                <View style={tailwind`flex-row mb-4 p-2 items-center justify-between gap-2`}>
                    <Pressable onPress={() => setBatTeam(homeTeamID)} style={[tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`, homeTeamID === batTeam ? tailwind`bg-red-400`: tailwind`bg-white`]}>
                        <Text style={tailwind`text-lg font-bold`}>{matchData.homeTeam.name}</Text>
                    </Pressable>
                    <Pressable onPress={() => setBatTeam(awayTeamID)} style={[tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`, awayTeamID===batTeam?tailwind`bg-red-400`:tailwind`bg-white`]}>
                        <Text style={tailwind`text-lg font-bold`}>{matchData.awayTeam.name}</Text>
                    </Pressable>
                </View>
                <View style={tailwind`bg-white rounded-lg shadow-md mb-4`}>
                    <CricketBattingScorecard battingData={battingData} setIsModalBattingVisible={setIsModalBattingVisible} handleUpdatePlayerBatting={handleUpdatePlayerBatting}/>
                </View>

                <View style={tailwind`bg-white rounded-lg shadow-md p-2 mb-4`}>
                    <CricketBowlingScorecard bowlingData={bowlingData} setIsModalBowlingVisible={setIsModalBowlingVisible} handleUpdatePlayerBowling={handleUpdatePlayerBowling} convertBallToOvers={convertBallToOvers} />
                </View>
                <View style={tailwind`bg-white rounded-lg shadow-md p-4 mb-4`}>
                    <Text style={tailwind`text-black`}>Yet to bat:</Text>
                    <SafeAreaView>
                            {yetToBat.map((item, index) => (
                               <View key={index}>
                                    <Text>{item.name}</Text>
                               </View>
                            ))}
                    </SafeAreaView>
                </View>
                <View>
                    {/*  add the fall of wickets*/}
                </View>
            </ScrollView>
                {isModalBattingVisible && (
                    <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isModalBattingVisible}
                    onRequestClose={() => setIsModalBattingVisible(false)}
                >
                    <Pressable onPress={() => setIsModalBattingVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddCricketBatsman matchData={matchData} batTeam={batTeam}  homePlayer={homePlayer} awayPlayer={awayPlayer} game={game}/>
                        </View>
                    </Pressable>
                </Modal>
                )}
            {isModalBowlingVisible && (
                 <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isModalBowlingVisible}
                    onRequestClose={() => setIsModalBowlingVisible(false)}
                >
                    <Pressable onPress={() => {setIsModalBowlingVisible(false)}} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddCricketBowler matchData={matchData} batTeam={batTeam}  homePlayer={homePlayer} awayPlayer={awayPlayer} game={game}/>
                        </View>
                    </Pressable>
                </Modal>
            )}

            {isUpdateBattingVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isUpdateBattingVisible}
                    onRequestClose={() => setIsUpdateBattingVisible(false)}
                >
                    <Pressable style={tailwind`flex-1 justify-end bg-black bg-opacity-50`} onPress={() => setIsUpdateBattingVisible(false)}>
                        <View style={tailwind`p-10 bg-white rounded-xl`}>
                            <Text style={tailwind`text-lg font-bold`}>{updateBatting.player?.name}</Text>
                            <View style={tailwind`flex-row justify-between py-2`}>
                                <Text style={tailwind`text-xl`}>Runs:</Text>
                                <View style={tailwind`flex-row justify-between gap-4`}>
                                    <Text style={tailwind`text-lg font-bold`}>{updateBatting.runsScored}</Text>
                                    <Pressable style={tailwind`rounded bg-gray-200 p-1`} onPress={() => handleUpdateRuns(1)}>
                                        <Text>1</Text>
                                    </Pressable>
                                    <Pressable style={tailwind`rounded bg-gray-200 p-1`} onPress={() => handleUpdateRuns(2)}>
                                        <Text>2</Text>
                                    </Pressable>
                                    <Pressable style={tailwind`rounded bg-gray-200 p-1`} onPress={() => handleUpdateRuns(3)}>
                                        <Text>3</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <View style={tailwind`flex-row justify-between py-2`}>
                                <Text style={tailwind`text-xl`}>Balls:</Text>
                                <View style={tailwind`flex-row gap-2`}>
                                    <Text style={tailwind`text-lg font-bold`}>{updateBatting.ballFaced}</Text>
                                    <Pressable style={tailwind`rounded bg-gray-200 p-1`} onPress={() => handleUpdateBalls()}>
                                        <Text style={tailwind`text-xl`}>+</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <View style={tailwind`flex-row justify-between py-2`}>
                                <Text style={tailwind`text-xl`}>Fours:</Text>
                                <View style={tailwind`flex-row gap-2`}>
                                    <Text style={tailwind`text-lg font-bold`}>{updateBatting.fours}</Text>
                                    <Pressable style={tailwind`rounded bg-gray-200 p-1`} onPress={() => handleUpdateFours()}>
                                        <Text style={tailwind`text-xl`}>+</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <View style={tailwind`flex-row justify-between py-2`}>
                                <Text style={tailwind`text-xl`}>Sixes:</Text>
                                <View style={tailwind`flex-row gap-2`}>
                                    <Text style={tailwind`text-lg font-bold`}>{updateBatting.sixes}</Text>
                                    <Pressable style={tailwind`rounded bg-gray-200 p-1`} onPress={() => handleUpdateSixes()}>
                                        <Text style={tailwind`text-xl`}>+</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <Pressable onPress={() => handleUpdateBatting()} style={tailwind`border rounded-md p-3 items-center`}>
                                <Text style={tailwind`text-lg font-bold`}>Update Score</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            )}

            {isUpdateBowlingVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isUpdateBowlingVisible}
                    onRequestClose={() => setIsUpdateBowlingVisible(false)}
                >
                    <Pressable style={tailwind`flex-1 justify-end bg-black bg-opacity-50`} onPress={() => setIsUpdateBowlingVisible(false)}>
                        <View style={tailwind`p-10 bg-white rounded-xl`}>
                            <Text style={tailwind`text-lg font-bold`}>{updateBowling.player?.name}</Text>
                            <View style={tailwind`flex-row justify-between py-2`}>
                                <Text style={tailwind`text-xl`}>Balls:</Text>
                                <View style={tailwind`flex-row gap-2`}>
                                    <Text style={tailwind`text-lg font-bold`}>{updateBowling.ball}</Text>
                                    <Pressable style={tailwind`rounded bg-gray-200 p-1`} onPress={() => handleBowlingBalls()}>
                                        <Text style={tailwind`text-xl`}>+</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <View style={tailwind`flex-row justify-between py-2`}>
                                <Text style={tailwind`text-xl`}>Runs Conceded:</Text>
                                <View style={tailwind`flex-row gap-2`}>
                                    <Text style={tailwind`text-lg font-bold`}>{updateBowling.runs}</Text>
                                    <Pressable style={tailwind`rounded bg-gray-200 p-1`} onPress={() => handleBowlingRuns()}>
                                        <Text style={tailwind`text-xl`}>+</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <View style={tailwind`flex-row justify-between py-2`}>
                                <Text style={tailwind`text-xl`}>Wickets:</Text>
                                <View style={tailwind`flex-row gap-2`}>
                                    <Text style={tailwind`text-lg font-bold`}>{updateBowling.wickets}</Text>
                                    <Pressable style={tailwind`rounded bg-gray-200 p-1`} onPress={() => handleBowlingWickets()}>
                                        <Text style={tailwind`text-xl`}>+</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <View style={tailwind`flex-row justify-between py-2`}>
                                <Text style={tailwind`text-xl`}>Wide:</Text>
                                <View style={tailwind`flex-row gap-2`}>
                                    <Text style={tailwind`text-lg font-bold`}>{updateBowling.wide}</Text>
                                    <Pressable style={tailwind`rounded bg-gray-200 p-1`} onPress={() => handleBowlingWide()}>
                                        <Text style={tailwind`text-xl`}>+</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <View style={tailwind`flex-row justify-between py-2`}>
                                <Text style={tailwind`text-xl`}>No Ball:</Text>
                                <View style={tailwind`flex-row gap-2`}>
                                    <Text style={tailwind`text-lg font-bold`}>{updateBowling.noBall}</Text>
                                    <Pressable style={tailwind`rounded bg-gray-200 p-1`} onPress={() => handleBowlingNoBall()}>
                                        <Text style={tailwind`text-xl`}>+</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <Pressable onPress={() => handleUpdateBowling()} style={tailwind`border rounded-md p-3 items-center`}>
                                <Text style={tailwind`text-lg font-bold`}>Update Bowling</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
};

export default CricketScoreCard;