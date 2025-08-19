    import React, { useState, useEffect } from 'react';
    import { Text, View, Image, TouchableOpacity, ActivityIndicator, Pressable, Alert } from 'react-native';
    import tailwind from 'twrnc';
    import { useNavigation } from '@react-navigation/native';
    import axiosInstance from './axios_config';
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import AntDesign from 'react-native-vector-icons/AntDesign';
    import { BASE_URL } from '../constants/ApiConstants';
    import { useSelector } from 'react-redux';
    import { CricketPlayerStats } from '../components/PlayerStats';
    import FootballPlayerStats from '../components/FootballPlayerStats';

    const PlayerProfile = ({ route }) => {
        const {publicID, from} = route.params;
        const [loading, setLoading] = useState(false);
        const [player, setPlayer] = useState(null);
        const navigation = useNavigation();
        const game = useSelector(state => state.sportReducers.game);
        const [isOwner, setIsOwner] = useState(false);
        const [headerContentType, setHeaderContentType] = useState("Matches");
        const user = useSelector(state => state.user.user);
        const authProfilePublicID = useSelector(state => state.profile.authProfilePublicID)
        useEffect(() => {
            const fetchPlayer = async () => {
                try {
                    setLoading(true);
                    const authToken = await AsyncStorage.getItem("AccessToken");
                    const userPublicID = await AsyncStorage.getItem("UserPublicID")
                    if(from === "team" ){
                        const playerResponse = await axiosInstance.get(`${BASE_URL}/getPlayer/${publicID}`, {
                            headers:{
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json'
                            }
                        })
                        if (playerResponse.data){
                            setPlayer(playerResponse.data)
                        } else {
                            setPlayer(null)
                        }
                    } else {
                        const playerResponse = await axiosInstance.get(`${BASE_URL}/getPlayerByProfile/${publicID}`, {
                            headers:{
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json'
                            }
                        })
                        if (playerResponse.data){
                            setPlayer(playerResponse.data)
                        } else {
                            setPlayer(null)
                        }
                    }
                } catch (err) {
                    console.error("Failed to get player profile: ", err)
                } finally {
                    setLoading(false);
                }
            }
            fetchPlayer()
        }, []);


        const handleAddActivity = () => {
            if (isOwner){
                navigation.navigate("CreatePlayerProfile");
            } else {
                Alert.alert("Not allowed to edit")
            }
        };

        navigation.setOptions({
            title: player?.name || "Player Profile",
            headerLeft: () => {
                return (
                    <Pressable onPress={() => navigation.goBack()}>
                        <AntDesign name="arrowleft" size={24} color="black"/>
                    </Pressable>
                )
            }
        })

        useEffect(() => {
            const checkProfileOwner = async () => {
                //check for currentOwner temp fix change with user_public_id
                if (authProfilePublicID=== profile.public_id) {
                    setIsOwner(true);
                }
            };
            checkProfileOwner();
        }, []);

        const handleContentType = (contentType) => {
            if (contentType === "Matches") {
                if(player.game_id === game.id && game.name === "football") {
                    return (
                        <Text style={tailwind`text-center text-gray-500 mt-10`}>
                            Match history will appear here.
                        </Text>
                    )
                } else if(player.game_id === game.id && game.name === "cricket") {
                    return (
                        <Text style={tailwind`text-center text-gray-500 mt-10`}>
                            Match history will appear here.
                        </Text>
                    )
                }
            } else if(contentType === "Stats"){
                if(player.game_id === game.id && game.name === "football") {
                    return <FootballPlayerStats player={player} />;
                } else if(player.game_id === game.id && game.name === "cricket") {
                    return <CricketPlayerStats  player={player}/>;
                }
            }
        }

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
                                <Text style={tailwind`text-xl font-semibold text-gray-900`}>{player?.name}</Text>
                                <Text style={tailwind`text-xl font-semibold text-gray-900`}>{player?.positions}</Text>
                                <Text style={tailwind`text-sm text-gray-500`}>{player?.country}</Text>
                            </View>
                        </View>
                        <View style={tailwind`flex-row items-center p-4 mb-6 bg-white justify-evenly`}>
                            {['Matches', 'Stats'].map((contentType, index) => (
                                <Pressable key={index} onPress={() => setHeaderContentType(contentType)} style={tailwind`shadow-lg rounded-lg p-6`}>
                                    <Text>{contentType}</Text>
                                </Pressable>
                            ))}
                        </View>
                        <View>
                            {handleContentType(headerContentType)}
                        </View>
                    </View>
                ) : (
                    <View style={tailwind`mx-4 mt-16`}>
                        <View style={tailwind`bg-white rounded-2xl p-10 shadow-lg items-center justify-center`}>
                            <TouchableOpacity
                                onPress={() => handleAddActivity()}
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
