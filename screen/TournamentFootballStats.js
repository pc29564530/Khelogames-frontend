import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Image, FlatList, Dimensions, ActivityIndicator} from 'react-native';
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

    const [loading, setLoading] = useState(false);
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
                setLoading(true);
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
            } finally {
                setLoading(false);
            }
        }

        const fetchYellowCards = async () => {
            try {
                setLoading(true);
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
                setMostYellowCards(response.data.data || []);
            } catch (err) {
                const backendErrors = err?.response?.data?.error.fields;
                setError({
                    global: "Unable to get yellow cards",
                    fields: backendErrors,
                })
                console.log("Failed to fetch yellow cards: ", err);
            } finally {
                setLoading(false);
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
            } finally {
                setLoading(false);
            }
        }

        fetchGoals();
        fetchYellowCards();
        fetchRedCard();
    }, []);

    // Helper to render stat card
    const renderStatCard = (title, data, type) => {
        const topPlayers = data?.length === 1 ? data?.slice(0,1) : [];

        return (
            <View style={tailwind`bg-white rounded-xl shadow-sm p-4 mb-3 mx-4`}>
                <View style={tailwind`flex-row justify-between items-center mb-3`}>
                    <View style={tailwind`flex-row items-center`}>
                        <Text style={tailwind`text-lg font-bold text-gray-900`}>
                            {title}
                        </Text>
                    </View>
                    {data && data.length > 0 && (
                        <Pressable
                            onPress={() => {
                                setModalData(data);
                                setModalTitle(title);
                                setModalType(type);
                                setModalVisible(true);
                            }}
                            style={tailwind`bg-gray-100 rounded-full px-3 py-2 flex-row items-center`}
                        >
                            <Text style={tailwind`text-gray-700 text-xs font-semibold mr-1`}>
                                View All
                            </Text>
                            <AntDesign name="right" size={12} color="#374151" />
                        </Pressable>
                    )}
                </View>

                {loading ? (
                    <View style={tailwind`py-8 items-center`}>
                        <ActivityIndicator size="small" color="#EF4444" />
                    </View>
                ) : !data || data.length === 0 ? (
                    <View style={tailwind`py-8 items-center`}>
                        <Text style={tailwind`text-gray-400 text-sm`}>No data available</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={topPlayers}
                            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                            renderItem={({item, index}) => (
                                <TournamentPlayerStatsRow
                                    player={item}
                                    type={type}
                                    rank={index + 1}
                                />
                            )}
                            scrollEnabled={false}
                        />
                    </>
                )}
            </View>
        );
    };

    return (
        <View style={tailwind`flex-1`}>
            {error.global && (
                <View style={tailwind`mx-4 mt-3 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg`}>
                    <Text style={tailwind`text-red-700 text-sm`}>
                        {error?.global}
                    </Text>
                </View>
            )}

            <Animated.ScrollView
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                style={tailwind`flex-1`}
                contentContainerStyle={{paddingTop: 16, paddingBottom: 100, minHeight: sHeight + 100}}
                showsVerticalScrollIndicator={false}
            >
                {loading && !mostGoals && !mostYellowCards && !mostRedCards ? (
                    <View style={tailwind`py-20 items-center`}>
                        <ActivityIndicator size="large" color="#EF4444" />
                        <Text style={tailwind`text-gray-500 mt-3`}>Loading stats...</Text>
                    </View>
                ) : (
                    <>
                        {renderStatCard("Most Goals", mostGoals, "mostGoals")}
                        {renderStatCard("Most Yellow Cards", mostYellowCards, "mostYellowCards")}
                        {renderStatCard("Most Red Cards", mostRedCards, "mostRedCards",)}
                    </>
                )}
            </Animated.ScrollView>

            {modalVisible && (
                <TournamentPlayerStatsModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    title={modalTitle}
                    data={modalData}
                    type={modalType}
                />
            )}
        </View>
    );
};

export default TournamentFootballStats;
