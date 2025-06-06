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


const TournamentFootballStats = ({route}) => {
    const [selectedTab, setSelectedTab] = useState('batting');
    const {tournament} = route.params
    const [mostGoals, setMostGoals] = useState(null);
    const [mostYellowCards, setMostYellowCards] = useState(null);
    const [mostRedCards, setMostRedCards] = useState(null);
    const axiosInstance = useAxiosInterceptor();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalType, setModalType] = useState('');
    const game = useSelector(state => state.sportReducers.game);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    tournament_id: tournament.id
                }

                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballTournamentPlayerGoal/${tournament.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                })
                setMostGoals(response.data || []);
            } catch (err) {
                console.error("Failed to fetch most goals: ", err);
            }
        }

        const fetchYellowCards = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    tournament_id: tournament.id
                }
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballTournamentPlayerYellowCard/${tournament.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                })
                setMostYellowCards(response.data || []);
            } catch (err) {
                console.error("Failed to fetch yellow cards: ", err);
            }
        }

        const fetchRedCard = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    tournament_id: tournament.id
                }
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballTournamentPlayerRedCard/${tournament.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                })
                setMostRedCards(response.data || []);
            } catch (err) {
                console.error("Failed to fetch red cards: ", err);
            }
        }

        fetchGoals();
        fetchYellowCards();
        fetchRedCard();
    }, []);

    return (
        <ScrollView nestedScrollEnabled={true} style={tailwind`flex-1 px-2 mt-4`}>
            <View style={tailwind`bg-white rounded-2xl shadow p-4 mb-4`}>
                <View style={tailwind`flex-row justify-between items-center mb-3`}>
                    <Text style={tailwind`text-lg font-semibold text-black`}>
                        Most Goals
                    </Text>
                    <Pressable
                        onPress={() => {
                            setModalData(mostGoals);
                            setModalTitle("Most Goals");
                            setModalType("mostGoals");
                            setModalVisible(true);
                        }}>
                        <AntDesign name="down" size={20} color="gray" />
                    </Pressable>
                </View>
                <FlatList
                    data={mostGoals?.slice(0,1)}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <TournamentPlayerStatsRow player={item} type={"mostGoals"}/>
                    )}
                />
            </View>

            {/* Section: Highest Runs */}
            <View style={tailwind`bg-white rounded-2xl shadow p-4 mb-4`}>
                <View style={tailwind`flex-row justify-between items-center mb-3`}>
                    <Text style={tailwind`text-lg font-semibold text-black`}>
                        Most Yellow Cards
                    </Text>
                    <Pressable
                        onPress={() => {
                            setModalData(mostYellowCards);
                            setModalTitle("Most Yellow Cards");
                            setModalType("mostYellowCards");
                            setModalVisible(true);
                        }}>
                        <AntDesign name="down" size={20} color="gray" />
                    </Pressable>
                </View>
                <FlatList
                    data={mostYellowCards?.slice(0,1)}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <TournamentPlayerStatsRow player={item} type={"mostYellowCards"}/>
                    )}
                />
            </View>
            {/* Section: Most Sixes */}
            <View style={tailwind`bg-white rounded-2xl shadow p-4 mb-4`}>
                <View style={tailwind`flex-row justify-between items-center mb-3`}>
                    <Text style={tailwind`text-lg font-semibold text-black`}>
                        Most Red Cards
                    </Text>
                    <Pressable
                        onPress={() => {
                            setModalData(mostRedCards);
                            setModalTitle("Most Red Cards");
                            setModalType("mostRedCards");
                            setModalVisible(true);
                        }}>
                        <AntDesign name="down" size={20} color="gray" />
                    </Pressable>
                </View>
                <FlatList
                    data={mostRedCards?.slice(0,1)}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <TournamentPlayerStatsRow player={item} type={"mostRedCards"}/>
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

export default TournamentFootballStats;
