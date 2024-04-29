import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Image, Modal} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';


const Members = ({clubID}) => {
    const axiosInstance = useAxiosInterceptor();
    const [member, setMember] = useState([]);
    const [searchPlayer, setSearchPlayer] = useState('');
    const [playerProfile, setPlayerProfile] = useState([]);
    const [isSelectPlayerModal, setIsSelectPlayerModal] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchPlayerProfile = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AcessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getAllPlayerProfile`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })

                const item = response.data;
                if(!item || item === null) {
                    setPlayerProfile([]);
                } else {
                    setPlayerProfile(item);
                }
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
                const data = {
                    club_id: clubID
                }
                const response = await axiosInstance.get(`${BASE_URL}/getClubMember`, {
                    params: { club_id: clubID.toString()},
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                const responseWithProfile = await response.data.map( async (item, index) => {
                    try {
                        if(item && item !== null) {
                            const profileData = await axiosInstance.get(`${BASE_URL}/getPlayerProfile`, {
                                params: { player_id: item.player_id.toString()},
                                headers: {
                                    'Authorization': `Bearer ${authToken}`,
                                    'Content-Type': 'application/json',
                                },
                            });
                            let displayText = '';
                            if (!profileData.data?.avatar_url || profileData.data?.avatar_url === '') {
                                const usernameInitial = profileData.data.player_name ? profileData.data.player_name.charAt(0) : '';
                                displayText = usernameInitial.toUpperCase();
                            }
                            

                            return {...item, profile: profileData.data, displayText}
                        }
                    } catch (err) {
                        console.error("unable to get the profile of user ", err)
                    }
                })
                
                
                const clubMemberWithProfile = await Promise.all(responseWithProfile);
                setMember(clubMemberWithProfile)
            } catch(err) {
                console.error("unable to fetch all member of team/club ", err)
            }
        }
        fetchMembers();
    }, []);
    //need to change in player profile backend to reterive the profile of the player
    const handleProfile = (player_id) => {
        navigation.navigate('PlayerProfile', {id:player_id} );
    }

    const handleAddPlayer = async (selectedItem) => {
        try {
            const data = {
                club_id:clubID,
                player_id: selectedItem.id
            }
            const authToken = await AsyncStorage.getItem('AcessToken');
            const response = await axiosInstance.post(`${BASE_URL}/addClubMember`,data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            setIsSelectPlayerModal(false)
        } catch (err) {
            console.error("unable to add the player data: ", err);
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
        <View style={tailwind`flex-1 mt-4 gap-2`}>
            <View style={tailwind`mt-2 mb-2 items-center`}>
                <Pressable 
                    style={({ pressed }) => [
                        tailwind`h-20 rounded-lg shadow-lg p-3`,
                        pressed ? tailwind`opacity-50` : null // Apply opacity when pressed
                    ]} 
                    onPress={() => setIsSelectPlayerModal(true)}
                >
                    <Text style={tailwind`text-black text-xl`}>Add Player</Text>
                </Pressable>
            </View>
            <View style={tailwind`mt-8`}>
                {member?.map((item,index) => (
                    <Pressable key={index} style={tailwind`  p-1 h-15 mt-1`} onPress={() => handleProfile({username: item.profile?.owner})}>
                            <View style={tailwind`flex-row items-center`}>
                                {!item?.profile && !item?.profile?.avatar_url ?(
                                    <View style={tailwind`w-12 h-12 rounded-12 bg-white items-center justify-center`}>
                                        <Text style={tailwind`text-red-500 text-6x3`}>
                                            {item?.displayText}
                                        </Text>
                                    </View>
                                ) : (
                                    <Image style={tailwind`w-10 h-10 rounded-full bg-yellow-500`} source={{uri: item.profile.avatar_url}}  />
                                )}
                                <View  style={tailwind`text-black p-2 mb-1`}>
                                    <Text style={tailwind`text-black font-bold text-xl `}>{item?.profile?.player_name}</Text>
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
                    <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
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
                    </View>
                </Modal>
            )}
        </View>
    );
}

export default Members;