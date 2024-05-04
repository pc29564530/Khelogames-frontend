import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, Text, Pressable, Modal, ScrollView } from 'react-native';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';

const AddCricketMatchPlayer = ({route}) => {
  const {team1ID, team2ID, team1Name, team2Name, tournamentID, matchID} = route.params;
  const [playerTeam1, setPlayerTeam1] = useState([]);
  const [playerTeam2, setPlayerTeam2] = useState([]);
  const [teamID, setTeamID] = useState();
  const [battingOrBowling, setBattingOrBowling] = useState('');
  const [position, setPosition] = useState(0);
  const [playerID, setPlayerID] = useState();
  const [runsScored, setRunsScored] = useState('');
  const [ballsFaced, setBallsFaced] = useState('');
  const [fours, setFours] = useState('');
  const [sixes, setSixes] = useState('')
  const [wicketsTaken, setWicketsTaken] = useState('');
  const [oversBowled, setOversBowled] = useState('0.0');
  const [runsConceded, setRunsConceded] = useState('');
  const [wicketTakenBy, setWicketTakenBy] = useState('');
  const [wicketOf, setWicketOf] = useState('');
  const [isSelectPlayerModal, setIsSelectPlayerModal] =  useState(false);
  const [isSelectTeamModal, setIsSelectTeamModal] = useState(false);
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
                console.log(playerTeam1)
                
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
            console.log(playerTeam2)
        } catch (err) {
            console.error("unable to get the profile ")
        }
    }
    fetchPlayerProfie2(team2ID);
  }, [])

  const handleSubmit = async () => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const data = {
            match_id: matchID,
            tournament_id: tournamentID,
            team_id: teamID,
            batting_or_bowling: battingOrBowling,
            position: position,
            player_id: playerID,
            runs_scored: runsScored,
            balls_faced: ballsFaced,
            fours: fours,
            sixes: sixes,
            wickets_taken: wicketsTaken,
            overs_bowled: oversBowled,
            runs_conceded: runsConceded,
            wicket_taken_by: wicketTakenBy,
            wicket_of: wicketOf,
        }

        const response = await axiosInstance.post(`${BASE_URL}/addCricketTeamPlayerScore`, data, {
            headers:{
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
            }
        });

      Alert.alert('Success', 'Cricket team player score added successfully');   
      
    } catch (error) {
      Alert.alert('Error', 'Failed to add cricket team player score');
      console.error('Error adding cricket team player score:', error);
    }
  };

  const handleAddPlayer = (selectedItem) => {
    setPlayerID(selectedItem.playerProfile.id)
    setIsSelectPlayerModal(false);
  }

  const handleSelectTeam = (item) => {
    setTeamID(item);
    setIsSelectTeamModal(false);
  }

  return (
    <View style={tailwind`flex-1 mt-2`}>
        <View style={tailwind`flex-row gap-2`}>
            <Pressable style={tailwind`shadow-lg bg-white p-2`} onPress={() => setIsSelectTeamModal(true)}>
                <Text style={tailwind`text-black text-xl`}>Select Team</Text>
            </Pressable>
            <Pressable  style={tailwind`shadow-lg bg-white p-2`} onPress={() => setIsSelectPlayerModal(true)} >
                <Text style={tailwind`text-black text-xl`}>Add Player</Text>
            </Pressable>
        </View>
        <View style={tailwind`mt-2 shadow-lg p-4`}>
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
            <Pressable onPress={() => handleSubmit()} style={tailwind`shadow-lg p-2 bg-white`}>
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
                                        <Pressable key={index} onPress={() => handleAddPlayer(item)}>
                                            <Text style={tailwind`text-xl py-2`}>{item.playerProfile.player_name}</Text>
                                        </Pressable>
                                    ))}
                               </ScrollView>
                            ):(
                                <ScrollView style={tailwind`bg-white rounded-md p-4`} keyboardShouldPersistTaps='always'>
                                    {playerTeam2?.map((item,index) => (
                                        <Pressable key={index} onPress={() => handleAddPlayer(item)}>
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
};

export default AddCricketMatchPlayer;
