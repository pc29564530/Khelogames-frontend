import { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, Modal, TouchableOpacity } from 'react-native';
import {Picker} from '@react-native-picker/picker';

import tailwind from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAxiosInterceptor from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const convertBallToOvers = (item) => {
    const overs = Math.floor(item/6);
    const remainingBall = item%6;
    return `${overs}.${remainingBall}`;
}

const convertOversToBalls = (item) => {
    const radian = item*(Math.PI/180)
    const balls = Math.floor(radian*6)
    return balls
}

const wicketsTypes = [
    {  key:1, label: 'Bowled', value: 'bowled' },
    { key:2,label: 'Caught', value: 'caught' },
    { key:3,label: 'Stamp', value: 'stamp' },
    { key:4,label: 'RunOut', value: 'runOut' },
    { key:5, label: 'LBW', value: 'lbw' }
];

const wicketsNumber = [
    {  key:1, label: 'First', value: 1 },
    { key:2,label: 'Second', value: 2 },
    { key:3,label: 'Third', value: 3 },
    { key:4,label: 'Fourth', value: 4 },
    { key:5, label: 'Fifth', value: 5 },
    {  key:6, label: 'Sixth', value: 6 },
    { key:7,label: 'Seventh', value: 7 },
    { key:8,label: 'Eighth', value: 8 },
    { key:9,label: 'Ninth', value: 9 },
    { key:10, label: 'Tenth', value: 10 }
];

