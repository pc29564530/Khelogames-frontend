import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Image, Modal, ScrollView, TextInput, TouchableOpacity} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';


const Members = ({teamData}) => {   
    const axiosInstance = useAxiosInterceptor();
    const [member, setMember] = useState([]);
    const [searchPlayer, setSearchPlayer] = useState('');
    const [playerProfile, setPlayerProfile] = useState([]);
    const [isSelectPlayerModal, setIsSelectPlayerModal] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const game = useSelector((state) => state.sportReducers.game);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchPlayerProfile = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getAllPlayers`, {
                    headers:{
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type':'application/json',
                    },
                })
                const item = response.data || [];
                setPlayerProfile(item)
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
                } else {
                    setMember(item);
                }
            } catch(err) {
                console.error("unable to fetch all member of team/club ", err)
            }
        }
        fetchMembers();
    }, []);
    const handleProfile = (itm) => {
        navigation.navigate('PlayerProfile', {profileData:itm} );
    }

    const handleAddPlayer = async (selectedItem) => {
        try {
            const data = {
                team_id:teamData.id,
                player_id: selectedItem.id,
                start_date: new Date()
            }
            const authToken = await AsyncStorage.getItem('AcessToken');
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addTeamsMemberFunc`,data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            setIsSelectPlayerModal(false)
        } catch (err) {
            console.error("unable to add the player data: ", err);
            setMember([]);
        }
    }

    const handleSearchPlayer = (text) => {
        if (Array.isArray(playerProfile) ){
            const filterData = playerProfile.filter((item) => 
                item.player_name.toLowerCase().includes(text.toLowerCase())
            )
            setFiltered(filterData);
        }
    }

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
                <View style={tailwind`w-full bg-white`}>
                    {member?.map((item,index) => (
                        <Pressable key={index} style={tailwind` shadow-md rounded-md w-full justify-center h-26 p-2`} onPress={() => handleProfile({itm: item})}>
                                <View style={tailwind`flex-row items-center`}>
                                    {item.media_url && item.media_url ?(
                                        <Image style={tailwind`w-10 h-10 rounded-full bg-yellow-500`} source={{uri: item.media_url}}  />
                                    ) : (
                                        <View style={tailwind`w-12 h-12 rounded-12 bg-white items-center justify-center`}>
                                            <Text style={tailwind`text-red-500 text-6x3`}>
                                                {item?.short_name[0]}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={tailwind``}>
                                        <View  style={tailwind`text-black p-1 mb-1`}>
                                            <Text style={tailwind`text-black text-xl `}>{item?.player_name}</Text>
                                        </View>
                                        <View  style={tailwind`flex-row items-start justify-evenly`}>
                                            <Text style={tailwind`text-black text-md `}>{item?.position}</Text>
                                            <Text style={tailwind`text-black text-md`}>{item.country}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={tailwind`border-b border-white mt-2`}></View>
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
                                    {filtered.map((item, index) => (
                                        <Pressable key={index} onPress={() =>  handleAddPlayer(item)}>
                                            <Text style={tailwind`text-xl py-2`}>{item.player_name}</Text>
                                        </Pressable>
                                    ))}
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