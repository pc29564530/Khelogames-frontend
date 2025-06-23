import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, Pressable, Image, Modal, ScrollView, TextInput, TouchableOpacity} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { getTeamPlayers, setTeamPlayer } from '../redux/actions/actions';
import { useSelector, useDispatch } from 'react-redux';


const Members = ({teamData}) => {   
    const axiosInstance = useAxiosInterceptor();
    const [member, setMember] = useState([]);
    const [searchPlayer, setSearchPlayer] = useState('');
    const [playerProfile, setPlayerProfile] = useState([]);
    const [isSelectPlayerModal, setIsSelectPlayerModal] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const dispatch = useDispatch();
    const game = useSelector((state) => state.sportReducers.game);
    const navigation = useNavigation();
    const players = useSelector((state) => state.players.players);

    useEffect(() => {
        const fetchPlayerProfile = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getPlayersBySport`, {
                    params: {
                        'game_id': game.id.toString()
                    },
                    headers:{
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type':'application/json',
                    },
                })
                const item = response.data || [];
                setPlayerProfile(item)
                setFiltered(item);
            } catch (err) {
                console.error("unable to get the player profile: ", err);
            }
        }
        fetchPlayerProfile();
    }, []);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AcessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsMemberFunc`, {
                    params: { team_id: teamData.id.toString()},
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                const item = response.data || [];
                if(!item || item === null ){
                    setMember([]);
                    dispatch(getTeamPlayers([]))
                } else {
                    dispatch(getTeamPlayers(item))
                    setMember(item);
                }
            } catch(err) {
                console.error("unable to fetch all member of team/club ", err)
            }
        }
        fetchMembers();
    }, []);
    const handleProfile = (item) => {
        navigation.navigate('PlayerProfile', {profileID: item.profile_id});
    }

    useEffect(() => {
        console.log("Redux Players List:", players);
    }, [players]);

    const handleAddPlayer = useCallback (async (selectedItem) => {
        try {
            const data = {
                team_id:teamData.id,
                player_id: selectedItem.id,
                join_date: new Date()
            }
            const authToken = await AsyncStorage.getItem('AcessToken');
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addTeamsMemberFunc`,data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            const item = response.data;
            if (item && item !== null ){
                dispatch(setTeamPlayer(item))
            }
            setIsSelectPlayerModal(false);
        } catch (err) {
            console.error("unable to add the player data: ", err);
            setMember([]);
        }
    }, [players, axiosInstance, dispatch])

    const handleSearchPlayer = (text) => {
        if (Array.isArray(playerProfile) ){
            const filterData = playerProfile.filter((item) => 
                item.player_name.toLowerCase().includes(text.toLowerCase())
            )
            const filterBySport = filterData.filter((item) => item.game_id === game.id ? item : [])
            setFiltered(filterBySport);
        }
    }

    const handleRemovePlayer = useCallback ( async(item) => {
        const playerID = item.id;
        try {
            
            const authToken = await AsyncStorage.getItem("AccessToken");
            const data = {
                team_id: teamData.id,
                player_id: playerID,
                leave_date: new Date()
            }
            const response = await axiosInstance.put(`${BASE_URL}/${game.name}/removePlayerFromTeam`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const item = response.data;
            const updatedPlayers = players.filter((player) => player.id !== item.player_id);
            setMember(updatedPlayers);
            dispatch(getTeamPlayers(updatedPlayers));
        } catch (err) {
            console.error("Unable to remove the player from team: ", err)
        }
    }, [players, axiosInstance, teamData.id, dispatch, game.name]);

    return (
        <View style={tailwind`flex-1`}>
            <ScrollView 
                contentContainerStyle={{flexGrow:1}}
                nestedScrollEnabled
                style={tailwind`flex-1 mt-1 bg-white`}>
                <View style={tailwind`flex-row justify-between p-2`}>
                    <Text style={tailwind`text-xl`}>Player</Text>
                    <TouchableOpacity onPress={() => setIsSelectPlayerModal(true)}>
                        <FontAwesome name="edit" size={22} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={tailwind`w-full bg-white p-4`}>
                    {players?.map((item, index) => (
                        <Pressable
                            key={index}
                            style={tailwind`shadow-lg rounded-lg w-full bg-white p-2 flex-row items-center mb-1`}
                            onPress={() => handleProfile(item)}
                        >
                            <View style={tailwind`flex-row items-center`}>
                                {item.media_url ? (
                                    <Image
                                        style={tailwind`w-12 h-12 rounded-full bg-yellow-500`}
                                        source={{ uri: item.media_url }}
                                    />
                                ) : (
                                    <View style={tailwind`w-12 h-12 rounded-full bg-gray-200 items-center justify-center`}>
                                        <Text style={tailwind`text-red-500 text-2xl`}>
                                            {item?.short_name}
                                        </Text>
                                    </View>
                                )}
                                <View style={tailwind`ml-4`}>
                                    <Text style={tailwind`text-black text-lg font-semibold`}>{item?.player_name}</Text>
                                    <View style={tailwind`flex-row items-center mt-1`}>
                                        <Text style={tailwind`text-gray-600 text-sm mr-2`}>{item?.position}</Text>
                                        <Text style={tailwind`text-gray-600 text-sm`}>{item.country}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={tailwind`ml-auto`}>
                                <Pressable style={tailwind`p-2`} onPress={() => handleRemovePlayer(item)}>
                                    <AntDesign name="delete" size={24} color="red" />
                                </Pressable>
                            </View>
                        </Pressable>
                    ))}
                </View>

                {isSelectPlayerModal && (
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={isSelectPlayerModal}
                        onRequestClose={() => setIsSelectPlayerModal(false)}
                    >
                        <Pressable onPress={() => setIsSelectPlayerModal(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                            <View style={tailwind`bg-white rounded-t-lg p-4`}>
                                <TextInput value={searchPlayer} onChangeText={(text) => {
                                    setSearchPlayer(text)
                                    handleSearchPlayer(text)
                                }} placeholder='Search player' style={tailwind`border border-gray-300 rounded-lg px-4 py-2 mb-4`}/>
                                <ScrollView style={tailwind`bg-white rounded-md p-4`}>
                                    {filtered.length > 0 ? filtered.map((item, index) => (
                                        <View>
                                            <Pressable key={index} onPress={() =>  handleAddPlayer(item)}>
                                                <Text style={tailwind`text-xl py-2`}>{item.player_name}</Text>
                                            </Pressable>
                                        </View>
                                    )) : (
                                        <View style={tailwind`items-center`}>
                                            <Text style={tailwind`text-lg font-bold`}>Search Not Found</Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        </Pressable>
                    </Modal>
                )}
            </ScrollView>
        </View>
    );
}

export default Members;