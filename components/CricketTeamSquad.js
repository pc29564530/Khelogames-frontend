import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {Text, View, ScrollView, Pressable, Image} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useSelector, useDispatch } from 'react-redux';
import { getTeamPlayers } from '../redux/actions/actions';
import { current } from '@reduxjs/toolkit';
const positions = require('../assets/position.json');

const CricketTeamSquad = ({route}) => {
    const dispatch = useDispatch();
    const axiosInstance = useAxiosInterceptor(); 
    const [currentTeamPlayer, setCurrentTeamPlayer] = useState(null);
    const players = useSelector(state => state.players.players)
    const cricketToss = useSelector(state => state.cricketToss.cricketToss)
    const match = route.params.match;
    const game = useSelector((state) => state.sportReducers.game);

    const homeTeamID = match?.homeTeam?.id;
    const awayTeamID = match?.awayTeam?.id;

    useEffect(() => {
        if (cricketToss) {
            if (cricketToss.tossDecision === "Batting") {
                setCurrentTeamPlayer(cricketToss.tossWonTeam.id === homeTeamID ? homeTeamID : awayTeamID);
            } else {
                setCurrentTeamPlayer(cricketToss.tossWonTeam.id === awayTeamID ? homeTeamID : awayTeamID);
            }
        }
    }, [cricketToss, homeTeamID, awayTeamID]);

    const toggleTeam = (teamID) => {
        setCurrentTeamPlayer(teamID)
    }

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsMemberFunc`, {
                    params:{
                        team_id: currentTeamPlayer.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                dispatch(getTeamPlayers(response.data || []));
            } catch (err) {
                console.error("unable to fetch the team player: ", err);
            }
        }
        fetchPlayers();
    }, [currentTeamPlayer]);

    const selectPosition = (item) => {
        var pos;
        positions["positions"].map(( itm ) => {
            if (itm.code === item) {
                pos =  itm.name;
                return;
            }
        })
        return pos;
    }

    const renderPlayers = () => {
        return (
            <View style={tailwind`flex-1`}>
                {players.map((item, index) => (
                    <View key={index} style={tailwind`mb-4 p-4 bg-white rounded-lg shadow-lg flex-row items-center`}>
                        <Image source={{uri: item.avatarUrl}} style={tailwind`w-10 h-10 rounded-full mr-4 bg-gray-200`} />
                        <View>
                            <Text style={tailwind`text-lg font-semibold`}>{item.player_name}</Text>
                            <View style={tailwind`flex-row justify-evenly items-start gap-5`}>
                                <Text>{selectPosition(item.position)}</Text>
                                <Text>{item.country}</Text>
                            </View>
                        </View>
                       
                    </View>
                ))}
            </View>
        );
    }

    return (
        <ScrollView nestedScrollEnabled={true} style={tailwind`flex-1 p-2 bg-white`}>
            <View style={tailwind`flex-row mb-2 p-2 items-center justify-between gap-2`}>
                <Pressable onPress={() => {toggleTeam(homeTeamID)}} style={[tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`, homeTeamID === currentTeamPlayer ? tailwind`bg-red-400`: tailwind`bg-white`]}>
                    <Text style={tailwind`text-lg font-bold`}>{match.homeTeam.name}</Text>
                </Pressable>
                <Pressable onPress={() => toggleTeam(awayTeamID)} style={[tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`, awayTeamID===currentTeamPlayer?tailwind`bg-red-400`:tailwind`bg-white`]}>
                    <Text style={tailwind`text-lg font-bold`}>{match.awayTeam.name}</Text>
                </Pressable>
            </View>
            <View style={tailwind`flex-row justify-center items-start`}>
                    {renderPlayers()}
            </View>
        </ScrollView>
    )
}

export default CricketTeamSquad;
