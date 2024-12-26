import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {Text, View, ScrollView, Pressable, Image} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useSelector } from 'react-redux';
const positions = require('../assets/position.json');

const CricketTeamSquad = ({route}) => {
    const [homePlayer, setHomePlayer] = useState([]);
    const [awayPlayer, setAwayPlayer] = useState([]);
    const [team1ModalVisible, setTeam1ModalVisible] = useState(true);
    const [team2ModalVisible, setTeam2ModalVisible] = useState(false);
    const axiosInstance = useAxiosInterceptor();    
    const matchData = route.params.matchData;
    const game = useSelector((state) => state.sportReducers.game);

    const handleToggle = (teamId) => {
        if (matchData.homeTeam.id === teamId) {
            setTeam1ModalVisible(true);
            setTeam2ModalVisible(false);
        } else {
            setTeam1ModalVisible(false);
            setTeam2ModalVisible(true);
        }
    };

    useEffect(() => {
        const fetchHomePlayer = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const homeResponse = await axiosInstance.get(`${BASE_URL}/Cricket/getTeamsMemberFunc`, {
                    params:{
                        team_id: matchData.homeTeam.id.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                setHomePlayer(homeResponse.data || []);
            } catch (err) {
                console.error("unable to fetch the team player: ", err);
            }
        }
        const fetchAwayPlayer = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const awayResponse = await axiosInstance.get(`${BASE_URL}/Cricket/getTeamsMemberFunc`, {
                    params:{
                        team_id: matchData.awayTeam.id.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                setAwayPlayer(awayResponse.data || []);
            } catch (err) {
                console.error("unable to fetch the team player: ", err);
            }
        }
        fetchHomePlayer();
        fetchAwayPlayer();
    }, []);


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

    const renderPlayers = (players) => {
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
        <ScrollView style={tailwind`flex-1 p-2 bg-white`}>
            <View style={tailwind`flex-row justify-evenly items-center mb-6 gap-2 `}>
                <Pressable 
                    style={[
                        tailwind`flex-1 p-2 rounded-lg items-center rounded-lg shadow-lg`,
                        team1ModalVisible ? tailwind`bg-red-400` : tailwind`bg-white`
                    ]}
                    onPress={() => handleToggle(matchData.homeTeam.id)}
                > 
                    <Text style={tailwind`text-xl font-bold text-gray`}>{matchData?.homeTeam?.name}</Text>
                </Pressable>
                <Pressable 
                    style={[
                        tailwind`flex-1 p-2 rounded-lg items-center rounded-lg shadow-lg`,
                        team2ModalVisible ? tailwind`bg-red-400` : tailwind`bg-white`
                    ]}
                    onPress={() => handleToggle(matchData.awayTeam.id)}
                >
                    <Text style={tailwind`text-xl font-bold text-gray`}>{matchData?.awayTeam?.name}</Text>
                </Pressable>
            </View>
            <View style={tailwind`flex-row justify-center items-start`}>
                {team1ModalVisible && (
                    <View style={tailwind`flex-1`}>
                        {renderPlayers(homePlayer)}
                    </View>
                )}
                {team2ModalVisible && (
                    <View style={tailwind`flex-1`}>
                        {renderPlayers(awayPlayer)}
                    </View>
                )}
            </View>
        </ScrollView>
    )
}

export default CricketTeamSquad;
