import { useDebugValue, useEffect, useState } from "react";
import { View, Text, Pressable, Modal, TouchableOpacity, ScrollView, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import tailwind from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAxiosInterceptor from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { AddCricketBatsman } from "./AddCricketBatsman";
import { AddCricketBowler } from "./AddCricketBowler";
import { fetchTeamPlayers } from "../services/teamServices";
import CricketBattingScorecard from "./CricketBattingScorecard";
import CricketBowlingScorecard from "./CricketBowlingScorecard";
import CricketWicketCard from "./CricketWicketCard";
import { UpdateCricketScoreCard } from "./UpdateCricketScoreCard";
import { useDispatch, useSelector } from "react-redux";
import SetCurrentBowler from "./SetCurrentBowler";
import { getCricketBattingScore, getCricketBowlingScore, getCricketMatchInningScore, getCricketWicketFallen } from "../redux/actions/actions";


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
    const [wicketType, setWicketType] = useState("");
    const [selectedBowlerType, setSelectedBowlerType] = useState("");
    const [battingData, setBattingData] = useState(null)
    const [isModalBattingVisible, setIsModalBattingVisible] = useState(false);
    const [isModalBowlingVisible, setIsModalBowlingVisible] = useState(false);
    const [bowlingData, setBowlingData] = useState([]);
    const [batTeam, setBatTeam] = useState(match?.homeTeam?.id);
    const [homePlayer, setHomePlayer] = useState([]);
    const [awayPlayer, setAwayPlayer] = useState([]);
    const [isWicketModalVisible,setIsWicketModalVisible] = useState(false);
    const [isUpdateScoreCardModal, setIsUpdateScoreCardModal] = useState(false);
    const [isYetToBatModalVisible, setIsYetToBatModalVisible] = useState(false);
    const [isFielder, setIsFielder] = useState(false);
    const [selectedFielder, setSelectedFielder] = useState();
    const [wicketsData, setWicketsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [addCurrentScoreEvent, setAddCurrentScoreEvent] = useState([]);
    const currentScoreEvent = ["No Ball", "Wicket", "Wide", "Leg Bye"];
    const wicketTypes = ["Run Out", "Stamp", "Catch", "Hit Wicket", "Bowled", "LBW"];
    const [selectNextBowler, setSelectNextBowler] = useState(bowling.innings);   
    const homeTeamID = match?.homeTeam?.id;
    const awayTeamID = match?.awayTeam?.id;
    const runsCount = [0, 1, 2, 3, 4, 5, 6, 7];


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
                    params: { match_id: match.id.toString(), team_id: homeTeamID===batTeam?homeTeamID.toString(): awayTeamID.toString() },
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
    }, [batTeam]);

    useEffect(() => {
        const fetchBowling = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const bowlingScore = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketBowlerFunc`, {
                    params: { match_id: match.id, team_id: awayTeamID!==batTeam?awayTeamID: homeTeamID },
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                setBowlingData(bowlingScore.data || []);
                dispatch(getCricketBowlingScore(bowlingScore?.data || []))
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
    }, []);

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
                    team_id: batTeam,
                }
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketWickets`, {
                    params: {
                        "match_id": match.id.toString(),
                        "team_id": batTeam.toString()
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
    }, [batTeam]);

    const currentFielder = homeTeamID !== batTeam
    ? homePlayer?.filter(
        (player) => 
            !bowlingData?.innings?.some(
                (bowler) => bowler.is_current_bowler && bowler.player.id === player.id
            )
      ) || []
    : awayPlayer?.filter(
        (player) => 
            !bowlingData?.innings?.some(
                (bowler) => bowler.is_current_bowler && bowler.player.id === player.id
            )
      ) || [];

      const bowlerToBeBowled = batTeam.id !== homeTeamID ? awayPlayer?.filter((player) => !bowling?.innings.some(
        (bowler) => bowler.bowling_status && bowler.player.id === player.id
      )) : homePlayer?.filter((player) => !bowling?.innings.some(
        (bowler) => bowler.bowling_status && bowler.player.id === player.id
      ));

    const existingBowler = (batTeam.id !== homeTeamID ? awayPlayer : homePlayer)?.filter((player) => 
        bowling?.innings.some((bowler) => bowler.is_current_bowler && bowler.player.id === player.id)
      );
      


      const handleToggle = (item) => {
        if(item==="newBowler") {
           setSelectNextBowler(bowlerToBeBowled);
        } else {
           setSelectNextBowler(existingBowler);
        }
      }

      const handleSelectBowler = () => {
        if (selectedBowlerType === "existingBowler"){
            return (
                <SetCurrentBowler match={match} batTeam={batTeam} homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch} bowling={bowling}/>
            )
        } else {
            return (
                <AddCricketBowler match={match} batTeam={batTeam}  homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch} bowler={bowlerToBeBowled}/>
            )
        }
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
                <ScrollView style={tailwind`bg-white`}>
                    <View style={tailwind`flex-row mb-2 p-2 items-center justify-between gap-2`}>
                        <Pressable onPress={() => setBatTeam(homeTeamID)} style={[tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`, homeTeamID === batTeam ? tailwind`bg-red-400`: tailwind`bg-white`]}>
                            <Text style={tailwind`text-lg font-bold`}>{match.homeTeam.name}</Text>
                        </Pressable>
                        <Pressable onPress={() => setBatTeam(awayTeamID)} style={[tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`, awayTeamID===batTeam?tailwind`bg-red-400`:tailwind`bg-white`]}>
                            <Text style={tailwind`text-lg font-bold`}>{match.awayTeam.name}</Text>
                        </Pressable>
                    </View>
                    {batting?.innings?.length > 0 ? (
                        <View style={tailwind``}>
                                <View style={tailwind`bg-white mb-2 p-2 justify-between`}>
                                    <Pressable style={tailwind`p-2 bg-white rounded-lg shadow-lg items-center`} onPress={() => setIsUpdateScoreCardModal(true)}>
                                        <Text style={tailwind`text-xl`}>Update Score</Text>
                                    </Pressable>
                                </View>
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
                {isModalBattingVisible && (
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={isModalBattingVisible}
                        onRequestClose={() => setIsModalBattingVisible(false)}
                    >  
                        <Pressable onPress={() => setIsModalBattingVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                            <View style={tailwind`bg-white rounded-md p-4`}>
                                <AddCricketBatsman match={match} batTeam={batTeam}  homePlayer={homePlayer} awayPlayer={awayPlayer} game={game} dispatch={dispatch}/>
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
                        <Pressable 
                            onPress={() => setIsModalBowlingVisible(false)} 
                            style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                        >
                            <View style={tailwind`bg-white rounded-t-3xl p-6 pb-10 shadow-lg`}>
                                <Text style={tailwind`text-lg font-semibold text-center mb-4 text-gray-800`}>
                                    Select Next Bowler
                                </Text>
                                <View style={tailwind`flex-row justify-around mb-6`}>
                                    <Pressable 
                                        onPress={() => {setSelectedBowlerType("newBowler"), handleToggle("newBowler")}} 
                                        style={[tailwind`px-4 py-2 bg-blue-500 rounded-full shadow-md`, selectedBowlerType === "newBowler" ? tailwind`bg-blue-200` : tailwind`bg-gray-200`]}
                                    >
                                        <Text style={tailwind`${selectedBowlerType === "newBowler" ? "text-white" : "text-gray-800"} font-semibold`}>New Bowler</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => {setSelectedBowlerType("existingBowler"), handleToggle("existingBowler")}} 
                                        style={[tailwind`px-4 py-2 bg-gray-300 rounded-full shadow-md`, selectedBowlerType === "existingBowler" ? tailwind`bg-blue-200` : tailwind`bg-gray-200`]}
                                    >
                                        <Text style={tailwind`${selectedBowlerType === "existingBowler" ? "text-white" : "text-gray-800"} font-semibold`}>Existing Bowler</Text>
                                    </Pressable>
                                </View>
                                <View style={tailwind`max-h-60`}>
                                    <ScrollView style={tailwind`border border-gray-300 rounded-lg p-2`}>
                                        {selectNextBowler.map((item, index) => (
                                            <Pressable 
                                                key={index} 
                                                onPress={() => handleSelectBowler(item)}
                                                style={tailwind`p-3 mb-2 bg-gray-100 rounded-lg border border-gray-200`}
                                            >
                                                <Text style={tailwind`text-gray-900 font-medium text-center`}>
                                                    {item.player_name}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Close Button */}
                                <Pressable 
                                    onPress={() => setIsModalBowlingVisible(false)}
                                    style={tailwind`mt-6 p-3 bg-red-500 rounded-full`}
                                >
                                    <Text style={tailwind`text-white text-center font-semibold`}>Close</Text>
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
                            <UpdateCricketScoreCard currentScoreEvent={currentScoreEvent} isWicketModalVisible={isWicketModalVisible} setIsWicketModalVisible={setIsWicketModalVisible} addCurrentScoreEvent={addCurrentScoreEvent} setAddCurrentScoreEvent={setAddCurrentScoreEvent} runsCount={runsCount} wicketTypes={wicketTypes} game={game} wicketType={wicketType} setWicketType={setWicketType} selectedFielder={selectedFielder} batting={batting} bowling={bowling} dispatch={dispatch} batTeam={batTeam} />
                        </Pressable>
                    </Modal>
                )}
                {isFielder && (
                    <Modal
                        transparent={true}
                        visible={isFielder}
                        animationType="slide"
                        onRequestClose={() => setIsFielder(false)}
                    >
                        <Pressable style={tailwind`flex-1 justify-end bg-black bg-opacity-50`} onPress={() => setIsFielder(false)}>
                            <View style={tailwind`p-10 bg-white rounded-xl`}>
                                {currentFielder.map((item,index) => (
                                    <Pressable key={index} onPress={() => {setSelectedFielder(item); setIsFielder(false)}}>
                                        <Text>{item.player_name}</Text>
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