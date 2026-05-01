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
    const [mostGoals, setMostGoals] = useState([]);
    const [mostYellowCards, setMostYellowCards] = useState([]);
    const [mostRedCards, setMostRedCards] = useState([]);

    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalType, setModalType] = useState('');
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const game = useSelector(state => state.sportReducers.game);
    const {height: sHeight, width: sWidth} = Dimensions.get("window");

    const currentScrollY = useSharedValue(0);

    const handlerScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            if (!parentScrollY) return;

            if (parentScrollY.value >= collapsedHeader) {
                parentScrollY.value = currentScrollY.value;
            } else {
                parentScrollY.value = event.contentOffset.y;
            }
        }
    });

    const fetchGoals = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballTournamentPlayerGoal/${tournament.public_id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'content-type': 'application/json'
                }
            })
            setMostGoals(Array.isArray(response?.data?.data) ? response.data.data : []);
        } catch (err) {
            console.log("Failed to fetch most goals: ", err);
        }
    }

    const fetchYellowCards = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballTournamentPlayerYellowCard/${tournament.public_id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'content-type': 'application/json'
                }
            })
            setMostYellowCards(Array.isArray(response?.data?.data) ? response.data.data : []);
        } catch (err) {
            console.log("Failed to fetch yellow cards: ", err);
        }
    }

    const fetchRedCard = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballTournamentPlayerRedCard/${tournament.public_id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'content-type': 'application/json'
                }
            })
            setMostRedCards(Array.isArray(response?.data?.data) ? response.data.data : []);
        } catch (err) {
            console.log("Failed to fetch red cards: ", err);
        }
    }

    useEffect(() => {
        if (!tournament?.public_id || !game?.name) return;

        const fetchAllStats = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchGoals(),
                    fetchYellowCards(),
                    fetchRedCard(),
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllStats();
    }, [tournament?.public_id, game?.name]);

    // Helper to render stat card
    const renderStatCard = (title, data, type) => {
        const topPlayers = Array.isArray(data) ? data.slice(0, 1) : [];

        return (
            <View style={[tailwind`rounded-xl p-4 mb-3 mx-4`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                <View style={tailwind`flex-row justify-between items-center mb-3`}>
                    <View style={tailwind`flex-row items-center`}>
                        <Text style={[tailwind`text-lg font-bold`, { color: '#f1f5f9' }]}>
                            {title}
                        </Text>
                    </View>
                    {data && data?.length > 0 && (
                        <Pressable
                            onPress={() => {
                                setModalData(data);
                                setModalTitle(title);
                                setModalType(type);
                                setModalVisible(true);
                            }}
                            style={[tailwind`rounded-full px-3 py-2 flex-row items-center`, { backgroundColor: '#334155' }]}
                        >
                            <Text style={[tailwind`text-xs font-semibold mr-1`, { color: '#cbd5e1' }]}>
                                View All
                            </Text>
                            <AntDesign name="right" size={12} color="#cbd5e1" />
                        </Pressable>
                    )}
                </View>

                {loading ? (
                    <View style={tailwind`py-8 items-center`}>
                        <ActivityIndicator size="small" color="#f87171" />
                    </View>
                ) : !data || data.length === 0 ? (
                    <View style={tailwind`py-8 items-center`}>
                        <Text style={[tailwind`text-sm`, { color: '#64748b' }]}>No data available</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={topPlayers}
                            keyExtractor={(item, index) => index.toString()}
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
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            {error?.global && (
                <View style={[tailwind`mx-4 mt-3 mb-3 p-3 rounded-lg`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                    <Text style={[tailwind`text-sm`, { color: '#fca5a5' }]}>
                        {error?.global}
                    </Text>
                </View>
            )}

            <Animated.ScrollView
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                style={{ flex: 1 }}
                contentContainerStyle={{paddingTop: 16, paddingBottom: 100, minHeight: sHeight + 100}}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={tailwind`py-20 items-center`}>
                        <ActivityIndicator size="large" color="#f87171" />
                        <Text style={[tailwind`mt-3`, { color: '#64748b' }]}>Loading stats...</Text>
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