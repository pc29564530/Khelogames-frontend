import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { BASE_URL } from '../constants/ApiConstants';
import { useSelector } from 'react-redux';
import { CricketPlayerStats } from '../components/CricketPlayerStats';
import FootballPlayerStats from '../components/FootballPlayerStats';

const PlayerProfile = ({ route }) => {
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const profile = useSelector(state => state.profile.profile);
    const game = useSelector(state => state.sportReducers.game);

    navigation.setOptions({
        title: route.params.player?.name,
        headerStyle: {},
        headerLeft: () => {
            return (
                <Pressable onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={24} color="black"/>
                </Pressable>
            )
        }
    })

    useEffect(() => {
        const fetchPlayerProfile = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken");
                const response = await axiosInstance.get(`${BASE_URL}/getPlayerByPlayerID`, {
                    params: { player_id: profile.id },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                setPlayer(response.data || null);
            } catch (err) {
                console.error("Error fetching player:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayerProfile();
    }, []);

    const handleAddActivity = () => {
        navigation.navigate("CreatePlayerProfile", { profile });
    };

    const avatarStyle = tailwind`w-24 h-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden`;

    return (
        <View style={tailwind`flex-1 bg-gray-50`}>
            {loading ? (
                <View style={tailwind`flex-1 items-center justify-center`}>
                    <ActivityIndicator size="large" color="#22c55e" />
                </View>
            ) : player ? (
                <View style={tailwind`p-2`}>
                    <View style={tailwind`flex-row items-center p-4 mb-6 bg-white`}>
                        {player?.media_url ? (
                            <Image style={avatarStyle} source={{ uri: player.media_url }} />
                        ) : (
                            <View style={avatarStyle}>
                                <Text style={tailwind`text-xl font-bold text-gray-700`}>
                                    {player?.displayText || "N/A"}
                                </Text>
                            </View>
                        )}
                        <View style={tailwind`ml-4`}>
                            <Text style={tailwind`text-xl font-semibold text-gray-900`}>{player?.player_name}</Text>
                            <Text style={tailwind`text-sm text-gray-500`}>{player?.country}</Text>
                        </View>
                    </View>
                    {player.game_id == game.id && game.name === "football" && (
                        <FootballPlayerStats playerID={player.id} />
                    )}
                    {player.game_id === game.id && game.name === "cricket" && (
                        <CricketPlayerStats  playerID={player.id}/>
                    )}
                </View>
            ) : (
                <View style={tailwind`mx-4 mt-16`}>
                    <View style={tailwind`bg-white rounded-2xl p-10 shadow-lg items-center justify-center`}>
                        <TouchableOpacity
                            onPress={handleAddActivity}
                            activeOpacity={0.8}
                            style={tailwind`bg-green-100 p-4 rounded-full mb-4`}>
                            <AntDesign name="adduser" size={40} color="#22c55e" />
                        </TouchableOpacity>
                        <Text style={tailwind`text-lg font-semibold text-gray-800`}>Add Player Activity</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default PlayerProfile;
