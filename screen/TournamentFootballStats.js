import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Image, FlatList, Dimensions} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import tailwind from 'twrnc';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { useSelector } from 'react-redux';
import TournamentPlayerStatsModal from '../components/modals/cricket/TournamentStats';
import TournamentPlayerStatsRow from '../components/TournamentPlayerStatsRow';
import Animated, {Extrapolation, useAnimatedScrollHandler, interpolate, useSharedValue} from 'react-native-reanimated';


const TournamentFootballStats = ({tournament, currentRole, parentScrollY, headerHeight, collapsedHeader}) => {
    const [mostGoals, setMostGoals] = useState(null);
    const [mostYellowCards, setMostYellowCards] = useState(null);
    const [mostRedCards, setMostRedCards] = useState(null);
    
    const [modalVisible, setModalVisible] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalTitle, setModalTitle] = useState('');
    const [currentDate, setCurrentDate] = useState(null);
    const [modalType, setModalType] = useState('');
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const game = useSelector(state => state.sportReducers.game);
    const {height: sHeight, width: sWidth} = Dimensions.get("window");

    const currentScrollY = useSharedValue(0);

    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeader){
                parentScrollY.value = currentScrollY.value
            } else {
                parentScrollY.value = event.contentOffset.y
            }
        }
    })

    useEffect(() => {
        const date = new Date();
        setCurrentDate(date);
    }, []);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken");
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballTournamentPlayerGoal/${tournament.public_id}`, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                })
                setMostGoals(response?.data?.data || []);
            } catch (err) {
                const backendErrors = err?.response?.data?.error.fields;
                setError({
                    global: "Unable to get goals",
                    fields: backendErrors,
                })
                console.log("Failed to fetch most goals: ", err);
            }
        }

        const fetchYellowCards = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    tournament_id: tournament.id
                }
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballTournamentPlayerYellowCard/${tournament.public_id}`, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                })
                setMostYellowCards(response.data || []);
            } catch (err) {
                const backendErrors = err?.response?.data?.error.fields;
                setError({
                    global: "Unable to get yellow cards",
                    fields: backendErrors,
                })
                console.log("Failed to fetch yellow cards: ", err);
            }
        }

        const fetchRedCard = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const data = {
                    tournament_public_id: tournament.public_id
                }
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballTournamentPlayerRedCard/${tournament.public_id}`, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'content-type': 'application/json'
                    }
                })
                setMostRedCards(response.data.data || []);
            } catch (err) {
                const backendErrors = err?.response?.data?.error.fields;
                setError({
                    global: "Unable to get red cards",
                    fields: backendErrors,
                })
                console.error("Failed to fetch red cards: ", err);
            }
        }

        fetchGoals();
        fetchYellowCards();
        fetchRedCard();
    }, []);

    return (
        <View style={tailwind`flex-1 mb-4`}>
            {error.global && (
                <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                    <Text style={tailwind`text-red-700 text-sm`}>
                        {error?.global}
                    </Text>
                </View>
            )}
            {/* TODO: Check for start time stamp display the ui according to it. */}
            {tournament.start_timestamp === currentDate && (
                <></>
            )}
            <Animated.ScrollView 
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                style={tailwind`flex-1`}
                contentContainerStyle={{paddintTop: 20, paddingBottom:100, minHeight: sHeight+100}}
                showsVerticalScrollIndicator={false}
            >
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
                        data={showAll ? mostGoals : (mostGoals?.length >= 2 ? mostGoals?.slice(0,1) : [])}
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
                        data={showAll ? mostYellowCards : (mostYellowCards?.length >= 2 ? mostYellowCards?.slice(0,1) : [])}
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
                        data={showAll ? mostRedCards : (mostRedCards?.length >= 2 ? mostRedCards?.slice(0,1) : [])}
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
            </Animated.ScrollView>
        </View>
    );
};

export default TournamentFootballStats;
