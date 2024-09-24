import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState , useEffect} from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
const positions = require('../assets/position.json');

const FootballLineUp = ({ route }) => {
    const [homeModalVisible, setHomeModalVisible] = useState(true);
    const [awayModalVisible, setAwayModalVisible] = useState(false);
    const [homePlayer, setHomePlayer] = useState([]);
    const [awayPlayer, setAwayPlayer] = useState([]);
    const axiosInstance = useAxiosInterceptor();
    const matchData = route.params.matchData;
    const handleToggle = (team) => {
        if (team === 'homeTeam') {
            setHomeModalVisible(true);
            setAwayModalVisible(false);
        } else if (team === 'awayTeam') {
            setHomeModalVisible(false);
            setAwayModalVisible(true);
        }
    };

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

    useEffect(() => {
        const fetchHomePlayer = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const homeResponse = await axiosInstance.get(`${BASE_URL}/Football/getTeamsMemberFunc`, {
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
                const awayResponse = await axiosInstance.get(`${BASE_URL}/Football/getTeamsMemberFunc`, {
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


    const renderPlayers = (players) => {
        return (
            <View style={tailwind`flex-1`}>
                {players.map((item, index) => (
                    <View key={index} style={tailwind`mb-4 p-4 bg-white rounded-lg shadow-lg flex-row items-center`}>
                        <Image source={{uri: item.avatarUrl}} style={tailwind`w-10 h-10 rounded-full mr-4 bg-gray-200`} />
                        <View>
                            <Text style={tailwind`text-lg font-semibold`}>{item.player_name}</Text>
                            <View style={tailwind`flex-row justify-evenly items-start gap-5`}>
                                <Text>{selectPosition(item?.position)}</Text>
                                <Text>{item.country}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    return (
        <ScrollView style={tailwind`flex-1 p-4`}>
            <View style={tailwind`flex-row justify-evenly  items-center ml-2 mr-2 gap-2`}>
                <Pressable style={[tailwind` flex-1 mt-2 bg-red-400 shadow-lg p-2 rounded-lg items-center `, homeModalVisible?tailwind`bg-blue-200`:tailwind`bg-red-400`] } onPress={() => handleToggle('homeTeam')}> 
                    <Text style={tailwind`text-xl font-bold mb-2`}>{matchData.homeTeam.name}</Text>
                </Pressable>
                <Pressable style={[tailwind` flex-1 mt-2 bg-red-400 shadow-lg p-2 rounded-lg items-center `, awayModalVisible?tailwind`bg-blue-200`:tailwind`bg-red-400`]} onPress={() => handleToggle('awayTeam')}>
                    <Text style={tailwind`text-xl font-bold mb-2`}>{matchData.awayTeam.name}</Text>
                </Pressable>
            </View>
            <View style={tailwind`flex-row justify-between items-start`}>
                {homeModalVisible && (
                    <View>
                        {renderPlayers(homePlayer)}
                    </View>
                )}
                {awayModalVisible && (
                    <View>
                        {renderPlayers(awayPlayer)}
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default FootballLineUp;
