import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Image, FlatList} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import tailwind from 'twrnc';
import useAxiosInterceptor from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { useSelector } from 'react-redux';
import { ScrollView } from 'native-base';
import TournamentPlayerStatsModal from '../components/modals/cricket/TournamentStats';
import TournamentPlayerStatsRow from '../components/TournamentPlayerStatsRow';


const TournamentCricketStats = ({route}) => {
    const [selectedTab, setSelectedTab] = useState('batting');
    const {tournament} = route.params 
    //in this we need to get the player score and the current team 
    const [mostRuns, setMostRuns] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [highestRuns, setHighestRuns] = useState(null);
    const [mostSixes, setMostSixes] = useState(null);
    const axiosInstance = useAxiosInterceptor();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalType, setModalType] = useState('');
    const [mostFours, setMostFours] = useState(null);
    const [mostFifties, setMostFifties] = useState(null);
    const [mostHundreds, setMostHundreds] = useState(null);

    const game = useSelector(state => state.sportReducers.game);
    useEffect(() => {
        const fetchMostRunsByPlayer = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    tournament_id: tournament.id
                }

                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketTournamentMostRuns/${tournament.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                })
                setMostRuns(response.data || []);
            } catch (err) {
                console.error("Failed to fetch most runs by players: ", err);
            }
        }

        const fetchHighestRunsByPlayer = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    tournament_id: tournament.id
                }
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketTournamentHighestRuns/${tournament.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                })
                setHighestRuns(response.data || []);
            } catch (err) {
                console.error("Failed to fetch highest individual runs by players: ", err);
            }
        }

        const fetchMostSixes = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    tournament_id: tournament.id
                }
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketTournamentMostSixes/${tournament.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                })
                setMostSixes(response.data || []);
            } catch (err) {
                console.error("Failed to fetch most sixes by players: ", err);
            }
        }

        const fetchMostFours = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    tournament_id: tournament.id
                }
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketTournamentMostFours/${tournament.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                })
                setMostFours(response.data || []);
            } catch (err) {
                console.error("Failed to fetch most sixes by players: ", err);
            }
        }

        const fetchMostFifties = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    tournament_id: tournament.id
                }
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketTournamentMostFifties/${tournament.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                })
                setMostFifties(response.data || []);
            } catch (err) {
                console.error("Failed to fetch most sixes by players: ", err);
            }
        }

        const fetchMostHundreds = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    tournament_id: tournament.id
                }
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketTournamentMostHundreds/${tournament.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                })
                setMostHundreds(response.data || []);
            } catch (err) {
                console.error("Failed to fetch most sixes by players: ", err);
            }
        }

        fetchMostRunsByPlayer()
        fetchHighestRunsByPlayer()
        fetchMostSixes()
        fetchMostFours()
        fetchMostFifties()
        fetchMostHundreds()
    }, []);

    return (
        <ScrollView nestedScrollEnabled={true} style={tailwind`flex-1 px-2 mt-4`}>
            {/* Tab Buttons */}
            <View style={tailwind`flex-row justify-around mb-4`}>
                {['batting', 'bowling'].map(tab => (
                    <Pressable
                        key={tab}
                        onPress={() => setSelectedTab(tab)}
                        style={tailwind`px-5 py-2 rounded-full ${
                            selectedTab === tab
                                ? 'bg-black'
                                : 'bg-white border border-gray-300'
                        }`}>
                        <Text
                            style={tailwind`${
                                selectedTab === tab
                                    ? 'text-white font-semibold'
                                    : 'text-black'
                            }`}>
                            {tab.toUpperCase()}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Section: Most Runs */}
            <View style={tailwind`bg-white rounded-2xl shadow p-4 mb-4`}>
                <View style={tailwind`flex-row justify-between items-center mb-3`}>
                    <Text style={tailwind`text-lg font-semibold text-black`}>
                        Most Runs
                    </Text>
                    <Pressable
                        onPress={() => {
                            setModalData(mostRuns);
                            setModalTitle("Most Runs");
                            setModalType("mostRuns");
                            setModalVisible(true);
                        }}>
                        <AntDesign name="down" size={20} color="gray" />
                    </Pressable>
                </View>
                <FlatList
                    data={showAll ? mostRuns : mostRuns?.slice(0,1)}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <TournamentPlayerStatsRow player={item} type={"mostRuns"}/>
                    )}
                />
            </View>

            {/* Section: Highest Runs */}
            <View style={tailwind`bg-white rounded-2xl shadow p-4 mb-4`}>
                <View style={tailwind`flex-row justify-between items-center mb-3`}>
                    <Text style={tailwind`text-lg font-semibold text-black`}>
                        Hightest Runs
                    </Text>
                    <Pressable
                        onPress={() => {
                            setModalData(highestRuns);
                            setModalTitle("Highest Runs");
                            setModalType("highestRuns");
                            setModalVisible(true);
                        }}>
                        <AntDesign name="down" size={20} color="gray" />
                    </Pressable>
                </View>
                <FlatList
                    data={showAll ? highestRuns : highestRuns?.slice(0,1)}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <TournamentPlayerStatsRow player={item} type={"highestRuns"}/>
                    )}
                />
            </View>
            {/* Section: Most Sixes */}
            <View style={tailwind`bg-white rounded-2xl shadow p-4 mb-4`}>
                <View style={tailwind`flex-row justify-between items-center mb-3`}>
                    <Text style={tailwind`text-lg font-semibold text-black`}>
                        Most Sixes
                    </Text>
                    <Pressable
                        onPress={() => {
                            setModalData(mostSixes);
                            setModalTitle("Most Sixes");
                            setModalType("mostSixes");
                            setModalVisible(true);
                        }}>
                        <AntDesign name="down" size={20} color="gray" />
                    </Pressable>
                </View>
                <FlatList
                    data={mostSixes?.slice(0,1)}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <TournamentPlayerStatsRow player={item} type={"mostSixes"}/>
                    )}
                />
            </View>

            {/* Section: Most Fours */}
            <View style={tailwind`bg-white rounded-2xl shadow p-4 mb-4`}>
                <View style={tailwind`flex-row justify-between items-center mb-3`}>
                    <Text style={tailwind`text-lg font-semibold text-black`}>
                        Most Fours
                    </Text>
                    <Pressable
                        onPress={() => {
                            setModalData(mostFours);
                            setModalTitle("Most Fours");
                            setModalType("mostFours");
                            setModalVisible(true);
                        }}>
                        <AntDesign name="down" size={20} color="gray" />
                    </Pressable>
                </View>
                <FlatList
                    data={mostFours?.slice(0,1)}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <TournamentPlayerStatsRow player={item} type={"mostFours"}/>
                    )}
                />
            </View>
            {/* Section: Most Fifties */}
            <View style={tailwind`bg-white rounded-2xl shadow p-4 mb-4`}>
                <View style={tailwind`flex-row justify-between items-center mb-3`}>
                    <Text style={tailwind`text-lg font-semibold text-black`}>
                        Most Fifties
                    </Text>
                    <Pressable
                        onPress={() => {
                            setModalData(mostFifties);
                            setModalTitle("Most Fifties");
                            setModalType("mostFifties");
                            setModalVisible(true);
                        }}>
                        <AntDesign name="down" size={20} color="gray" />
                    </Pressable>
                </View>
                <FlatList
                    data={mostFifties?.slice(0,1)}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <TournamentPlayerStatsRow player={item} type={"mostFifties"}/>
                    )}
                />
            </View>
            {/* Section: Most Hundreds */}
            <View style={tailwind`bg-white rounded-2xl shadow p-4 mb-4`}>
                <View style={tailwind`flex-row justify-between items-center mb-3`}>
                    <Text style={tailwind`text-lg font-semibold text-black`}>
                        Most Hundreds
                    </Text>
                    <Pressable
                        onPress={() => {
                            setModalData(mostFours);
                            setModalTitle("Most Hundreds");
                            setModalType("mostHundreds");
                            setModalVisible(true);
                        }}>
                        <AntDesign name="down" size={20} color="gray" />
                    </Pressable>
                </View>
                <FlatList
                    data={mostHundreds?.slice(0,1)}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <TournamentPlayerStatsRow player={item} type={"mostHundreds"}/>
                    )}
                />
            </View>
            { modalVisible && (<TournamentPlayerStatsModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    title={modalTitle}
                    data={modalData}
                    type={modalType}
                />)}
        </ScrollView>
    );
};

export default TournamentCricketStats;
