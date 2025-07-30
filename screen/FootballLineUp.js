import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState , useEffect} from 'react';
import { View, Text, Pressable, ScrollView, Image, Modal, Switch } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import { useSelector, useDispatch } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { getTeamPlayers, setCricketMatchToss } from '../redux/actions/actions';
const positions = require('../assets/position.json');

const FootballLineUp = ({ route }) => {
    const dispatch = useDispatch();
    const match = route.params.matchData;
    const homeTeamPublicID = match?.homeTeam?.public_id;
    const awayTeamPublicID = match?.awayTeam?.public_id;
    const [currentTeamPlayer, setCurrentTeamPlayer] = useState(homeTeamPublicID);
    const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);
    const [isSubstituted, setIsSubstituted] = useState([]);
    const [currentSquad, setCurrentSquad] = useState([]);
    const [selectedSquad, setSelectedSquad] = useState([]);
    const axiosInstance = useAxiosInterceptor();
    const game = useSelector((state) => state.sportReducers.game);
    const players = useSelector((state) => state.players.players)

    const toggleTeam = (teamID) => {
        setCurrentTeamPlayer(teamID)
    }

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

    const handleSelectSquad = async () => {
        try {
            var data={
                match_public_id: match.public_id,
                team_public_id: homeTeamPublicID === currentTeamPlayer ? homeTeamPublicID : awayTeamPublicID,
                player: selectedSquad,
                is_substitute: isSubstituted,
            }
            console.log("data: ", data)
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addFootballMatchSquad`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            setCurrentSquad(response.data || []);
        } catch (err) {
            console.error("Failed to create the squad for match: ", err)
        }
    }
    
    useEffect(() => {
        const fetchSquad = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballMatchSquad`, {
                    params: {
                        'match_public_id':match.public_id.toString(),
                        'team_public_id': currentTeamPlayer.toString()
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                setCurrentSquad(response.data || [])
            } catch (err) {
                console.error("failed to fetch football lineup: ", err);
            }
        }
        fetchSquad();
    }, [currentTeamPlayer])

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsMemberFunc/${currentTeamPlayer.public_id}`, {
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

    const currentLineUp = currentSquad.filter((item) => item.is_substitute == false);
    const substitutionPlayer = currentSquad.filter((item) => item.is_substitute === true);

    const renderPlayers = () => {
        return (
            <View style={tailwind``}>
                {currentLineUp.length > 0 && (
                    <View style={tailwind`rounded-2xl bg-white p-4 shadow-lg mb-4`}>
                        <Text style={tailwind`text-xl font-bold mb-4 text-gray-800`}>Current Squad</Text>
                        {currentLineUp?.map((item, index) => (
                            <View key={index} style={tailwind`flex-row items-center mb-4`}>
                            <Image
                                source={{ uri: item.player.avatarUrl }}
                                style={tailwind`w-12 h-12 rounded-full bg-gray-200 mr-4`}
                            />
                            <View style={tailwind`flex-1`}>
                                <Text style={tailwind`text-base font-semibold text-gray-900`}>
                                    {item.player.name}
                                </Text>
                                <View style={tailwind`flex-row items-center gap-4 mt-1`}>
                                    <Text style={tailwind`text-sm text-gray-600`}>
                                    {selectPosition(item.player.positions)}
                                    </Text>
                                    <Text style={tailwind`text-sm text-gray-600`}>•</Text>
                                    <Text style={tailwind`text-sm text-gray-600`}>
                                    {item.player.country}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        ))}
                    </View>
                )}
                {substitutionPlayer.length > 0 && (
                    <View style={tailwind`rounded-2xl bg-white p-4 shadow-lg mb-4`}>  
                        <Text style={tailwind`text-xl font-bold mb-4 text-gray-800`}>Substitution</Text>
                        {currentLineUp.map((item, index) => (
                            <View key={index} style={tailwind`flex-row items-center mb-4`}>
                            <Image
                                source={{ uri: item.player.avatarUrl }}
                                style={tailwind`w-12 h-12 rounded-full bg-gray-200 mr-4`}
                            />
                            <View style={tailwind`flex-1`}>
                                <Text style={tailwind`text-base font-semibold text-gray-900`}>
                                    {item.player.name}
                                </Text>
                                <View style={tailwind`flex-row items-center gap-4 mt-1`}>
                                    <Text style={tailwind`text-sm text-gray-600`}>
                                    {selectPosition(item.player.positions)}
                                    </Text>
                                    <Text style={tailwind`text-sm text-gray-600`}>•</Text>
                                    <Text style={tailwind`text-sm text-gray-600`}>
                                    {item.player.country}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        ))}
                    </View>
                )}
            </View>
        );
    }

    const togglePlayerSelection = (item) => {
        setSelectedSquad(prevSquad => [...prevSquad, item])
     }

    return (
        <ScrollView   nestedScrollEnabled={true} style={tailwind`flex-1 p-2 bg-white`}>
            <View style={tailwind`flex-row mb-2 p-2 items-center justify-between gap-2`}>
                <Pressable onPress={() => {toggleTeam(homeTeamID)}} style={[tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`, homeTeamID === currentTeamPlayer ? tailwind`bg-red-400`: tailwind`bg-white`]}>
                    <Text style={tailwind`text-lg font-bold`}>{match.homeTeam.name}</Text>
                </Pressable>
                <Pressable   onPress={() => toggleTeam(awayTeamID)} style={[tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`, awayTeamID===currentTeamPlayer?tailwind`bg-red-400`:tailwind`bg-white`]}>
                    <Text style={tailwind`text-lg font-bold`}>{match.awayTeam.name}</Text>
                </Pressable>
            </View>
            <View style={tailwind`mb-2 gap-4 p-2`}>
                    <Pressable style={tailwind`rounded-md shadow-lg bg-white p-8 items-center`} onPress={() => {setIsPlayerModalVisible(true)}}>
                        <Text style={tailwind`text-lg`}>Select Squad</Text>
                    </Pressable>
            </View>
            <View style={tailwind``}>
                {renderPlayers(players)}
            </View>
            {isPlayerModalVisible && (
                <Modal
                    visible={isPlayerModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setIsPlayerModalVisible(false)}
                >
                    <View style={tailwind`flex-1 bg-black bg-opacity-60 justify-end`}>
                        <View style={tailwind`max-h-[80%] bg-white rounded-t-2xl shadow-xl p-4`}>
                            {/* Header */}
                            <View style={tailwind`flex-row justify-between items-center mb-4`}>
                                <Text style={tailwind`text-xl font-bold`}>Select Players</Text>
                                <Pressable onPress={() => setIsPlayerModalVisible(false)}>
                                    <AntDesign name="close" size={24} color="black" />
                                </Pressable>
                            </View>

                            {/* Player List */}
                            <ScrollView contentContainerStyle={tailwind`gap-3 pb-4`}>
                                {players.map((item, index) => (
                                    <View key={index} style={tailwind`flex-row items-center p-3 bg-gray-100 rounded-xl shadow-sm`}>
                                        <Image
                                            source={{ uri: item.avatarUrl || 'https://via.placeholder.com/40' }}
                                            style={tailwind`w-10 h-10 rounded-full mr-3 bg-gray-300`}
                                        />
                                        <View style={tailwind`flex-1`}>
                                            <Text style={tailwind`text-base font-semibold`}>{item.player_name}</Text>
                                            <View style={tailwind`flex-row items-center gap-3`}>
                                                <Text style={tailwind`text-sm text-gray-500`}>{selectPosition(item.position)}</Text>
                                                <Text style={tailwind`text-sm text-gray-500`}>{item.country}</Text>
                                            </View>
                                        </View>
                                        <Pressable onPress={() => togglePlayerSelection(item)}>
                                            <AntDesign
                                                name={selectedSquad?.some(p => p.public_id === item.public_id) ? 'checkcircle' : 'pluscircleo'}
                                                size={22}
                                                color={selectedSquad?.some(p => p.id === item.id) ? 'green' : 'gray'}
                                            />
                                        </Pressable>
                                        <View>
                                            <Text></Text>
                                                <Switch 
                                                    value={isSubstituted.includes(item.public_id)}
                                                    onValueChange={(value) => {
                                                        if (value) {
                                                            setIsSubstituted((prev) => [...prev, item.public_id]);
                                                        } else {
                                                            setIsSubstituted((prev) => prev.filter((public_id) => public_id !== item.public_id))
                                                        }
                                                    }}
                                                    trackColor={{false: "#ccc", true: "#34D399" }}
                                                    thumbColor={isSubstituted.includes(item.public_id)? "#10B981" : "#f4f3f4"}
                                                />
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            {/* Submit Button */}
                            <Pressable onPress={() => handleSelectSquad()}
                                style={tailwind`mt-4 bg-green-600 py-3 rounded-xl items-center`}
                            >
                                <Text style={tailwind`text-white text-base font-semibold`}>Add to Squad</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            )}
        </ScrollView>
    );
};

export default FootballLineUp;
