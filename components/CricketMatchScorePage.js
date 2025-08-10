import React, {useEffect, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import axiosInstance from '../screen/axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const fetchScoreboard = async (authToken, axiosInstance, teamID, tournamentID, matchID) => {
    
    const response = await axiosInstance.get(`${BASE_URL}/getCricketTeamPlayerScore`, {
        params:{
            match_id:matchID,
            tournament_id:tournamentID,
            team_id:teamID
        },
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    });
    const item = response.data;
    return item;
}

const fetchClubName = async (authToken, axiosInstance, teamID) => {
    const response = await axiosInstance.get(`${BASE_URL}/getClub/${teamID}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    });
    const item = response.data;
    return item;
}

const CricketMatchScorePage = ({route}) => {
    const [battingTeam1, setBattingTeam1] = useState([]);
    const [battingTeam2, setBattingTeam2] = useState([]);
    const [bowlingTeam1, setBowlingTeam1] = useState([]);
    const [bowlingTeam2, setBowlingTeam2] = useState([]);
    const [clubName1, setClubName1] = useState('');
    const [clubName2, setClubName2] = useState('');
    const [isClubNameVisible, setIsClubNameVisible] = useState('');
    const navigation = useNavigation();

    const {team1ID, team2ID, tournamentID, matchID} = route.params;
    const axiosInstance = axiosInstance()
    useEffect(() => {
        const fetchScoreBoard = async () => {
            try {
                let battingFirstScore = [];
                let battingSecondScore = [];
                let bowlingFirst = [];
                let bowlingSecond = [];
                const authToken  = await AsyncStorage.getItem('AccessToken');
                const team1Score = await fetchScoreboard(authToken, axiosInstance, team1ID, tournamentID, matchID);
                const team2Score = await fetchScoreboard(authToken, axiosInstance, team2ID, tournamentID, matchID);

                const club1 = await fetchClubName(authToken, axiosInstance, team1ID);
                const club2 = await fetchClubName(authToken, axiosInstance, team2ID);
                setClubName1(club1.club_name)
                setClubName2(club2.club_name)
                const addplayerProfile1 = await team1Score.map(async (item, index) => {
                    try {
                        const res = await axiosInstance.get(`${BASE_URL}/getPlayerProfile`, {
                            params: {
                                player_id: item.player_id
                            },
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        return {...item, profile: res.data.player_name};
                    } catch(err) {
                        console.error("unable to get the player profile: ", err);
                    }
                });
                const addplayerProfile2 = await team2Score.map(async (item, index) => {
                    try {
                        const res = await axiosInstance.get(`${BASE_URL}/getPlayerProfile`, {
                            params: {
                                player_id: item.player_id
                            },
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        return {...item, profile: res.data.player_name};
                    } catch(err) {
                        console.error("unable to get the player profile: ", err);
                    }
                });
                const battingFirstWithPlayerProfile = await Promise.all(addplayerProfile1);
                battingFirstWithPlayerProfile.map((item, index) => {
                    if(item.runs_scored>0 || item.balls_faced>0){
                        battingFirstScore.push(item);     
                    }
                    if(item.overs_bowled>0 || item.runs_conceded>0){
                        bowlingFirst.push(item)
                    }
                });
                const battingSecondWithPlayerProfile = await Promise.all(addplayerProfile2);
                battingSecondWithPlayerProfile.map((item, index) => {
                    if(item.runs_scored>0 || item.balls_faced>0){
                        battingSecondScore.push(item);     
                    }
                    if(item.overs_bowled>0 || item.runs_conceded>0){
                        bowlingSecond.push(item)
                    }
                });
                setBattingTeam1(battingFirstScore);
                setBowlingTeam2(bowlingSecond);
                setBattingTeam2(battingSecondScore);
                setBowlingTeam1(bowlingFirst);
            } catch (err) {
                console.error("unable to get the scoreboard: ", err)
            }
        }
        fetchScoreBoard();
    }, []);
    let formattedTeam1Batting=[];
    let formTeam2Bowling=[];
    const battingCol = ["Name", "Run", "Ball",  "4s", "6s"];
    if(Array.isArray(battingTeam1) && battingTeam1.length>0){
        formattedTeam1Batting = battingTeam1.map((itm, index) => [
            itm.profile, itm.runs_scored, itm.balls_faced, itm.fours, itm.sixes
        ]);
    }
    const BatTeam1 = colForm(formattedTeam1Batting);
    const bowlingCol = ["Name", "Overs", "Runs", "Wicket"];
    if(Array.isArray(bowlingTeam2) && bowlingTeam2.length>0){
        formTeam2Bowling = bowlingTeam2.map((itm, index) => [
            itm.profile, itm.overs_bowled, itm.runs_conceded, itm.wickets_taken
        ]);
    }
    const BowlTeam2 = colForm(formTeam2Bowling);
    if(Array.isArray(battingTeam1) && battingTeam1.length>0){
        formattedTeam1Batting = battingTeam2.map((itm, index) => [
            itm.profile, itm.runs_scored, itm.balls_faced, itm.fours, itm.sixes
        ]);
    }
    const BatTeam2 = colForm(formattedTeam1Batting);
    if(Array.isArray(bowlingTeam2) && bowlingTeam2.length>0){
        formTeam2Bowling = bowlingTeam1.map((itm, index) => [
            itm.profile, itm.overs_bowled, itm.runs_conceded, itm.wickets_taken
        ]);
    }
    const BowlTeam1 = colForm(formTeam2Bowling);
    useEffect(() => {
        setIsClubNameVisible(clubName1);
    }, []);
    
    return (
        <View style={tailwind`p-4 bg-white  justify-center mb-2 gap-2`}>
                <View style={tailwind`flex-row justify-evenly items-center`}>
                    <Pressable style={tailwind`shadow-lg bg-orange-500 p-4`} onPress={() => setIsClubNameVisible(clubName1)}>
                        <Text>{clubName1}</Text>
                    </Pressable>
                    <Pressable style={tailwind`shadow-lg bg-orange-500 p-4`} onPress={() => setIsClubNameVisible(clubName2)}>
                        <Text>{clubName2}</Text>
                    </Pressable>
                </View>
                {isClubNameVisible === clubName1 && (
                    <TeamScoreBoard batTeam={BatTeam1} bowlTeam={BowlTeam2} battingCol={battingCol} bowlingCol={bowlingCol}/>
                )   
                }
                {isClubNameVisible === clubName2 && (
                     <TeamScoreBoard batTeam={BatTeam2} bowlTeam={BowlTeam1} battingCol={battingCol} bowlingCol={bowlingCol}/>
                )}
            <View>

            </View>
        </View>
    )
}

const colForm = (item) => {
    return item[0]?.map((_, colIndex) => item.map(data => data[colIndex]));
}

const TeamScoreBoard = ({batTeam, bowlTeam, battingCol, bowlingCol}) => {
    if (!batTeam || batTeam.length === 0) {
        return <Text style={tailwind`text-red-500`}>Not Played / Match Not Started Yet</Text>;
    }
    return (
        
        <>
            <View>
                <View style={tailwind`flex-row justify-between rounded-md shadow-md items-center py-2 border-gray-300 p-3`}>
                    {batTeam?.map((colData, colIndex) => (
                        <View style={tailwind``}>
                            <Text style={tailwind`text-black`}>{battingCol[colIndex]}</Text>
                            {colData?.map((rowData, rowIndex) => (
                                <Text style={tailwind`items-center justify-center mt-2`} key={rowIndex}>{rowData}</Text>
                            ))}
                        </View>
                    ))}
                </View>
                <View style={tailwind`flex-row justify-between rounded-md shadow-md items-center py-2 border-gray-300 p-3 `}>
                    {bowlTeam?.map((colData, colIndex) => (
                        <View style={tailwind``}>
                            <Text style={tailwind`text-black`}>{bowlingCol[colIndex]}</Text>
                            {colData?.map((rowData, rowIndex) => (
                                <Text style={tailwind`items-center justify-center mt-2`} key={rowIndex}>{rowData}</Text>
                            ))}
                        </View>
                    ))}
                </View>
            </View>         
        </>
    );
}

export default CricketMatchScorePage;