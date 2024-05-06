import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {Pressable, Text, View, Modal, TextInput, ScrollView } from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import useAxiosInterceptor from './axios_config';

const EditMatchScore = ({route}) => {
    const [playerTeam1, setPlayerTeam1] = useState([]);
    const [playerTeam2, setPlayerTeam2] = useState([]);
    const [playerID, setPlayerID] = useState('');
    const [isSelectPlayerModal, setIsSelectPlayerModal] = useState(false);
    const [teamID, setTeamID ] = useState('');
    const [editScore, setEditScore] = useState({});
    const [runsScored, setRunsScored] = useState('');
    const [ballsFaced, setBallsFaced] = useState('');
    const [position, setPosition] = useState('');
    const [fours, setFours] = useState('');
    const [sixes, setSixes] = useState('');
    const [wicketsTaken, setWicketsTaken] = useState('');
    const [oversBowled, setOversBowled] = useState('');
    const [wicketTakenBy, setWicketTakenBy] = useState('');
    const [runsConceded, setRunsConceded] = useState('');
    const [wicketOf, setWicketOf] = useState('');
    const [isSelectTeamModal, setIsSelectTeamModal] = useState(false);
    const {team1ID, team2ID, team1Name, team2Name, tournamentID, matchID} = route.params;
    const axiosInstance = useAxiosInterceptor();

    useEffect(() => {
        const fetchPlayerProfie1 = async (teamID)  => {
            try {
                const authToken = await AsyncStorage.getItem('AcessToken');
                    const response = await axiosInstance.get(`${BASE_URL}/getClubMember`, {
                        params: { club_id: teamID.toString() },
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                });
                const item = response.data || [];
                const resposneWithPlayerProfile1 = item.map( async (itm, index) => {
                    const responsePlayerProfile = await axiosInstance.get(`${BASE_URL}/getPlayerProfile`, {
                        params:{
                            player_id:itm.player_id.toString()
                        },
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    })
                    return {...itm, playerProfile: responsePlayerProfile.data}
                })
                const data1 = await Promise.all(resposneWithPlayerProfile1);
                setPlayerTeam1(data1)
                // console.log(playerTeam1)
                
            } catch (err) {
                console.error("unable to get the profile ")
            }
        }
        fetchPlayerProfie1(team1ID);
  }, []);

  useEffect(() => {
    const fetchPlayerProfie2 = async (teamID)  => {
        try {
            const authToken = await AsyncStorage.getItem('AcessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getClubMember`, {
                    params: { club_id: teamID.toString() },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
            });
            const item = response.data || [];
            const resposneWithPlayerProfile2 = item.map( async (itm, index) => {
                const responsePlayerProfile = await axiosInstance.get(`${BASE_URL}/getPlayerProfile`, {
                    params:{
                        player_id:itm.player_id.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                })
                return {...itm, playerProfile: responsePlayerProfile.data}
            })
            const data2 = await Promise.all(resposneWithPlayerProfile2);
            setPlayerTeam2(data2);
            // console.log(playerTeam2)
        } catch (err) {
            console.error("unable to get the profile ")
        }
    }
    fetchPlayerProfie2(team2ID);
  }, [])

  useEffect(()=> {
    const fetchScoreByPlayer = async () => {
        
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getCricketPlayerScore`, {
                params:{
                    match_id: matchID.toString(),
                    tournament_id: tournamentID.toString(),
                    team_id: teamID.toString(),
                    player_id: playerID.toString()
                },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data;
            // console.log("Line no 116: ", item)
            let isMounted = true;
            if(item &&  item !== null) {
                if(isMounted) {
                    setRunsScored(item.runs_scored.toString());
                    setBallsFaced(item.balls_faced.toString());
                    setFours(item.fours.toString());
                    setSixes(item.sixes.toString());
                    setWicketsTaken(item.wickets_taken.toString())
                    setWicketTakenBy(item.wicket_taken_by.toString());
                    setOversBowled(item.overs_bowled.toString());
                    setRunsConceded(item.runs_conceded.toString());
                    setWicketOf(item.wicket_of.toString());
                }
            }
        } catch (err) {
            console.error("unable to get the score of the player: ", err);
        }
    }
    fetchScoreByPlayer();

    return () => {
        isMounted = false;
    }
  }, [playerID])

    const handleUpdateBattingScore = async () => {
        try{
            const battingData = {
                match_id: matchID,
                tournament_id: tournamentID,
                team_id: teamID,
                position: position,
                player_id: playerID,
                runs_scored: runsScored,
                balls_faced: ballsFaced,
                fours: fours,
                sixes: sixes,
                wicket_taken_by: wicketTakenBy,
            }
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.put(`${BASE_URL}/updateCricketMatchScoreBatting`, battingData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })
            const item = response.data || [];
            if(item &&  item !== null) {
                setEditScore(item);
            }
        } catch (err) {
            console.error("Unable to get the ", err)
        }
    }

    const handleUpdateBowlingScore = async () => {
        try{
            const bowlingData = {
                match_id: matchID,
                tournament_id: tournamentID,
                team_id: teamID,
                batting_or_bowling: battingOrBowling,
                position: position,
                player_id: playerID,
                wickets_taken: wicketsTaken,
                overs_bowled: oversBowled,
                runs_conceded: runsConceded,
                wicket_of: wicketOf,
            }
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/updateCricketMatchScoreBowling`, bowlingData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })
        } catch (err) {
            console.error("Unable to get the ", err)
        }
    }

    const handleSelectPlayer = (item) => {
        setPlayerID(item)
        setIsSelectPlayerModal(false);
    }

    const handleSelectTeam = (item) => {
        setTeamID(item);
        setIsSelectTeamModal(false);
    }

    console.log("Line1: ", typeof(runsScored));
    console.log("Line2: ", ballsFaced);
    console.log("Line3: ", fours);
    console.log("Line4: ", sixes);
    console.log("Line5: ", wicketTakenBy);
    console.log("Line6: ", wicketsTaken);
    console.log("Line17: ", oversBowled);
    console.log("Line19: ", runsConceded);
    console.log("Line10: ", wicketOf);

    return (
        <View style={tailwind`flex-1 mt-2`}>
            <View style={tailwind`flex-row`}>
                <Pressable style={tailwind`shadow-lg bg-white p-2`} onPress={() => setIsSelectTeamModal(true)}>
                    <Text>Select Team</Text>
                </Pressable>
                <Pressable style={tailwind`shadow-lg bg-white p-2`} onPress={() => setIsSelectPlayerModal(true)}>
                    <Text>Select Player</Text>
                </Pressable>
            </View>
            <View style={tailwind`mt-2 shadow-lg p-4`} >
                <View>
                    <Text>Batting Update</Text>
                </View>
                <View style={tailwind`flex-row justify-between`}>
                    <Text>Runs Scored</Text>
                    <TextInput value={runsScored} onChangeText={setRunsScored} placeholder='0' style={tailwind`p-2 shadow-lg items-center justify-center`}/>
                </View>
                <View style={tailwind`flex-row justify-between`}>
                    <Text>Ball Faced</Text>
                    <TextInput value={ballsFaced} onChangeText={setBallsFaced} placeholder='0' style={tailwind`p-2 shadow-lg items-center`}/>
                </View>
                <View style={tailwind`flex-row justify-between`}>
                    <Text>Fours</Text>
                    <TextInput value={fours} onChangeText={setFours} placeholder='0' style={tailwind`p-2 shadow-lg items-center`}/>
                </View>
                <View style={tailwind`flex-row justify-between`}>
                    <Text>Sixes</Text>
                    <TextInput value={sixes} onChangeText={setSixes} placeholder='0' style={tailwind`p-2 shadow-lg items-center`}/>
                </View>
                <View style={tailwind`flex-row justify-between`}>
                    <Text>Wicket Taken By</Text>
                    <TextInput value={wicketTakenBy} onChangeText={setWicketTakenBy} placeholder='0' style={tailwind`p-2 shadow-lg items-center`}/>
                </View>
                <Pressable onPress={() => handleUpdateBattingScore()} style={tailwind`shadow-lg p-2 bg-white`}>
                    <Text style={tailwind`text-lg text-black`}>submit</Text>
                </Pressable>
            </View>

            <View>  
                <View>
                    <Text>Bowling Update</Text>
                </View>
                <View style={tailwind`flex-row justify-between`}>
                    <Text>Wicket Taken</Text>
                    <TextInput value={wicketsTaken} onChangeText={setWicketsTaken} placeholder='0' style={tailwind`p-2 shadow-lg items-center`}/>
                </View>
                <View style={tailwind`flex-row justify-between`}>
                    <Text>Overs Bowled</Text>
                    <TextInput value={oversBowled} onChangeText={setOversBowled} placeholder='0.0' style={tailwind`p-2 shadow-lg items-center`}/>
                </View>
                <View style={tailwind`flex-row justify-between`}>
                    <Text>Runs Conceded</Text>
                    <TextInput value={runsConceded} onChangeText={setRunsConceded} placeholder='0' style={tailwind`p-4 shadow-sm`}/>
                </View>
                <View style={tailwind`flex-row justify-between`}>
                    <Text>WicketOf</Text>
                    <TextInput value={wicketOf} onChangeText={setWicketOf} placeholder='0' style={tailwind`p-2 shadow-lg`}/>
                </View>
                <Pressable onPress={() => handleUpdateBowlingScore()} style={tailwind`shadow-lg p-2 bg-white`}>
                    <Text style={tailwind`text-lg text-black`}>submit</Text>
                </Pressable>
            </View>
            {isSelectPlayerModal && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isSelectPlayerModal}
                    onRequestClose={() => setIsSelectPlayerModal(false)}
                >
                    <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-t-lg p-4`}>
                            {team1ID===teamID ? (
                                <ScrollView style={tailwind`bg-white rounded-md p-4`} keyboardShouldPersistTaps='always'>
                                    {playerTeam1?.map((item,index) => (
                                        <Pressable key={index} onPress={() => handleSelectPlayer(item.playerProfile.id)}>
                                            <Text style={tailwind`text-xl py-2`}>{item.playerProfile.player_name}</Text>
                                        </Pressable>
                                    ))}
                               </ScrollView>
                            ):(
                                <ScrollView style={tailwind`bg-white rounded-md p-4`} keyboardShouldPersistTaps='always'>
                                    {playerTeam2?.map((item,index) => (
                                        <Pressable key={index} onPress={() => handleSelectPlayer(item.playerProfile.id)}>
                                            <Text style={tailwind`text-xl py-2`}>{item.playerProfile.player_name}</Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </Modal>
            )}
            {isSelectTeamModal && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isSelectTeamModal}
                    onRequestClose={() => setIsSelectTeamModal(false)}
                >
                    <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-t-lg p-4`}>
                            <Pressable onPress={() => handleSelectTeam(team1ID)} style={tailwind`mb-2 p-2`}>
                                <Text style={tailwind`text-xl`}>{team1Name}</Text>
                            </Pressable>
                            <Pressable onPress={() => handleSelectTeam(team2ID)}>
                                <Text style={tailwind`text-xl`}>{team2Name}</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

export default EditMatchScore;