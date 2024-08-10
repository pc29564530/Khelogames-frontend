import { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, Modal } from 'react-native';
import tailwind from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAxiosInterceptor from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const convertBallToOvers = (item) => {
    const overs = Math.floor(item/6);
    const remainingBall = 137%6;
    return `${overs}.${remainingBall}`;
}

const convertOversToBalls = (item) => {
    const radian = item*(Math.PI/180)
    const balls = Math.floor(radian*6)
    return balls
}

const CricketScoreCard = ({ route }) => {
    const axiosInstance = useAxiosInterceptor();
    const [updateBatting, setUpdateBatting] = useState(null);
    const [updateBowling, setUpdateBowling] = useState(null);

    const [isUpdateBattingVisible, setIsUpdateBattingVisible] = useState(false);
    const [isUpdateBowlingVisible, setIsUpdateBowlingVisible] = useState(false);
    const { matchData, matchID, homeTeamID, awayTeamID } = route.params;
    const [battingData, setBattingData] = useState([]);
    const [bowlingData, setBowlingData] = useState([]);
    const [batTeam, setBatTeam] = useState(homeTeamID);
    const [ballTeam, setBallTeam] = useState(awayTeamID)
    console.log("Score: card: ", matchData)

    useEffect(() => {
        const fetchBatting = async () => {
            try {
                const temp = {
                    match_id: matchID,
                    team_id: batTeam===homeTeamID?homeTeamID:awayTeamID,
                };
                console.log("batt temp: ", temp)
                const authToken = await AsyncStorage.getItem('AccessToken');
                const battingScore = await axiosInstance.get(`${BASE_URL}/Cricket/getPlayerScoreFunc`, {
                    params: temp,
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log("BattingScore: ", battingScore.data.battingTeam?.name)
                setBattingData(battingScore.data || []);
            } catch (err) {
                console.error("unable to fetch batting score: ", err);
            }
        };
        fetchBatting();
    }, [batTeam]);

    useEffect(() => {
        const fetchBowling = async () => {
            try {
                const temp = {
                    match_id: matchID,
                    team_id: batTeam===homeTeamID?awayTeamID:homeTeamID,
                };
                console.log("Bowl Team: ", temp)
                const authToken = await AsyncStorage.getItem('AccessToken');
                const bowlingScore = await axiosInstance.get(`${BASE_URL}/Cricket/getCricketBowlerFunc`,  {
                    params: temp,
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log("BowlingScore: ", bowlingScore.data.bowlingTeam?.name)
                setBowlingData(bowlingScore.data || []);
            } catch (err) {
                console.error("unable to fetch bowling score: ", err);
            }
        };
        fetchBowling();
    }, [batTeam]);

    const handleUpdatePlayerScore = (item) => {
        setUpdateBatting(item);
        setIsUpdateBattingVisible(true);
    };

    const handleUpdateBowling = (item) => {
        console.log("Bowling Data: ", item)
        setUpdateBowling(item);
        setIsUpdateBowlingVisible(false);
    }
    const handleUpdateRuns = (runs) => {
        console.log("updage onew")
        console.log("Update Batt: ", updateBatting)
        updateBatting.runsScored = updateBatting.runsScored + runs;
    };

    const handleUpdateBalls = () => {
        console.log("Update Ball: ", updateBatting.ballFaced)
        updateBatting.ballFaced = updateBatting.ballFaced + 1;
    };

    const handleUpdateFours = () => {
        handleUpdateRuns(4);
        updateBatting.fours = updateBatting.fours + 1;
    };

    const 
    handleUpdateSixes = () => {
        handleUpdateRuns(6);
        updateBatting.sixes = updateBatting.sixes + 1;
    };

    const  handleBowlingBalls = () => {
        console.log("Ball Bowling: ", updateBowling.ball)
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

    const battingRenderItem = ({ item }) => (
        <View style={tailwind`flex-row justify-between py-2 px-4 border-b border-gray-200`}>
            <View style={tailwind`flex-1`}>
                <Text style={tailwind`text-lg font-bold`}>{item.player.name}</Text>
            </View>
            <View style={tailwind`flex-1 flex-row justify-between`}>
                <View style={tailwind`flex-1 text-center`}>
                    <Text style={tailwind`text-lg font-bold`}>{item.runsScored}</Text>
                </View>
                <View style={tailwind`flex-1 text-center`}>
                    <Text style={tailwind`text-lg font-bold`}>{item.ballFaced}</Text>
                </View>
                <View style={tailwind`flex-1 text-center`}>
                    <Text style={tailwind`text-lg font-bold`}>{item.fours}</Text>
                </View>
                <View style={tailwind`flex-1 text-center`}>
                    <Text style={tailwind`text-lg font-bold`}>{item.sixes}</Text>
                </View>
                <View style={tailwind`flex-1 text-center`}>
                    <Text style={tailwind`text-lg font-bold`}>{Math.floor(item.runsScored / item.ballFaced)}</Text>
                </View>
            </View>
            <Pressable onPress={() => handleUpdatePlayerScore(item)}>
                <MaterialIcon name="update" size={24} />
            </Pressable>
        </View>
    );

    const bowlingRenderItem = ({ item }) => (
        <View style={tailwind`flex-row justify-between py-2 px-4 border-b border-gray-200`}>
            <View style={tailwind`flex-1`}>
                <Text style={tailwind`text-lg font-bold`}>{item.player?.name}</Text>
            </View>
            <View style={tailwind`flex-1 flex-row justify-between`}>
                <View style={tailwind`flex-1 text-center`}>
                    <Text style={tailwind`text-lg font-bold`}>{convertBallToOvers(item.ball)}</Text>
                </View>
                <View style={tailwind`flex-1 text-center`}>
                    <Text style={tailwind`text-lg font-bold`}>{item.runs}</Text>
                </View>
                <View style={tailwind`flex-1 text-center`}>
                    <Text style={tailwind`text-lg font-bold`}>{item.wickets}</Text>
                </View>
                <View style={tailwind`flex-1 text-center`}>
                    <Text style={tailwind`text-lg font-bold`}>{item.wide}</Text>
                </View>
                <View style={tailwind`flex-1 text-center`}>
                    <Text style={tailwind`text-lg font-bold`}>{item.noBall}</Text>
                </View>
            </View>
            <Pressable onPress={() => setIsUpdateBowlingVisible(true)}>
                <MaterialIcon name="update" size={24} />
            </Pressable>
        </View>
    );

    console.log("UpdateBatting: ", updateBatting)

    const handleUpdateBatting = async () => {
        try {
            const data = {
                batsman_id: updateBatting.player.id,
                match_id: matchID,
                team_id: currentTeam,
                runs_scored: updateBatting.runsScored,
                balls_faced: updateBatting.ballFaced,
                fours: updateBatting.fours,
                sixes: updateBatting.sixes
            }
            console.log("Data: ", data)
            const authToken = await AsyncStorage.getItem('AccessToken')
            const response = await axiosInstance.put(`${BASE_URL}/Cricket/updateCricketBat`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            })
            console.log("udpagte data; ", response.data)
            setIsUpdateBattingVisible(false)
        } catch (err) {
            console.error("unable to update the batting score: ", err);
        }
    }
    console.log("BattTeam: ", battingData.battingTeam)
    console.log("bowlTeam: ", bowlingData)
    return (
        <View style={tailwind`flex-1 p-4`}>
            <View style={tailwind`flex-row justify-evenly items-center mb-4 `}>
                <Pressable onPress={() => setBatTeam(homeTeamID)} style={tailwind`rounded bg-red-200 p-2`}>
                    <Text style={tailwind`text-lg font-bold`}>{matchData.homeTeam.name }</Text>
                </Pressable>
                <Pressable onPress={() => setBatTeam(awayTeamID)} style={tailwind`rounded bg-red-200 p-2`}>
                    <Text style={tailwind`text-lg font-bold`}>{matchData.awayTeam.name}</Text>
                </Pressable>
            </View>
            <View style={tailwind`flex-1 p-4`}>
                <Text>Batting</Text>
                <FlatList
                    data={battingData.innings}
                    renderItem={battingRenderItem}
                    keyExtractor={(item) => item.player.id.toString()}
                    ListHeaderComponent={() => (
                        <View style={tailwind`flex-row justify-between py-2 px-4 bg-gray-100`}>
                            <Text style={tailwind`text-lg font-bold`}>Batter</Text>
                            <Text style={tailwind`text-lg font-bold`}>R</Text>
                            <Text style={tailwind`text-lg font-bold`}>B</Text>
                            <Text style={tailwind`text-lg font-bold`}>4s</Text>
                            <Text style={tailwind`text-lg font-bold`}>6s</Text>
                            <Text style={tailwind`text-lg font-bold`}>RR</Text>
                        </View>
                    )}
                />
            </View>

            {/* Bowling */}
            <View style={tailwind`flex-1 p-4`}>
                <Text>Bowling</Text>
                <FlatList
                    data={bowlingData.innings}
                    renderItem={bowlingRenderItem}
                    keyExtractor={(item) => item.player.id.toString()}
                    ListHeaderComponent={() => (
                        <View style={tailwind`flex-row justify-between py-2 px-4 bg-gray-100`}>
                            <Text style={tailwind`text-lg font-bold`}>Bowler</Text>
                            <Text style={tailwind`text-lg font-bold`}>O</Text>
                            <Text style={tailwind`text-lg font-bold`}>R</Text>
                            <Text style={tailwind`text-lg font-bold`}>W</Text>
                            <Text style={tailwind`text-lg font-bold`}>WI</Text>
                            <Text style={tailwind`text-lg font-bold`}>NB</Text>
                        </View>
                    )}
                />
            </View>

            {isUpdateBattingVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isUpdateBattingVisible}
                    onRequestClose={() => setIsUpdateBattingVisible(false)}
                >
                    <Pressable style={tailwind`flex-1 justify-end bg-black bg-opacity-50`} onPress={() => setIsUpdateBattingVisible(false)}>
                        <View style={tailwind`p-10 bg-white rounded-xl`}>
                            <Text style={tailwind`text-lg font-bold`}>{updateBatting.player.name}</Text>
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
                            <Pressable onPress={() => handleUpdateBatting()} style={tailwind`border rounded-md p-3 items-center ml-50 mr-50`}>
                                <Text style={tailwind`text-lg font-bold`}>Update Score</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            )}

            {/* bowling Update:  */}

            {isUpdateBowlingVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isUpdateBowlingVisible}
                    onRequestClose={() => setIsUpdateBowlingVisible(false)}
                >
                    <Pressable style={tailwind`flex-1 justify-end bg-black bg-opacity-50`} onPress={() => setIsUpdateBowlingVisible(false)}>
                        <View style={tailwind`p-10 bg-white rounded-xl`}>
                            <Text style={tailwind`text-lg font-bold`}>{updateBowling.player.name}</Text>
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
                                <Text style={tailwind`text-xl`}>RunsConceded:</Text>
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
                                <Text style={tailwind`text-xl`}>NoBall:</Text>
                                <View style={tailwind`flex-row gap-2`}>
                                    <Text style={tailwind`text-lg font-bold`}>{updateBowling.noBall}</Text>
                                    <Pressable style={tailwind`rounded bg-gray-200 p-1`} onPress={() => handleBowlingNoBall()}>
                                        <Text style={tailwind`text-xl`}>+</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <Pressable onPress={() => handleUpdateBowling()} style={tailwind`border rounded-md p-3 items-center ml-50 mr-50`}>
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
