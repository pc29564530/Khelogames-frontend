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
import CricketWicketCard from "./CricketWicketCard";


const convertBallToOvers = (item) => {
    const overs = Math.floor(item / 6);
    const remainingBall = item % 6;
    return `${overs}.${remainingBall}`;
};

const CricketScoreCard = ({ route }) => {
    const axiosInstance = useAxiosInterceptor();
    const { matchData } = route.params;
    const game = useSelector(state => state.sportReducers.game);
   const [battingData, setBattingData] = useState(null)
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
    const [isUpdateScoreCardModal, setIsUpdateScoreCardModal] = useState(false);
    const [isYetToBatModalVisible, setIsYetToBatModalVisible] = useState(false);
    const [isWicketTypeVisibleModal, setIsWicketTypeVisibleModal] = useState(false);
    const [wicketsData, setWicketsData] = useState([]);
    const [isStriker, setIsStriker] = useState(null);
    const [updateBatting, setUpdateBatting] = useState();
    const [updateBowling, setUpdateBowling] = useState();
    const [addCurrentScoreEvent, setAddCurrentScoreEvent] = useState(null);
    const currentScoreEvent = ["No Ball", "Wicket", "Wide", "Leg Bye"];
    const wicketTypes = ["Run Out", "Stump", "Catch", "Hit Wicket", "Bowled Out", "LBW"];
    const homeTeamID = matchData.homeTeam.id;
    const awayTeamID = matchData.awayTeam.id;
    const runsCount = [0, 1, 2, 3, 4, 5, 6, 7];
    
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
                 
                setBattingData(battingScore.data || [])
                // (battingScore?.data || {});
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

    useEffect(() => {
        const handleYetToBat = () => {
            let notBatted = [];
            if (batTeam === homeTeamID){
                notBatted = homePlayer.filter((item) => !battingData?.innings?.some((batter) => item.id !== batter.id) )
            }
            setYetToBat(notBatted);
        }
        handleYetToBat();
    }, []);

    const handleScorecard = async (temp) => {
        const currentBowler = bowlingData?.innings.find((item) => item.is_current_bowler === true );
        const currentBatsman = battingData?.innings.find((item) => (item.is_currently_batting === true && item.is_striker === true));
        if(addCurrentScoreEvent===null){
            try {
                
                const data = {
                    batsman_id: currentBatsman.player.id,
                    bowler_id: currentBowler.player.id,
                    match_id: matchData.matchId,
                    runs_scored: temp,
                    bowler_balls: currentBowler.ball,
                }

                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketRegularScore`, data, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            } catch (err) {
                console.error("Failed to add the runs and balls: ", err)
            }
        } else if(addCurrentScoreEvent === "no_ball"){
            try {
                const data = {
                    runs_scored: temp,
                    match_id: matchData.matchId,
                    bowler_id: currentBowler.player.id,
                    batting_team_id: batTeam
                }
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketNoBall`, data, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            } catch (err) {
                console.error("Failed to add the runs and balls: ", err)
            }
        } else if(addCurrentScoreEvent === "wide") {
            try {
                const data = {
                    match_id: matchData.matchId,
                    bowler_id: currentBowler.player.id,
                    batting_team_id: batTeam
                }
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateCricketWide`, data, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            } catch (err) {
                console.error("Failed to add the runs and balls: ", err)
            }
        } else if(addCurrentScoreEvent === "wicket") {
            try {
                const data = {
                    match_id: matchData.matchId,
                    batting_team_id: batTeam,
                    bowling_team_id: matchData.homeTeamID === batTeam?matchData.awayTeamID: matchData.homeTeamID,
                    Batsman_id: currentBatsman.player.id,
                    bowler_id: currentBowler.player.id,
                    wicket_type: wicketType,
                    fielder_id: null
                }
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.post(`${BASE_URL}/${game.name}/wickets`, data, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            } catch (err) {
                console.error("Failed to add the runs and balls: ", err)
            }
        }
    }

    const handleAddNextBatsman = async () => {
        try{

            const data = {
                batsman_id: item.id,
                match_id: matchData.matchId,
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

    const handleCurrentScoreEvent = (item) => {
        const itemType = item.toLowerCase().replace(/\s+/g, '_');
        setAddCurrentScoreEvent(itemType)

        if (itemType === "wicket" ){
            setIsWicketModalVisible(true);
        }
    } 

    useEffect(() => {
        const fetchTeamWickets = async () => {
            try {
                const data = {
                    match_id: matchData.matchId,
                    team_id: batTeam,
                }
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketWickets`, {
                    params: {
                        "match_id": matchData.matchId.toString(),
                        "team_id": batTeam.toString()
                    },
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                setWicketsData(response.data || []);
            } catch (err) {
                console.error("failed to get the wickets: ", err)
            }
        }
        fetchTeamWickets()
    }, [batTeam]);

    return (
        <View style={tailwind`flex-1 bg-white`}>
            <ScrollView style={tailwind`bg-white`}>
                <View style={tailwind`flex-row mb-2 p-2 items-center justify-between gap-2`}>
                    <Pressable onPress={() => setBatTeam(homeTeamID)} style={[tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`, homeTeamID === batTeam ? tailwind`bg-red-400`: tailwind`bg-white`]}>
                        <Text style={tailwind`text-lg font-bold`}>{matchData.homeTeam.name}</Text>
                    </Pressable>
                    <Pressable onPress={() => setBatTeam(awayTeamID)} style={[tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`, awayTeamID===batTeam?tailwind`bg-red-400`:tailwind`bg-white`]}>
                        <Text style={tailwind`text-lg font-bold`}>{matchData.awayTeam.name}</Text>
                    </Pressable>
                </View>
                {console.log("Batting Dat: ", battingData)}
                {battingData?.innings?.length > 0 ? (
                    <View style={tailwind``}>
                        {console.log("Line no 381")}
                            <View style={tailwind`bg-white mb-2 p-2 justify-between`}>
                                <Pressable style={tailwind`p-2 bg-white rounded-lg shadow-lg items-center`} onPress={() => setIsUpdateScoreCardModal(true)}>
                                    <Text style={tailwind`text-xl`}>Update Score</Text>
                                </Pressable>
                            </View>
                            <View style={tailwind`bg-white mb-2 p-1`}>
                                <CricketBattingScorecard battingData={battingData} setIsModalBattingVisible={setIsModalBattingVisible} handleUpdatePlayerBatting={handleUpdatePlayerBatting}/>
                            </View>

                            <View style={tailwind`bg-white mb-2 p-1`}>
                                <CricketBowlingScorecard bowlingData={bowlingData} setIsModalBowlingVisible={setIsModalBowlingVisible} handleUpdatePlayerBowling={handleUpdatePlayerBowling} convertBallToOvers={convertBallToOvers} />
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
                            {wicketsData.length > 0 && (
                                <View style={tailwind`bg-white mb-2 p-1`}>
                                    <CricketWicketCard wicketsData={wicketsData} convertBallToOvers={convertBallToOvers}/>
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

            {isUpdateScoreCardModal && (
                <Modal
                transparent={true}
                animationType="slide"
                visible={isUpdateScoreCardModal}
                onRequestClose={() => setIsUpdateScoreCardModal(false)}
                >
                    <Pressable style={tailwind`flex-1 justify-end bg-black bg-opacity-50`} onPress={() => setIsUpdateScoreCardModal(false)}>
                        <View style={tailwind`p-10 bg-white rounded-xl`}>
                            <Text style={tailwind`text-lg font-bold`}>Event</Text>
                            <View style={tailwind`flex-row justify-between py-2`}>
                                {currentScoreEvent.map((item, index) => (
                                    <Pressable key={index} onPress={() => { handleCurrentScoreEvent(item)}} style={tailwind`flex-row rounded-lg shadow-md bg-white p-2`}>
                                        <Text>{item}</Text>
                                    </Pressable>
                                ))}
                            </View>
                            {isWicketModalVisible && (
                                <View style={tailwind`mt-4`}>
                                    <Text style={tailwind`text-base font-semibold text-gray-700 mb-2`}>Wicket Types</Text>
                                    <View style={tailwind`flex-row flex-wrap`}>
                                        {wicketTypes.map((item, index) => (
                                            <Pressable 
                                                key={index} 
                                                onPress={() => {setWicketType(item)}}
                                                style={tailwind`rounded-lg shadow-md bg-gray-100 px-4 py-2 mr-2 mb-2`}
                                            >
                                                <Text style={tailwind`text-gray-800`}>{item}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            )}
                            <View style={tailwind`flex-row justify-between py-2`}>
                                <Text style={tailwind`text-lg font-bold`}>Runs/Ball</Text>
                                {runsCount.map((item, index) => (
                                    <Pressable onPress={() => {handleScorecard(item)}}style={tailwind`rounded-lg shadow-md bg-white p-2`} key={index}>
                                        <Text>{item}</Text>
                                    </Pressable>
                                ))}
                                
                            </View>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
};

export default CricketScoreCard;