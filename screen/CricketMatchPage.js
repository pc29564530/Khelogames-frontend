import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {View, Text, Pressable} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import TopTabCricketMatchPage from '../navigation/TopTabCricketMatchPage';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const CricketMatchPage = ({route}) => {
    const [data, setData] = useState([]);
    const matchData = route.params.item;
    const axiosInstance = useAxiosInterceptor();
    const navigation= useNavigation();

    useEffect(() => {
        const fetchPlayerScore = async () => {
            try {
                const data = {
                    match_id:matchData.match_id,
                    tournament_id:matchData.tournament_id,
                    team_id:matchData.team1_id
                }
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getCricketTeamPlayerScore`,{
                    params:{
                        match_id:matchData.match_id.toString(),
                        tournament_id:matchData.tournament_id.toString(),
                        team_id:matchData.team1_id.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                const item = response.data;
                if(!item || item === null) {
                    setData([]);
                } else {
                    const resposneWithPlayerProfile = item.map( async (itm, index) => {
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
                    const data = await Promise.all(resposneWithPlayerProfile);
                    setData(data);
                }

            } catch(err) {
                console.error("unable to fetch the match data", err)
            }
        }
        fetchPlayerScore()
    }, [])

    const handleAddPlayerBattingOrBowlingStats = () => {
        navigation.navigate("AddCricketMatchPlayer", {team1ID:matchData.team1_id, team2ID: matchData.team2_id, team1Name: matchData.team1_name, team2Name: matchData.team2_name, tournamentID: matchData.tournament_id, matchID: matchData.match_id});
    }

    const handleEditScore = () => {
        navigation.navigate("EditMatchScore", {team1ID:matchData.team1_id, team2ID: matchData.team2_id, team1Name: matchData.team1_name, team2Name: matchData.team2_name, tournamentID: matchData.tournament_id, matchID: matchData.match_id });
    }

    navigation.setOptions({
        headerTitle:"",
        headerLeft:()=>(
            <Pressable onPress={()=>navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="black" style={tailwind`ml-4`} />
            </Pressable>
        ),
        headerRight: () => (
            <View style={tailwind`flex-row`}>
                <Pressable onPress={() => handleEditScore()} style={tailwind`relative p-2 bg-white items-center justify-center rounded-lg shadow-lg mr-4`}>
                    <FontAwesome name="edit" size={24} color="black" />
                </Pressable>
                {/* {currentRole === "admin" && ( */}
                    <Pressable style={tailwind`relative p-2 bg-white items-center justify-center rounded-lg shadow-lg mr-4`} onPress={() => handleAddPlayerBattingOrBowlingStats()}>
                        <MaterialIcons name="add" size={24} color="black"/>
                    </Pressable>
                {/* )} */}
            </View>
        )
    })
    return (
        <View style={tailwind`flex-1 mt-4`}>
            <View style={tailwind` h-45 bg-black`}>
                {/* //adding the match */}
                <Text>Hello Score</Text>
            </View>
            <TopTabCricketMatchPage team1ID ={matchData.team1_id} team2ID={matchData.team2_id} tournamentID={matchData.tournament_id} matchID={matchData.match_id}/>
        </View>
    );
}

export default CricketMatchPage;