const CricketScoreCard = ({ route }) => {
    const axiosInstance = useAxiosInterceptor();
    const [updateBatting, setUpdateBatting] = useState(null);
    const [updateBowling, setUpdateBowling] = useState(null);
    const [currentBatsman, setCurrentBatsman] = useState();
    const [currentBowler, setCurrentBowler] = useState();
    const [wicketType, setWicketType] = useState("");
    const [ballNumber, setBallNumber] = useState();
    const [wicketNumber, setWicketNumber] = useState();
    const [isWicketModalVisible,setIsWicketModalVisible] = useState(false);
    const [isUpdateBattingVisible, setIsUpdateBattingVisible] = useState(false);
    const [isUpdateBowlingVisible, setIsUpdateBowlingVisible] = useState(false);
    const [showWicketNumberPicker, setShowWicketNumberPicker] = useState(false);
    const [showWicketTypePicker, setShowWicketTypePicker] = useState(false);
    const [showBatsmanPicker, setShowBatsmanPicker] = useState(false);
    const [showBowlerPicker, setShowBowlerPicker] = useState(false);
    const [showOversPicker, setShowOverPicker] = useState(false);
    const { matchData, matchID, homeTeamID, awayTeamID } = route.params;
    const [battingData, setBattingData] = useState([]);
    const [bowlingData, setBowlingData] = useState([]);
    const [batTeam, setBatTeam] = useState(homeTeamID);
    const [ballTeam, setBallTeam] = useState(awayTeamID);
    const [wicketFall, setWicketFall] = useState([]);

    useEffect(() => {
        const fetchBatting = async () => {
            try {
                const temp = {
                    match_id: matchID,
                    team_id: batTeam===homeTeamID?homeTeamID:awayTeamID,
                };
                const authToken = await AsyncStorage.getItem('AccessToken');
                const battingScore = await axiosInstance.get(`${BASE_URL}/Cricket/getPlayerScoreFunc`, {
                    params: temp,
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
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
                console.log("Bowling Data Temp: ", temp)
                const authToken = await AsyncStorage.getItem('AccessToken');
                const bowlingScore = await axiosInstance.get(`${BASE_URL}/Cricket/getCricketBowlerFunc`,  {
                    params: temp,
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log("Bowling Score: ", bowlingScore.data)
                setBallTeam(bowlingScore.data.bowlingTeam || {});
                setBowlingData(bowlingScore.data || []);
            } catch (err) {
                console.error("unable to fetch bowling score: ", err);
            }
        };
        fetchBowling();
    }, [batTeam]);


    useEffect(() => {
        const fetchFallOfWickets = async () => {
            try {
                const temp = {
                    match_id: matchID,
                    team_id: batTeam===homeTeamID?homeTeamID:awayTeamID,
                };
                const authToken = await AsyncStorage.getItem('AccessToken');
                const wicketFallen = await axiosInstance.get(`${BASE_URL}/Cricket/getCricketWickets`,  {
                    params: temp,
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                setWicketFall(wicketFallen.data || []);
            } catch (err) {
                console.error("unable to fetch bowling score: ", err);
            }
        };
        fetchFallOfWickets();
    }, [batTeam]);

    const handleFallOfWickets = async () => {
        try {
            const temp = {
                match_id: matchID,
                team_id: batTeam===homeTeamID?homeTeamID:awayTeamID,
                batsman_id: currentBatsman,
                bowler_id: currentBowler,
                wickets_number: wicketNumber,
                wicket_type: wicketType,
                ball_number: ballNumber
            };
            console.log("Temp Data: ", temp)
            const authToken = await AsyncStorage.getItem('AccessToken');
            const wicketFallen = await axiosInstance.post(`${BASE_URL}/Cricket/addCricketWicket`, temp, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setIsWicketModalVisible(false);
            setWicketFall(wicketFallen.data || []);
            setShowOverPicker(false);
        } catch (err) {
            console.error("unable to fetch bowling score: ", err);
        }
    }

    const handleUpdatePlayerScore = (item) => {
        setUpdateBatting(item);
        setIsUpdateBattingVisible(true);
    };

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

    const 
    handleUpdateSixes = () => {
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

    const battingRenderItem = ({ item }) => (
        <View style={tailwind`flex-row justify-between py-2 px-4 border-b border-gray-200`}>
            <View style={tailwind`flex-1`}>
                <Text style={tailwind`text-lg font-bold`}>{item?.player?.name}</Text>
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
                <Text style={tailwind`text-lg font-bold`}>{item?.player?.name}</Text>
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
            <Pressable onPress={() => handleUpdatePlayerBowling(item)}>
                <MaterialIcon name="update" size={24} />
            </Pressable>
        </View>
    );



    const handleUpdateBatting = async () => {
        try {
            const data = {
                batsman_id: updateBatting.player.id,
                match_id: matchID,
                team_id: bowlingData.bowlingTeam.id,
                runs_scored: updateBatting.runsScored,
                balls_faced: updateBatting.ballFaced,
                fours: updateBatting.fours,
                sixes: updateBatting.sixes
            }
            const authToken = await AsyncStorage.getItem('AccessToken')
            const response = await axiosInstance.put(`${BASE_URL}/Cricket/updateCricketBat`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            })
            setIsUpdateBattingVisible(false)
        } catch (err) {
            console.error("unable to update the batting score: ", err);
        }
    }

    const handleUpdateBowling = async () => {
        try {
            const data = {
                bowler_id: updateBowling.player.id,
                match_id: matchID,
                team_id: bowlingData.bowlingTeam.id,
                ball: updateBowling.ball,
                runs: updateBowling.runs,
                wickets: updateBowling.wickets,
                wide: updateBowling.wide,
                no_ball: updateBowling.noBall
            }
            const authToken = await AsyncStorage.getItem('AccessToken')
            const response = await axiosInstance.put(`${BASE_URL}/Cricket/updateCricketBall`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            })
            setIsUpdateBowlingVisible(false)
        } catch (err) {
            console.error("unable to update the bowling data: ", err);
        }
    }

    const handleWicketFallen = () => {
        setIsWicketModalVisible(true);
    }

    const handleWicketsBall = (item) => {
        item.ball = item.ball+1;
        setBallNumber(item.ball);
        setShowOverPicker(false);
    }

    console.log("Batsman Data: ", battingData)
    console.log("Bowing Data: ", bowlingData)
    console.log("Wicket Fall: ", wicketFall)

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

            {/* Fall of Wickets:  */}

            <View style={tailwind`flex-1 p-4`}>
                <Text styl={tailwind`text-2xl`}>Fall of Wickets </Text>
                <Pressable onPress={() => handleWicketFallen()} style={tailwind`items-end border p-2`}>
                    <Text styl={tailwind`text-xl`}>Add Wickets Fall</Text>
                </Pressable>
                <FlatList 
                    data={wicketFall}
                    keyExtractor={(item) => item.battingTeam.id.toString()}
                    ListHeaderComponent={() => (
                        <View style={tailwind`flex-row justify-between py-2 px-4 bg-gray-100`}>
                            <Text style={tailwind`text-lg font-bold`}>Wkt No.</Text>
                            <Text style={tailwind`text-lg font-bold`}>Player</Text>
                            <Text style={tailwind`text-lg font-bold`}>Score</Text>
                            <Text style={tailwind`text-lg font-bold`}>Over</Text>
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


        {/* Wicket Fallen */}
        {isWicketModalVisible && (
                <Modal
                animationType="slide"
                transparent={true}
                visible={isWicketModalVisible}
                onRequestClose={() => setIsWicketModalVisible(false)}
              >
                <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                  <View style={tailwind`bg-white rounded-md shadow-md p-4`}>
                    <Text style={tailwind`text-2xl font-bold mb-4`}>Fall of Wickets</Text>

                    <View style={tailwind`flex flex-row justify-between mb-4`}>
                      <Text style={tailwind`text-lg`}>Batsman</Text>
                      <TouchableOpacity onPress={() => setShowBatsmanPicker(true)}>
                        <MaterialIcon name="add" size={24} />
                      </TouchableOpacity>
                    </View>

                    <View style={tailwind`flex flex-row justify-between mb-4`}>
                      <Text style={tailwind`text-lg`}>Bowler</Text>
                      <TouchableOpacity onPress={() => setShowBowlerPicker(true)}>
                      <MaterialIcon name="add" size={24} />
                      </TouchableOpacity>
                    </View>
              
                    <View style={tailwind`flex flex-row justify-between mb-4`}>
                      <Text style={tailwind`text-lg`}>Wicket Type</Text>
                      <TouchableOpacity onPress={() => setShowWicketTypePicker(true)}>
                        <MaterialIcon name="add" size={24} />
                      </TouchableOpacity>
                    </View>
              
                    <View style={tailwind`flex flex-row justify-between mb-4`}>
                      <Text style={tailwind`text-lg`}>Wicket Number</Text>
                      <TouchableOpacity onPress={() => setShowWicketNumberPicker(true)}>
                      <MaterialIcon name="add" size={24} />
                      </TouchableOpacity>
                    </View>
              
                    <View style={tailwind`flex flex-row justify-between mb-4`}>
                      <Text style={tailwind`text-lg`}>Overs</Text>
                      <TouchableOpacity onPress={() => setShowOverPicker(true)}>
                      <MaterialIcon name="add" size={24} />
                      </TouchableOpacity>
                    </View>
              
                    <Pressable
                      onPress={() => handleFallOfWickets()}
                      style={tailwind`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md`}
                    >
                      <Text style={tailwind`text-lg`}>Update Bowling</Text>
                    </Pressable>
                  </View>
                </View>

                {showBatsmanPicker && (
                  <Modal animationType="slide" transparent={true} visible={showBatsmanPicker}>
                        <Pressable
                            style={tailwind`flex-1 justify-center bg-black bg-opacity-50`}
                            onPress={() => setShowBatsmanPicker(false)}
                        >
                            <View style={tailwind`bg-white rounded-md shadow-md p-4 m-40`}>
                                <FlatList
                                    data={battingData?.innings}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => {
                                            setCurrentBatsman(item.player.id);
                                            setShowBatsmanPicker(false);
                                        }}>
                                            <Text style={tailwind`text-lg`}>{item.player.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item) => item.player.id.toString()}
                                />
                            </View>
                        </Pressable>
                  </Modal>
                )}
              
              {showBowlerPicker && (
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showBowlerPicker}
                        onRequestClose={() => setShowBowlerPicker(false)}
                    >
                        <Pressable
                            style={tailwind`flex-1 justify-center bg-black bg-opacity-50`}
                            onPress={() => setShowBowlerPicker(false)}
                        >
                            <View style={tailwind`bg-white rounded-md shadow-md p-4 m-40`}>
                                <FlatList
                                    data={bowlingData?.innings}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setCurrentBowler(item.player.id);
                                                setShowBowlerPicker(false);
                                            }}
                                        >
                                            <Text style={tailwind`text-lg`}>{item.player.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item) => item.player.id.toString()}
                                />
                            </View>
                        </Pressable>
                    </Modal>
                )}

              
                {showWicketTypePicker && (
                  <Modal animationType="slide" transparent={true} visible={showWicketTypePicker}>
                    <Pressable
                            style={tailwind`flex-1 justify-center bg-black bg-opacity-50`}
                            onPress={() => setShowWicketTypePicker(false)}
                        >
                        <View style={tailwind`bg-white rounded-md shadow-md p-4 m-40`}>
                            <FlatList
                                data={wicketsTypes}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => {
                                        setWicketType(item.value);
                                        setShowWicketTypePicker(false);
                                    }}>
                                        <Text style={tailwind`text-lg`}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item.key.toString()}
                            />
                        </View>
                    </Pressable>
                  </Modal>
                )}
              
                {showWicketNumberPicker && (
                  <Modal animationType="slide" transparent={true} visible={showWicketNumberPicker}>
                    <Pressable
                            style={tailwind`flex-1 justify-center bg-black bg-opacity-50`}
                            onPress={() => setShowBowlerPicker(false)}
                        >
                        <View style={tailwind`bg-white rounded-md shadow-md p-4 m-40`}>
                            <FlatList
                            data={wicketsNumber}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => {
                                    setWicketNumber(item.value);
                                    setShowWicketNumberPicker(false);
                                }}>
                                    <Text style={tailwind`text-lg`}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.key.toString()}
                            />
                    </View>
                    </Pressable>
                  </Modal>
                )}
                {showOversPicker && (
                  <Modal animationType="slide" transparent={true} visible={showOversPicker} onRequestClose={() => setShowOverPicker(false)}>
                    <Pressable
                            style={tailwind`flex-1 justify-center bg-black bg-opacity-50`}
                            onPress={() => setShowOverPicker(false)}
                        >
                        <View style={tailwind`bg-white rounded-md shadow-md p-4 m-40`}>
                            {bowlingData.innings.map((item,index) => (

                                    <TouchableOpacity key={index} onPress={() => {handleWicketsBall(item)}}>
                                        {console.log("Itme: ", item)}
                                        {console.log("Player: ", item.player.id)}
                                        {console.log("current Bowler: ", currentBowler)}
                                    {item.player.id === currentBowler  && (
                                        <Text style={tailwind`text-lg`}>Balls Bowled: {item.ball}</Text>
                                    )}
                                    </TouchableOpacity>
                            ))}
                    </View>
                    </Pressable>
                  </Modal>
                )}
              </Modal>
            )}
        </View>
    );
};

export default CricketScoreCard;
